import React, { Component } from "react";
import "./barchartMap.css";
import BarChart from '../BarChart/barchart';
import Map from '../Map/map';

class BarchartWithNavMap extends Component {    
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
            vdNumber: "",
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
        if (props.vdNumber) {
            this.state.vdNumber = props.vdNumber;
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
        <div>
            <div className="leftContainer">
            <BarChart {...this.state} />
            </div>
            <div className="rightContainer">
            <Map {...this.state}/>
            </div>
        </div>
        );
    }
}

export default BarchartWithNavMap;
