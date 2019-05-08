import React, { Component } from "react";
import * as d3 from "d3";
import styles from "./voteprediction.css";
import {Chart} from "../VotePredictionLineChart/d3voteprediction";
import svgToPng from "save-svg-as-png";

import events from "../../events";
import config from "../../config";
import {
  getVotesPredictionData,
  getPartyColors
} from "../../api";
import {
  parseVotesPredictionData,
  parseCSIRTurnoutTimestamp,
  getNationOrProvinceName,
  fetchDataFromOBJ,
  handleRegionChange
} from "../../utils";


var dataRefreshTime = 30 * 1000;
var chartOptions = {
  chartType: 'Votes prediction line charts',
};

function className(originName) {
  return styles[originName] || originName;
}

function cn(originName) {
  return className(config.CSS_PREFIX + originName);
}

function formatDate(d) {
  var hr = d.getHours();
  var min = d.getMinutes();
  if (min < 10) {
      min = "0" + min;
  }

  var date = d.getDate();
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var month = months[d.getMonth()];
  var year = d.getFullYear();

  var currentTimeText = hr + ":" + min + " on " + date + " " + month + " " + year;
  return currentTimeText;
}

var partyColorsData;

class VotePredictionLineChart extends Component {
    constructor(props) {
      super(props);
      this.state = {
        numParties: 100,
        electionType: "national",
        eventDescription: "2019 National Election",
        regionType: "national",
        provinceName: "",
        muniName: "",
        muniCode: "",
        iecId: "",
        stylesheetFor: "web",
        componentID: 8
      }
      this._isMounted = false;

      fetchDataFromOBJ(this.state, props);
      this.state["numParties"] = 100;

      this.chart = null;
      this.refreshIntervalID = 0;
      this.exportAsPNG = this.exportAsPNG.bind(this);
      this.exportAsPNGUri = this.exportAsPNGUri.bind(this);
      this.handleRegionChange = handleRegionChange.bind(this);
      this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }
  
    componentDidMount() {
      this._isMounted = true;
      var self = this;
      this.draw(this.getContainer(), this.state);
      this.refreshIntervalID = setInterval(() => {
        self.draw(self.getContainer(), self.state)
      }, dataRefreshTime);
      document.addEventListener(events.EXPORT_PNG, this.exportAsPNG);
      document.addEventListener(events.REGION_CHANGE, this.handleRegionChange);
      document.addEventListener(events.CHART_PREVIEW, this.handlePreviewEvent);
    }

    componentDidUpdate() {
        this.draw(this.getContainer(), this.state);
    }

    componentWillUnmount() {
      this._isMounted = false;
      this.chart = null;
      document.removeEventListener(events.EXPORT_PNG, this.exportAsPNG);
      document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
      document.removeEventListener(events.CHART_PREVIEW, this.handlePreviewEvent);
      clearInterval(this.refreshIntervalID);
    }

    exportAsPNGUri() {
      var self = this;
      return new Promise(function(resolve, reject) {
        svgToPng.svgAsPngUri(self.refs.vizcontainer.childNodes[0], {}, function(uri) {
          resolve(uri.split(',')[1]);
        });
      });
    }

    exportAsPNG(event) {
      var targetState = event.detail;
      if (targetState.componentID != this.state.componentID)
        return;

      // TODO not sure what to change race-for-seats-horseshoe.... to
      svgToPng.saveSvgAsPng(this.refs.vizcontainer.childNodes[0], `race-for-seats-horseshoe-chart(${getNationOrProvinceName(this.state)}).png`);
    }

    handlePreviewEvent(event) {
      if (this._isMounted) {
        var newState = event.detail;
        if (this.chart)
          this.chart.destroy();
        this.chart = new Chart(this.getContainer(), null, null, className, chartOptions);
        this.setState(newState)
      }
    }

    getContainer() {
      return d3.select(this.refs.vizcontainer)
    }
      
    render () {

      const {
        stylesheetFor,
        componentID
      } = this.state;

      var currentTimeText = formatDate(new Date());

      return (
          <div className={className("votepredictionlinechart") + " " + cn(`stylesheet-${stylesheetFor}`)}>
            {
                componentID != -1000 && <div className={cn("chart-title")}>{chartOptions.chartType} ({getNationOrProvinceName(this.state)}): </div>
            }
            <div className={cn("vote-prediction-title")}>
              <div className={cn("projected-turnout")}> 
                Projected turnout: <span ref="projectedTurnout">10%</span>
              </div>
              <div className={cn("prediction-time")}> 
                Predictions at <span ref="lastTimestamp">{currentTimeText}</span>
              </div>
            </div>
            <div 
              ref="vizcontainer" 
              className={cn("chart-body")} 
              ></div>
              <div className={cn("CSIR-bottom-label")}><b>CSIR's election prediction  model</b><br/>The CSIR produces predictions of the final results of the election based on a statistical model. The model can provide scientific predictions even if only a small number of voting districts have been declared and therefore can give a reliable early indication of what the final percentages for each party and the voter turnout rates would be.</div>
          </div>
        )
    }

    draw(container, props) {
      var self = this;
      var predictionDataLoader = getVotesPredictionData(props);
      var dataLoaders = [predictionDataLoader];

      if (!partyColorsData) {
        var partyColorsLoader = getPartyColors();
        dataLoaders.push(partyColorsLoader);
      }

      Promise.all(dataLoaders).then(function(values){ 
        var predictionData = values[0];
        partyColorsData = partyColorsData || values[1];         
        self.drawGraph(container, props, predictionData, partyColorsData);
      }).catch(error => console.error(error));
    }

    drawGraph(container, props, data, partyColorsData) {
        var chartData = parseVotesPredictionData(data, props);
        var {
          turnout,
          timestamp
        } = parseCSIRTurnoutTimestamp(data, props);
        if (this.refs.projectedTurnout && this.refs.projectedTurnout.innerHTML) {
          this.refs.projectedTurnout.innerHTML = turnout + "%";
        }
        if (this.refs.lastTimestamp && this.refs.lastTimestamp.innerHTML) {
          var lastTimeStampText = formatDate(new Date(timestamp));
          console.log("timestamp", new Date(timestamp), timestamp, lastTimeStampText);
          this.refs.lastTimestamp.innerHTML = lastTimeStampText;
        }
        if (!this.chart)
          this.chart = new Chart(container, null, null, className, chartOptions);
        
        this.chart.draw(chartData, partyColorsData);
    }
}

export default VotePredictionLineChart;
