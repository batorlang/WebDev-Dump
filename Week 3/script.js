async function loadPopData() {
    const apiUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak/11ra.px";

    try {

        //This part laods the query from the .json file
        const queryPromise = await fetch('population_query.json');
        const queryJSON = await queryPromise.json();
        

        //This part handles the api call by the query
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryJSON)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("API rejected the request. Server says:", errorText);
            return; // Stop the function, so it doesn't crash
        }

        const data = await apiResponse.json();
        populateTable(data);
    } catch (error){
        console.error("An error has occured while fetching: ", error);
    }
};

function populateTable(data) {
    const tbody = document.getElementById('population-body');
    //Getting the actual data inside these constant variables
    const municipalities = Object.values(data.dimension['alue_23_20260101'].category.label);
    const populationVals = data.value;

    //Looping through the dataset and creating table-rows for each entry
    municipalities.forEach((municipality, index) => {
        const row = document.createElement("tr");
        const municipalityCells = document.createElement("td");
        const populationCells = document.createElement("td");

        municipalityCells.textContent = municipality;
        populationCells.textContent = populationVals[index];

        row.appendChild(municipalityCells);
        row.appendChild(populationCells);
        tbody.appendChild(row);
    });
};

loadPopData();