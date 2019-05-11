import React, { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

import config from "../../config";
import polylabel from "polylabel";
import styles from "../Map/map.css";
import events from "../../events";
import ReactLoading from "react-loading";
import {
    getTurnoutData,
    getProvincesData
} from "../../api";
import {
  parseTurnoutData,
  parseCountingProgressDataForMap,
  getRegionName,
  getSubRegionName,
  createTooltip,
  getMunicipalityCode,
  fixMapLabelIntersect,
  triggerCustomEvent,
  getMunicipalityiecId,
  getRegionFileName,
  fetchDataFromOBJ
} from "../../utils";

var dataRefreshTime = 30 * 1000;

var regionColor = "#9c9c9c";
var regionBorderColor = "#eeeeee";

function className(originName) {
  return styles[originName] || originName;
}

function cn(originName) {
  return className(config.CSS_PREFIX + originName);
}

var provincesData = getProvincesData();

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isTurnout: true,
            disableNavigation: false,
            eventDescription: "2019 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            stylesheetFor: "web",
            componentID: 11
        }

        fetchDataFromOBJ(this.state, props);
        console.log("updatedState", this.state, props);

        this.refreshIntervalID = 0;
        this.exportAsPNGUri = this.exportAsPNGUri.bind(this);
        this.exportAsPNG = this.exportAsPNG.bind(this);
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    draw(container, props) {
        this.drawGraph(container, props);
    }

    componentDidMount() {
        var self = this;
        this.draw(this.getContainer(), this.state);
        this.refreshIntervalID = setInterval(() => {
          self.draw(self.getContainer(), self.state)
        }, dataRefreshTime);

        document.addEventListener(events.EXPORT_PNG, this.exportAsPNG);
        document.addEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentWillUnmount() {
        this.getContainer().selectAll("svg").remove();
        document.removeEventListener(events.EXPORT_PNG, this.exportAsPNG);
        document.removeEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevState) !== JSON.stringify(this.state))
            this.draw(this.getContainer(), this.state)
    }


    exportAsPNGUri() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var rect = {width: 950, height: 890};
            var rendercanvas = document.createElement('canvas');
            rendercanvas.setAttribute("width", rect.width);
            rendercanvas.setAttribute("height", rect.height);

            if (!window.canvg) {
                return reject("canvg module not available");
            }

            window.canvg(rendercanvas, self.refs.vizcontainer.innerHTML, {
                ignoreDimensions: true,
                scaleWidth: rect.width,
                scaleHeight: rect.height
            });
            resolve(rendercanvas.toDataURL("image/png;base64").split(',')[1])
        });
    }

    exportAsPNG(event) {
        var targetState = event.detail;
        if (targetState.componentID != this.state.componentID)
          return;
        var rect = {width: 950, height: 890};
        var rendercanvas = document.createElement('canvas');
        rendercanvas.setAttribute("width", rect.width);
        rendercanvas.setAttribute("height", rect.height);

        if (!window.canvg) {
            return console.error("canvg module not available");
        }

        window.canvg(rendercanvas, this.refs.vizcontainer.innerHTML, {
            ignoreDimensions: true,
            scaleWidth: rect.width,
            scaleHeight: rect.height
        });

        var canvas = rendercanvas, filename = `turnout-map(${getRegionName(this.state)}).png`;
        if (!this.state.isTurnout) {
            filename = `counting-progress-map(${getRegionName(this.state)}).png`
        }
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
            stylesheetFor,
            componentID
        } = this.state;
        return (
            <div className={className("map-widget") + " " + cn(`stylesheet-${stylesheetFor}`)}>
                {
                    componentID != -1000 && <div className={cn("map-title")}>{getRegionName(this.state)}</div>
                }
                <div ref="vizcontainer" className={className("map")}></div>
                <div className={cn("loading-spinner")} ref="loading">
                    <ReactLoading type={"spin"} color={"#777"} height={100} width={100} />
                </div>
            </div>
        )
    }
 
    drawGraph(container, props) {
        var self = this;

        var fullRouteGeoJsonFile = config.DOMAIN + "/mapdata/" + getRegionFileName(self.state);

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
        var mainDataLoader = getTurnoutData(props);
        var dataLoaders = [mainDataLoader];

        geoJsonLoader.then(function(value) {
            var geoJsonData = value;
            Promise.all(dataLoaders).then(function(values){ 
                var locationToMainData;
                if (self.state.isTurnout) {
                    locationToMainData = parseTurnoutData(values[0], props);
                } else {
                    locationToMainData = parseCountingProgressDataForMap(values[0], props);
                }
                       
    
                function getMergedColorWithWhite(percent) {
                    var originRGB = {
                        R: 0,
                        G: 255,
                        B: 0
                    }
                    var mixedR = (originRGB.R * (percent) + 255 * (100-percent))/100;
                    var mixedG = (originRGB.G * (percent) + 255 * (100-percent))/100;
                    var mixedB = (originRGB.B * (percent) + 255 * (100-percent))/100;
                    return `rgb(${mixedR},${mixedG},${mixedB})`;
                }
                function getFillColorFromTurnout(turnout) {
                //   if (turnout > 65)
                //     return "#39711D";//getMergedColorWithWhite(100);//"rgb(0,165,138)";
                //   if (turnout >= 60)
                //     return "#458923";//getMergedColorWithWhite(90);//"rgb(4,68,95)";
                //   if (turnout >= 55)
                //     return "#53B025";//getMergedColorWithWhite(80);//"rgb(4,98,138)";
                //   if (turnout >= 50)
                //     return "#4BDC02";//getMergedColorWithWhite(70);//"rgb(4,117,164)";
                //   if (turnout >= 45)
                //     return "#7CE547";//getMergedColorWithWhite(60);//"rgb(4,136,191)";
                //   if (turnout >= 40)
                //     return "#93E968";//getMergedColorWithWhite(50);//"rgb(0,154,216)";
                //   if (turnout >= 35)
                //     return "#A6ED83";//getMergedColorWithWhite(40);//"rgb(77,174,224)";
                //   if (turnout >= 30)
                //     return "#C5F3AF";//getMergedColorWithWhite(30);//"rgb(124,194,231)";
                //   return "#D3F6C3";//regionColor;
                    if (turnout > 90)
                        return "#39711D";//getMergedColorWithWhite(100);//"rgb(0,165,138)";
                    if (turnout >= 80)
                        return "#458923";//getMergedColorWithWhite(90);//"rgb(4,68,95)";
                    if (turnout >= 70)
                        return "#53B025";//getMergedColorWithWhite(80);//"rgb(4,98,138)";
                    if (turnout >= 60)
                        return "#7CE547";//getMergedColorWithWhite(70);//"rgb(4,117,164)";
                    if (turnout >= 50)
                        return "#C5F3AF";//getMergedColorWithWhite(60);//"rgb(4,136,191)";
                    return "#D3F6C3";//regionColor;
                }

                function getFillColorFromCountProg(countProg) {
                    if (countProg >= 100)
                      return "#980043";
                    if (countProg >= 80)
                      return "#dd1c77";
                    if (countProg >= 60)
                      return "#df65b0";
                    if (countProg >= 40)
                      return "#c994c7";
                    if (countProg >= 20)
                      return "#d4b9da";
                    if (countProg <= 0)
                      return "#ffffff";
                    return "#f1eef6";
                  }
    
                function getMainData(d, i) {
                    var mainData;
                    var regionType = self.state.regionType;
                    if (regionType === "national") {
                        var provinceName = d.properties.SPROVINCE;
                        mainData = locationToMainData[provinceName];
                    } else if (regionType === "province") {
                        var muniCode = getMunicipalityCode(d.properties);
                        mainData = locationToMainData[muniCode];
                    } else if (regionType === "municipality"){// "municipality"
                        var iecId = getMunicipalityiecId(d.properties);
                        mainData = locationToMainData[iecId];
                    } else {// "municipality-vd"
                        var iecId = getMunicipalityiecId(d.properties);
                        mainData = locationToMainData[iecId];
                    }
                    return mainData;
                }
                function getFillColorFromRegion(d, i) {
                    if (self.state.isTurnout) {
                        var turnout = getMainData(d, i);
                        return getFillColorFromTurnout(turnout);
                    } else {
                        var countProg = getMainData(d, i);
                        return getFillColorFromCountProg(countProg);
                    }
                }
                var jsonDataFeatures;
                if (fullRouteGeoJsonFile.indexOf(".topojson") !== -1) {//topojson is used for munis and muni-vds
                    var regionType = self.state.regionType
                    if (regionType == "municipality") {
                        if (!geoJsonData.objects[self.state.muniCode])
                            return;
                        geoJsonData = topojson.feature(geoJsonData, geoJsonData.objects[self.state.muniCode]);
                    } else { // "municipality-vd"
                        if (!geoJsonData.objects[self.state.iecId])
                            return;
                        geoJsonData = topojson.feature(geoJsonData, geoJsonData.objects[self.state.iecId]);
                    }
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
                    .attr("fill", getFillColorFromRegion)
                    .attr("id", function(d, i) {
                        return `region-${i}`;
                    })
                    .attr("d", path);

                    
                var turnoutColors = [{
                    text: "More than 90%",
                    turnout: 91
                },{
                    text: "80% - 89%",
                    turnout: 81
                },{
                    text: "70% - 79%",
                    turnout: 71
                },{
                    text: "60% - 69%",
                    turnout: 61
                },{
                    text: "50% - 59%",
                    turnout: 51
                },{
                    text: "Less than 50%",
                    turnout: 40
                }];

                var countProgColors = [{
                    text: "100%",
                    countProg: 100
                },{
                    text: "80% - 99%",
                    countProg: 81
                },{
                    text: "60% - 79%",
                    countProg: 61
                },{
                    text: "40% - 59%",
                    countProg: 41
                },{
                    text: "20% - 39%",
                    countProg: 21
                },{
                    text: "0.01% - 19%",
                    countProg: 1
                },{
                    text: "0%",
                    countProg: 0
                }];
                
                function getLegendXY(i) {
                    return [(i%5)*170, h + 10 + parseInt(i/5) * 40];
                }
                var legends = svg.selectAll(`.${className("legend")}`)
                    .data(self.state.isTurnout? turnoutColors: countProgColors)
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
                    .attr("fill", (it) => {
                        if (self.state.isTurnout)
                            return getFillColorFromTurnout(it.turnout);
                        return getFillColorFromCountProg(it.countProg);
                    })
                legends.append('text')
                    .attr('x', 30)
                    .attr('y', 16)
                    .text(it => it.text)
                
                if (self.state.regionType !== "municipality") {
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
    
                if (self.state.regionType !== "municipality") {
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
                        tooltipDiv.transition()		
                            .duration(200)		
                            .style("opacity", 1);
                        
                        var undefinedText;
                        if (self.state.eventDescription.indexOf("2019") == -1) {
                            if (self.state.regionType === "province") {
                                undefinedText = "New municipality - no previous results available"
                            } else {
                                undefinedText = "New voting district - no previous results available"
                            }
                        } else {
                            undefinedText = "votes not counted yet";
                        }
    
                        var mainData = getMainData(d, i);
                        var subRegionName = getSubRegionName(d.properties, self.state);
                        var tooltipText = (typeof mainData !== "undefined")? 
                                    (subRegionName + " : " + mainData + "%") : undefinedText;
    
                        tooltipDiv.html(tooltipText)	
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
                        var newState;
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
                            .attr("x", 0)
                            .attr("y", 10)
                            .attr("width", 500)
                            .attr("height", 30)
                            .attr("class", "map-controls")
                        
                        function setRegionType(regionType) {
                            var newState;
                            var newState = {
                                regionType: self.state.regionType, 
                                provinceName: self.state.provinceName,
                                muniName: self.state.muniName,
                                muniCode: self.state.muniCode,
                                iecId: self.state.iecId,
                            }
                            newState.regionType = regionType;
                            triggerCustomEvent(events.REGION_CHANGE, newState);
                            self.setState(newState);
                        }
        
                        function appendSpan(foDiv, regionName, addSub) {
                            if (addSub) foDiv.append("span").html(" > ");
                            foDiv.append("span")
                                .style("height", "30px")
                                .style("cursor", "default")
                                .html(regionName);
                        }
        
                        function appendLink(foDiv, regionName, regionType, addSub) {
                            if (addSub) foDiv.append("span").html(" > ");
                            foDiv.append("a")
                                .style("height", "30px")
                                .style("cursor", "pointer")
                                .html(regionName)
                                .on("click", function() {
                                    setRegionType(regionType);
                                });
                        }
                        
                        var foDiv = fo.append("xhtml:div");
                        var regionType = self.state.regionType;
                        if (regionType == "national") {
                            appendSpan(foDiv, "South Africa", false);
                        } else {
                            appendLink(foDiv, "South Africa", "national", false);
                            if (regionType == "province") {
                                appendSpan(foDiv, self.state.provinceName, true);
                            } else {
                                appendLink(foDiv, self.state.provinceName, "province", true);
                                if (regionType == "municipality") {
                                    appendSpan(foDiv, self.state.muniCode, true);
                                } else {
                                    appendLink(foDiv, self.state.muniCode, "municipality", true);
                                    appendSpan(foDiv, self.state.iecId, true);
                                }
                            }
                        }
                        // foDiv
                        //     .append("button")
                        //     .attr("class", "go-back")
                        //     .style("height", "30px")
                        //     .style("color", "black")
                        //     .html("go back")
                        //     .on("click", function() {
                        //         var regionType = self.state.regionType;
                        //         var newState, event;
            
                        //         var newState = {
                        //             regionType: self.state.regionType, 
                        //             provinceName: self.state.provinceName,
                        //             muniName: self.state.muniName,
                        //             muniCode: self.state.muniCode,
                        //             iecId: self.state.iecId,
                        //         }
                                
                        //         if (regionType === "province") {
                        //             newState.regionType = "national";
                        //         } else if (regionType === "municipality") {
                        //             newState.regionType = "province";
                        //         } else if (regionType === "municipality-vd") {
                        //             newState.regionType = "municipality";
                        //         }
            
                        //         triggerCustomEvent(events.REGION_CHANGE, newState);
                        //         self.setState(newState);
                        //     });
                    }
                self.getLoadingSpinner()
                    .style("display", "none");
            }).catch(error => {
                console.error(error);
                console.log(`failed to get data from server`);
            })
        }).catch(error => {
            console.error(error);       
            self.getLoadingSpinner()
                .style("display", "none");
            var currentRegionName = getRegionName(this.state);
            var regionType = self.state.regionType;
            var newState, event;

            var newState = {
                regionType: self.state.regionType, 
                provinceName: self.state.provinceName,
                muniName: self.state.muniName,
                muniCode: self.state.muniCode,
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
            setTimeout(() => {
                if (regionType == "national" || regionType == "province") {
                  console.log(`Can't get map data for ${currentRegionName}`);
                } else {
                    alert(`${currentRegionName} has been disestablished`); 
                }
            }, 300);    
        })
    }
}

export default Map;
