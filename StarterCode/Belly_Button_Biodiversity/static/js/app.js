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
      title: {
        text: '<b>Top 10 Biodiversity</b><br>% Count'
      },
      height: 500,
      width: 650,
      margin: {
        l: 2,
        r: 0,
        b: 8,
        pad: 4
      }
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
      marker: {size: 30, color:'850000'},
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
    { values: [50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50],
    rotation: 90,
    text: ['9-10','8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
  
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgb(38, 115, 38)', 'rgb(51, 153, 51)', 'rgb(57, 172, 57)', 'rgb(64, 191, 64)', 'rgb(83, 198, 83)',
                     'rgb(102, 204, 102)', 'rgb(121, 210, 121)', 'rgb(140, 217, 140)', 'rgb(179, 230, 179)', 'rgb(236, 249, 236)','rgb(255, 255, 255)']},
    labels: ['9-10','8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
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
    title: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week',
    height: 600,
    width: 450,
    margin: {
      l: 2,
      r: 0,
      b: 0,
      pad: 4
    },
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

  // Build scatter plot
  //buildScatter();
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();









//EXTRA
function buildScatter() {
  // Get keys from count summery
  d3.json("/count").then(data => {
    console.log(data);
    keys = Object.keys(data);
    count = Object.values(data);

    //  d3.json(`/metadata/${Number(keys[1])}`).then(metaData => {
    //    console.log(metaData.WFREQ);
    //  })

    freqs = []

    for(var i=0; i<keys.length; i++) {
      d3.json(`/metadata/${Number(keys[i])}`).then(metaData => {
        //console.log(metaData.WFREQ);
        //console.log(metaData);
        if(metaData.sample){
          freqs.push(metaData.WFREQ)
        }
        else{
          freqs.push(null)
        }
      }) 
    }
    //console.log()
    //console.log(freqs);
    console.log(count);
    console.log(freqs);

    //delete null values 
    new_freqs = []
    new_count = []
    new_keys = []
    for(var i=0; i<count.length; i++) {
      if(freqs[i]) {
        new_freq.push(freqs[i])
        new_count.push(count[i])
        new_keys.push(keys[i])      
      }
    }
    console.log(new_count);
    console.log(new_freqs);

    // Build scatter plot Count v.s. WFREQ
    var trace = {
      x: new_freqs,
      y: new_count,
      text: new_keys,
      mode: 'markers',
      marker: {
        //color: colors,
        size:  new_count
      },
      type: 'scatter'
    };
    var data = [trace];
    var layout = {
      showlegend: false,
      xaxis: {
        title: {
          text: 'WASH FRQUENCY'
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
    Plotly.newPlot("scatter", data, layout);
    
  })
}
