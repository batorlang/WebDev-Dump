
const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";

const map = L.map("map", {
    minZoom: -3
});

let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(map);

async function fetchData(){

    const response = await fetch(url);
    const data = await response.json();

    const geoJsonLayer = L.geoJSON(data, {
        weight: 2,
        onEachFeature: (feature, layer) => {
            const name = feature.properties.name;
            layer.bindTooltip(name);
        }
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());

};

fetchData();






