import React, { Component } from "react";
import * as d3 from "d3";
import styles from "./piechart.css";
import {Chart} from "../ProgVotesCountPiechart/d3piechart";
import svgToPng from "save-svg-as-png";

import events from "../../events";
import config from "../../config";
import {
  getSeatsData,
  getPartyColors
} from "../../api";
import {
  parseSeatsData,
  getNationOrProvinceName,
  fetchDataFromOBJ,
  handleRegionChange
} from "../../utils";


var dataRefreshTime = 30 * 1000;
var chartOptions = {
  chartType: 'Race For Seats Donut Chart',
  variable: 'seats',
  category: 'name',
  viewBox: '170 0 360 320'
};

function className(originName) {
  return styles[originName] || originName;
}

function cn(originName) {
  return className(config.CSS_PREFIX + originName);
}

var partyColorsData;

class DonutChart extends Component {

    constructor(props) {
      super(props);
      this.state = {
        numParties: 100,
        eventDescription: "2019 National Election",
        regionType: "national",
        provinceName: "",
        muniName: "",
        muniCode: "",
        iecId: "",
        stylesheetFor: "web",
        componentID: 17
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
      if (targetState.componentID !== this.state.componentID)
        return;
      svgToPng.saveSvgAsPng(this.refs.vizcontainer.childNodes[0], `race-for-seats-donutchart-chart(${getNationOrProvinceName(this.state)}).png`);
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
          <div className={className("donutchart") + " " + cn(`stylesheet-${stylesheetFor}`)}>
            {
              componentID !== -1000 && <div className={cn("chart-title")}>{chartOptions.chartType} ({getNationOrProvinceName(this.state)}): </div>
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
      var seatsDataLoader = getSeatsData(props);
      var dataLoaders = [seatsDataLoader];

      if (!partyColorsData) {
        var partyColorsLoader = getPartyColors();
        dataLoaders.push(partyColorsLoader);
      }

      Promise.all(dataLoaders).then(function(values){ 
        var seatsData = values[0];
        partyColorsData = partyColorsData || values[1];         
        self.drawGraph(container, props, seatsData, partyColorsData);
      }).catch(error => console.error(error));
    }

    drawGraph(container, props, data, partyColorsData) {
        var chartData = parseSeatsData(data, props);
        if (!this.chart)
          this.chart = new Chart(container, null, null, className, chartOptions);
        
        this.chart.draw(chartData, partyColorsData);
    }
}

export default DonutChart;
