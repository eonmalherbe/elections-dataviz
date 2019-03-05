import React, { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { SideNav, Nav } from "react-sidenav";

import config from "../../config";
import polylabel from "polylabel";
import styles from "./map.css";
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
  createTooltip
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
            iecId: ""
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
        if (props.disableNavigation) {
            this.state.disableNavigation = props.disableNavigation;
        }
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    draw(container, props) {
        this.drawGraph(container, props);
    }

    componentDidMount() {
        this.draw(this.getContainer(), this.state)
        document.addEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentWillUnmount() {
      document.removeEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentDidUpdate() {
        this.draw(this.getContainer(), this.state)
    }

    handlePreviewEvent(event) {
        var newState = event.detail;
        this.setState(newState)
    }

    handleNavBarSelection(regionType, selectionData) {
        var newState;
        if (regionType == "national") {
            newState = {regionType: regionType};
            if (this.state.regionType == newState.regionType)
                return;
        } else if (regionType == "province") {
            newState = {
                regionType: regionType,
                provinceName: selectionData.name
            };
            if (this.state.regionType == newState.regionType && this.state.provinceName == newState.provinceName)
                return;
        } else if (regionType == "municipality") {
            newState = {
                regionType: regionType,
                provinceName: selectionData.provinceName,
                muniName: selectionData.muniName,
                muniCode: selectionData.muniCode,
            }; 
            if (this.state.regionType == newState.regionType 
                && this.state.provinceName == newState.provinceName
                && this.state.newState == newState.muniName)
                return;
        }

        var event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
        document.dispatchEvent(event);
        this.setState(newState);
    }

    getContainer() {
        return d3.select(this.refs.vizcontainer)
    }

    getLoadingSpinner() {
        return d3.select(this.refs.loading)
    }
      
    render () {
        const theme = {
            selectionColor: "#C51162"
        };
        var {
            disableNavigation
        } = this.state;
        return (
            <div className="map-widget">
                {/* {
                    !disableNavigation &&
                        <div className={className("map-navbar")}>
                            <SideNav
                                defaultSelectedPath="1"
                                theme={theme}
                                onItemSelection={this.onItemSelection}
                                className={className("map-navbar")}
                            >
                                <Nav id="navbar-national" onClick={this.handleNavBarSelection.bind(this, "national")}>
                                    National
                                </Nav>
                                {
                                    provincesData.map(province => {
                                        return <Nav 
                                            key={province.abbreviation} 
                                            id={"navbar-province-"+province.abbreviation}
                                            onClick={this.handleNavBarSelection.bind(this, "province", province)}>
                                                { province.name }
                                                {
                                                    province.munis.map(muni => {
                                                        return <Nav 
                                                            key={muni.muniCode} 
                                                            id={"navbar-muni-"+muni.muniCode}
                                                            onClick={this.handleNavBarSelection.bind(this, "municipality", muni)}
                                                            >
                                                                {muni.muniName.split("-")[1].split("[")[0] }
                                                            </Nav>
                                                    })
                                                }
                                        </Nav>
                                    })
                                }
                            </SideNav>
                        </div> 
                } */}

                <div className={className("map-title")}>{getRegionName(this.state)}</div>

                <div className="loading-spinner" ref="loading">
                    <ReactLoading type={"spin"} color={"#777"} height={100} width={100} />
                </div>
                <div ref="vizcontainer" style={{display: 'hidden'}} className="map"></div>
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

        console.log("process.env", process.env)

        var w = 900;
        var h = 800;
        var bottomMargin = 90;// for legend
        var rightMargin = 50;

        container.selectAll("svg").remove();
        var svg = container.append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet").style("background-color","#ffffff")
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
                    function getMunicipalityCode(properties) {
                        return properties.code || properties.smunicipal.split(" - ")[0].replace(/\s/g, "");
                    }
                    var muniCode = getMunicipalityCode(d.properties);
                    partyName = locationToMainParty[muniCode];
                } else {// "municipality"
                    function getMunicipalityiecId(properties) {
                        return properties.PKLVDNUMBE;
                    }
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
                .attr('transform', (d, i) => "translate(" + getLegendXY(i) + ")")
            legends
                .append("rect")
                .attr("class", className("legend"))
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
            
            // if (self.state.regionType == "province") {
            //    console.log("fetch muni Names and codes", JSON.stringify(jsonDataFeatures.map(d => {
            //         function getMunicipalityCode(properties) {
            //             return properties.code || properties.smunicipal.split("-")[0].replace(/\s/g, "");
            //         }
            //         var newState = {
            //             provinceName: self.state.provinceName,
            //             muniName: d.properties.smunicipal,
            //             muniCode: getMunicipalityCode(d.properties),
            //         }
            //         return newState;
            //     })));
            // }
            
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
                    .text(function(d) { 
                        if (self.state.regionType === "national") {
                            return d.properties.SPROVINCE;
                        } else if (self.state.regionType === "province") {
                            return d.properties.smunicipal.split(" - ")[1].split("[")[0]; 
                        } else {//municipality
                            return d.properties.SMUNICIPAL.split(" - ")[1].split("[")[0]; 
                        }
                    })
            }

            if (self.state.regionType !== "municipality") {
                var labelElements = document.getElementsByClassName("place-label");

                var regions = {};
                var overlapCnt = {};
                var i;

                for (i = 0; i < jsonDataFeatures.length; i ++) {
                    regions[i] = labelElements[i].getBoundingClientRect();
                }
    
                for (i = 0; i < jsonDataFeatures.length; i ++) {
                    for (var j = 0; j < i; j ++) {
                        var rect1 = regions[i];
                        var rect2 = regions[j];
                        var overlap = !(rect1.right < rect2.left || 
                            rect1.left > rect2.right || 
                            rect1.bottom < rect2.top || 
                            rect1.top > rect2.bottom);
                        if (overlap) {
                            overlapCnt[i] = overlapCnt[i]? (overlapCnt[i] + 1): 1;
                        }
                    }
                    if (overlapCnt[i] > 2) {
                        labelElements[i].setAttribute("opacity", 0)
                    } else if (overlapCnt[i] > 0){
                        labelElements[i].innerHTML = labelElements[i].innerHTML.slice(0, 3) + "...";
                    } else {
    
                    }
                }
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
                    function regionName() {
                        if (self.state.regionType === "national") {
                            return d.properties.SPROVINCE;
                        } else if (self.state.regionType === "province") {
                            return d.properties.smunicipal.split(" - ")[1].split("[")[0]; 
                        } else {//municipality
                            return d.properties.SMUNICIPAL.split(" - ")[1].split("[")[0]; 
                        }
                    }
                    tooltipDiv.html(regionName() + " : " + getMainPartyName(d, i))	
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
                        event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);
                        self.setState(newState);
                    } else if (regionType === "province") {
                        function getMunicipalityCode(properties) {
                            return properties.code || properties.smunicipal.split(" - ")[0].replace(/\s/g, "");
                        }
                        newState = {
                            regionType: "municipality", 
                            provinceName: self.state.provinceName,
                            muniName: d.properties.smunicipal,
                            muniCode: getMunicipalityCode(d.properties),
                        }
                        event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);

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
                        var event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);
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
                        }
    
                        event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);
                        self.setState(newState);
                    });
            }
            self.getLoadingSpinner()
                .style("display", "none");
        })

        var redrawChart = function() {

        };

        window.addEventListener("resize", redrawChart, 200);
    }
}

export default Map;
