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
    QuickResultsWidget,
    ProgVotesCountPiechart,
    RaceForSeatsComparisonBarChart,
    SeatHorseShoeChart,
    VoteComparisonBarchart,
    TVSeatCompBarchart,
    TVSeatSwingBarchart,
    TVVoteCompBarchart,
    TVVoteSwingBarchart
} from "./components";

window.showBarChart = (element, options) => {
    ReactDOM.render(<BarChart 
        {...options}
        />, element);
};

window.showBarchartWithNavMap = (element, options) => {
    ReactDOM.render(<BarchartWithNavMap 
        {...options}
        />, element);
};

window.showMap = (element, options) => {
    ReactDOM.render(<Map 
        {...options}
        />, element);
};

window.showProgVotesPiechart = (element, options) => {
    ReactDOM.render(<ProgVotesCountPiechart 
        {...options}
        />, element);
}

window.showQuickResultsWidget = (element, options) => {
    ReactDOM.render(<QuickResultsWidget 
        {...options}
        />, element);
};

window.showRaceForSeatsBarChart = (element, options) => {
    ReactDOM.render(<RaceForSeatsBarChart 
        {...options}
        />, element);
};

window.showSeatsComparisonBarChart = (element, options) => {
    ReactDOM.render(<RaceForSeatsComparisonBarChart 
        {...options}
        />, element);
};

window.showSeatHorseShoeChart = (element, options) => {
    ReactDOM.render(<SeatHorseShoeChart 
        {...options}
        />, element);
}

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

window.showTurnoutMap = (element, options) => {
    ReactDOM.render(<TurnoutMap 
        {...options}
        />, element);
};

window.showVoteComparisonBarchart = (element, options) => {
    ReactDOM.render(<VoteComparisonBarchart 
        {...options}
        />, element);
};

window.showTVSeatCompBarchart = (element, options) => {
    ReactDOM.render(<TVSeatCompBarchart 
        {...options}
        />, element);
};

window.showTVSeatSwingBarchart = (element, options) => {
    ReactDOM.render(<TVSeatSwingBarchart 
        {...options}
        />, element);
};

window.showTVVoteCompBarchart = (element, options) => {
    ReactDOM.render(<TVVoteCompBarchart 
        {...options}
        />, element);
};

window.showTVVoteSwingBarchart = (element, options) => {
    ReactDOM.render(<TVVoteSwingBarchart 
        {...options}
        />, element);
};





