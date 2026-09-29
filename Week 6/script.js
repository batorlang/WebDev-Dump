const requestBody = {
  "query": [
    {
      "code": "timeperiod_y",
      "selection": {
        "filter": "item",
        "values": [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      "code": "alue_23_20260101",
      "selection": {
        "filter": "item",
        "values": [
          "SSS"
        ]
      }
    },
    {
      "code": "contentscode",
      "selection": {
        "filter": "item",
        "values": [
          "synt-vaesto"
        ]
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
};
//The lecture video create the request body in the JavaScript file, so that is how I did as well

const popUrl = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/12dy.px";

const years = [
    "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", 
    "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", 
    "2016", "2017", "2018", "2019", "2020", "2021"
];

let areaCodes = [];
let areaNames = [];
let chart;
let chartData;

const fetchPopData = async () => {
    //This should probably be in a try catch block, for error-handling, might implement later.
    const response = await fetch(popUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data;

};

const buildChart = async (areaName = "Finland") => {
    const data = await fetchPopData();
    const popVals = data.value;

    chartData = {
        labels: [...years],
        datasets: [
            {
                name: "Population",
                values: [...popVals]
            }
        ]
    };
    
    if (chart) {
        document.getElementById("chart").innerHTML = "";
    }

    chart = new frappe.Chart("#chart", {
        title: `Population of ${areaName} (2000-2021)`,
        data: chartData,
        type: "line",
        height: 450,
        colors: ["#eb5146"]
    });

};

const fetchAreaMap = async () => { //Simple GET to collect area codes and names into arrays. 
    const res = await fetch(popUrl);
    const data = await res.json();
    areaCodes = data.variables[1].values;
    areaNames = data.variables[1].valueTexts;
};


const submitButton = document.getElementById("submit-data");
submitButton.addEventListener("click", async (event) =>{
    event.preventDefault();
    const serachInput = document.getElementById("input-area").value.toLowerCase();
    const areaIndex = areaNames.findIndex(name => name.toLowerCase() === serachInput);

    if (areaIndex === -1) {
        return; //This means an error
    }

    requestBody.query[1].selection.values = [areaCodes[areaIndex]];
    await buildChart(areaNames[areaIndex]);
});

const addButton = document.getElementById("add-data");
addButton.addEventListener("click", () => {
    if (!chart) {
        return;
    }

    const labels = chartData.labels;
    const data = chartData.datasets[0].values;

    let deltaSum = 0;
    for (let i = 1; i < data.length; i++) {
        deltaSum += data[i] - data[i - 1];
    }

    const meanDelta = deltaSum / (data.length - 1);

    const pred = data[data.length - 1] + meanDelta;

    const nextLabel = String(Number(labels[labels.length -1]) + 1);

    chart.addDataPoint(nextLabel, [pred]);
    labels.push(nextLabel);
    data.push(pred);

    localStorage.setItem("selectedAreaCode", areaCodes[areaIndex]);
    localStorage.setItem("selectedAreaName", areaNames[areaIndex]);
});

//Function thatr runs areaMapping and the buildChart functions.
const initializer = async () => {
    await fetchAreaMap();
    await buildChart();
};



initializer();
