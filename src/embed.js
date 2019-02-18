import React from 'react';
import ReactDOM from 'react-dom';
import {
    BarChart,
    Map
} from './components';

// 1. Container div tag
// 2. Geography - e.g.National, Province - EC, Municipality - CPT or VD - 10344444
// 3. Number of parties shown

window.showBarChart = (element, eventType, locationName, numberOfParties) => {
    ReactDOM.render(<BarChart 
        width="600" 
        height="220" 
        eventType={eventType}
        locationName={locationName}
        numberOfParties={numberOfParties}
        />, element);
};

window.showMap = (element) => {
    ReactDOM.render(<Map 
        />, element);
};