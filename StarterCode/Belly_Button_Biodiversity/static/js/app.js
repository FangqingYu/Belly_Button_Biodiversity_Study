function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use d3 to select the panel with id of `#sample-metadata`
  // Use `.html("") to clear any existing metadata
  row = d3.select("#sample-metadata")
  row.html("")
  
  //console.log(sample)
  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`).then(metaData => {
    row = d3.select("#sample-metadata")  
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(metaData).forEach(([key, value]) => {
      row.append("p").text(`${key}: ${value}`)
    })  
    
    // BONUS: Build the Gauge Chart
    buildGauge(metaData.WFREQ);
  });  
}



function buildCharts(sample) {

  console.log(sample);
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(sampleData => {
    console.log(sampleData);
    var otu_ids =sampleData.otu_ids;
    //console.log(otu_ids);
    var sample_values = sampleData.sample_values;
    //console.log(sample_values);
    var otu_labels = sampleData.otu_labels;
    //console.log(otu_labels);

    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    // @TODO: Build a Bubble Chart using the sample data

    // Assign colors to otu_ids
    colors =  otu_ids.map(id =>{
      if(id<1000) {
        return 'rgb(93, 164, 214)'
      }
      else if (id>=1000 && id<2000) {
        return 'rgb(255, 144, 14)'
      }
      else if (id>=2000 && id<3000){
        return 'rgb(44, 160, 101)'
      }
      else {
        return 'rgb(255, 65, 54)'
      }
    });
    //console.log(colors);

    // Assign hover text: "otu_id \n otu_label
    hover_text = [];
    for(var i=0; i<otu_ids.length; i++) {
      hover_text.push(`ID: ${otu_ids[i]}<br>${otu_labels[i]}`)
    }
    //console.log(hover_text);

    var trace1 = {
      x: otu_ids,
      y: sample_values,
      text: hover_text,
      mode: 'markers',
      marker: {
        color: colors,
        size:  sample_values
      },
      type: 'scatter'
    };
    var data = [trace1];
    var layout = {
      showlegend: false,
      xaxis: {
        title: {
          text: 'OTU ID'
        }
      },
      yaxis: {
        title: {
          text: 'COUNT'
        }
      },
      height: 600,
      width: 1500
    }
    Plotly.newPlot("bubble", data, layout);

  

    // @TODO: Build a Pie Chart
    var data2 = [{
      values: sample_values.slice(0,10),
      labels: otu_ids.slice(0,10),
      type: 'pie',
      hoverinfo: otu_labels.slice(0, 10)
    }];
    var layout2 = {
      height: 500,
      width: 700
    };
    Plotly.newPlot("pie", data2, layout2);
    
  })
}



function buildGauge(level) {

  // Enter a number between 0 and 10
  // Trig to calc meter point
  var degrees = 180 - level*18,
      radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
    { values: [50/6, 50/6, 50/6, 50/6, 50/6, 50/6, 50],
    rotation: 90,
    text: ['9-10', '7-9', '5-7', '4-5', '2-4', '0-2', ''],
  
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                          'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                          'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                          'rgba(255, 255, 255, 0)']},
    labels: ['9-10', '7-9', '5-7', '4-5', '2-4', '0-2', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Belly Button Washing Frequency<b><br>Scrubs per Week',
    height: 500,
    width: 500,
    xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]}
};


  Plotly.newPlot('gauge', data, layout);
}






function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);


  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();