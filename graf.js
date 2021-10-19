const lables = [30,25,20,15,10,5,"nu"];
const labels = ["rum1,rum2,rum3,rum4,rum5"]

let tempChart = new Chart(document.getElementById("tempgraf"), {
    type: 'line',
    data: {
    labels: lables,
    datasets: [{ 
        data: [12,32,15,65,31,4],
        label: "rum1",
        borderColor: "#012749",
        fill: false
        },
        { 
        data: [52,32,69,65,12,74],
        label: "rum2",
        borderColor: "#ee538b",
        fill: false
        },
        { 
         data: [23,43,12,23,12,54],
        label: "rum3",
        borderColor: "#8a3800"
         },
         { 
        data: [2,22,49,65,12,44],
        label: "rum4",
        borderColor: "#b28600",
        fill: false
          },
         { 
        data: [12,32,89,35,22,64],
        label: "rum5",
        borderColor: "#198038",
        fill: false
                },
    ]
    },
    options: {
    title: {
        display: true,
        text: 'World population per region (in millions)'
    }
    }
});