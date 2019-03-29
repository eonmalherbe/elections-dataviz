import * as d3 from "d3";
import {createTooltip, formatPartyName} from "../../utils";
export function Chart(container, width, height, className, options) {
  if (!options) {
      options = {};
  }
  width = 700;
  height = 300;
  container.selectAll("svg").remove();

    var XaxisOffset = 70;
    var YaxisOffset = 120;
    var predefColors = ["blue", "yellow", "red"];

    var svg = container.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width+XaxisOffset) + " " + (height+YaxisOffset))
        .classed("svg-content", true);
        
    var tooltipDiv = createTooltip(className);
  
    var x = d3.scaleBand()
      .rangeRound([XaxisOffset, width])
  
    var y = d3.scaleLinear()
      .rangeRound([height, YaxisOffset]);
  
    var errorText = svg.append("g")
      .attr("transform", "translate("+(width/2)+","+(height/2)+")")
      .append("text")
      .attr("text-anchor", "middle");
  
    this.draw = function(groupChartData, colorsData) {

      svg.selectAll(".topLabel").remove();
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "topLabel")
        .attr("x", width/2)
        .attr("y", 20)
        .text(options.topLabel);

      if (!groupChartData) {
        errorText.text("chart data is not available");
        return;
      } else {
        errorText.text("");
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

      function getFillColor(d, i) {
          return getFillColorFromPartyName(d.partyInfo.name, i);
      }

      function getTooltipText(d, i) {
        if (options.noXaxisByParty) {
          return d.name + " : " + options.yValueFormat(d.delta);
        } else {
          return formatPartyName(d.partyInfo.name) + " : " + options.yValueFormat(d.delta);
        }	
      }

      var newGroupChartData = groupChartData.map(item => {
        var chartData = item.data;
        return {
          ...item,
          data: [{
            ...chartData[1],
            delta: options.yValue(chartData[1]) - options.yValue(chartData[0])
          }]
        }
      });

      x.domain(groupChartData.map(item => item.partyAbbr));

      var minMaxY = [-100, 100];
      if (options.dynamicYAxisFromValues) {
        minMaxY[1] = d3.max(newGroupChartData.map(item => item.data[0].delta)) + 1
        minMaxY[0] = d3.min(newGroupChartData.map(item => item.data[0].delta)) - 1
      }
      y.domain(minMaxY);

      var groupSvgs = svg.selectAll(`.bar-group`).data(newGroupChartData);
      groupSvgs.exit()
        .transition()
        .duration(300)
        .style("fill-opacity", 1e-6)
        .remove();
    
      var groupSvg = groupSvgs.enter()
        .append("g")
        .attr("class", d => `bar-group ${d.partyAbbr}`)
        .attr("transform", (d) => `translate(${x(d.partyAbbr)}, 0)`);

      groupSvg.append("g")
        .attr("class", "groupname-container")
        .attr("transform", `translate(${x.bandwidth()*1/3}, ${YaxisOffset - 50})`)
        .append("text")
          .attr("text-anchor", "middle")
          .text(d => d.partyAbbr)

      groupSvg.append("g")
        .attr("class", "bar-container");

      groupSvg.append("g")
        .attr("class", "bartext-container");
      
      for (var i = 0; i < newGroupChartData.length; i ++) {
        var partyAbbr = newGroupChartData[i].partyAbbr;
        var deltaData = newGroupChartData[i].data;

        var groupSvg = svg.selectAll(`.bar-group.${partyAbbr}`);

        var barSvg = groupSvg.select(".bar-container");
        var barTextSvg = groupSvg.select(".bartext-container");

        var bars = barSvg.selectAll(`.${className("bar")}`).data(deltaData);

        bars.exit()
          .transition()
          .duration(300)
          .attr("height", 0)
          .style("fill-opacity", 1e-6)
          .remove();
        
        bars.enter()
            .append("rect")
            .attr("class", (d) => className("bar") + " bar_" + d.name)
            .attr("x", x.bandwidth()/6)
            .attr("width", x.bandwidth()*1/3)
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
    
          barSvg.selectAll(`.${className("bar")}`).data(deltaData)
            .attr("fill", (d, i) => getFillColor(d, i))
            .transition()
            .duration(300)
            .attr("y", function (d) {
              return Math.min(y(Number(d.delta)), y(0));
            })
            .attr("height", function (d) {
              return Math.abs(y(Number(d.delta)) - y(0));
            })
    
          var barTexts = barTextSvg.selectAll(`.${className("bartext")}`).data(deltaData);
          barTexts.exit()
            .transition()
            .duration(300)
            .style("fill-opacity", 1e-6)
            .remove();
    
          barTexts.enter().append("text")
            .attr("class", className("bartext"))
            .attr("x", function (d) {
              return x.bandwidth()/3;
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("y", function(d) {
              if (d.delta > 0)
                return y(0) - 5;
              return y(0) + 5;
            })
          barTextSvg.selectAll(`.${className("bartext")}`).data(deltaData)
            .text(function(d) {
              return options.yValueFormat(d.delta);
            })
            .transition()
            .duration(300)
            .attr("y", function (d) {
              var barTextYDelta = 0;
              if (d.delta > 0) {
                barTextYDelta = -5;
              } else {
                barTextYDelta = 15;
              }
              return y(Number(d.delta)) + barTextYDelta;
            })
      }

      svg.selectAll(".xAxisLine").remove();
      var axisThick = 2;
      svg.append('line')
        .attr('class', 'xAxisLine')
        .attr('stroke-width', axisThick)
        .attr('stroke', "currentColor")
        .attr('x1', XaxisOffset)
        .attr('y1', y(0)-axisThick/2)
        .attr('x2', width)
        .attr('y2', y(0)-axisThick/2)
    }
    this.destroy = function() {
      svg.remove();
    }
  }