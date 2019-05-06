import * as d3 from "d3";
import {createTooltip, createSvg, createErrorText, PartyColours} from "../../utils";

export function Chart(container, width, height, className, options) {
  if (!options) {
    options = {};
  }

  var showPoints = options.showPoints || true;
  var pointRadius = options.pointRadius || 2;
  var showPointLabels = options.showPointLabels || true;
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