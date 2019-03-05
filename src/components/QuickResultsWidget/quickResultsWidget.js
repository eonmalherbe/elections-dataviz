import React, { Component } from "react";
import styles from "./quickResultsWidget.css";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";

import config from '../../config'
import BarChart from '../BarChart/barchart';
import NavBar from '../NavBar/navbar';
import Map from '../Map/map';

function className(originName) {
    return styles[originName] || bootstrapStyles[originName] || originName;
}

class QuickResultsWidget extends Component {    
    constructor(props) {
        super(props);
        var self = this;
        this.state = {
            numParties: 5,
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
        }
        if (props.numParties) {
            this.state.numParties = props.numParties;
        }
        if (props.regionType) {
            this.state.regionType = props.regionType;
        }
        if (props.provinceName) {
            this.state.provinceName = props.provinceName;
        }
        if (props.muniName) {
            this.state.muniName = props.muniName;
        }
        if (props.muniCode) {
            this.state.muniCode = props.muniCode;
        }
        if (props.iecId) {
            this.state.iecId = props.iecId;
        }
        if (props.width && props.height) {
            this.state.width = props.width;
            this.state.height = props.height;
        }
        this.onResize = this.onResize.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.onResize, 200);
    }
  
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }

    onResize() {
        
    };

    render() {
        return (
        <div className={className("row")}>
            <div className={className("col-md-4")}>
                <NavBar />
            </div>
            <div className={className("col-md-8")}>
                <div className={className("barchart-container")}>
                    <BarChart {...this.state} />
                </div>
                <div className={className("map-container")}>
                    <Map {...this.state}/>
                </div>
            </div>
        </div>
        );
    }
}

export default QuickResultsWidget;
