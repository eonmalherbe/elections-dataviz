import React, { Component } from "react";
import styles from "./quickResultsWidget.css";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";

import config from '../../config'
import events from "../../events";

import BarChart from '../BarChart/barchart';

import ProgressVotesPieChart from '../ProgVotesCountPiechart/piechart';

import RaceForSeatBarChart from '../RaceForSeatBarchart/barchart';

import SpoiltBarChart from '../SpoiltBarchart/barchart';

import TurnoutBarchart from '../TurnoutBarchart/barchart';
import TurnoutMap from '../TurnoutMap/map';

import NavBar from '../NavBar/navbar';
import Map from '../Map/map';

function className(originName) {
    return styles[originName] || bootstrapStyles[originName] || originName;
}

class QuickResultsWidget extends Component {    
    constructor(props) {
        super(props);
        this.state = {
            numParties: 5,
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            comp: "race for votes"
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
        this.handleRegionChange = this.handleRegionChange.bind(this);
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    componentDidMount() {
        document.addEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.addEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);
    }
  
    componentWillUnmount() {
        document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.removeEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);
    }

    handleRegionChange(event) {
      var newState = event.detail;
      if (newState.regionType != "municipality-vd")
        this.setState(newState)
    }

    handlePreviewEvent(event) {
        var newState = event.detail;
        this.setState(newState)
    };

    render() {
        var {
            comp,
            numParties,
            eventDescription,
            regionType,
            provinceName,
            muniName,
            muniCode,
            iecId,
            comp
        } = this.state;
        return (
            <div>
                <div className={className("row") + " " + className("submenu")}>
                    <div className={className("col-md-2") + " " + className("label")}>
                        Show Results for 
                    </div>
                    <div className={className("col-md-2")}>
                        <button 
                            className={comp == 'race for votes'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'race for votes'})}> Race for votes </button>
                    </div>
                    <div className={className("col-md-2")}>
                        <button  
                            className={comp == 'race for seats'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'race for seats'})}> Race for seats</button>
                    </div>
                    <div className={className("col-md-2")}>
                        <button  
                            className={comp == 'turnout'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'turnout'})}> Turnout</button>
                    </div>
                    {
                        (eventDescription.indexOf("2014") != -1) &&
                        <div className={className("col-md-2")}>
                            <button  
                                className={comp == 'counting progress'? className("active") : ""} 
                                onClick={() => this.setState({comp: 'counting progress'})}> Counting progress </button>
                        </div>
                    }
                    <div className={className("col-md-2")}>
                        <button  
                            className={comp == 'spoilt votes'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'spoilt votes'})}> Spoilt Votes </button>
                    </div>
                </div>
                <div className={className("row")}>
                    <div className={className("col-md-4")}>
                        <NavBar />
                    </div>
                            {
                                comp == 'race for votes' && 
                                <div className={className("col-md-8")}>
                                    <div className={className("barchart-container")}>
                                        <BarChart {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map {...this.state}/>
                                    </div>
                                </div>
                            }
                            {
                                comp == 'race for seats' && 
                                <div className={className("col-md-8")}>
                                    <div className={className("barchart-container")}>
                                        <RaceForSeatBarChart {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map {...this.state}/>
                                    </div>
                                </div>
                            }
                            {
                                comp == 'turnout' && 
                                <div className={className("col-md-8")}>
                                    <div className={className("barchart-container")}>
                                        <TurnoutBarchart {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <TurnoutMap {...this.state}/>
                                    </div>
                                </div>
                                
                            }
                            {
                                comp == 'counting progress' && 
                                <div className={className("col-md-8")}>
                                    <div className={className("barchart-container")}>
                                        <ProgressVotesPieChart {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map {...this.state}/>
                                    </div>
                                </div>
                            }
                            {
                                comp == 'spoilt votes' &&
                                <div className={className("col-md-8")}>
                                    <div className={className("barchart-container")}>
                                        <SpoiltBarChart {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map {...this.state}/>
                                    </div>
                                </div> 
                            }
                </div>
            </div>
        );
    }
}

export default QuickResultsWidget;
