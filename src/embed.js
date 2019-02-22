import React from "react";
import ReactDOM from "react-dom";
import {
    BarChart,
    Map
} from "./components";

// 1. Container div tag
// 2. Geography - e.g.National, Province - EC, Municipality - CPT or VD - 10344444
// 3. Number of parties shown

window.showBarChart = (element, options) => {
    ReactDOM.render(<BarChart 
        {...options}
        />, element);
};

window.showMap = (element, options) => {
    ReactDOM.render(<Map 
        {...options}
        />, element);
};