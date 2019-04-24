import React, {Component} from "react";
import EmbedBase from "../embedBase";
import config from "../../config";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";
import styles from "./quickResultsWidgetEmbed.css";
import events from "../../events";
import {
    getElectionEvents,
    getProvincesData
} from "../../api";

import {
    triggerCustomEvent,
    nationalEventSelected
} from "../../utils";

var provincesData = getProvincesData();

function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class QuickResultsWidgetEmbed extends EmbedBase {
    
    constructor(props) {
        super(props);
        this.state = {
            elementId: "root",
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            stylesheetFor: "none",
            numParties: 5,

            electionYear: 2014,

            nationalEventDescription: "2014 National Election",
            provincialEventDescription: "2014 Provincial Election",
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
            electionYearsSplitNatProv: [2009, 2014],

            electionEvents: [],
            electionYears: [],
            componentID: 5
        }
    }

    componentDidMount() {
        var self = this;
        getElectionEvents()
            .then(function(data) {
                var electionEvents = data["data"]["allEvents"];
                var electionYears = [];
                electionEvents.forEach((item) => {
                    var eventDescription = item.description;
                    var year = /(19|20)\d{2}/g.exec(eventDescription)[0];
                    item.year = year;
                    if (electionYears.indexOf(year) == -1) {
                        electionYears.push(year);
                    }
                })
                self.setState({electionEvents, electionYears});
            }).catch(error => console.error(error));
    }

    componentDidUpdate() {
    }

    onNatEventDescriptionChange(e) {
        this.setState({nationalEventDescription: e.target.value, eventDescription: e.target.value });
    }

    onProvEventDescriptionChange(e) {
        this.setState({provincialEventDescription: e.target.value });
    }

    onEventYearSplitNatProvChange(e) {
        var {electionEvents} = this.state;
        var options = e.target.options;
        var values = [];
        for (var i = 0, l = options.length; i < l; i++) {
          if (options[i].selected) {
            values.push(options[i].value);
          }
        }
        var yearFilter = electionEvents.filter(item => values.indexOf(item.year) != -1);
        this.setState({
            electionYearsSplitNatProv: values,
            eventDescriptionsSplitNatProv: yearFilter.map(item => item.description)
        });
        // console.log("yearFilter.map(item => item.description)", yearFilter.map(item => item.description));
    }

    onEventYearChange(e) {
        var electionYear = e.target.value;
        var nationalEventDescription, provincialEventDescription;
        var {
            electionEvents
        } = this.state;

        var yearFilter = electionEvents.filter(item => item.year == electionYear);
        var nationalFilter = yearFilter.filter(item => item.eventType.description == "National Election");
        var provincialFilter = yearFilter.filter(item => item.eventType.description != "National Election");


        if (nationalFilter.length) {
            nationalEventDescription = nationalFilter[0].description;
        } else {
            nationalEventDescription = yearFilter[0].description;
        }
        if (provincialFilter.length) {
            provincialEventDescription = provincialFilter[0].description;
        } else {
            provincialEventDescription = yearFilter[0].description;
        }

        this.setState({
            electionYear, 
            nationalEventDescription, 
            provincialEventDescription,
            eventDescription: nationalEventDescription
         });
    }

    onRegionTypeChange(e) {
        var newState = {regionType: e.target.value};
        this.setState(newState);
    }

    onPreview(e) {
        triggerCustomEvent(events.QUICK_RESULTS_PREVIEW, this.state);
    }    
    
    onExportAsPNG(e) {
        triggerCustomEvent(events.EXPORT_SUPERWIDGET_PNG, this.state);
    }
      
    render () {
        var DOMAIN = config.DOMAIN;
        var {
            elementId,
            stylesheetFor,
            eventDescription,
            nationalEventDescription,
            provincialEventDescription,
            regionType,            
            provinceName,
            muniName,
            muniCode,
            iecId,
            numParties,
            electionEvents,
            electionYears,
            electionYear,
            electionYearsSplitNatProv
        } = this.state;
        var curProvinceData = provincesData.filter(item => item.name == provinceName)[0];
        return (
          <div>
            <h3> Quick Results Embed Script Generation </h3>
            <div className={className("form-group")}>
                <label>Element ID </label>
                <input 
                    type="text" 
                    className={className("form-control")} 
                    placeholder="chart-container"
                    onChange={e => this.setState({elementId: e.target.value})}
                    />
            </div>
            <div className={className("form-group")}>
                  <label>Stylesheet</label>
                  <select className={className("form-control")} 
                     value={stylesheetFor}
                     onChange={e => this.setState({stylesheetFor: e.target.value})}>
                        <option value="tv">TV</option>
                        <option value="web">Web</option>
                        <option value="none">None</option>
                  </select>
            </div>
              <div className={className("form-group")}>
                  <label>Election Year </label>
                  <select className={className("form-control")} 
                     value={electionYear}
                     onChange={this.onEventYearChange.bind(this)}>
                        {
                            electionYears.map(item => {
                                return (<option key={item} value={item}>{item}</option>)
                            })
                        }
                  </select>
              </div>
              <div className={className("form-group")}>
                  <label>National Event </label>
                  <select className={className("form-control")} 
                     value={nationalEventDescription}
                     onChange={this.onNatEventDescriptionChange.bind(this)}>
                        {
                            electionEvents
                            .filter(item => item.year == electionYear)
                            .map(item => {
                                return (<option key={item.description} value={item.description}>{item.description}</option>)
                            })
                        }
                  </select>
              </div>
              <div className={className("form-group")}>
                  <label>Provincial Event </label>
                  <select className={className("form-control")} 
                     value={provincialEventDescription}
                     onChange={this.onProvEventDescriptionChange.bind(this)}>
                        {
                            electionEvents
                            .filter(item => item.year == electionYear)
                            .map(item => {
                                return (<option key={item.description} value={item.description}>{item.description}</option>)
                            })
                        }
                  </select>
              </div>
              <div className={className("form-group")}>
                  <label>Region Type </label>
                  <select className={className("form-control")} 
                     value={regionType}
                     onChange={this.onRegionTypeChange.bind(this)}>
                        { 
                            nationalEventSelected(this.state) && 
                            <option value="national">national</option>
                        }
                        <option value="province">province</option>
                        <option value="municipality">municipality</option>
                  </select>
              </div>
              {
                  (regionType != "national") && 
                    <div className={className("form-group")}>
                        <label>Province Name</label>
                        <select className={className("form-control")} 
                            value={provinceName}
                            onChange={e => this.setState({provinceName: e.target.value})} >
                            <option value="">Select ...</option>
                            {
                                provincesData && provincesData.map(province => {
                                    return <option key={province.name} value={province.name}>{province.name}</option>
                                })
                            }
                        </select>
                    </div>
              }
              {
                  (regionType == "municipality") &&
                    <div className={className("form-group")}>
                        <label>Municipality Name</label>
                        <select className={className("form-control")} 
                            value={muniName}
                            onChange={e => this.setState({muniName: e.target.value})} >
                            <option value="">Select ...</option>
                            {
                                curProvinceData && curProvinceData.munis.map(muni => {
                                    return <option key={muni.muniName} value={muni.muniName}>{muni.muniName}</option>
                                })
                            }
                        </select>
                    </div>
              }
              <div className={className("form-group")}>
                  <label>Number Of Parties for Bar Chart</label>
                  <input 
                    type="number" 
                    className={className("form-control")} 
                    placeholder="5"
                    value={numParties}
                    onChange={e => this.setState({numParties: e.target.value})} />
              </div>
              <div className={className("form-group")}>
                  <label>Election Year For Split (Nat/Prov)</label>
                  <select multiple className={className("form-control")} 
                     value={electionYearsSplitNatProv}
                     onChange={this.onEventYearSplitNatProvChange.bind(this)}>
                        {
                            electionYears.map(item => {
                                return (<option key={item} value={item}>{item}</option>)
                            })
                        }
                  </select>
              </div>
              <div className={className("form-group")}>
                <button type="button" onClick={this.onPreview.bind(this)} className={className("btn") + " " + className("btn-primary") }>Preview</button>
              </div>              
              <div className={className("form-group")}>
                <button type="button" 
                    onClick={this.onExportAsPNG.bind(this)} 
                    className={className("btn") + " " + className("btn-primary") }>Export As PNG</button>
              </div>
              <div className={className("form-group")}>
                  <label>Embed Code</label>
                  <div className={className("embedcode")}>
                    <span>{`
                    <div id="${elementId}"></div>
                    <script src="${DOMAIN}/embed/embed.js"></script>
                    <script>showQuickResultsWidget(
                        document.getElementById("${elementId}"),
                        {
                            stylesheetFor: "${stylesheetFor}",
                            eventDescription: "${eventDescription}",
                            regionType: "${regionType}",
                            provinceName: "${provinceName}",
                            muniName: "${muniName}",
                            muniCode: "${muniCode}",
                            iecId: "${iecId}",
                            numParties: "${numParties}"
                        });</script>`.replace(/(\r\n|\n|\r)/gm, "")}</span>
                  </div>
              </div>
          </div>
        )
    }
}
export default QuickResultsWidgetEmbed;