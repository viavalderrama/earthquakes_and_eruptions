// https://codepen.io/MinzCode/pen/MWKgyqb
// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
  .defer(d3.csv, "https://raw.githubusercontent.com/viavalderrama/data101-project/main/earthquakes%20(1).csv") // Position of circles
  .defer(d3.csv, "https://raw.githubusercontent.com/viavalderrama/data101-project/main/eruptions%20(1).csv") // Position of circles
  .await(ready);

var sliderMAG = document.getElementById("valueMAG");
var outputMAG = document.getElementById("displayMAG");
var sliderVEI = document.getElementById("valueVEI");
var outputVEI = document.getElementById("displayVEI");

outputMAG.innerHTML = sliderMAG.value; // Display the Magniture slider value
outputVEI.innerHTML = sliderVEI.value; // Display the VEI slider value

// Update the current slider value (each time you drag the slider handle)
sliderMAG.oninput = function() {
  outputMAG.innerHTML = this.value;
}

// Update the current slider value (each time you drag the slider handle)
sliderVEI.oninput = function() {
  outputVEI.innerHTML = this.value;
}

// Map and projection
var projection = d3.geoMercator()
    .center([0,20])                // GPS of location to zoom on
    .scale(99)                       // This is like the zoom
    .translate([ width/2, height/2 ]);

function ready(error, dataGeo, earthquakes, eruptions) {
  // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(dataGeo.features) // 177 features
      .enter()
      .append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
      .attr("cursor","pointer")
      .style("stroke", "none")
      .style("opacity", 0.3)

   // Add a scale for bubble size for earthquakes
      var earthquake_valueExtent = d3.extent(earthquakes, function(d) { return +d.Magnitude; })
      var earthquake_size = d3.scaleSqrt()
      .domain(earthquake_valueExtent)  // What's in the data
      .range([1, 6]);  // Size in pixel but need to adjust

   // Add circles for earthquakes:
      svg
        .selectAll("circlequakes")
        .data(earthquakes)
        .enter()
        .append("circle")
        .filter(function(d, i) {return d.Magnitude <= sliderMAG.value;}) //Magnitude Filter
          .attr("class" , function(d){ return "earthquakes";})
          .attr("cx", function(d){return projection([+d.Longitude, +d.Latitude])[0];})
          .attr("cy", function(d){return projection([+d.Longitude, +d.Latitude])[1];})
          .attr("r", function(d){return earthquake_size(+d.Magnitude);})
          .attr("stroke", "black")
          .attr("stroke-width", 0.01)
        .style("fill", "green")
          .attr("fill-opacity", 0.2)

  // Add a scale for bubble size for eruptions
  var eruption_valueExtent = d3.extent(eruptions, function(d) {return +d.VEI;})
  var eruption_size = d3.scaleSqrt()
    .domain(eruption_valueExtent)  // What's in the data
    .range([1,6]);  // Size in pixel but need to adjust

  // Add circles for eruptions:
      svg
        .selectAll("circletions")
        .data(eruptions)
        .enter()
        .append("circle")
        .filter(function(d, i) {return d.VEI <= sliderVEI.value;}) //VEI Filter
          .attr("class" , function(d){ return "eruptions";})
          .attr("cx", function(d){return projection([+d.Longitude, +d.Latitude])[0];})
          .attr("cy", function(d){return projection([+d.Longitude, +d.Latitude])[1];})
          .attr("r", function(d){return eruption_size(+d.VEI);})
          .attr("stroke", "black")
          .attr("stroke-width", 0.01)
        .style("fill", "red")
          .attr("fill-opacity", 0.2);

  function update(){
      // For each check box:
      d3.selectAll(".checkbox").each(function(d){
        cb = d3.select(this);
        grp = cb.property("value");

        // If the box is check, I show the group
        if(cb.property("checked")){
          if (grp == "earthquakes") {
            svg.selectAll(".earthquakes").transition().duration(1000).style("opacity", 1).attr("r", function(d){return earthquake_size(+d.Magnitude);});
          } else {
            svg.selectAll(".eruptions").transition().duration(1000).style("opacity", 1).attr("r",function(d){return eruption_size(+d.VEI);})
          }

        }
        else{
          svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0);
        }
      })
    }

   d3.selectAll(".checkbox").on("change",update);
   d3.selectAll(".slidecontainer").on("change",update);

    // And I initialize it at the beginning
    update();


}
// set the dimensions and margins of the graph
var margin = {top: 10, right: 0, bottom: 30, left: 30},
    width_line = width - margin.left - margin.right,
    height_line = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
var chart2 = d3.select("#line_chart")
  .append("svg")
    .attr("width", width_line + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/viavalderrama/data101-project/main/earthquakes_eruptions_year.csv", function(data) {

  // group the data: I want to draw one line per group
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) {return d.Type;})
    .entries(data);

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) {return d.Year;}))
    .range([0, width_line]);
 chart2.append("g")
    .attr("transform", "translate(0," + height_line + ")")
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d){return +d.Frequency;})])
    .range([ height_line, 0 ]);
  chart2.append("g")
    .call(d3.axisLeft(y));

  // color palette
  var res = sumstat.map(function(d){ return d.key;}); // list of group names
  var color = d3.scaleOrdinal()
    .domain(res)
    .range(['red','green','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

  // Draw the line
  chart2.selectAll(".line")
      .data(sumstat)
      .enter()
      .append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d.key);})
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) {return x(d.Year); })
            .y(function(d) {return y(+d.Frequency);})
            (d.values)
        })

})
var mar = {top: 10, right: 30, bottom: 90, left: 40},
    wid = 460 - mar.left - mar.right,
    hei = 450 - mar.top - mar.bottom;

// append the svg object to the body of the page
var barchart = d3.select("#bar_chart")
  .append("svg")
    .attr("width", wid + mar.left + mar.right)
    .attr("height", hei + mar.top + mar.bottom)
  .append("g")
    .attr("transform",
          "translate(" + mar.left + "," + mar.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/viavalderrama/data101-project/main/earthquake_freq_file_2.csv", function(data) {

// X axis
var x = d3.scaleBand()
  .range([ 0, wid ])
  .domain(data.map(function(d) { return d.ID; }))
  .padding(0.2);
barchart.append("g")
  .attr("transform", "translate(0," + hei + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 128])
  .range([ hei, 0]);
barchart.append("g")
  .call(d3.axisLeft(y));

// Bars
barchart.selectAll("mybar")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.ID); })
    .attr("width", x.bandwidth())
    .attr("fill", "#69b3a2")
    // no bar at the beginning thus:
    .attr("height", function(d) { return hei - y(0); }) // always equal to 0
    .attr("y", function(d) { return y(0); })

// Animation
barchart.selectAll("rect")
  .transition()
  .duration(800)
  .attr("y", function(d) { return y(d.Frequency); })
  .attr("height", function(d) { return hei - y(d.Frequency); })
  .delay(function(d,i){console.log(i) ; return(i*100)})

})
