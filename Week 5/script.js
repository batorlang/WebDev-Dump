
const geoJsonUrl = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
const migrationUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/11a2.px";

const map = L.map("map", {
    minZoom: -3
});

let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(map);

async function fetchMigData(){
    //fetch the query
    const queryResponse = await fetch("migration_data_query.json");
    const query = await queryResponse.json();

    const res = await fetch(migrationUrl, {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
    });

    const migrationJson = await res.json();

    const migrationLookup = {}; //Initialize it empty

    migrationJson.data.forEach((row) => { //I rewrote the json-stat2 into json in the migration data query.
        const areaCode = row.key[0];
        if (areaCode === "SSS") return; //Do not need the country total data

        const muniCode = areaCode.replace("KU", ""); //Need to cut the KU off of the codes

        migrationLookup[muniCode] = {
            positive: row.values[0],
            negative: row.values[1]
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






