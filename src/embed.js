import React from 'react';
import ReactDOM from 'react-dom';
import BarChart from './barchart';

window.showBarChart = (element) => {
    ReactDOM.render(<BarChart width="600" height="220" />, element);
};