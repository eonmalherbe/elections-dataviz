import React, { Component } from "react";
import "./App.css";
import {
  BarChart,
  BarChartEmbed,
  Map,
  MapEmbed
} from "./components";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="leftContainer">
          <BarChart regionName="SA" regionType="national" numParties={3} />
          <Map regionType="province" provinceName="Western Cape" />
        </div>
        <div className="rightContainer">
          <div className="barchartEmbed">
            <BarChartEmbed />
          </div>
          <div className="mapEmbed">
            <MapEmbed />
          </div>
        </div>
        <div id="sales-data"></div>
      </div>
    );
  }
}

export default App;
