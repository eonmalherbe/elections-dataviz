import React, { Component } from 'react';
import * as d3 from 'd3';

// using britecharts for a proof of concept
import bar from 'britecharts/dist/umd/bar.min';

import './barchart.css';

// for the purposes of the proof of concept - production data should be live
var use_live_data = false;
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

class BarChart extends Component {

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

        barChart = bar();
        var containerWidth = props.width;
        barChart
            .width(containerWidth)
            .height(props.height)
            .hasPercentage(false)
            .enableLabels(true)
            .labelsNumberFormat('0')
            .isAnimated(false)

        container.datum(chartData).call(barChart);

        var redrawChart = function() {
            var newContainerWidth = container.node() ? container.node().getBoundingClientRect().width : false;

            barChart.width(newContainerWidth);
            container.datum(chartData).call(barChart);
        };

        window.addEventListener("resize", redrawChart, 200);
    }

    draw(container, props) {
        var self = this;
        if (use_live_data) {
            d3.json(props.url).then(function(data) {
                self.drawGraph(container, props, data);
            });
        }
        else {
            self.drawGraph(container, props, js);
        }
    }

    componentDidMount() {
        this.draw(this.getContainer(), this.props)
    }

    componentDidUpdate() {
        this.draw(this.getContainer(), this.props)
    }

    getContainer() {
        return d3.select(this.refs.vizcontainer)
    }
      
    render () {
        return (
          <div ref="vizcontainer" className="chart"></div>
        )
    }
}

export default BarChart;
