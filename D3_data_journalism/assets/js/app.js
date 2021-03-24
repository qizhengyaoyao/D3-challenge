var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
        d3.max(data, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating x-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.7,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles x
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles y
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}
// Updating text location
function renderXText(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}
function renderYText(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenYAxis]))
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var labelx;
    var labely;
  
    if (chosenXAxis === "poverty") {
        labelx = "Poverty:";
        unitx = "%";
    }
    else if (chosenXAxis === "age") {
        labelx = "Age:";
        unitx = "";
    }
    else if (chosenXAxis === "income"){
        labelx = "Household income:"
        unitx = "$";
    }

    if (chosenYAxis === 'healthcare'){
        labely = "Health:"
    }
    else if (chosenYAxis === 'obesity'){
        labely = "Obesity:"
    }
    else if (chosenYAxis === 'smokes'){
        labely = "Smokes:"
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${labelx} ${d[chosenXAxis]}${unitx}<br>${labely} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
    .on("mouseout", function(data, index) {
    toolTip.hide(data);
    });
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    // console.log(data)
    if (err) throw err;
  
    // parse data
    data.forEach(d => {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.healthcare = +d.healthcare;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
    
    var elemEnter = chartGroup.selectAll("circle")
        .data(data)
        .enter() 
        .append("g")
    
    // append initial circles
    var circlesGroup = elemEnter     
      .append("circle")
      .classed('stateCircle', true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)

    // append initial text
    var textGroup = elemEnter
      .append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5) 
      .classed('stateText', true)
      .attr("font-size", "smaller");
  
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `rotate(-90) translate(${-height/2}, ${-margin.left + 60})`)
  
    var PovertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var AgeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var IncomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
    var ObeseLabel = ylabelsGroup.append("text")
      .attr("x", 0)  
      .attr("y", -40)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");
  
    var SmokesLabel = ylabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var HealthLabel = ylabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updating text
          textGroup = renderXText(textGroup, xLinearScale, chosenXAxis)  
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
  
          // changes classes to change bold text
          switch (chosenXAxis) {
              case "poverty":
                PovertyLabel.classed("active", true).classed("inactive", false);
                AgeLabel.classed("active", false).classed("inactive", true);
                IncomeLabel.classed("active", false).classed("inactive", true);
                break;
              case "age":
                PovertyLabel.classed("active", false).classed("inactive", true);
                AgeLabel.classed("active", true).classed("inactive", false);
                IncomeLabel.classed("active", false).classed("inactive", true);
                break;
              case "income":
                PovertyLabel.classed("active", false).classed("inactive", true);
                AgeLabel.classed("active", false).classed("inactive", true);
                IncomeLabel.classed("active", true).classed("inactive", false);
                break;
              default:
                PovertyLabel.classed("active", true).classed("inactive", false);
                AgeLabel.classed("active", false).classed("inactive", true);
                IncomeLabel.classed("active", false).classed("inactive", true);
                break;
            }
        }
      });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // update text
        textGroup = renderYText(textGroup, yLinearScale, chosenYAxis) 

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

        // changes classes to change bold text
        switch (chosenYAxis) {
            case "health":
                HealthLabel.classed("active", true).classed("inactive", false);
                SmokesLabel.classed("active", false).classed("inactive", true);
                ObeseLabel.classed("active", false).classed("inactive", true);
                break;
            case "smokes":
                HealthLabel.classed("active", false).classed("inactive", true);
                SmokesLabel.classed("active", true).classed("inactive", false);
                ObeseLabel.classed("active", false).classed("inactive", true);
                break;
            case "obesity":
                HealthLabel.classed("active", false).classed("inactive", true);
                SmokesLabel.classed("active", false).classed("inactive", true);
                ObeseLabel.classed("active", true).classed("inactive", false);
                break;
            default:
                HealthLabel.classed("active", true).classed("inactive", false);
                SmokesLabel.classed("active", false).classed("inactive", true);
                ObeseLabel.classed("active", false).classed("inactive", true);
                break;
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
  });