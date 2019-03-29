import React, { Component } from "react";
import styles from "./barchartMap.css";
import BarChart from '../BarChart/barchart';
import Map from '../Map/map';
import events from "../../events";
import config from "../../config";
import JSZip from "jszip";
import {saveAs} from "file-saver";

import {
    getRegionName
} from "../../utils";

function className(originName) {
    return styles[originName] || originName;
}

function cn(originName) {
  return className(config.CSS_PREFIX + originName);
}

class BarchartWithNavMap extends Component {    
    constructor(props) {
        super(props);
        var self = this;
        this.state = {
            numParties: 5,
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
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

        this.exportAsPNG = this.exportAsPNG.bind(this);
    }

    exportAsPNG(event) {
        var self = this;
        Promise.all([
            self.barchartInstance.exportAsPNGUri(),
            self.mapInstance.exportAsPNGUri()
        ]).then(values => {
            console.log("exporting ...");
            var zip = new JSZip();

            var imgs = zip.folder("export-images");
            imgs.file("barchart.png", values[0], {base64: true});
            imgs.file("map.png", values[1], {base64: true});

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                saveAs(content, `race-for-votes-barchart-map(${getRegionName(self.state)}).zip`);
                console.log("exporting ended successfully");
            });
        }).catch(error => {
            console.error("export error", error);
        })
    }

    componentDidMount() {
        document.addEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
    }
  
    componentWillUnmount() {
        document.removeEventListener(events.EXPORT_SUPERWIDGET_PNG, this.exportAsPNG);
    }

    render() {
      const {
        stylesheetFor
      } = this.state;

        return (
        <div ref="superwidget" className={cn(`stylesheet-${stylesheetFor}`)}>
            <div className={className("barchart-container")} ref="barchart">
                <BarChart 
                    ref={instance => { this.barchartInstance = instance; }} 
                    {...this.state} />
            </div>
            <div className={className("map-container")}>
                <Map 
                    ref={instance => { this.mapInstance = instance; }} 
                    {...this.state}/>
            </div>
        </div>
        );
    }
}

export default BarchartWithNavMap;
