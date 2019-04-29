import React, { Component } from "react";
import styles from "./barchartMap.css";
import BarChart from '../BarChart/barchart';
import Map from '../Map/map';
import events from "../../events";
import config from "../../config";
import {saveAs} from "file-saver";

import {
    getRegionName,
    fetchDataFromOBJ
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
        this.state = {
            numParties: 5,
            eventDescription: "2019 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            stylesheetFor: "web",
            componentID: 2
        }      

        fetchDataFromOBJ(this.state, props);

        this.exportAsPNG = this.exportAsPNG.bind(this);
    }

    exportAsPNG(event) {
        var targetState = event.detail;
        if (targetState.componentID != this.state.componentID)
          return;
        var self = this;
        Promise.all([
            self.barchartInstance.exportAsPNGUri(),
            self.mapInstance.exportAsPNGUri()
        ]).then(values => {
            var zip = new window.JSZip();

            var imgs = zip.folder("export-images");
            imgs.file("barchart.png", values[0], {base64: true});
            imgs.file("map.png", values[1], {base64: true});

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                saveAs(content, `race-for-votes-barchart-map(${getRegionName(self.state)}).zip`);
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
        <div ref="superwidget" className={className("barchart-map") + " " + cn(`stylesheet-${stylesheetFor}`)}>
            <div className={className("barchart-container")} ref="barchart">
                <BarChart 
                    ref={instance => { this.barchartInstance = instance; }} 
                    {...this.state}
                    componentID={-1000} />
            </div>
            <div className={className("map-container")}>
                <Map 
                    ref={instance => { this.mapInstance = instance; }} 
                    {...this.state}
                    componentID={-1000} />
            </div>
        </div>
        );
    }
}

export default BarchartWithNavMap;
