import React, { Component } from "react";
import config from "../../config";
import bootstrapStyles from "bootstrap/dist/css/bootstrap.min.css";
import styles from "./barchartEmbed.css";
import events from "../../events";
import {
    getElectionEvents
} from "../../api";

function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class BarChartEmbed extends Component {
    
    constructor(props) {
        super(props);
        var self = this;
        this.state = {
            elementId: "root",
            eventDescription: "2014 National Election",
            regionType: "province",
            provinceName: "Western Cape",
            muniName: "",
            muniCode: "",
            vdNumber: "",
            numParties: 5,

            electionEvents: []
        }
        getElectionEvents()
            .then(function(data) {
                var electionEvents = data["data"]["allEvents"].map(edge => edge["description"])
                self.setState({electionEvents});
            }).catch(error => console.error(error));
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    onEventDescriptionChange(e) {
        this.setState({eventDescription: e.target.value});
    }

    onRegionTypeChange(e) {
        var newState = {regionType: e.target.value};
        this.setState(newState);
    }

    onPreview(e) {
        var event = new CustomEvent(events.BARCHART_PREVIEW, { detail: this.state });
        document.dispatchEvent(event);
    }
      
    render () {
        var DOMAIN = config.DOMAIN;
        var {
            elementId,
            eventDescription,
            regionType,            
            provinceName,
            muniName,
            muniCode,
            vdNumber,
            numParties,
            electionEvents
        } = this.state;
        return (
          <div>
            <h3> Barchart Embed Script Generation </h3>
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
                        <option value="national">national</option>
                        <option value="province">province</option>
                        <option value="municipality">municipality</option>
                        <option value="municipality-vd">voting district</option>
                  </select>
              </div>
              {
                  (regionType != "national") && 
                    <div className={className("form-group")}>
                        <label>Province Name</label>
                        <input 
                            type="text" 
                            className={className("form-control")} 
                            placeholder="Western Cape"
                            value={provinceName}
                            onChange={e => this.setState({provinceName: e.target.value})} 
                            disabled={(regionType=="national")}/>
                    </div>
              }
              {
                  (regionType == "municipality") &&
                    <div className={className("form-group")}>
                        <label>Municipality Name</label>
                        <input 
                            type="text" 
                            className={className("form-control")} 
                            placeholder="City of Cape Town"
                            value={muniName}
                            onChange={e => this.setState({muniName: e.target.value})} 
                            disabled={(regionType=="national")}/>
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
                            disabled={(regionType=="national")}/>
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
                            value={vdNumber}
                            onChange={e => this.setState({vdNumber: e.target.value})} 
                            disabled={(regionType=="national")}/>
                    </div>
              }
              <div className={className("form-group")}>
                  <label>Number Of Parties</label>
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
                  <label>Embed Code</label>
                  <div className={className("embedcode")}>
                    <span>{`<script src="${DOMAIN}/embed/embed.js"></script>
                    <script>showBarChart(
                        document.getElementById("${elementId}"),
                        {
                            eventDescription: "${eventDescription}",
                            regionType: "${regionType}",
                            provinceName: "${provinceName}",
                            muniName: "${muniName}",
                            muniCode: "${muniCode}",
                            vdNumber: "${vdNumber}",
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
export default BarChartEmbed;


