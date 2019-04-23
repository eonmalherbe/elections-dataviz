import React, { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import config from "../../config";
import polylabel from "polylabel";
import styles from "../Map/map.css";
import events from "../../events";
import ReactLoading from "react-loading";
import {
    getMainParties,
    getPartyColors,
} from "../../api";
import {
  parseMainPartyData,
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
var partyColorsData;

function className(originName) {
  return styles[originName] || originName;
}

function cn(originName) {
  return className(config.CSS_PREFIX + originName);
}

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            disableNavigation: false,
            stylesheetFor: "web",
            componentID: 3
        }

        fetchDataFromOBJ(this.state, props);

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

    // componentWillReceiveProps(newProps) {
    //     var newState = JSON.parse(JSON.stringify(this.state));
    //     fetchDataFromOBJ(newState, newProps);
    //     this.setState(newState);
    // }

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
        if (!this.state.disableNavigation) {
            var newState = event.detail;
            this.setState(newState)
        }
    }

    getContainer() {
        return d3.select(this.refs.vizcontainer)
    }

    getLoadingSpinner() {
        return d3.select(this.refs.loading)
    }
      
    render () {
        var {
            stylesheetFor,
            componentID
        } = this.state;
        return (
            <div className={className("map-widget")+" "+cn(`stylesheet-${stylesheetFor}`)}>
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
                    // if (self.state.regionType === "municipality") return;
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 1);

                    var undefinedText;
                    if (self.state.regionType === "province") {
                        undefinedText = "New municipality - no previous results available"
                    } else {
                        undefinedText = "New voting district - no previous results available"
                    }
                    var mainPartyName = getMainPartyName(d, i);
                    var subRegionName = getSubRegionName(d.properties, self.state);
                    var tooltipText = (typeof mainPartyName !== "undefined")? 
                                (subRegionName + " : " + mainPartyName) : undefinedText;

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
                    } else if (regionType === "province") {
                        newState = {
                            regionType: "municipality", 
                            provinceName: self.state.provinceName,
                            muniName: d.properties.smunicipal,
                            muniCode: getMunicipalityCode(d.properties),
                        }
                    } else if (regionType === "municipality"){ // "municipality"
                        var newState = {
                            regionType: "municipality-vd", 
                            provinceName: self.state.provinceName,
                            muniName: self.state.muniName,
                            muniCode: self.state.muniCode,
                            iecId: getMunicipalityiecId(d.properties),
                        }
                    } else { // "municipality-vd"
                        return;
                    }
                    triggerCustomEvent(events.REGION_CHANGE, newState);
                    if (self.state.disableNavigation) {
                        return;
                    }
                    self.setState(newState);
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
            }
            self.getLoadingSpinner()
                .style("display", "none");
        }).catch(error => {
            console.error(error);

            self.getLoadingSpinner()
                .style("display", "none");
            
            if (self.state.disableNavigation) {
                return;
            }

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
                alert(`${currentRegionName} has been disestablished`); 
            }, 300);    
        })
    }
}

export default Map;
