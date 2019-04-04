import React, {Component} from "react";
import EmbedBase from "../embedBase";
import config from "../../config";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";
import styles from "./barchartEmbed.css";
import events from "../../events";
import {
    getElectionEvents,
    getProvincesData,
    getPartyColors,
} from "../../api";

import {
    triggerCustomEvent
} from "../../utils";


var provincesData = getProvincesData();

function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class BarChartEmbed extends EmbedBase {
    
    constructor(props) {
        super(props);
        this.state = {
            elementId: "root",
            eventDescriptions: [
                "National Elections 1999",
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
            regionType: "national",
            provinceName: "Western Cape",
            muniName: "",
            muniCode: "",
            iecId: "",
            partyAbbr: "ANC",

            electionEvents: [],
            allParties: [],
            stylesheetFor: "web",
            componentID: 7
        }
    }

    componentDidMount() {
        var self = this;
        getElectionEvents()
            .then(function(data) {
                var electionEvents = data["data"]["allEvents"].map(edge => edge["description"])
                self.setState({electionEvents});
            }).catch(error => console.error(error));
        getPartyColors()
            .then(function(data) {
                var allParties = data["data"]["allParties"]["edges"].map(edge => edge["node"])
                allParties = allParties.filter((thing, index, self) =>
                    index === self.findIndex((t) => (
                        t.abbreviation === thing.abbreviation
                    ))
                )
                self.setState({allParties});         
            }).catch(error => console.error(error))
    }

    componentDidUpdate() {
    }

    onEventDescriptionChange(e) {
        var options = e.target.options;
        var values = [];
        for (var i = 0, l = options.length; i < l; i++) {
          if (options[i].selected) {
            values.push(options[i].value);
          }
        }
        this.setState({
            eventDescriptions: values 
        })
    }

    onRegionTypeChange(e) {
        var newState = {regionType: e.target.value};
        this.setState(newState);
    }

    onPreview(e) {
        triggerCustomEvent(events.CHART_PREVIEW, this.state);
    }

    onExportAsPNG(e) {
        triggerCustomEvent(events.EXPORT_PNG, this.state);
    }
      
    render () {
        var DOMAIN = config.DOMAIN;
        var {
            elementId,
            stylesheetFor,
            eventDescriptions,
            regionType,            
            provinceName,
            muniName,
            muniCode,
            iecId,
            partyAbbr,
            electionEvents,
            allParties
        } = this.state;

        var curProvinceData = provincesData.filter(item => item.name == provinceName)[0];
        return (
          <div>
            <h3> Race For Seats Comparison Bar Chart Embed Script Generation </h3>
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
                  <label>Region Type </label>
                  <select className={className("form-control")} 
                     value={regionType}
                     onChange={this.onRegionTypeChange.bind(this)}>
                        <option value="national">national</option>
                        <option value="province">province</option>
                        <option value="municipality">municipality</option>
                        <option value="municipality-vd">voting district</option>
                  </select>
              </div>
              <div className={className("form-group")}>
                  <label>Event </label>
                  <select multiple className={className("form-control")+" "+className("multievent-container")} 
                     value={eventDescriptions}
                     onChange={this.onEventDescriptionChange.bind(this)}>
                        {
                            electionEvents
                            .filter(item => item.toLowerCase().indexOf(regionType=="national"?"national":"provincial") != -1)
                            .map(item => {
                                return (<option key={item} value={item}>{item}</option>)
                            })
                        }
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
              {
                  (regionType == "municipality-vd") &&
                    <div className={className("form-group")}>
                        <label>Municipality Code</label>
                        <input 
                            type="text" 
                            className={className("form-control")} 
                            placeholder="CPT"
                            value={muniCode}
                            onChange={e => this.setState({muniCode: e.target.value})} 
                            />
                    </div>
              }
              {
                  (regionType == "municipality-vd") &&
                    <div className={className("form-group")}>
                        <label>Voting District Number</label>
                        <input 
                            type="text" 
                            className={className("form-control")} 
                            placeholder="97860055"
                            value={iecId}
                            onChange={e => this.setState({iecId: e.target.value})} 
                            />
                    </div>
              }
              <div className={className("form-group")}>
                  <label>Party Name</label>
                  
                  <select className={className("form-control")} 
                        value={partyAbbr}
                        onChange={e => this.setState({partyAbbr: e.target.value})} >
                        <option value="">Select ...</option>
                        {
                            allParties && allParties.map(party => {
                                return <option key={party["name"]} value={party["abbreviation"]}>{party["name"]}</option>
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
                    <script>showSeatsComparisonBarChart(
                        document.getElementById("${elementId}"),
                        {
                            stylesheetFor: "${stylesheetFor}",
                            eventDescriptions: ${JSON.stringify(eventDescriptions)},
                            regionType: "${regionType}",
                            provinceName: "${provinceName}",
                            muniName: "${muniName}",
                            muniCode: "${muniCode}",
                            iecId: "${iecId}",
                            partyAbbr: "${partyAbbr}"
                        });</script>`.replace(/(\r\n|\n|\r)/gm, "")}</span>
                  </div>
              </div>
          </div>
        )
    }
}
export default BarChartEmbed;