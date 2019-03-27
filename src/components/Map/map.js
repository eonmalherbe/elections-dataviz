import React, { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import svgToPng from "save-svg-as-png";
import canvg from "canvg";

import config from "../../config";
import polylabel from "polylabel";
import styles from "../Map/map.css";
import events from "../../events";
import ReactLoading from "react-loading";
import {
    getMainParties,
    getPartyColors,
    getProvincesData
} from "../../api";
import {
  parseMainPartyData,
  getRegionName,
  getSubRegionName,
  createTooltip,
  getMunicipalityCode,
  fixMapLabelIntersect,
  triggerCustomEvent
} from "../../utils";

var regionColor = "#9c9c9c";
var regionBorderColor = "#eeeeee";
var partyColorsData;

function className(originName) {
  return styles[originName] || originName;
}

var provincesData = getProvincesData();

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disableNavigation: false,
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            stylesheetFor: "web"
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
        if (props.disableNavigation) {
            this.state.disableNavigation = props.disableNavigation;
        }
        if (props.stylesheetFor) {
            this.state.stylesheetFor = props.stylesheetFor;
        }
        this.exportAsPNGUri = this.exportAsPNGUri.bind(this);
        this.exportAsPNG = this.exportAsPNG.bind(this);
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    draw(container, props) {
        this.drawGraph(container, props);
    }

    componentDidMount() {
        this.draw(this.getContainer(), this.state)
        document.addEventListener(events.EXPORT_PNG, this.exportAsPNG);
        document.addEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentWillUnmount() {
      this.getContainer().selectAll("svg").remove();
      document.removeEventListener(events.EXPORT_PNG, this.exportAsPNG);
      document.removeEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentDidUpdate() {
        this.draw(this.getContainer(), this.state)
    }

    exportAsPNGUri() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var rect = {width: 950, height: 890};
            var rendercanvas = document.createElement('canvas');
            rendercanvas.setAttribute("width", rect.width);
            rendercanvas.setAttribute("height", rect.height);
    
            // var ctx = rendercanvas.getContext("2d");
            // ctx.globalCompositeOperation = "source-out";
            // ctx.fillStyle = "#ffffff";
            // ctx.fillRect(0, 0, rect.width, rect.height);

            canvg(rendercanvas, self.refs.vizcontainer.innerHTML, {
                ignoreDimensions: true,
                scaleWidth: rect.width,
                scaleHeight: rect.height
            });
            resolve(rendercanvas.toDataURL("image/png;base64").split(',')[1])
        });
    }

    exportAsPNG(event) {
        var rect = {width: 950, height: 890};
        var rendercanvas = document.createElement('canvas');
        rendercanvas.setAttribute("width", rect.width);
        rendercanvas.setAttribute("height", rect.height);

        canvg(rendercanvas, this.refs.vizcontainer.innerHTML, {
            ignoreDimensions: true,
            scaleWidth: rect.width,
            scaleHeight: rect.height
        });

        // var ctx = rendercanvas.getContext("2d");
        // ctx.globalCompositeOperation = "source-in";
        // ctx.fillStyle = "#ffffff";
        // ctx.fillRect(0, 0, rect.width, rect.height);

        var canvas = rendercanvas, filename = `race-for-votes-map(${getRegionName(this.state)}).png`;
        var lnk = document.createElement("a"), e;

        lnk.download = filename;
        lnk.href = canvas.toDataURL("image/png;base64");

        if (document.createEvent) {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window,
                            0, 0, 0, 0, 0, false, false, false,
                            false, 0, null);
            lnk.dispatchEvent(e);
        } else if (lnk.fireEvent) {
            lnk.fireEvent("onclick");
        }
    }

    handlePreviewEvent(event) {
        var newState = event.detail;
        this.setState(newState)
    }

    getContainer() {
        return d3.select(this.refs.vizcontainer)
    }

    getLoadingSpinner() {
        return d3.select(this.refs.loading)
    }
      
    render () {
        var {
            disableNavigation,
            stylesheetFor
        } = this.state;
        return (
            <div className={className("map-widget")+" "+className(`${config.CSS_PREFIX}stylesheet-${stylesheetFor}`)}>
                <div className={className(config.CSS_PREFIX + "map-title")}>{getRegionName(this.state)}</div>

                <div ref="vizcontainer" className={className("map")}></div>
                <div className={className(config.CSS_PREFIX + "loading-spinner")} ref="loading">
                    <ReactLoading type={"spin"} color={"#777"} height={100} width={100} />
                </div>
            </div>
        )
    }

    drawGraph(container, props) {
        var self = this;
        var nationalMapFile = "province_lo-res.geojson";

        function getRegionFileName() {
            function getProvinceFileName(provinceName) {
                var provinceNameToFileMap = {
                    "Limpopo": "lim_lo-res.geojson",
                    "Mpumalanga": "mp_lo-res.geojson",
                    "Gauteng": "gt_lo-res.geojson",
                    "KwaZulu-Natal": "kzn_lo-res.geojson",
                    "North West": "nw_lo-res.geojson",
                    "Free State": "fs_lo-res.geojson",
                    "Eastern Cape": "ec_lo-res.geojson",
                    "Northern Cape": "nc_lo-res.geojson",
                    "Western Cape": "wc_lo-res.geojson",
                }
                return provinceNameToFileMap[provinceName];
            }
            switch(self.state.regionType) {
                case "national":
                    return nationalMapFile;
                case "province":
                    return getProvinceFileName(self.state.provinceName);
                case "municipality":
                    return self.state.muniCode + ".topojson";
                case "municipality-vd":
                    return "vd-data/" + self.state.muniCode + "-" + self.state.iecId + ".geojson"
                default:
                    return null;
            }
        }

        var fullRouteGeoJsonFile = config.DOMAIN + "/mapdata/" + getRegionFileName();

        self.getLoadingSpinner()
            .style("display", "block")
            .transition()
            .duration(200)
            .style("opacity", 1);

        var tooltipDiv = createTooltip(className);

        var w = 900;
        var h = 800;
        var bottomMargin = 90;// for legend
        var rightMargin = 50;

        container.selectAll("svg").remove();
        var svg = container.append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + (w+rightMargin) + " " + (h+bottomMargin))
            .classed("svg-content", true);

        var geoJsonLoader = d3.json(fullRouteGeoJsonFile);
        var mainPartiesDataLoader = getMainParties(props);
        var dataLoaders = [geoJsonLoader, mainPartiesDataLoader];

        if (!partyColorsData) {
          var partyColorsLoader = getPartyColors();
          dataLoaders.push(partyColorsLoader);
        }

        Promise.all(dataLoaders).then(function(values){ 
            var geoJsonData = values[0];
            var locationToMainParty = parseMainPartyData(values[1], props);
            partyColorsData = partyColorsData || values[2];  

            var partyColorByName = {};
            var partyAbbrByName = {};
            if (partyColorsData && partyColorsData["data"]["allParties"]["edges"]) {
              partyColorsData["data"]["allParties"]["edges"].forEach(edge => {
                partyColorByName[edge.node.name] = edge.node.colour;
                partyAbbrByName[edge.node.name] = edge.node.abbreviation;
              })
            }            

            function getFillColorFromPartyName(partyName) {
              if (!partyName)
                return regionColor;
              return partyColorByName[partyName.split("/")[0]] || regionColor;
            }

            function getMainPartyName(d, i) {
                function getMunicipalityiecId(properties) {
                    return properties.PKLVDNUMBE;
                }
                var partyName;
                var regionType = self.state.regionType;
                if (regionType === "national") {
                    var provinceName = d.properties.SPROVINCE;
                    partyName = locationToMainParty[provinceName];
                } else if (regionType === "province") {
                    var muniCode = getMunicipalityCode(d.properties);
                    partyName = locationToMainParty[muniCode];
                } else if (regionType === "municipality"){// "municipality"
                    var iecId = getMunicipalityiecId(d.properties);
                    partyName = locationToMainParty[iecId];
                } else {// "municipality-vd"
                    var iecId = getMunicipalityiecId(d.properties);
                    partyName = locationToMainParty[iecId];
                }
                return partyName;
            }
            function getMainPartyColorFromRegion(d, i) {
                var partyName = getMainPartyName(d, i);
                var partyColor = getFillColorFromPartyName(partyName);
                return partyColor;
            }

            var jsonDataFeatures;
            if (fullRouteGeoJsonFile.indexOf(".topojson") !== -1) {//topojson is used for only munis
                if (!geoJsonData.objects[self.state.muniCode])
                    return;
    
                geoJsonData = topojson.feature(geoJsonData, geoJsonData.objects[self.state.muniCode]);
            }

            jsonDataFeatures = geoJsonData.features;

            var projection = d3.geoMercator().fitSize([w, h], geoJsonData);
            var path = d3.geoPath().projection(projection);

            // fill region with regionColor
            svg.selectAll(`.${className("region")}`)
                .data(jsonDataFeatures)
                .enter()
                .append("path")
                .attr("class", className("region"))
                .attr("stroke", regionBorderColor)
                .attr("fill", getMainPartyColorFromRegion)
                .attr("id", function(d, i) {
                    return `region-${i}`;
                })
                .attr("d", path);
            
            var parties = [];
            var availableCnt = [];
            jsonDataFeatures.forEach((d, i) => {
                var party = getMainPartyName(d, i);
                if (parties.indexOf(party) == -1) {
                    parties.push(party);
                    availableCnt.push(1);
                } else {
                    availableCnt[parties.indexOf(party)] ++;
                }
            })

            parties.sort(function(a, b){
                return availableCnt[parties.indexOf(b)] - availableCnt[parties.indexOf(a)];
            })

            function getLegendXY(i) {
                return [(i%5)*150, h + 10 + parseInt(i/5) * 40];
            }
            var legends = svg.selectAll(`.${className("legend")}`)
                .data(parties)
                .enter()
                .append('g')
                .attr("class", className("legend"))
                .attr('transform', (d, i) => "translate(" + getLegendXY(i) + ")")
            legends
                .append("rect")
                .attr('width', 20)
                .attr('height', 20)
                .attr('x', 0)
                .attr('y', 0)
                .attr("fill", (party, i) => {
                    return getFillColorFromPartyName(party);
                })
            legends.append('text')
                .attr('x', 30)
                .attr('y', 16)
                .text(party => partyAbbrByName[party])
            
            if (self.state.regionType.indexOf("municipality") == -1) {
                svg.selectAll(".place-label")
                    .data(jsonDataFeatures)
                .enter().append("text")
                    .attr("class", "place-label")
                    .attr("font-size", "12px")
                    .attr("transform", function(d) { 
                        var center, projectionCenter;
                        if (d.geometry.type === "Polygon") {
                            center = polylabel(d.geometry.coordinates);
                            projectionCenter = projection(center);
                            projectionCenter[1] -= 12;
                            return "translate(" + projectionCenter + ")"; 
                        } else { //"MultiPolygon"
                            center = polylabel(d.geometry.coordinates[0]);
                            projectionCenter = projection(center);
                            projectionCenter[1] -= 5;
                            return "translate(" + projectionCenter + ")"; 
                        }
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(d => getSubRegionName(d.properties, self.state))
            }

            if (self.state.regionType.indexOf("municipality") == -1) {
                fixMapLabelIntersect();
            }

            //hidden area for catching events
            svg.selectAll(".eventLayer")
                .data(jsonDataFeatures)
            .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "eventLayer")
                .attr("id", function(d, i) {
                    return `eventLayer-${i}`;
                })
                .attr("fill", "transparent")
                .on("mouseover", function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr("stroke-width", 3)
                        .style("fill-opacity", 0.8);
                })
                .on("mousemove", function(d, i) {	
                    if (self.state.regionType === "municipality") return;
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 1);

                    tooltipDiv.html(getSubRegionName(d.properties, self.state) + " : " + getMainPartyName(d, i))	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                })
                .on("mouseout", function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr("stroke-width", 1)
                        .style("fill-opacity", 1);
                    
                    if (self.state.regionType === "municipality") return;

                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 0);	
                })
                .on("click", function(d, i) {
                    if (self.state.disableNavigation) {
                        return;
                    }
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 0);	
                    
                    var regionType = self.state.regionType;
                    var newState, event;
                    if (regionType === "national") {
                        newState = {
                            regionType: "province",
                            provinceName: d.properties.SPROVINCE
                        }
                        triggerCustomEvent(events.REGION_CHANGE, newState);
                        self.setState(newState);
                    } else if (regionType === "province") {
                        newState = {
                            regionType: "municipality", 
                            provinceName: self.state.provinceName,
                            muniName: d.properties.smunicipal,
                            muniCode: getMunicipalityCode(d.properties),
                        }
                        triggerCustomEvent(events.REGION_CHANGE, newState);

                        self.setState(newState);
                    } else { // "municipality"
                        function getMunicipalityiecId(properties) {
                            return properties.PKLVDNUMBE;
                        }
                        var newState = {
                            regionType: "municipality-vd", 
                            provinceName: self.state.provinceName,
                            muniName: self.state.muniName,
                            muniCode: self.state.muniCode,
                            iecId: getMunicipalityiecId(d.properties),
                        }
                        triggerCustomEvent(events.REGION_CHANGE, newState);

                        self.setState(newState);
                    }
                })
            if (!self.state.disableNavigation) {
                var fo = svg.append("foreignObject")
                    .attr("x", w - 100)
                    .attr("y", 10)
                    .attr("width", 100)
                    .attr("height", 30)
                    .attr("class", "map-controls")
                fo.append("xhtml:div")
                    .append("button")
                    .attr("class", "go-back")
                    .style("height", "30px")
                    .style("color", "black")
                    .html("go back")
                    .on("click", function() {
                        var regionType = self.state.regionType;
                        var newState, event;
    
                        var newState = {
                            regionType: self.state.regionType, 
                            provinceName: self.state.provinceName,
                            muniName: self.state.muniName,
                            muniImuniCodeD: self.state.muniCode,
                            iecId: self.state.iecId,
                        }
                        
                        if (regionType === "province") {
                            newState.regionType = "national";
                        } else if (regionType === "municipality") {
                            newState.regionType = "province";
                        } else if (regionType === "municipality-vd") {
                            newState.regionType = "municipality";
                        }
    
                        triggerCustomEvent(events.REGION_CHANGE, newState);
                        self.setState(newState);
                    });
            }
            self.getLoadingSpinner()
                .style("display", "none");
        })
    }
}

export default Map;
