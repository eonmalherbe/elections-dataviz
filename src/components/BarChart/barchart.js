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
var seed = 1;

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

function Chart(container, width, height) {
  var XaxisOffset = 70;
  var YaxisOffset = 20;
  var predefColors = predefBarChartColors;
  var svg = container.append("svg")
      .attr("width", width + XaxisOffset)
      .attr("height", height + YaxisOffset);

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

  var defs = svg.append("defs");
  for (var i = 0; i < predefColors.length; i ++)
    defineGradient(defs, predefColors[i]);

  var tooltipDiv;
  if (document.getElementsByClassName('tooltip')[0]) {
    tooltipDiv = d3.select(".tooltip");
  } else {
    tooltipDiv = d3.select("body").append("div")	
      .attr("class", className("tooltip"))				
      .style("opacity", 0);
  }

  var x = d3.scaleBand()
    .rangeRound([XaxisOffset, width])

  var y = d3.scaleLinear()
    .rangeRound([height, YaxisOffset]);

  svg.append("g")
    .attr("transform", "translate(20,"+(height/2+YaxisOffset/2)+")")
    .append("text")
    .attr("class", className("percentage-label"))
    .attr("transform", "rotate(-90)")
    .text("PERCENTAGE VOTES")
    .attr("text-anchor", "middle");

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + XaxisOffset +", 0)")

  svg.append("g")
    .attr("class", className("grid"))
    .attr("transform", "translate(" + XaxisOffset +", 0)")

  var barSvg = svg.append("g")
    .attr("class", className("bar-container"));
  var barTextSvg = svg.append("g")
    .attr("class", className("bartext-container"));

  this.draw = function(chartData) {
    console.log("draw start", chartData);
    x.domain(chartData.map(function (d) {
        return d.name;
      }));
    y.domain([0, d3.max(chartData, function (d) {
          return Number(d.value);
        })]);


		svg.select('.x.axis').transition().duration(300).call(d3.axisBottom(x));
		svg.select(".y.axis").transition().duration(300).call(d3.axisLeft(y)
      .ticks(6)
      .tickSize(-width+XaxisOffset)
    )
    svg.select(".grid").transition().duration(300).call(d3.axisLeft(y)
      .ticks(6)
      .tickSize(-width+XaxisOffset)
      .tickFormat("")
    )

    var bars = barSvg.selectAll(`.${className("bar")}`).data(chartData);

    bars.exit()
      .transition()
      .duration(300)
      .attr("y", function(d) {
        return y(0);
      })
      .attr("height", 0)
      .style('fill-opacity', 1e-6)
      .remove();

    bars.enter()
        .append("rect")
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

      barSvg.selectAll(`.${className("bar")}`).data(chartData)
        .transition()
        .duration(300)
        .attr("y", function (d) {
          return y(Number(d.value));
        })
        .attr("height", function (d) {
          return height - y(Number(d.value));
        })
      console.log("bars", bars);
        
      var barTexts = barTextSvg.selectAll(`.${className("bartext")}`).data(chartData);

      barTexts.exit()
        .transition()
        .duration(300)
        .attr("y", function(d) {
          return y(0) - 5;
        })
        .style('fill-opacity', 1e-6)
        .remove();

      barTexts.enter().append("text")
        .attr("class", className("bartext"))
        .attr("x", function (d) {
          return x(d.name)+x.bandwidth()/2;
        })
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr("y", function(d) {
          return y(0) - 5;
        })
      barTextSvg.selectAll(`.${className("bartext")}`).data(chartData)
        .text(function(d) {
          return d.value;
        })
        .transition()
        .duration(300)
        .attr("y", function (d) {
          // console.log("d.frequency", d.frequency);
          return y(Number(d.value)) - 5;
        })
  }
}

var chart;

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
      window.addEventListener("resize", this.redrawChart, 200);
    }



    componentDidUpdate() {
      this.draw(this.getContainer(), this.props)
    }

    componentWillUnmount() {
      document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange.bind(this));
      window.removeEventListener("resize", this.redrawChart);
    }

    redrawChart() {
      // var newContainerWidth = container.node() ? container.node().getBoundingClientRect().width : false;
      // if (newContainerWidth) {

      // }
    };

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
        var chartData;
        var results = data["data"]["allProvincialBallots"].edges[0]["node"]["topResult"]["edges"];
        chartData = results.map(function(node) {
            var el = node["node"];
            return {
                name: el["party"]["abbreviation"],
                value: el["validVotes"] + parseInt(Math.random(seed++) * 0.1 * el["validVotes"])
            }
        }).reverse();

        var width = parseInt(props.width);
        var height = parseInt(props.height);
        if (!chart)
          chart = new Chart(container, width, height);
        chart.draw(chartData);
        console.log("draw chartData", chartData);
    }
}

export default BarChart;
