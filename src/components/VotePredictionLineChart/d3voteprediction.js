import * as d3 from "d3";
import {createTooltip} from "../../utils";

export function Chart(container, width, height, className, options) {
  if (!options) {
    options = {};
  } 

  var width = 360;
  var height = 185;
  var margins = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 50
  }

  // TODO see if this can be reomved
  container.selectAll("svg").remove();

  //var predefColors = ["blue", "yellow", "red"];

  var svg = container.append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width) + " " + (height))
      .classed("svg-content", true);

  var tooltipDiv = createTooltip(className);

  var mainSvg = svg.append("g");

  var errorText = svg.append("g")
    .attr("transform", "translate("+(width/2)+","+(height/2)+")")
    .append("text")
    .attr("text-anchor", "middle");


  this.draw = function(originChartData, colorsData) {
    var chartData = [];
    if (!originChartData) {
      errorText.text("chart data is not available");
      return;
    } else {
      errorText.text("");
    }

    var x = d3.scaleLinear()
      .domain([0, 1000])   // TODO This should be the number of VDs
      .range([margins.left, width - margins.right]);

    var y = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margins.top, margins.bottom]);

    var xAxis = d3.axisBottom()
      .scale(x)
      .tickSize(5)
      .tickSubdivide(true)

    var yAxis = d3.axisLeft()
      .scale(y)
      .tickSize(5)
      .tickSubdivide(true);

    mainSvg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
      .call(xAxis);

    mainSvg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margins.left) + ',0)')
      .call(yAxis);

    mainSvg.append("circle").attr("r", 200).attr("cx", 50).attr("cy", 50).style("fill", "red")

     /*
    for(var i = originChartData.length - 1; i >= 0 ; i -=2) {
      chartData.push(originChartData[i]);
    }
    for (i= -1 - i; i < originChartData.length; i += 2) {
      chartData.push(originChartData[i]);
    }


      var partyColorByName = {};

      var partyColorsData = colorsData;
      if (partyColorsData && partyColorsData["data"]["allParties"]["edges"]) {
          partyColorsData["data"]["allParties"]["edges"].forEach(edge => {
          partyColorByName[edge.node.name] = edge.node.colour;
          })
      }

      function getFillColorFromPartyName(partyName, i) {
        return partyColorByName[partyName.split("/")[0]] || predefColors[i%predefColors.length];
      }

      function getTooltipText(d, i) {
          return d.name;
      }
      */
    }
    this.destroy = function() {
      svg.remove();
    }
  }