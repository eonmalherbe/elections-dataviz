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
    getTurnoutData,
    getProvincesData
} from "../../api";
import {
  parseTurnoutData,
  getRegionName,
  createTooltip
} from "../../utils";

var regionColor = "#9c9c9c";
var regionBorderColor = "#eeeeee";

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
            <div className={className("map-container")}>
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

                <div className={className("loading-spinner")} ref="loading">
                    <ReactLoading type={"spin"} color={"#777"} height={100} width={100} />
                </div>
                <div ref="vizcontainer" className={className("map")}></div>
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
        var turnoutDataLoader = getTurnoutData(props);
        var dataLoaders = [geoJsonLoader, turnoutDataLoader];

        Promise.all(dataLoaders).then(function(values){ 
            var geoJsonData = values[0];
            var locationToTurnout = parseTurnoutData(values[1], props);      

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
              if (turnout > 65)
                return "#39711D";//getMergedColorWithWhite(100);//"rgb(0,165,138)";
              if (turnout >= 60)
                return "#458923";//getMergedColorWithWhite(90);//"rgb(4,68,95)";
              if (turnout >= 55)
                return "#53B025";//getMergedColorWithWhite(80);//"rgb(4,98,138)";
              if (turnout >= 50)
                return "#4BDC02";//getMergedColorWithWhite(70);//"rgb(4,117,164)";
              if (turnout >= 45)
                return "#7CE547";//getMergedColorWithWhite(60);//"rgb(4,136,191)";
              if (turnout >= 40)
                return "#93E968";//getMergedColorWithWhite(50);//"rgb(0,154,216)";
              if (turnout >= 35)
                return "#A6ED83";//getMergedColorWithWhite(40);//"rgb(77,174,224)";
              if (turnout >= 30)
                return "#C5F3AF";//getMergedColorWithWhite(30);//"rgb(124,194,231)";
              return "#D3F6C3";//regionColor;
            }

            function getTurnout(d, i) {
                var turnout;
                var regionType = self.state.regionType;
                if (regionType === "national") {
                    var provinceName = d.properties.SPROVINCE;
                    turnout = locationToTurnout[provinceName];
                } else if (regionType === "province") {
                    function getMunicipalityCode(properties) {
                        return properties.code || properties.smunicipal.split(" - ")[0].replace(/\s/g, "");
                    }
                    var muniCode = getMunicipalityCode(d.properties);
                    turnout = locationToTurnout[muniCode];
                } else {// "municipality"
                    function getMunicipalityiecId(properties) {
                        return properties.PKLVDNUMBE;
                    }
                    var iecId = getMunicipalityiecId(d.properties);
                    turnout = locationToTurnout[iecId];
                }
                return turnout;
            }
            function getFillColorFromRegion(d, i) {
                var turnout = getTurnout(d, i);
                var fillColor = getFillColorFromTurnout(turnout);
                return fillColor;
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
                .attr("fill", getFillColorFromRegion)
                .attr("id", function(d, i) {
                    return `region-${i}`;
                })
                .attr("d", path);
            
            var turnoutColors = [{
                text: "More than 65%",
                turnout: 66
            },{
                text: "60% - 65%",
                turnout: 60
            },{
                text: "55% - 60%",
                turnout: 55
            },{
                text: "50% - 55%",
                turnout: 50
            },{
                text: "45% - 50%",
                turnout: 45
            },{
                text: "40% - 45%",
                turnout: 40
            },{
                text: "35% - 40%",
                turnout: 35
            },{
                text: "30% - 35%",
                turnout: 30
            },{
                text: "Less than 30%",
                turnout: 15
            }];
            
            function getLegendXY(i) {
                return [(i%5)*170, h + 10 + parseInt(i/5) * 40];
            }
            var legends = svg.selectAll(`.${className("legend")}`)
                .data(turnoutColors)
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
                .attr("fill", (it) => {
                    return getFillColorFromTurnout(it.turnout);
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
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 1);
                    function regionName() {
                        if (self.state.regionType === "national") {
                            return d.properties.SPROVINCE;
                        } else if (self.state.regionType === "province") {
                            return d.properties.smunicipal.split(" - ")[1].split("[")[0]; 
                        } else {//municipality
                            return d.properties.PKLVDNUMBE; 
                        }
                    }
                    tooltipDiv.html(regionName(self.state) + " : " + getTurnout(d, i) + "%")	
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
