import React, { Component } from "react";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";
import styles from "./mapEmbed.css";
import config from "../../config";
import events from "../../events";

import {
    getElectionEvents,
    getProvincesData
} from "../../api";

var provincesData = getProvincesData();
function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class MapEmbed extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            elementId: "root",
            disableNavigation: false, //checkbox
            eventDescription: "2014 National Election",
            regionType: "province",
            provinceName: "Western Cape",
            muniName: "",
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
        var event = new CustomEvent(events.MAP_PREVIEW, { detail: this.state });
        document.dispatchEvent(event);
    }
      
    render () {
        var DOMAIN = config.DOMAIN;
        var {
            elementId,            
            disableNavigation,
            eventDescription,
            regionType,
            provinceName,
            muniName,
            electionEvents
        } = this.state;
        var curProvinceData = provincesData.filter(item => item.name == provinceName)[0];
        return (
          <div>
            <h3> Map Embed Script Generation </h3>
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
                            {
                                curProvinceData && curProvinceData.munis.map(muni => {
                                    return <option key={muni.muniName} value={muni.muniName}>{muni.muniName}</option>
                                })
                            }
                        </select>
                    </div>
              }

              <div className={className("form-check")}>
                
                <label className={className("form-check-label")}>
                    <input 
                        type="checkbox" 
                        className={className("form-check-input")} 
                        value={disableNavigation}
                        onChange={e => this.setState({disableNavigation: e.target.checked})} 
                        />
                    &nbsp;&nbsp;Disable Navigation
                </label>
              </div>
              <div className={className("form-group")}>
                <button type="button" onClick={this.onPreview.bind(this)} className={className("btn") + " " + className("btn-primary") }>Preview</button>
              </div>
            <div className={className("form-group")}>
                <label>Embed Code</label>
                <div className={className("embedcode")}>
                    <span>{`<script src="${DOMAIN}/embed/embed.js"></script>
                    <script>
                        showTurnoutMap(document.getElementById("${elementId}"),{
                            disableNavigation: ${disableNavigation},
                            regionType: "${regionType}",
                            provinceName: "${provinceName}",
                            muniName: "${muniName}",
                        });</script>`.replace(/(\r\n|\n|\r)/gm, "")}
                    </span>
                </div>
            </div>
          </div>
        )
    }
}
export default MapEmbed;


