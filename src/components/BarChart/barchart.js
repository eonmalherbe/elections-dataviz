import React, { Component } from "react";
import * as d3 from "d3";
import styles from "../BarChart/barchart.css";
import {Chart} from "../BarChart/d3barchart";
import svgToPng from "save-svg-as-png";

import events from "../../events";
import config from "../../config";
import {
  getVotesDataM,
  getPartyColors
} from "../../api";
import {
  parseVotesData,
  getRegionName,
  fetchDataFromOBJ,
  handleRegionChange,
  triggerCustomEvent,
  fetchLocationTrackFromVDdata
} from "../../utils";

var dataRefreshTime = 30 * 1000;

function className(originName) {
  return styles[originName] || originName;
}

function cn(originName) {
  return className(config.CSS_PREFIX + originName);
}

var partyColorsData;

var chartOptions = {
  chartType: "Race For Votes",
  yAxisLabel: "PERCENTAGE VOTES",
  dynamicYAxisFromValues: true,
  customizeDynamicMaxValue: (maxVal) => Math.min(100, maxVal * 1.5),
  yValue: d => d.percOfVotes,
  yValueFormat: value => value + '%',
}

class BarChart extends Component {

    constructor(props) {
      super(props);
      this.state = {
        comp: "votes-default",
        numParties: 5,
        eventDescription: "2014 National Election",
        regionType: "national",
        provinceName: "",
        muniName: "",
        muniCode: "",
        iecId: "",
        stylesheetFor: "web",
        componentID: 1
      }

      fetchDataFromOBJ(this.state, props);

      this.chart = null;
      this.refreshIntervalID = 0;
      this.exportAsPNG = this.exportAsPNG.bind(this);
      this.exportAsPNGUri = this.exportAsPNGUri.bind(this);
      this.handleRegionChange = handleRegionChange.bind(this);
      this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }
  
    componentDidMount() {

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
      this.draw(this.getContainer(), this.state)
    }

    componentWillUnmount() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      document.removeEventListener(events.EXPORT_PNG, this.exportAsPNG);
      document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
      document.removeEventListener(events.CHART_PREVIEW, this.handlePreviewEvent);
      clearInterval(this.refreshIntervalID);
    }

    exportAsPNG(event) {
      var targetState = event.detail;
      if (targetState.componentID != this.state.componentID)
        return;
      svgToPng.saveSvgAsPng(this.refs.vizcontainer.childNodes[0], `race-for-votes-barchart(${getRegionName(this.state)}).png`);
    }

    exportAsPNGUri() {
      var self = this;
      return new Promise(function(resolve, reject) {
        svgToPng.svgAsPngUri(self.refs.vizcontainer.childNodes[0], {}, function(uri) {
          resolve(uri.split(',')[1]);
        });
      });
    }

    handlePreviewEvent(event) {
      var newState = event.detail;
      if (this.chart)
        this.chart.destroy();
      this.chart = new Chart(this.getContainer(), null, null, className, chartOptions);
      this.setState(newState)
    }

    getContainer() {
      return d3.select(this.refs.vizcontainer)
    }
      
    render () {
      const {
        stylesheetFor,
        componentID
      } = this.state;

      return (
          <div className={cn("barchart") + " " + cn(`stylesheet-${stylesheetFor}`)}>
            {
              componentID != -1000 && <div className={cn("chart-title")}>{chartOptions.chartType} ({getRegionName(this.state)}): </div>
            }
            <div 
              ref="vizcontainer" 
              className={cn("chart-body")} 
              ></div>
          </div>
        )
    }

    draw(container, props) {
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

        if (props.comp == "votes-myvd") {
          var newState;
          if (chartData) {
            newState = fetchLocationTrackFromVDdata(data);
          } else {
            newState = {iecId: ""}
          }
          var needUpdate = false;
          Object.keys(newState).forEach(key => {
            if (props[key] != newState[key]) {
              needUpdate = true;
            }
          })
          if (needUpdate) {
            triggerCustomEvent(events.REGION_CHANGE, newState);
          }
        }
       
        if (!this.chart)
          this.chart = new Chart(container, null, null, className, chartOptions);
        this.chart.draw(chartData, partyColorsData);
    }
}

export default BarChart;
