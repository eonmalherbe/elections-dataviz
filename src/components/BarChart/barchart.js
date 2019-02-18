import React, { Component } from 'react';
import * as d3 from 'd3';
import styles from './barchart.css';

import events from '../../events';
import {
  getVotesData
} from '../../api';

var dataRefreshTime = 30 * 100;
var predefBarChartColors = [
  {R: 0, G: 114, B: 47},
  {R: 3, G: 62, B: 108},
  {R: 131, G: 23, B: 27},
  {R: 170, G: 0, B: 14},
  {R: 76, G: 114, B: 114},
  {R: 191, G: 135, B: 50},
];

// for the purposes of the proof of concept - production data should be live
var use_live_data = true;
var js = {
  "data": {
    "allProvincialBallots": {
      "edges": [
        {
          "node": {
            "location": {
              "name": "Western Cape"
            },
            "topResult": {
              "edges": [
                {
                  "node": {
                    "party": {
                      "abbreviation": "VF Plus",
                      "name": "VRYHEIDSFRONT PLUS"
                    },
                    "validVotes": 23243
                  }
                },
                {
                  "node": {
                    "party": {
                      "abbreviation": "ACDP",
                      "name": "AFRICAN CHRISTIAN DEMOCRATIC PARTY"
                    },
                    "validVotes": 25318
                  }
                },
                {
                  "node": {
                    "party": {
                      "abbreviation": "EFF",
                      "name": "ECONOMIC FREEDOM FIGHTERS"
                    },
                    "validVotes": 50280
                  }
                },
                {
                  "node": {
                    "party": {
                      "abbreviation": "ANC",
                      "name": "AFRICAN NATIONAL CONGRESS"
                    },
                    "validVotes": 737219
                  }
                },
                {
                  "node": {
                    "party": {
                      "abbreviation": "DA",
                      "name": "DEMOCRATIC ALLIANCE/DEMOKRATIESE ALLIANSIE"
                    },
                    "validVotes": 1241424
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
}

function className(originName) {
  return styles[originName] || originName;
}

class BarChart extends Component {

    constructor(props) {
      super(props);
      var self = this;
      setInterval(() => {
        self.draw(self.getContainer(), self.props)
      }, dataRefreshTime);
    }
  
    componentDidMount() {
      this.draw(this.getContainer(), this.props)
      document.addEventListener(events.REGION_CHANGE, this.handleRegionChange.bind(this));
    }

    componentDidUpdate() {
      this.draw(this.getContainer(), this.props)
    }

    componentWillUnmount() {
      document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange.bind(this));
    }

    handleRegionChange = (event) => {
      alert("region is changed");
    }

    getContainer() {
      return d3.select(this.refs.vizcontainer)
    }
      
    render () {
      return (
          <div>
            <div className={className("chart-title")}>RACE FOR VOTES: </div>
            <div ref="vizcontainer" className={className("chart-body")}></div>
          </div>
        )
    }

    draw(container, props) {
      var self = this;
      if (use_live_data) {
        getVotesData({
          numParties: props.numParties || 5,
          regionName: props.regionName || "Western Cape"
        }).then(function(data) {
            self.drawGraph(container, props, data);
        }).catch(error => console.error(error));
      }
      else {
          self.drawGraph(container, props, js);
      }
    }

    drawGraph(container, props, data) {
        var chartData, barChart;
        var results = data["data"]["allProvincialBallots"].edges[0]["node"]["topResult"]["edges"];
        chartData = results.map(function(node) {
            var el = node["node"];
            return {
                name: el["party"]["abbreviation"],
                value: el["validVotes"]
            }
        }).reverse();

        var width = props.width;
        var height = props.height;

        function gradientName(rgb) {
          return `gradientrgb-${rgb.R}-${rgb.G}-${rgb.B}`;
        }

        function defineGradient(defs, originRGB) {
          function getMergedColorWithWhite(percent) {
            var mixedR = (originRGB.R * (100-percent) + 255 * (percent))/100;
            var mixedG = (originRGB.G * (100-percent) + 255 * (percent))/100;
            var mixedB = (originRGB.B * (100-percent) + 255 * (percent))/100;
            return `rgb(${mixedR},${mixedG},${mixedB})`;
          }
          var linearGradient = defs.append("linearGradient")
            .attr("id", gradientName(originRGB));
          var gradientInfo = [[0,0], [11, 92], [25,15], [82, 35], [100, 4]];
          linearGradient.selectAll("stop")
            .data(gradientInfo)
            .enter()
            .append('stop')
            .attr("offset", d => d[0]+'%')
            .attr("stop-color", d => getMergedColorWithWhite(d[1]))
            .attr("stop-opacity", 1);
        }

        function d3DrawBarChart(width, height) {
          width = parseInt(width);
          height = parseInt(height);
          container.select("svg").remove();
          var XaxisOffset = 70;
          var YaxisOffset = 20;
          var svg = container.append("svg")
            .attr("width", width + XaxisOffset)
            .attr("height", height + YaxisOffset);

          var predefColors = predefBarChartColors;

          var defs = svg.append("defs");
          for (var i = 0; i < predefColors.length; i ++)
            defineGradient(defs, predefColors[i]);

          // Define the div for the tooltip
          var tooltipDiv = d3.select("body").append("div")	
            .attr("class", className("tooltip"))				
            .style("opacity", 0);

          var x = d3.scaleBand()
            .rangeRound([XaxisOffset, width])

          var y = d3.scaleLinear()
            .rangeRound([height, YaxisOffset]);

          x.domain(chartData.map(function (d) {
              return d.name;
            }));
          y.domain([0, d3.max(chartData, function (d) {
                return Number(d.value);
              })]);


          svg.append("g")
              .attr("transform", "translate(20,"+(height/2+YaxisOffset/2)+")")
              .append("text")
              .attr("class", className("percentage-label"))
              .attr("transform", "rotate(-90)")
              .text("PERCENTAGE VOTES")
              .attr("text-anchor", "middle");

          svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

          svg.append("g")
            .attr("transform", "translate(" + XaxisOffset +", 0)")
            .call(d3.axisLeft(y)
              .ticks(6)
              .tickSize(-width+XaxisOffset)
            )

          svg.append("g")
            .attr("class", className("grid"))
            .attr("transform", "translate(" + XaxisOffset +", 0)")
            .call(d3.axisLeft(y)
              .ticks(6)
              .tickSize(-width+XaxisOffset)
              .tickFormat("")
            )

          var barSvg = svg.selectAll(".bar")
            .data(chartData)
            .enter()
              .append("g");

          barSvg.append("rect")
              .attr("class", className("bar"))
              .attr("x", function (d) {
                return x(d.name)+x.bandwidth()/20;
              })
              .attr("width", x.bandwidth()*9/10)
              .attr("fill", (d, i) =>`url(#${gradientName(predefColors[i%predefColors.length])})`)
              .on("mousemove", function(d) {		
                  d3.select(this)
                    .attr("opacity", 0.8);
                  tooltipDiv.transition()		
                      .duration(200)		
                      .style("opacity", .9);		
                  tooltipDiv.html(d.name + ' : ' + d.value)	
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
              .transition()
              .duration(1000)
              .attr("y", function (d) {
                return y(Number(d.value));
              })
              .attr("height", function (d) {
                return height - y(Number(d.value));
              })
          barSvg.append("text")
              .attr("x", function (d) {
                return x(d.name)+x.bandwidth()/2;
              })
              .text(function(d) {
                return d.value;
              })
              .attr('text-anchor', 'middle')
              .attr('font-size', '12px')
              .attr("y", function(d) {
                return y(0) - 5;
              })
              .transition()
              .duration(1000)
              .attr("y", function (d) {
                // console.log("d.frequency", d.frequency);
                return y(Number(d.value)) - 5;
              })
        }

        d3DrawBarChart(width, height);

        var redrawChart = function() {
            var newContainerWidth = container.node() ? container.node().getBoundingClientRect().width : false;
            if (newContainerWidth)
              d3DrawBarChart(newContainerWidth, height);
        };

        window.addEventListener("resize", redrawChart, 200);
    }
}

export default BarChart;
