import React, { Component } from 'react';
import './App.css';
import Box from './Box';
import BarChart from './barchart';

var url ="http://localhost:8000/graphql?query=%7B%0A%20%20allProvincialBallots(%0A%20%20%09event_Description_Icontains%3A%222014%22%2C%20%0A%20%20%20%20event_EventType_Description_Icontains%3A%22National%22%2C%0A%20%20%20%20location_Name%3A%22Western%20Cape%22%0A%0A%20%20)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20topResult(validVotes_Gt%3A1000%2C%20last%3A5)%20%7B%0A%20%20%20%20%20%20%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20validVotes%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20party%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20abbreviation%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20location%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=null"

class App extends Component {
  render() {
    return (
      <div className="App">
        <Box width="100" height="100" className="MyBox"/>
        <BarChart width="600" height="220" url={url}/>
        <BarChart width="400" height="420" url={url}/>
        <div id="sales-data"></div>
      </div>
    );
  }
}

export default App;
