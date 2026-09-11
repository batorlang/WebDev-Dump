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

async function appendEmpData() {
    const apiUrl = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/tyokay/115b.px";
    try {
        const queryPromise = await fetch("employment_query.json");
        const queryJSON = await queryPromise.json();

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryJSON)
        });
        const data = await apiResponse.json();
        const employmentVals = data.value || (data.dataset && data.dataset.value);
        const table = document.querySelector("table");
        for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            const newCell = document.createElement("td");
            
            const dataIndex = i - 1;
            
            if (employmentVals && employmentVals[dataIndex] !== undefined) {
                newCell.textContent = employmentVals[dataIndex];
            } else {
                newCell.textContent = "-"; 
            }
            
            row.appendChild(newCell);
        }

        calculateEmpPerc();
    } catch (error) {
        console.error("Error occured: ", error);
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

function employmentPerc() {

};

function calculateEmpPerc() {
    const table = document.querySelector("table");
        for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i];
            const popText = row.cells[1].textContent;
            const empText = row.cells[2].textContent;
            const population = parseFloat(popText);
            const employment = parseFloat(empText);
            const percentageCell = document.createElement("td");
            const percentage = (employment / population) * 100;
            percentageCell.textContent = percentage.toFixed(2) + "%";
            if (percentage > 45) {
                row.style.background = "#abffbd";
            } else if (percentage < 25) {
                row.style.background = "#ff9e9e";
            } 
            row.appendChild(percentageCell);
        }
};

loadPopData();
appendEmpData();