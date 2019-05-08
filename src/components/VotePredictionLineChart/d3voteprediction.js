import * as d3 from "d3";
import {createTooltip, createSvg, createErrorText, PartyColours} from "../../utils";

export function Chart(container, width, height, className, options) {
  if (!options) {
    options = {};
  }

  var showPoints = options.showPoints || true;
  var pointRadius = options.pointRadius || 2;
  var showPointLabels = options.showPointLabels || false;
  var pointLabelOffset = options.pointLabelOffset || 4;
  var showCurrentLine = options.showCurrentLine || true;

  width = 600;
  height = 400;

  var margin = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 40
  }

  var canvas = {
    top : margin.top,
    bottom : height - margin.bottom - margin.top,
    left : margin.left,
    right : width - margin.right - margin.left
  }

  //var predefColors = ["blue", "yellow", "red"];

  var svg = createSvg(container, width, height);

  var tooltipDiv = createTooltip(className);

  var mainSvg = svg
    .append("g")

  var errorText = createErrorText(svg, width / 2, height / 2);

  this.draw = function(originChartData, colorsData) {
    var chartData = [];
    var getPartyColour = PartyColours(colorsData);

    if (!originChartData) {
      errorText.text("chart data is not available");
      return;
    }

    var x = d3.scaleLinear()
      .domain([0, 100])
      .range([canvas.left, canvas.right]);

    var y = d3.scaleLinear()
      .domain([0, 100])
      .range([canvas.bottom, canvas.top]);

    var radiusScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 100]);
    
    mainSvg.selectAll("g").remove();

    var axisContainer = mainSvg
      .append("g")
        .classed("axes", true)

    axisContainer.append("g")
      .attr("transform", "translate(0, " + canvas.bottom + ")")
      .classed("x-axis", true)
      .call(d3.axisBottom(x));

    axisContainer.append("g")
      .attr("transform", "translate(" + canvas.left + ", 0)")
      .classed("y-axis", true)
      .call(d3.axisLeft(y));

    axisContainer.append("text")
      .text("% VDs declared")
      .attr("transform", "translate(" + x(50) + ", " + y(-10) + ")")
      .style("fill", "white")
      .attr("text-anchor", "middle")
      .classed("x-axis-text", "true")
      .classed("axis-text", "true")

    axisContainer.append("text")
      .text("% Party support")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90) translate(-180, 10)")
      .style("fill", "white")
      .classed("y-axis-text", "true")
      .classed("axis-text", "true")

    var data = null;
    var party = null;
    var lineContainer = null;
    var legendContainer = null;
    var eventCaptureContainer = null;
    var cleaned_party_name = null;
    var valueline = null;

    originChartData.map(function(party) {
      valueline = d3.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

      data = party.data;
      var colour = getPartyColour(party.name);

      lineContainer = mainSvg.append("g")
        .classed("line-container", true)
        .classed(party.cleaned_name, true);
      
      legendContainer = mainSvg.append("g")
        .classed("ledgends", true)

      eventCaptureContainer = mainSvg.append("g")
        .classed("event-capture-container", true)
        .classed(party.cleaned_name, true);

      lineContainer.append("path")
        .data([data])
          .attr("class", "line")
          .attr("d", valueline)
          .style("stroke", colour)

      if (showPoints) {
        lineContainer.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.x) })
            .attr("cy", function(d) { return y(d.y) })
            .attr("r", function(d) { return radiusScale(pointRadius) })
            .style("fill", colour)
            .classed("graph-points", true)
        
        eventCaptureContainer.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.x) })
            .attr("cy", function(d) { return y(d.y) })
            .attr("r", function(d) { return radiusScale(pointRadius) * 3 })
            .style("fill", "transparent")
            .classed("graph-points", true)
            .on("mousemove", function(d, i) {		
              console.log("tooltip mousemove");
              d3.select(this)
                .attr("opacity", 0.8);
              tooltipDiv.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              tooltipDiv.html(d.y + "%")
                  .style("left", (d3.event.pageX) + "px")		
                  .style("top", (d3.event.pageY - 28) + "px");	
            })					
            .on("mouseout", function(d) {		
              console.log("tooltip mouseout");
              d3.select(this)
                .attr("opacity", 1);
              tooltipDiv.transition()		
                .duration(200)		
                .style("opacity", 0);	
            })
      }

      if (showPointLabels) {
        lineContainer.selectAll("text")
          .data(data)
          .enter()
          .append("text")
            .text(function(d) { return d.y})
            .attr("transform", function(d) {
              return "translate(" +  x(d.x - radiusScale(pointRadius / 2)) + ", " + y(d.y + pointLabelOffset) + ")"
            })
            .classed("graph-labels", true)
      }

      // if (options.showLegend) 
      {
        var parties = [];
        var partyAbbrs = [];
        var partyIecIds = [];
        originChartData.forEach((partyInfo) => {
          var party = partyInfo.name;
          if (partyIecIds.indexOf(partyInfo.iecId) === -1 && partyInfo.iecId) {
              parties.push(party);
              partyAbbrs.push(partyInfo.abbreviation)
              partyIecIds.push(partyInfo.iecId);
          }
        })
        
        function getLegendXY(i) {
          
          var xydata = [30 + (i%5)*100, height - 30 + parseInt(i/5) * 40];
          if (parties.length < 6) {
            xydata[0] += 100 * ( 6 - parties.length) / 2;
          }
          return xydata;
        }
        legendContainer.selectAll(`.${className("legend")}`).remove();
        var legends = legendContainer.selectAll(`.${className("legend")}`)
            .data(parties)
            .enter()
            .append('g')
            .attr("class", className("legend"))
            .attr('transform', (d, i) => "translate(" + getLegendXY(i) + ")")
        legends
            .append("rect")
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 0)
            .attr('y', 0)
            .attr("fill", (party, i) => {
                return getPartyColour(party);
            })
        legends.append('text')
            .attr('x', 30)
            .attr('y', 10)
            .style('font-size', '12px')
            .text((party, idx) => partyAbbrs[idx])
      }

    })





     /*

      function getTooltipText(d, i) {
          return d.name;
      }
      */
    }
    this.destroy = function() {
      svg.remove();
    }
  }