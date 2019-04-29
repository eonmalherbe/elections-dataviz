import React, { Component } from "react";
import "./App.css";
import {
  BarChart,
  BarChartEmbed,
  Map,
  MapEmbed,
  QuickResultsWidget,
  QuickResultsWidgetEmbed
} from "./components";

class App extends Component {
  render() {
    return (
      <div className="App">
        <QuickResultsWidget stylesheetFor={"tv"} eventDescription={"2019 NATIONAL ELECTION"} nationalEventDescription={"2019 NATIONAL ELECTION"} provincialEventDescription={"2019 PROVINCIAL ELECTION"} />
      </div>
    );
  }
}

export default App;
