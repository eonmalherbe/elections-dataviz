import * as d3 from "d3";
import {createTooltip, formatPartyName, formatClassNameFromPartyAbbr} from "../../utils";
import config from "../../config"

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
        .attr("viewBox", options.viewBox || ("0 0 " + (width+XaxisOffset) + " " + (height+YaxisOffset)))
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
        .attr("class", "topLabel")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", 20)
        .text(options.topLabel);

      // svg.append("text")
      //   .attr("text-anchor", "end")
      //   .attr("x", width)
      //   .attr("y", 40)
      //   .text(options.usedValue);

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
          return d.name + " : " + options.yValueFormat(options.yValue(d));
        } else {
          return formatPartyName(d.partyInfo.name) + " : " + options.yValueFormat(options.yValue(d));
        }	
      }

      x.domain(groupChartData.map(item => item.partyAbbr));

      var minMaxY = [0, 100];
      if (options.dynamicYAxisFromValues) {
        minMaxY[1] = d3.max(groupChartData.map(item => d3.max(item.data, function(d) { return options.yValue(d); }))) + 1
      }
      y.domain(minMaxY);

      var groupSvgs = svg.selectAll(`.bar-group`).data(groupChartData);
      groupSvgs.exit()
        .transition()
        .duration(300)
        .style("fill-opacity", 1e-6)
        .remove();
    
      var groupSvg = groupSvgs.enter()
        .append("g")
        .attr("class", d => `bar-group ${formatClassNameFromPartyAbbr(d.partyAbbr)}`)
        .attr("transform", (d) => `translate(${x(d.partyAbbr)}, 0)`);

      groupSvg.append('rect')
        .attr('class', className(config.CSS_PREFIX + "grouprect"))
        .attr('x', -x.bandwidth()*1/12)
        .attr('y', YaxisOffset - 85)
        .attr('width', x.bandwidth()*5/6)
        .attr('height', 120 + height - YaxisOffset);

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

      groupSvg.append("g")
        .attr("class", "baraxistext-container");
      
      for (var i = 0; i < groupChartData.length; i ++) {
        var partyAbbr = groupChartData[i].partyAbbr;
        var chartData = groupChartData[i].data;

        var subX = d3.scaleBand()
          .rangeRound([0, x.bandwidth()*2/3])
          .domain(chartData.map(function (d) {
            return d.name;
          }));

        var groupSvg = svg.selectAll(`.bar-group.${formatClassNameFromPartyAbbr(partyAbbr)}`);

        var barSvg = groupSvg.select(".bar-container");
        var barTextSvg = groupSvg.select(".bartext-container");
        var barAxisTextSvg = groupSvg.select(".baraxistext-container");

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
            .attr("class", (d) => className("bar") + " bar_" + d.name)
            .attr("x", function (d, i) {
              return subX(d.name)+subX.bandwidth()/4;
            })
            .attr("width", subX.bandwidth()*1/2)
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
            

          var barAxisTexts = barAxisTextSvg.selectAll(`.${className("bartext")}`).data(chartData);
          barAxisTexts.exit()
            .transition()
            .duration(300)
            .style("fill-opacity", 1e-6)
            .remove();
    
          barAxisTexts.enter().append("text")
            .attr("class", className("bartext"))
            .attr("x", function (d) {
              return subX(d.name)+subX.bandwidth()/2;
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "7px")
            .attr("y", function(d) {
              return y(0) + 18;
            })
          barAxisTextSvg.selectAll(`.${className("bartext")}`).data(chartData)
            .text(function(d) {
              return /(19|20)\d{2}/g.exec(d.name)[0];
            });
            
    
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
              return subX(d.name)+subX.bandwidth()/2;
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "7px")
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
    }
    this.destroy = function() {
      svg.remove();
    }
  }