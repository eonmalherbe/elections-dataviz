import * as d3 from "d3";
import {createTooltip} from "../../utils";
import { type } from "os";

export function Chart(container, width, height, className, options) {


  if (!options) {
    options = {};
  } 
  if (!options.chartType) {
    options.chartType = "Race For Votes";
  }
  if (!options.yAxisLabel) {
    options.yAxisLabel = "PERCENTAGE VOTES";
  }
  if (!options.yValue) {
    options.yValue = function(d) {
      return d.percOfVotes;
    }
  }
  if (!options.yValueFormat) {
    options.yValueFormat = function(value) {
      return value + '%';
    }
  }

  width = 700;
  height = 200;
  container.selectAll("svg").remove();

    var XaxisOffset = 70;
    var YaxisOffset = 20;
    var predefColors = ["blue", "yellow", "red"];

    var svg = container.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet").style("background-color","#ffffff")
        .attr("viewBox", "0 0 " + (width+XaxisOffset) + " " + (height+YaxisOffset))
        .classed("svg-content", true);
        
    var tooltipDiv = createTooltip(className);
  
    var x = d3.scaleBand()
      .rangeRound([XaxisOffset, width])
  
    var y = d3.scaleLinear()
      .rangeRound([height, YaxisOffset]);
  
    svg.append("g")
      .attr("transform", "translate(20,"+(height/2+YaxisOffset/2)+")")
      .append("text")
      .attr("class", className("percentage-label"))
      .attr("transform", "rotate(-90)")
      .text(options.yAxisLabel)
      .attr("text-anchor", "middle");
  
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
  
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + XaxisOffset +", 0)")
  
    var barSvg = svg.append("g")
      .attr("class", className("bar-container"));
    var barTextSvg = svg.append("g")
      .attr("class", className("bartext-container"));
  
    this.draw = function(chartData, colorsData) {
      var partyColorByName = {};

      if (options.noXaxisByParty) {

      } else {
        var partyColorsData = colorsData;
        if (partyColorsData && partyColorsData["data"]["allParties"]["edges"]) {
          partyColorsData["data"]["allParties"]["edges"].forEach(edge => {
            partyColorByName[edge.node.name] = edge.node.colour;
          })
        }
      }

      function getFillColorFromPartyName(partyName, i) {
        return partyColorByName[partyName.split("/")[0]] || predefColors[i%predefColors.length];
      }

      function getFillColor(d, i) {
        if (options.noXaxisByParty) {
          if (typeof colorsData == "object")
            return colorsData[d.name];
          if (typeof colorsData == "function")
            return colorsData(d, i);
          return colorsData;
        } else {
          return getFillColorFromPartyName(d.partyInfo.name, i);
        }
      }

      function getTooltipText(d, i) {
        if (options.noXaxisByParty) {
          return d.name + " : " + options.yValueFormat(options.yValue(d));
        } else {
          function formatPartyName(name) {
            return name.split("/")[0].toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase() })
          }
          return formatPartyName(d.partyInfo.name) + " : " + options.yValueFormat(options.yValue(d));
        }	
      }

      x.domain(chartData.map(function (d) {
          return d.name;
        }));
      var minMaxY = [0, 100];
      if (options.dynamicYAxisFromValues) {
        minMaxY[1] = d3.max(chartData, function(d) { return options.yValue(d); })
      }
      y.domain(minMaxY);
  
      svg.select(".x.axis").transition().duration(300).call(d3.axisBottom(x));
      svg.select(".y.axis").transition().duration(300).call(d3.axisLeft(y)
        .ticks(6)
        .tickFormat(function(d) { return options.yValueFormat(d); })
      )
  
      var bars = barSvg.selectAll(`.${className("bar")}`).data(chartData);
  
      bars.exit()
        .transition()
        .duration(300)
        .attr("y", function(d) {
          return y(0);
        })
        .attr("height", 0)
        .style("fill-opacity", 1e-6)
        .remove();
  
      bars.enter()
          .append("rect")
          .attr("class", className("bar"))
          .attr("x", function (d) {
            return x(d.name)+x.bandwidth()/20;
          })
          .attr("width", x.bandwidth()*9/10)
          .attr("fill", (d,i) => getFillColor(d, i))
          .on("mousemove", function(d, i) {		
              d3.select(this)
                .attr("opacity", 0.8);
              tooltipDiv.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              tooltipDiv.html(getTooltipText(d, i))
                  .style("left", (d3.event.pageX) + "px")		
                  .style("top", (d3.event.pageY - 28) + "px");	
              })					
          .on("mouseout", function(d) {		
              d3.select(this)
                .attr("opacity", 1);
              tooltipDiv.transition()		
                  .duration(200)		
                  .style("opacity", 0);	
          })
          .attr("y", function(d) {
            return y(0);
          })
          .attr("height", 0)        
  
        barSvg.selectAll(`.${className("bar")}`).data(chartData)
          .attr("fill", (d, i) => getFillColor(d, i))
          .transition()
          .duration(300)
          .attr("y", function (d) {
            return y(Number(options.yValue(d)));
          })
          .attr("height", function (d) {
            return height - y(Number(options.yValue(d)));
          })
          
        var barTexts = barTextSvg.selectAll(`.${className("bartext")}`).data(chartData);
  
        barTexts.exit()
          .transition()
          .duration(300)
          .attr("y", function(d) {
            return y(0) - 5;
          })
          .style("fill-opacity", 1e-6)
          .remove();
  
        barTexts.enter().append("text")
          .attr("class", className("bartext"))
          .attr("x", function (d) {
            return x(d.name)+x.bandwidth()/2;
          })
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("y", function(d) {
            return y(0) - 5;
          })
        barTextSvg.selectAll(`.${className("bartext")}`).data(chartData)
          .text(function(d) {
            return options.yValueFormat(options.yValue(d));
          })
          .transition()
          .duration(300)
          .attr("y", function (d) {
            return y(Number(options.yValue(d))) - 5;
          })
    }
    this.destroy = function() {
      svg.remove();
    }
  }