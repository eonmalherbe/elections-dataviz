import React, { Component } from "react";
import * as d3 from "d3";
import styles from "./barchart.css";
import {Chart} from "./d3barchart";

import events from "../../events";
import {
  getVotesDataM,
  getPartyColors
} from "../../api";

var dataRefreshTime = 30 * 1000;


// for the purposes of the proof of concept - production data should be live
var use_live_data = true;

var js = {
    "data": {
      "allProvincialBallots": {
        "edges": [
          {
            "node": {
              "partyResults": {
                "edges": [
                  {
                    "node": {
                      "validVotes": 15311,
                      "percOfVotes": 84.44,
                      "party": {
                        "id": "52",
                        "name": "DEMOCRATIC ALLIANCE/DEMOKRATIESE ALLIANSIE",
                        "abbreviation": "DA"
                      }
                    }
                  },
                  {
                    "node": {
                      "validVotes": 1508,
                      "percOfVotes": 8.32,
                      "party": {
                        "id": "7",
                        "name": "AFRICAN NATIONAL CONGRESS",
                        "abbreviation": "ANC"
                      }
                    }
                  },
                  {
                    "node": {
                      "validVotes": 328,
                      "percOfVotes": 1.81,
                      "party": {
                        "id": "938",
                        "name": "AGANG SOUTH AFRICA",
                        "abbreviation": "AGANG SA"
                      }
                    }
                  },
                  {
                    "node": {
                      "validVotes": 255,
                      "percOfVotes": 1.41,
                      "party": {
                        "id": "945",
                        "name": "ECONOMIC FREEDOM FIGHTERS",
                        "abbreviation": "EFF"
                      }
                    }
                  },
                  {
                    "node": {
                      "validVotes": 198,
                      "percOfVotes": 1.09,
                      "party": {
                        "id": "4",
                        "name": "VRYHEIDSFRONT PLUS",
                        "abbreviation": "VF Plus"
                      }
                    }
                  }
                ]
              },
              "location": {
                "id": "UHJvdmluY2VUeXBlOjk5",
                "name": "Out of Country"
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



var chart;
var partyColorsData;
var refreshIntervalID = 0;

class BarChart extends Component {

    constructor(props) {
      super(props);
      var self = this;
      this.state = {
        numParties: 5,
        eventDescription: "2014 National Election",
        regionType: "national",
        provinceName: "",
        muniName: "",
        muniCode: "",
        vdNumber: "",
      }
      if (props.numParties) {
        this.state.numParties = props.numParties;
      }
      if (props.regionType) {
        this.state.regionType = props.regionType;
      }
      if (props.provinceName) {
        this.state.provinceName = props.provinceName;
      }
      if (props.muniName) {
        this.state.muniName = props.muniName;
      }
      if (props.muniCode) {
        this.state.muniCode = props.muniCode;
      }
      if (props.vdNumber) {
        this.state.vdNumber = props.vdNumber;
      }
      if (props.width && props.height) {
        this.state.width = props.width;
        this.state.height = props.height;
      } else {
        var {
          modifW,
          modifH
        } = this.getWidthHeightByScreenSize();
        this.state.width = modifW;
        this.state.height = modifH;
      }
      refreshIntervalID = setInterval(() => {
        self.draw(self.getContainer(), self.state)
      }, dataRefreshTime);
      this.handleRegionChange = this.handleRegionChange.bind(this);
      this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
      this.redrawChart = this.redrawChart.bind(this);
    }
  
    componentDidMount() {
      this.draw(this.getContainer(), this.state)
      document.addEventListener(events.REGION_CHANGE, this.handleRegionChange);
      document.addEventListener(events.BARCHART_PREVIEW, this.handlePreviewEvent);
      window.addEventListener("resize", this.redrawChart, 200);
    }

    componentDidUpdate() {
      this.draw(this.getContainer(), this.state)
    }

    componentWillUnmount() {
      document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
      document.removeEventListener(events.BARCHART_PREVIEW, this.handlePreviewEvent);
      window.removeEventListener("resize", this.redrawChart);
      clearInterval(refreshIntervalID);
    }

    getWidthHeightByScreenSize() {
      var modifW = Math.min(810, document.body.clientWidth- 350);
      if (document.body.clientWidth < 775)
        modifW = document.body.clientWidth - 50;
      var modifH = modifW/3.5;
      return {
        modifW,
        modifH
      }
    }

    redrawChart() {
      var {
        modifW,
        modifH
      } = this.getWidthHeightByScreenSize();
      if (chart)
        chart.destroy();
      chart = new Chart(this.getContainer(), modifW, modifH, className);
      this.setState({width: modifW, height: modifH});
    };

    handleRegionChange(event) {
      var newState = event.detail;
      console.log("handleRegionChange", newState);
      this.setState(newState)
    }

    handlePreviewEvent(event) {
      var newState = event.detail;
      console.log("handlePreviewEvent", newState);
      if (chart)
        chart.destroy();
      chart = new Chart(this.getContainer(), this.state.width, this.state.height, className);
      this.setState(newState)
    }

    getContainer() {
      return d3.select(this.refs.vizcontainer)
    }

    getRegionName() {
      if (this.state.regionType == "national") {
        return "SA";
      }
      if (this.state.regionType == "province") {
        return this.state.provinceName;
      }
      if (this.state.regionType == "municipality") {
        return this.state.muniName;
      }
      if (this.state.regionType == "municipality-vd") {
        return this.state.muniName + "-" + this.state.vdNumber;
      }
    }
      
    render () {
      return (
          <div className="barchart">
            <div className={className("chart-title")}>RACE FOR VOTES ({this.getRegionName()}): </div>
            <div 
              ref="vizcontainer" 
              className={className("chart-body")} 
              style={{width: this.state.width, height: this.state.height}}></div>
          </div>
        )
    }

    draw(container, props) {
      var self = this;
      if (use_live_data) {        
        var votesDataLoader = getVotesDataM(props);
        var dataLoaders = [votesDataLoader];

        if (!partyColorsData) {
          var partyColorsLoader = getPartyColors();
          dataLoaders.push(partyColorsLoader);
        }

        Promise.all(dataLoaders).then(function(values){ 
          var votesData = values[0];
          partyColorsData = partyColorsData || values[1];          
          self.drawGraph(container, props, votesData, partyColorsData);
        }).catch(error => console.error(error));
      }
      else {
        self.drawGraph(container, props, js, null);
      }
    }

    drawGraph(container, props, data, partyColorsData) {
        var results, chartData, firstEdge;
        var regionType = props.regionType;
        if (regionType == "national") {
          firstEdge = data["data"]["allBallots"].edges[0];
        } else if (regionType == "province") {
          firstEdge = data["data"]["allProvincialBallots"].edges[0];
        } else if (regionType == "municipality") {
          firstEdge= data["data"]["allMunicipalBallots"].edges[0];
        } else { //"municipality-vd"
          firstEdge = data["data"]["allVotingDistrictBallots"].edges[0];
        }
        if (!firstEdge){
          console.error("party data is empty!!");
          return;
        }

        var nodeData = firstEdge["node"];
        var partyResults = nodeData["partyResults"] || nodeData["topResult"];
        results = partyResults["edges"];

        chartData = results.map(function(node) {
            var el = node["node"];
            return {
                name: el["party"]["abbreviation"],
                validVotes: el["validVotes"],
                percOfVotes: el["percOfVotes"],
                partyInfo: el["party"]
            }
        });
        
        var width = parseInt(props.width);
        var height = parseInt(props.height);
        if (!chart)
          chart = new Chart(container, width, height, className);
        console.log(results);
        chart.draw(chartData, partyColorsData);
    }
}

export default BarChart;
