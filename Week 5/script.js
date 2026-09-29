
const geoJsonUrl = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
const migrationUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/11a2.px";

const map = L.map("map", {
    minZoom: -3
});

let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(map);

async function fetchMigData(){
    const queryResponse = await fetch("migration_data_query.json");
    const query = await queryResponse.json();

    const res = await fetch(migrationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    });

    const migrationJson = await res.json();

    // Municipality codes, in the same order they appear in the flat value list
    const alueIndex = migrationJson.dimension.alue_23_20260101.category.index;
    const alueCodes = [];
    Object.entries(alueIndex).forEach(([code, pos]) => { alueCodes[pos] = code; }); //I have used help for this part

    const values = migrationJson.value;

    const migrationLookup = {};

    alueCodes.forEach((areaCode, i) => {
        if (areaCode === "SSS") return;

        const muniCode = areaCode.replace("KU", "");

        migrationLookup[muniCode] = {
            positive: values[i * 2],
            negative: values[i * 2 + 1]
        };
    });

    return migrationLookup;
};

async function fetchData(){ //Simple fetch of geoJson

    const rawGeoRes = await fetch(geoJsonUrl);
    const geoResponse = await rawGeoRes.json();
    const migrationLookup = await fetchMigData();

    const geoJsonLayer = L.geoJSON(geoResponse, {
        style: (feature) => {
            const migration = migrationLookup[feature.properties.kunta];
            //Here I have made a normal fallback for a no migration data case
            if (!migration) return {weight: 2};
            const hue = Math.min(
                (migration.positive / migration.negative) ** 3 * 60,
                120
            );
            return {
                weight: 2,
                color: `hsl(${hue}, 75%, 50%)`
            };
        },
        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;
            layer.bindTooltip(name);
        
            const migration = migrationLookup[feature.properties.kunta]; //kunta means municipality
            if (migration) {
                layer.bindPopup(
                    `<b>${name}</b><br>Positive Migration: ${migration.positive}<br>Negative Migration: ${migration.negative}`
                );
            }
        }
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());

};

fetchData();






