// Setup dropdown
// target selector element in html and read sample names into dropdown list
var selectEl = document.getElementById("selDataset");
Plotly.d3.json("/names", function (error, response) {
    if (error) return console.warn(error);

    var choices = response;

    for (var i = 0; i < choices.length; i++) {
        var choice = document.createElement("option");
        choice.value = choices[i];
        choice.text = choices[i];
        selectEl.appendChild(choice);
    }
})

// setup metadata table using keys and values of flask metadata
var sample_data = document.getElementById("sample_data");
Plotly.d3.json("/metadata/BB_940", function (error, response) {
    
    dataHTML = ""
    for (key in response) {
        dataHTML += "<b>" + key + ": </b>" + response[key] + "<br>";
    }
    sample_data.innerHTML = dataHTML;
})

// set opening chart default to pie of sample and utc top 10 values
Plotly.d3.json("/samples/BB_940", function (error, response) {
    if (error) return console.warn(error);
    
    var data = [{
        values: response.sample_values.slice(0, 10),
        labels: response.otu_ids.slice(0, 10),
        type: 'pie'
    }];
    
    var layout = {
        title: "Biodiversity Finding Values for Selected Sample",
        autosize: false,
        width: 650,
        height: 500,
        margin: {
            l: 30,
            r: 30,
            b: 30,
            t: 30
        }
    };
    Plotly.plot("pie_chart", data, layout);
})

// setup bubble chart 
Plotly.d3.json("/samples/BB_940", function (error, response) {
    if (error) return console.warn(error);
    
    var data = [{
        x: response.otu_ids,
        y: response.sample_values,
        mode: 'markers',
        marker: {
            color: response.otu_ids,
            size: response.sample_values
        }
    }];
    
    var layout = {
        height: 550,
        width: 900,
        title: "Sample Biodiversity Finding OTU Comparison",
        xaxis: {
            title: "OTU ID"
        },
        yaxis: {
            title: "Sample Value"
        }
    };
    Plotly.plot("bubble_chart", data, layout);
})

// Setup to restyle plots on dropdown selection
function updatePie(dataUpdate) {
    var Pie = document.getElementById("pie_chart");
    Plotly.restyle(Pie, "labels", [dataUpdate.otu_ids.slice(0, 10)]);
    Plotly.restyle(Pie, "values", [dataUpdate.sample_values.slice(0, 10)]);
}

function updateBubbles(dataUpdate) {
    var Bubbles = document.getElementById("bubble_chart");
    Plotly.restyle(Bubbles, "x", [dataUpdate.otu_ids]);
    Plotly.restyle(Bubbles, "y", [dataUpdate.sample_values]);
}

function optionChange(sample) {
    var samplesURL = `/samples/${sample}`
    var dataURL = `/metadata/${sample}`

    // updated data selection
    Plotly.d3.json(samplesURL, function (error, dataUpdate) {
        if (error) return console.warn(error);
        updatePie(dataUpdate);
        updateBubbles(dataUpdate);
    });
    // update sample data panel
    Plotly.d3.json(dataURL, function (error, metaUpdate) {
        dataHTML = ""
        for (key in metaUpdate) {
            dataHTML += "<b>" + key + ": </b>" + metaUpdate[key] + "<br>";
        }
        sample_data.innerHTML = dataHTML;
    });
}