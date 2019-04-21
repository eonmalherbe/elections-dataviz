import React, { Component } from "react";
import styles from "./quickResultsWidget.css";

import config from '../../config'
import events from "../../events";

import BarChart from '../BarChart/barchart';

import ProgressVotesPieChart from '../ProgVotesCountPiechart/piechart';

import RaceForSeatDonut from '../RaceForSeatDonut/piechart';
import VoteCompBarchart from '../VoteCompBarchart/barchart';
import SeatCompBarchart from '../SeatCompBarchart/barchart';

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
    getVotesDataM,
    getSeatsData
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
    parseProgressVotesCount,
    parseVotesData,
    parseSeatsData,
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
            iecId: "65010035", // regionIecId
            comp: "votes-default",
            stylesheetFor: "web",
            componentID: 5,

            partyAbbrs: ["ANC", "DA", "EFF", "ID"],
            partyIecIds: [null, null, null, null],        
            eventDescriptions: [
                // "National Elections 1999",
                // "Provincial Elections 1999",
                "14 Apr 2004 National Election",
                // "14 Apr 2004 Provincial Election",
                "22 Apr 2009 National Election",
                // "22 Apr 2009 Provincial Election",
                "2014 National Election",
                // "2014 Provincial Election",
                "2019 NATIONAL ELECTION",
                // "2019 PROVINCIAL ELECTION",
            ],
            currentTurnout: 0,
            currentCountingProg: 0,
            currentSpoiltVotes: 0
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

        document.addEventListener(events.SEATS_ELECTEDS_EVENT, this.handleSeatsElectedsEvent); // "seats-electeds-event"

        this.fetchCurrentResultData();
    }
  
    componentWillUnmount() {
        document.removeEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
        document.removeEventListener(events.REGION_CHANGE, this.handleRegionChange);
        document.removeEventListener(events.QUICK_RESULTS_PREVIEW, this.handlePreviewEvent);
    }

    componentDidUpdate() {
      this.fetchCurrentResultData()
    }

    handleSeatsElectedsEvent(event) {
        console.log("handleSeatsElectedsEvent", event.detail);
    }

    fetchCurrentResultData() {
        var self = this;
        var newProps = JSON.parse(JSON.stringify(this.state));
        var {comp} = this.state;

        // newProps.eventDescription = "2019_mock1";
        var dataLoaders = [
            getSpoiltData(newProps), 
            getTurnoutDataForOneEvent(newProps),
            getProgressVotesCount(newProps),
        ];

        if (comp == 'votes-comparisons') {
            dataLoaders.push(getVotesDataM(newProps));
        }
        if (comp == 'seats-comparisons') {
            dataLoaders.push(getSeatsData(newProps));
        }

        Promise.all(dataLoaders).then(function(values){ 
            var spoiltData = values[0];
            var turnoutData = values[1];
            var progVotesData = values[2];

            var parsedSpoiltData = parseSpoiltVotesData(spoiltData, newProps);
            var parsedTurnoutData = parseTurnoutDataForOneEvent(turnoutData, newProps);
            var parsedProgVotesData = parseProgressVotesCount(progVotesData, newProps);

            if (parsedTurnoutData[0] && parsedProgVotesData[0] && parsedSpoiltData[1]) {
                var newState = {            
                    currentTurnout: parsedTurnoutData[0].percVoterTurnout,
                    currentCountingProg: parsedProgVotesData[0].percent,
                    currentSpoiltVotes: parsedSpoiltData[1].percent
                };
    
                if (comp == 'votes-comparisons') {
                    var votesData = values[3];
                    var parsedVotesData = parseVotesData(votesData, newProps);
                    newState.partyAbbrs = parsedVotesData.map(voteItem => voteItem.name);
                    newState.partyIecIds = parsedVotesData.map(voteItem => voteItem.iecId);
                } else if (comp == 'seats-comparisons') {
                    var seatsData = values[3];
                    var parsedSeatsData = parseSeatsData(seatsData, newProps);
                    newState.partyAbbrs = parsedSeatsData.map(seatItem => seatItem.name);
                    newState.partyIecIds = parsedSeatsData.map(seatItem => seatItem.iecId);
                }
    
                if (newState.partyIecIds && newState.partyIecIds.join(" ") != self.state.partyIecIds.join(" ")) {
                    self.setState(newState);
                } else {
                    if (self.refs.currentTurnout && self.refs.currentCountingProg && self.refs.currentSpoiltVotes) {
                        self.refs.currentTurnout.innerHTML = newState.currentTurnout + "%";
                        self.refs.currentCountingProg.innerHTML = newState.currentCountingProg + "%";
                        self.refs.currentSpoiltVotes.innerHTML = newState.currentSpoiltVotes + "%";
                    }
                }
            }
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
        if (comp == 'votes-default') {
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

    renderTurnoutProgressSpoilt() {
        var {
            currentTurnout,
            currentCountingProg,
            currentSpoiltVotes,
        } = this.state;

        return (
            <div className={cn("current-progress")}>
                <div className={cn("current-turnout")}>
                    <div>Turnout</div>
                    <div ref="currentTurnout">{currentTurnout}%</div>
                </div>
                <div className={cn("current-counting-progress")}>
                    <div>Counting Progress</div>
                    <div ref="currentCountingProg">{currentCountingProg}%</div>
                </div>
                <div className={cn("current-spoilt-votes")}>
                    <div>Spoilt Votes</div>
                    <div ref="currentSpoiltVotes">{currentSpoiltVotes}%</div>
                </div>
            </div>
        )
    }

    renderQuickResultsTitle() {
        var {
            comp
        } = this.state;
        var self = this;
        if (comp == 'votes-default') {
            return (
                <div className={className("quick-results-title")}>
                    RACE FOR VOTES: <span className="regionName">{getRegionName2(self.state)}</span>
                </div>
            );
        }
        if (comp == 'seats-default') {
            return (
                <div className={className("quick-results-title")+" "+className("race-for-seats")}>
                    RACE FOR SEATS: <span className="regionName">{getRegionName(self.state)}</span>(#SEATS)
                </div>
            );
        }
        if (comp == 'votes-turnout') {
            return (
                <div className={className("quick-results-title")}>
                    RACE FOR VOTES: TURNOUT - {getRegionName3(self.state)}
                </div>
            );
        }
        if (comp == 'votes-progress') {
            return (
                <div className={className("quick-results-title")}>
                    COUNTING PROGRESS: {getRegionName(self.state)}
                </div>
            );
        }
        if (comp == 'votes-comparisons') {
            return (
                <div className={className("quick-results-title")}>
                    VOTES COMPARISONS: {getRegionName(self.state)}
                </div>
            );
        }
        if (comp == 'seats-comparisons') {
            return (
                <div className={className("quick-results-title")}>
                    SEATS COMPARISONS: {getRegionName(self.state)}
                </div>
            );
        }
        if (comp == 'votes-myvd') {
            return (
                <div className={className("quick-results-title")}>
                    My Voting District {getRegionName(self.state)}
                </div>
            );
        }
        return null;
    }

    renderMap() {
        var {
            comp
        } = this.state;
        if (comp == 'votes-myvd') {
            return null;
        }
        if (comp == 'votes-turnout') {
            return (
                <div className={className("map-container")}>
                    <TurnoutMap 
                        ref={instance => { this.turnoutInstance2 = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        } else {
            return (
                <div className={className("map-container")}>
                    <Map 
                        ref={instance => { this.mapInstance = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
    }

    renderBarchart() {
        var {
            comp,
            partyIecIds,
            partyAbbrs,
        } = this.state;
        if (comp == 'votes-default' || comp == 'votes-myvd') {
            return (
                <div className={className("barchart-container")}>
                    <BarChart 
                        ref={instance => { this.votesInstance1 = instance; }} 
                        {...this.state} 
                        componentID={-1000}/>
                </div>
            );
        }
        if (comp == 'seats-default') {
            return (
                <div className={className("barchart-container")}>
                    <RaceForSeatDonut 
                        ref={instance => { this.seatsInstance1 = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
        if (comp == 'votes-turnout') {
            return (
                <div className={className("barchart-container")}>
                    <TurnoutBarchart 
                        ref={instance => { this.turnoutInstance1 = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
        if (comp == 'votes-progress') {
            return (
                <div className={className("barchart-container")}>
                    <ProgressVotesPieChart 
                        ref={instance => { this.progressInstance1 = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
        if (comp == 'votes-comparisons') {
            return (
                <div className={className("barchart-container")}>
                    {
                        partyIecIds.map((partyIecId, partyIdx) => {
                            return <VoteCompBarchart 
                                key={partyIdx}
                                {...this.state}
                                partyAbbr={partyAbbrs[partyIdx]}
                                partyIecId={partyIecId}
                                componentID={-1000}
                            />
                        })
                    }
                </div>
            );
        }
        if (comp == 'seats-comparisons') {
            return (
                <div className={className("barchart-container")}>
                    {
                        partyIecIds.map((partyIecId, partyIdx) => {
                            return <SeatCompBarchart 
                                key={partyIdx}
                                {...this.state}
                                partyAbbr={partyAbbrs[partyIdx]}
                                partyIecId={partyIecId}
                                componentID={-1000}
                            />
                        })
                    }
                </div>
            );
        }
        return null;
    }

    renderMyVDEnterForm() {
        var {comp} = this.state;
        if (comp != 'votes-myvd') {
            return null;
        }
        return (
            <div className="voting-district-enter-form">
                <input ref="vdInput" type="text" placeholder="65010035 or 86550385"/>
                <button onClick={this.onShowVDResult.bind(this)}> Show Result</button>
            </div>
        )
    }

    onShowVDResult() {
        console.log("onShowVDResult", this.refs.vdInput.value);
        var newState = {
            regionType: "municipality-vd",
            iecId: this.refs.vdInput.value
        }
        triggerCustomEvent(events.REGION_CHANGE, newState);
        // this.setState(newState);
    }

    render() {
        var {
            stylesheetFor,
        } = this.state;
        return (
            <div className={className("quickresultswidget") + " " + cn(`stylesheet-${stylesheetFor}`)}>
                <div className={cn("row")}>
                    <div className={cn("col-md-4")+" "+className("main-left-part")}>
                        <NavBar />
                    </div>
                    <div className={cn("col-md-8")+" "+className("main-right-part")}>
                        {this.renderQuickResultsTitle()}
                        {this.renderTurnoutProgressSpoilt()}
                        {this.renderMyVDEnterForm()}
                        {this.renderBarchart()}
                        {this.renderMap()}
                    </div>
                </div>
            </div>
        );
    }
}

export default QuickResultsWidget;
