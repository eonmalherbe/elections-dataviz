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
        <QuickResultsWidget stylesheetFor={"tv"} eventDescription={"2014 National Election"} />
      </div>
    );
  }
}

export default App;
