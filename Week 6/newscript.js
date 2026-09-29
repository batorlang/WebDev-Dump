const apiUrl = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/12dy.px";
const years = [
    "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", 
    "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", 
    "2016", "2017", "2018", "2019", "2020", "2021"
];


const selectedAreaCode = localStorage.getItem("selectedAreaCode") || "SSS";
const selectedAreaName = localStorage.getItem("selectedAreaName") || "Finaland";

const createRequestBody = (contentsCode) => ({
    query: [
        {
            code: "timeperiod_y",
            selection: {
                filter: "item",
                values: years
            }
        },
        {
            code: "alue_23_20260101",
            selection: {
                filter: "item",
                values: [selectedAreaCode]
            }
        },
        {
            code: "contentscode",
            selection: {
                filter: "item",
                values: [contentsCode]
            }
        }
    ],
    response: {
        format: "json-stat2"
    }
});


const fetchData = async (contentsCode) => {
    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(createRequestBody(contentsCode))
    });

    const data = await res.json();
    return data.value;
};

const buildChart = async () => {
    const birthValues = await fetchData("synt-vm01");
    const deathValues = await fetchData("synt-vm11");
    chart = new frappe.Chart("#chart", {
        title: `Births and Deaths in ${selectedAreaName} (2000-2021)`,
        data: {
            labels: years,
            datasets: [
                {
                    name: "Births",
                    values: birthValues
                },
                {
                    name: "Deaths",
                    values: deathValues
                }
            ]
        },
        type: "bar",
        height: 450,
        colors: ["#63d0ff", "#363636"]
    });
};
buildChart();