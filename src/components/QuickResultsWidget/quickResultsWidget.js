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

import JSZip from "jszip";
import {saveAs} from "file-saver";
import {
    getRegionName
} from "../../utils";


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
            comp: "race for votes",
            stylesheetFor: "web"
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
        if (props.stylesheetFor) {
            this.state.stylesheetFor = props.stylesheetFor;
        }
        this.exportAsPNG = this.exportAsPNG.bind(this);
        this.handleRegionChange = this.handleRegionChange.bind(this);
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    componentDidMount() {
        document.addEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
        document.addEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.addEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);
    }
  
    componentWillUnmount() {
        document.removeEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
        document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.removeEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);
    }

    handleRegionChange(event) {
      var newState = event.detail;
      if (newState.regionType != "municipality-vd")
        this.setState(newState)
    }

    exportAsPNG(event) {
        var {
            comp
        } = this.state;
        var self = this;
        var zipfileName = `quick-results-widget-${comp.replace(/\s/gi, '-')}(${getRegionName(self.state)})`;
        var imageLoadPromises = [];
        if (comp == 'race for votes') {
            imageLoadPromises = [
                this.votesInstance1.exportAsPNGUri(), 
                this.votesInstance2.exportAsPNGUri()
            ];
        } else if (comp == 'race for seats') {
            imageLoadPromises = [
                this.seatsInstance1.exportAsPNGUri(), 
                this.seatsInstance2.exportAsPNGUri()
            ];
        } else if (comp == 'turnout') {
            imageLoadPromises = [
                this.turnoutInstance1.exportAsPNGUri(), 
                this.turnoutInstance2.exportAsPNGUri()
            ];
        } else if (comp == 'counting progress') {
            imageLoadPromises = [
                this.progressInstance1.exportAsPNGUri(), 
                this.progressInstance2.exportAsPNGUri()
            ];
        } else if (comp == 'spoilt votes') {
            imageLoadPromises = [
                this.spoiltInstance1.exportAsPNGUri(), 
                this.spoiltInstance2.exportAsPNGUri()
            ];
        }
        Promise.all(imageLoadPromises).then(values => {
            console.log("exporting ...");
            var zip = new JSZip();

            var imgs = zip.folder(zipfileName);
            imgs.file("image1.png", values[0], {base64: true});
            imgs.file("image2.png", values[1], {base64: true});

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                saveAs(content, `${zipfileName}.zip`);
                console.log("exporting ended successfully");
            });
        }).catch(error => {
            console.error("export error", error);
        })
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
            stylesheetFor,
            regionType,
            provinceName,
            muniName,
            muniCode,
            iecId,
            comp
        } = this.state;
        return (
            <div className={className(`stylesheet-${stylesheetFor}`)}>
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
                    <div className={className("col-md-4")+" "+className("main-left-part")}>
                        <NavBar />
                    </div>
                            {
                                comp == 'race for votes' && 
                                <div className={className("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("barchart-container")}>
                                        <BarChart 
                                            ref={instance => { this.votesInstance1 = instance; }} 
                                            {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.votesInstance2 = instance; }} 
                                            {...this.state} />
                                    </div>
                                </div>
                            }
                            {
                                comp == 'race for seats' && 
                                <div className={className("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("barchart-container")}>
                                        <RaceForSeatBarChart 
                                            ref={instance => { this.seatsInstance1 = instance; }} 
                                            {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.seatsInstance2 = instance; }} 
                                            {...this.state} />
                                    </div>
                                </div>
                            }
                            {
                                comp == 'turnout' && 
                                <div className={className("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("barchart-container")}>
                                        <TurnoutBarchart 
                                            ref={instance => { this.turnoutInstance1 = instance; }} 
                                            {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <TurnoutMap 
                                            ref={instance => { this.turnoutInstance2 = instance; }} 
                                            {...this.state} />
                                    </div>
                                </div>
                                
                            }
                            {
                                comp == 'counting progress' && 
                                <div className={className("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("barchart-container")}>
                                        <ProgressVotesPieChart 
                                            ref={instance => { this.progressInstance1 = instance; }} 
                                            {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.progressInstance2 = instance; }} 
                                            {...this.state} />
                                    </div>
                                </div>
                            }
                            {
                                comp == 'spoilt votes' &&
                                <div className={className("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("barchart-container")}>
                                        <SpoiltBarChart 
                                            ref={instance => { this.spoiltInstance1 = instance; }} 
                                            {...this.state} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.spoiltInstance2 = instance; }} 
                                            {...this.state} />
                                    </div>
                                </div> 
                            }
                </div>
            </div>
        );
    }
}

export default QuickResultsWidget;
