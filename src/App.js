import React, { Component } from 'react';
import './App.css';
import {
  BarChart,
  Map
} from './components';

class App extends Component {
  render() {
    return (
      <div className="App">
        <BarChart width="600" height="220" regionName="Western Cape" numParties={3}/>
        <Map />
        <div id="sales-data"></div>
      </div>
    );
  }
}

export default App;
