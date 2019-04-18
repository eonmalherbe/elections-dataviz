import React, { Component } from "react";
import styles from "./quickResultsWidget.css";

import config from '../../config'
import events from "../../events";

import BarChart from '../BarChart/barchart';

import ProgressVotesPieChart from '../ProgVotesCountPiechart/piechart';

import RaceForSeatDonut from '../RaceForSeatDonut/piechart';

import SpoiltBarChart from '../SpoiltBarchart/barchart';

import TurnoutBarchart from '../TurnoutBarchart/barchart';
import TurnoutMap from '../TurnoutMap/map';

import NavBar from '../NavBar/navbar';
import Map from '../Map/map';

import {saveAs} from "file-saver";

import {
    getSpoiltData,
    getTurnoutDataForOneEvent,
    getProgressVotesCount,
} from "../../api";

import {
    getRegionName,
    getRegionName2,
    getRegionName3,
    triggerCustomEvent,
    fetchDataFromOBJ,
    handleRegionChange,

    parseSpoiltVotesData,
    parseTurnoutDataForOneEvent,
    parseProgressVotesCount
} from "../../utils";

var dataRefreshTime = 30 * 1000;

function className(originName) {
    return styles[originName] || originName;
}

function cn(originName) {
    return className(config.CSS_PREFIX + originName);
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
            stylesheetFor: "web",
            currentTurnout: 0,
            currentCountingProg: 0,
            currentSpoiltVotes: 0,
            componentID: 5
        }
        fetchDataFromOBJ(this.state, props);

        this.refreshIntervalID = 0;
        this.exportAsPNG = this.exportAsPNG.bind(this);
        this.handleRegionChange = handleRegionChange.bind(this);
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    componentDidMount() {
        var self = this;
        this.refreshIntervalID = setInterval(() => {
            self.fetchCurrentResultData();
        }, dataRefreshTime);

        document.addEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
        document.addEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.addEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);

        this.fetchCurrentResultData();
    }
  
    componentWillUnmount() {
        document.removeEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
        document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.removeEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);
    }

    fetchCurrentResultData() {
        console.log("fetchCurrentResultData start");
        var self = this;
        var newProps = JSON.parse(JSON.stringify(this.state));
        newProps.eventDescription = "2019_mock1";
        var dataLoaders = [
            getSpoiltData(newProps), 
            getTurnoutDataForOneEvent(newProps),
            getProgressVotesCount(newProps)
        ];

        Promise.all(dataLoaders).then(function(values){ 
            var spoiltData = values[0];
            var turnoutData = values[1];
            var progVotesData = values[2];

            console.log("spoiltData", spoiltData);
            console.log("turnoutData", turnoutData);
            console.log("progVotesData", progVotesData);

            var parsedSpoiltData = parseSpoiltVotesData(spoiltData, newProps);
            var parsedTurnoutData = parseTurnoutDataForOneEvent(turnoutData, newProps);
            var parsedProgVotesData = parseProgressVotesCount(progVotesData, newProps);

            self.setState({            
                currentTurnout: parsedTurnoutData[0].percVoterTurnout,
                currentCountingProg: parsedProgVotesData[0].percent,
                currentSpoiltVotes: parsedSpoiltData[1].percent
            });

            console.log("parsedSpoiltData", parsedSpoiltData);
            console.log("parsedTurnoutData", parsedTurnoutData);
            console.log("parsedProgVotesData", parsedProgVotesData);

        }).catch(error => console.error(error));
    }

    exportAsPNG(event) {
        var targetState = event.detail;
        if (targetState.componentID != this.state.componentID)
          return;
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
            var zip = new window.JSZip();

            var imgs = zip.folder(zipfileName);
            imgs.file("image1.png", values[0], {base64: true});
            imgs.file("image2.png", values[1], {base64: true});

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                saveAs(content, `${zipfileName}.zip`);
            });
        }).catch(error => {
            console.error("export error", error);
        })
    }

    handlePreviewEvent(event) {
        var newState = event.detail;
        this.setState(newState);

        var triggerState = JSON.parse(JSON.stringify(newState));
        triggerState.componentID = -1000;

        triggerCustomEvent(events.CHART_PREVIEW, triggerState);
        triggerCustomEvent(events.MAP_PREVIEW, triggerState);
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
            currentTurnout,
            currentCountingProg,
            currentSpoiltVotes
        } = this.state;
        var self = this;
        return (
            <div className={className("quickresultswidget") + " " + cn(`stylesheet-${stylesheetFor}`)}>
                {/* <div className={cn("row") + " " + cn("component-transition-menu")}>
                    <div className={cn("col-md-2") + " " + className("label")}>
                        Show Results 
                    </div>
                    <div className={cn("col-md-2")}>
                        <button 
                            className={comp == 'race for votes'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'race for votes'})}> Race for votes </button>
                    </div>
                    <div className={cn("col-md-2")}>
                        <button  
                            className={comp == 'race for seats'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'race for seats'})}> Race for seats</button>
                    </div>
                    <div className={cn("col-md-2")}>
                        <button  
                            className={comp == 'turnout'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'turnout'})}> Turnout</button>
                    </div>
                    {
                        (eventDescription.indexOf("2014") != -1) &&
                        <div className={cn("col-md-2")}>
                            <button  
                                className={comp == 'counting progress'? className("active") : ""} 
                                onClick={() => this.setState({comp: 'counting progress'})}> Counting progress </button>
                        </div>
                    }
                    <div className={cn("col-md-2")}>
                        <button  
                            className={comp == 'spoilt votes'? className("active") : ""} 
                            onClick={() => this.setState({comp: 'spoilt votes'})}> Spoilt Votes </button>
                    </div>
                </div> */}
                <div className={cn("row")}>
                    <div className={cn("col-md-4")+" "+className("main-left-part")}>
                        <NavBar />
                    </div>
                            {
                                comp == 'race for votes' && 
                                <div className={cn("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("quick-results-title")}>
                                        RACE FOR VOTES: <span className="regionName">{getRegionName2(self.state)}</span>
                                    </div>
                                    <div className={cn("current-progress")}>
                                        <div className={cn("current-turnout")}>
                                            <div>Turnout</div>
                                            <div>{currentTurnout}%</div>
                                        </div>
                                        <div className={cn("current-counting-progress")}>
                                            <div>Counting Progress</div>
                                            <div>{currentCountingProg}%</div>
                                        </div>
                                        <div className={cn("current-spoilt-votes")}>
                                            <div>Spoilt Votes</div>
                                            <div>{currentSpoiltVotes}%</div>
                                        </div>
                                    </div>
                                    {/* <div className={className("event-description")}>
                                        {
                                            /(19|20)\d{2}/g.exec(this.state.eventDescription)[0]
                                        }
                                    </div> */}
                                    <div className={className("barchart-container")}>
                                        <BarChart 
                                            ref={instance => { this.votesInstance1 = instance; }} 
                                            {...this.state} 
                                            componentID={-1000}/>
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.votesInstance2 = instance; }} 
                                            {...this.state} 
                                            componentID={-1000}/>
                                    </div>
                                </div>
                            }
                            {
                                comp == 'race for seats' && 
                                <div className={cn("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("quick-results-title")+" "+className("race-for-seats")}>
                                        RACE FOR SEATS: <span className="regionName">{getRegionName(self.state)}</span>(#SEATS)
                                    </div>
                                    <div className={cn("current-progress")}>
                                        <div className={cn("current-turnout")}>
                                            <div>Turnout</div>
                                            <div>{currentTurnout}%</div>
                                        </div>
                                        <div className={cn("current-counting-progress")}>
                                            <div>Counting Progress</div>
                                            <div>{currentCountingProg}%</div>
                                        </div>
                                        <div className={cn("current-spoilt-votes")}>
                                            <div>Spoilt Votes</div>
                                            <div>{currentSpoiltVotes}%</div>
                                        </div>
                                    </div>
                                    {/* <div className={className("event-description")}>
                                        {
                                            /(19|20)\d{2}/g.exec(this.state.eventDescription)[0]
                                        }
                                    </div> */}
                                    <div className={className("barchart-container")}>
                                        <RaceForSeatDonut 
                                            ref={instance => { this.seatsInstance1 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.seatsInstance2 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                </div>
                            }
                            {
                                comp == 'turnout' && 
                                <div className={cn("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("quick-results-title")}>
                                        RACE FOR VOTES: TURNOUT - {getRegionName3(self.state)}
                                    </div>
                                    <div className={cn("current-progress")}>
                                        <div className={cn("current-turnout")}>
                                            <div>Turnout</div>
                                            <div>{currentTurnout}%</div>
                                        </div>
                                        <div className={cn("current-counting-progress")}>
                                            <div>Counting Progress</div>
                                            <div>{currentCountingProg}%</div>
                                        </div>
                                        <div className={cn("current-spoilt-votes")}>
                                            <div>Spoilt Votes</div>
                                            <div>{currentSpoiltVotes}%</div>
                                        </div>
                                    </div>
                                    {/* <div className={className("event-description")}>
                                        {
                                            /(19|20)\d{2}/g.exec(this.state.eventDescription)[0]
                                        }
                                    </div> */}
                                    <div className={className("barchart-container")}>
                                        <TurnoutBarchart 
                                            ref={instance => { this.turnoutInstance1 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <TurnoutMap 
                                            ref={instance => { this.turnoutInstance2 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                </div>
                                
                            }
                            {
                                comp == 'counting progress' && 
                                <div className={cn("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("quick-results-title")}>
                                        COUNTING PROGRESS: {getRegionName(self.state)}
                                    </div>
                                    <div className={cn("current-progress")}>
                                        <div className={cn("current-turnout")}>
                                            <div>Turnout</div>
                                            <div>{currentTurnout}%</div>
                                        </div>
                                        <div className={cn("current-counting-progress")}>
                                            <div>Counting Progress</div>
                                            <div>{currentCountingProg}%</div>
                                        </div>
                                        <div className={cn("current-spoilt-votes")}>
                                            <div>Spoilt Votes</div>
                                            <div>{currentSpoiltVotes}%</div>
                                        </div>
                                    </div>
                                    {/* <div className={className("event-description")}>
                                        {
                                            /(19|20)\d{2}/g.exec(this.state.eventDescription)[0]
                                        }
                                    </div> */}
                                    <div className={className("barchart-container")}>
                                        <ProgressVotesPieChart 
                                            ref={instance => { this.progressInstance1 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.progressInstance2 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                </div>
                            }
                            {
                                comp == 'spoilt votes' &&
                                <div className={cn("col-md-8")+" "+className("main-right-part")}>
                                    <div className={className("quick-results-title")}>
                                        SPOILT VOTES: {getRegionName(self.state)}<br/>
                                    </div>
                                    <div className={cn("current-progress")}>
                                        <div className={cn("current-turnout")}>
                                            <div>Turnout</div>
                                            <div>{currentTurnout}%</div>
                                        </div>
                                        <div className={cn("current-counting-progress")}>
                                            <div>Counting Progress</div>
                                            <div>{currentCountingProg}%</div>
                                        </div>
                                        <div className={cn("current-spoilt-votes")}>
                                            <div>Spoilt Votes</div>
                                            <div>{currentSpoiltVotes}%</div>
                                        </div>
                                    </div>
                                    {/* <div className={className("event-description")}>
                                        {
                                            /(19|20)\d{2}/g.exec(this.state.eventDescription)[0]
                                        }
                                    </div> */}
                                    <div className={className("barchart-container")}>
                                        <SpoiltBarChart 
                                            ref={instance => { this.spoiltInstance1 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                    <div className={className("map-container")}>
                                        <Map 
                                            ref={instance => { this.spoiltInstance2 = instance; }} 
                                            {...this.state}
                                            componentID={-1000} />
                                    </div>
                                </div> 
                            }
                </div>
            </div>
        );
    }
}

export default QuickResultsWidget;
