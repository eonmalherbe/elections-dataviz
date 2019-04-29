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
import SplitNatProvChart from '../SplitNatProv/barchart';

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
            eventDescription: "2019 National Election",
            nationalEventDescription: "2019 National Election",
            provincialEventDescription: "2019 Provincial Election",
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
            eventDescriptionsSplitNatProv: [
                // "National Elections 1999",
                // "Provincial Elections 1999",
                // "14 Apr 2004 National Election",
                // "14 Apr 2004 Provincial Election",
                "22 Apr 2009 National Election",
                "22 Apr 2009 Provincial Election",
                "2014 National Election",
                "2014 Provincial Election",
                // "2019 NATIONAL ELECTION",
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

    componentDidUpdate(prevProps, prevState) {
      this.fetchCurrentResultData()
    }

    handleSeatsElectedsEvent(event) {
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
        if (comp == 'votes-comparisons' || comp == 'seats-comparisons') {
            imageLoadPromises = [
                ...this.barchartInstances.map(instance => instance.exportAsPNGUri()),
                this.mapInstance.exportAsPNGUri()
            ];
        } else {
            imageLoadPromises = [
                this.barchartInstance.exportAsPNGUri(), 
                this.mapInstance.exportAsPNGUri()
            ];
        }
        Promise.all(imageLoadPromises).then(values => {
            var zip = new window.JSZip();

            var imgs = zip.folder(zipfileName);
            values.forEach((element, idx) => {
                imgs.file(`image${idx+1}.png`, element, {base64: true});
            });

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
        if (newState.regionType == "national" && this.state.comp == "votes-split") {
            newState.regionType = "province";
            newState.provinceName = this.state.provinceName || "Western Cape";
        }
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
        if (comp == 'votes-split') {
            return (
                <div className={className("quick-results-title")}>
                    {getRegionName(self.state)} Race for Votes - Split (Nat/Prov)
                </div>
                
            )
        }
        return null;
    }

    renderMap() {
        var {
            comp,
            iecId,
            muniCode
        } = this.state;
        var mapState = JSON.parse(JSON.stringify(this.state));
        if (comp == 'votes-myvd') {
            if (iecId && iecId.length && muniCode && muniCode.length) {
                mapState.disableNavigation = true;
                return (
                    <div className={className("map-container")}>
                        <Map 
                            ref={instance => { this.mapInstance = instance; }} 
                            key={comp}
                            {...mapState}
                            componentID={-1000}
                        />
                    </div>
                );
            }
            return null;
        }
        if (comp == 'votes-split') {
            mapState.disableNavigation = true;
            mapState.regionType = "national";
            return (
                <div className={className("map-container")}>
                    <Map 
                        ref={instance => { this.mapInstance = instance; }} 
                        key={comp}
                        {...mapState}
                        componentID={-1000}
                    />
                </div>
            ); 
        } else if (comp == 'votes-turnout') {
            return (
                <div className={className("map-container")}>
                    <TurnoutMap 
                        ref={instance => { this.mapInstance = instance; }} 
                        key={comp}
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        } else {
            return (
                <div className={className("map-container")}>
                    <Map 
                        ref={instance => { this.mapInstance = instance; }} 
                        key={comp}
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
                        key={comp}
                        ref={instance => { this.barchartInstance = instance; }} 
                        {...this.state} 
                        componentID={-1000}/>
                </div>
            );
        }
        if (comp == 'seats-default') {
            return (
                <div className={className("barchart-container")}>
                    <RaceForSeatDonut 
                        ref={instance => { this.barchartInstance = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
        if (comp == 'votes-turnout') {
            return (
                <div className={className("barchart-container")}>
                    <TurnoutBarchart 
                        ref={instance => { this.barchartInstance = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
        if (comp == 'votes-progress') {
            return (
                <div className={className("barchart-container")}>
                    <ProgressVotesPieChart 
                        ref={instance => { this.barchartInstance = instance; }} 
                        {...this.state}
                        componentID={-1000} />
                </div>
            );
        }
        if (comp == 'votes-comparisons') {
            var {numParties} = this.state;
            this.barchartInstances = new Array(numParties);
            return (
                <div className={className("barchart-container")}>
                    {
                        partyIecIds.map((partyIecId, partyIdx) => {
                            return <VoteCompBarchart 
                                ref={instance => { this.barchartInstances[partyIdx] = instance; }} 
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
            this.barchartInstances = new Array(numParties);
            return (
                <div className={className("barchart-container")}>
                    {
                        partyIecIds.map((partyIecId, partyIdx) => {
                            return <SeatCompBarchart 
                                ref={instance => { this.barchartInstances[partyIdx] = instance; }} 
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
        if (comp == 'votes-split') {
            return (
                <div className={className("barchart-container")}>
                    <SplitNatProvChart 
                        ref={instance => { this.barchartInstance = instance; }} 
                        {...this.state}
                        componentID={-1000}
                    />
                </div>
                
            )
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
        if (this.refs.vdInput.value.length == 0) {
            alert("please enter valid vd number");
            return;
        }
        var newState = {
            regionType: "municipality-vd",
            iecId: this.refs.vdInput.value,
            muniCode: ""
        }
        triggerCustomEvent(events.REGION_CHANGE, newState);
    }

    render() {
        var {
            stylesheetFor,
        } = this.state;
        return (
            <div className={className("quickresultswidget") + " " + cn(`stylesheet-${stylesheetFor}`)}>
                <div className={cn("row")}>
                    <div className={cn("col-md-4")+" "+className("main-left-part")}>
                        <NavBar {...this.state}/>
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
