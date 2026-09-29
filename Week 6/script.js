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

async function fetchPopData() {
    //This should probably be in a try catch block, for error-handling, might implement later.
    const response = await fetch(popUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("Pop data fetched: ", data);

};

fetchPopData();