import React, { Component } from "react";
import * as d3 from "d3";
import styles from "./barchart.css";
import {Chart} from "../BarChart/d3barchart";

import events from "../../events";
import {
  getVotesDataM,
  getPartyColors,
  getProvincesData
} from "../../api";
import {
  parseVotesData,
  getRegionName
} from "../../utils";

var provincesData = getProvincesData();

var dataRefreshTime = 30 * 1000;

function className(originName) {
  return styles[originName] || originName;
}



var chart;
var partyColorsData;
var refreshIntervalID = 0;

var chartOptions = {
  chartType: "Race For Votes",
  yAxisLabel: "PERCENTAGE VOTES",
  yValue: d => d.percOfVotes,
  yValueFormat: value => value + '%'
}

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
        iecId: "",
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
      if (props.iecId) {
        this.state.iecId = props.iecId;
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
      this.handleRegionChange = this.handleRegionChange.bind(this);
      this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
      this.redrawChart = this.redrawChart.bind(this);
    }
  
    componentDidMount() {

      // if (this.state.width && this.state.height) {

      // } else {
      //   var {
      //     modifW,
      //     modifH
      //   } = this.getWidthHeightByScreenSize();
      //   this.state.width = modifW;
      //   this.state.height = modifH;
      // }

      var self = this;
      this.draw(this.getContainer(), this.state);
      refreshIntervalID = setInterval(() => {
        self.draw(self.getContainer(), self.state)
      }, dataRefreshTime);
      document.addEventListener(events.REGION_CHANGE, this.handleRegionChange);
      document.addEventListener(events.BARCHART_PREVIEW, this.handlePreviewEvent);
      window.addEventListener("resize", this.redrawChart, 200);
    }

    componentDidUpdate() {
      this.draw(this.getContainer(), this.state)
    }

    componentWillUnmount() {
      console.log("barchart unmount");
      chart = null;
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
      // var {
      //   modifW,
      //   modifH
      // } = this.getWidthHeightByScreenSize();
      // if (chart)
      //   chart.destroy();
      // chart = new Chart(this.getContainer(), modifW, modifH, className);
      // this.setState({width: modifW, height: modifH});
    };

    handleRegionChange(event) {
      var newState = event.detail;
      this.setState(newState)
    }

    handlePreviewEvent(event) {
      var newState = event.detail;
      if (chart)
        chart.destroy();
      chart = new Chart(this.getContainer(), this.state.width, this.state.height, className);
      this.setState(newState)
    }

    getContainer() {
      return d3.select(this.refs.vizcontainer)
    }
      
    render () {
      return (
          <div className="barchart">
            <div className={className("chart-title")}>{chartOptions.chartType} ({getRegionName(this.state)}): </div>
            <div 
              ref="vizcontainer" 
              className={className("chart-body")} 
              ></div>
          </div>
        )
    }

    draw(container, props) {
      console.log("drawing ...barchart");
      var self = this;
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

    drawGraph(container, props, data, partyColorsData) {
        var chartData = parseVotesData(data, props);
       
        var width = parseInt(props.width);
        var height = parseInt(props.height);
        if (!chart)
          chart = new Chart(container, width, height, className);
        console.log("chart component", chart)
        chart.draw(chartData, partyColorsData);
    }
}

export default BarChart;
