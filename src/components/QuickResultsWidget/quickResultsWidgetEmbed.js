import React, { Component } from "react";
import config from "../../config";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";
import styles from "./quickResultsWidgetEmbed.css";
import events from "../../events";
import {
    getElectionEvents,
    getProvincesData
} from "../../api";

import {
    triggerCustomEvent
} from "../../utils";

var provincesData = getProvincesData();

function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class QuickResultsWidgetEmbed extends Component {
    
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

            electionEvents: []
        }
    }

    componentDidMount() {
        var self = this;
        getElectionEvents()
            .then(function(data) {
                var electionEvents = data["data"]["allEvents"].map(edge => edge["description"])
                self.setState({electionEvents});
            }).catch(error => console.error(error));
    }

    componentDidUpdate() {
    }

    onEventDescriptionChange(e) {
        if (e.target.value.toLowerCase().indexOf("national") == -1 &&
                this.state.regionType == "national") {
            this.setState({eventDescription: e.target.value, regionType: "province", provinceName: "Western Cape"});
        } else {
            this.setState({eventDescription: e.target.value });
        }
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
            regionType,            
            provinceName,
            muniName,
            muniCode,
            iecId,
            numParties,
            electionEvents
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
                  <label>Event </label>
                  <select className={className("form-control")} 
                     value={eventDescription}
                     onChange={this.onEventDescriptionChange.bind(this)}>
                        {
                            electionEvents.map(item => {
                                return (<option key={item} value={item}>{item}</option>)
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
                            eventDescription.toLowerCase().indexOf("national") != -1 && 
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
                    <span>{`<script src="${DOMAIN}/embed/embed.js"></script>
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
                            numParties: "${numParties}",
                            width: 600,
                            height: 220
                        });</script>`.replace(/(\r\n|\n|\r)/gm, "")}</span>
                  </div>
              </div>
          </div>
        )
    }
}
export default QuickResultsWidgetEmbed;