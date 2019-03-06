import React from "react";
import ReactDOM from "react-dom";
import {
    BarChart,
    RaceForSeatsBarChart,
    SpoiltBarChart,
    Map,
    TurnoutMap,
    TurnoutBarChart,
    BarchartWithNavMap,
    QuickResultsWidget
} from "./components";

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

window.showTurnoutMap = (element, options) => {
    ReactDOM.render(<TurnoutMap 
        {...options}
        />, element);
};

window.showBarchartWithNavMap = (element, options) => {
    ReactDOM.render(<BarchartWithNavMap 
        {...options}
        />, element);
};

window.showRaceForSeatsBarChart = (element, options) => {
    ReactDOM.render(<RaceForSeatsBarChart 
        {...options}
        />, element);
};

window.showQuickResultsWidget = (element, options) => {
    ReactDOM.render(<QuickResultsWidget 
        {...options}
        />, element);
};

window.showSpoiltBarChart = (element, options) => {
    ReactDOM.render(<SpoiltBarChart 
        {...options}
        />, element);
}

window.showTurnoutBarChart = (element, options) => {
    ReactDOM.render(<TurnoutBarChart 
        {...options}
        />, element);
}
