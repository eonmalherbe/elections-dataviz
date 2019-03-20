import * as d3 from "d3";
import {createTooltip} from "../../utils";

export function Chart(container, width, height, className, options) {
  if (!options) {
    options = {};
  } 

  width = 360;
  height = 185;
  container.selectAll("svg").remove();

    var predefColors = ["blue", "yellow", "red"];

    var svg = container.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet").style("background-color","#ffffff")
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

      var totalSeats = 0;
      for (var i = 0; i < chartData.length; i ++) {
        totalSeats += chartData[i].seats;
      }

      function pythonConvertedCode(totalSeats, mainSvg) {
        var Totals=[ 3, 15, 33, 61, 95, 138, 189, 247, 313, 388, 469, 559, 657, 762, 876, 997, 1126, 1263, 1408, 1560, 1722, 1889, 2066, 2250, 2442, 2641, 2850, 3064, 3289, 3519, 3759, 4005, 4261, 4522, 4794, 5071, 5358, 5652, 5953, 6263, 6581, 6906, 7239, 7581, 7929, 8287, 8650, 9024, 9404, 9793, 10187, 10594, 11003, 11425, 11850, 12288, 12729, 13183, 13638, 14109, 14580, 15066, 15553, 16055, 16557, 17075, 17592, 18126, 18660, 19208, 19758, 20323, 20888, 21468, 22050, 22645, 23243, 23853, 24467, 25094, 25723, 26364, 27011, 27667, 28329, 29001, 29679, 30367, 31061]
    
        if (totalSeats > Totals[Totals.length-1]){
            console.error("total seats >", Totals[Totals.length-1]);
        }
    
        if (totalSeats < 1) {
          console.error("total seats < 1");
        }
        var rows;
        var radius;
        var poslist;
        var J, R, angle;
          // Figure out how many rows are needed:
          for (var i = 0; i < Totals.length; i ++ ){
              if (Totals[i] >= totalSeats) {
                  rows = i + 1;
                  break
              }
          }
          // Maximum radius of spot is 0.5/rows; leave a bit of space.
          radius = 0.4/rows;
    
          // Create list of centre spots
          poslist=[]
          for( var i = 1; i < rows; i ++){
            // Each row can contain pi/(2asin(2/(3n+4i-2))) spots, where n is the number of rows and i is the number of the current row.
            J = parseInt((totalSeats)/Totals[rows-1]*Math.PI/(2*Math.asin(2.0/(3.0*rows+4.0*i-2.0))));
            // The radius of the ith row in an N-row diagram (Ri) is (3*N+4*i-2)/(4*N)
            R = (3.0*rows+4.0*i-2.0)/(4.0*rows);
            if (J == 1) {
              poslist.push({
                angle: Math.PI/2.0,
                x: 1.75*R,
                y: R
              })
            } else {
              for (var j = 0; j < J; j ++){
                // The angle to a spot is n.(pi-2sin(r/Ri))/(Ni-1)+sin(r/Ri) where Ni is the number in the arc
                // x=R.cos(theta) + 1.75
                // y=R.sin(theta)
                angle = (j)*(Math.PI-2.0*Math.sin(radius/R))/(J-1.0)+Math.sin(radius/R);
                poslist.push({
                  angle,
                  x: R*Math.cos(angle)+1.75,
                  y: R*Math.sin(angle)
                });
              }
            }
          }
          J=totalSeats-poslist.length
          R=(7.0*rows-2.0)/(4.0*rows)
          if (J==1) {
              poslist.push({
                angle: Math.PI/2.0,
                x: 1.75*R,
                y: R
              })
          }
          else {
              for (var j = 0; j < J; j ++) {
                  angle=(j)*(Math.PI-2.0*Math.sin(radius/R))/((J)-1.0)+Math.sin(radius/R)
                  poslist.push({
                    angle,
                    x: R*Math.cos(angle)+1.75,
                    y: R*Math.sin(angle)
                  })
              }
          }

          poslist.sort(function(a,b) {
            function value(x) {
              return x.angle - Math.PI/2;
            }
            return value(b) - value(a);
          })

          function onMouseMove(svg, i){
            svg
              .attr("opacity", 0.8);
            tooltipDiv.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltipDiv.html(getTooltipText(chartData[i], i))
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
          }
          function onMouseOut(svg) {
            svg
              .attr("opacity", 1);
            tooltipDiv.transition()		
                .duration(200)		
                .style("opacity", 0);	
          }
          
          mainSvg.append('text')
            .attr('x', 175)
            .attr('y', 175)
            .attr('style', "font-size:36px;font-weight:bold;text-align:center;text-anchor:middle;font-family:sans-serif")
            .text(totalSeats);

          var Counter=0 //How many spots have we drawn?
          for (var i = 0; i < chartData.length; i ++){
            //Make each party's blocks an svg group
            var partySvg = mainSvg.append('g')
              .attr("fill", getFillColorFromPartyName(chartData[i].partyInfo.name, i))
              .attr("id", chartData[i].name);
            
            partySvg.on("mousemove", onMouseMove.bind(this, partySvg, i))					
              .on("mouseout", onMouseOut.bind(this, partySvg))
            
            for (var j = 0; j < chartData[i].seats; j ++, Counter ++){
              partySvg.append('circle')
                .attr('cx', poslist[Counter].x*100.0+5.0)
                .attr('cy', 100.0*(1.75-poslist[Counter].y)+5.0)
                .attr('r', radius*100.0)
            }
          }
      }
      pythonConvertedCode(totalSeats, mainSvg);

    }
    this.destroy = function() {
      svg.remove();
    }
  }