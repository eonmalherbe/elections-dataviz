import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import polylabel from 'polylabel';
import styles from './map.css';
import events from '../../events';

function className(originName) {
  return styles[originName] || originName;
}

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
          regionType: "national",
          regionName: "SA",
          parentProvinceName: ""
        }

        if (props.regionType) {
            this.state.regionType = props.regionType;
        }
        if (props.regionName) {
            this.state.regionName = props.regionName;
        }
    }



    drawGraph(container, props) {
        console.log("drawGraph", "new", this);
        var self = this;
        var nationalMapFile = "province_lo-res.geojson";

        function getRegionFileName() {
            function getProvinceFileName(regionName) {
                console.log("getProvinceFileName", regionName);
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
                return provinceNameToFileMap[regionName];
            }
            switch(self.state.regionType) {
                case "national":
                    return nationalMapFile;
                case "province":
                    return getProvinceFileName(self.state.regionName);
                case "municipality":
                    return self.state.regionName + ".topojson";
            }
        }

        // var geoJSONFileNames = [
        //     "province_hires.geojson", // high resolution national { "SPROVINCE": "Mpumalanga", "PKLVDNUMBE": 54100011.0 }
        //     "province_lo-res.geojson",// low resolution national {"SPROVINCE":"Limpopo","PKLVDNUMBE":54520017}
        //     "ec_lo-res.geojson",
        //     "fs_lo-res.geojson",
        //     "gt_lo-res.geojson",
        //     "kzn_lo-res.geojson",
        //     "lim_lo-res.geojson",
        //     "mp_lo-res.geojson",
        //     "nc_lo-res.geojson",
        //     "nw_lo-res.geojson", //low resolution northwest {"smunicipal":"NW372 - Madibeng [Brits]"}
        //     "wc_lo-res.geojson",
        //     // BUF.topojson
        //     // CPT.topojson
        //     // EC101.topojson ... EC444.topojson
        //     // EKU.topojson
        //     // ETH.topojson
        //     // FS161.topojson ... FS205.topojson
        //     // GT421.topojson ... GT484.topojson
        //     // JHB.topojson
        //     // KZN211.topojson ... KZN435.topojson
        //     // LIM331.topojson ... LIM475.topojson
        //     // MAN.topojson
        //     // MP301.topojson ... MP325.topojson
        //     // NC061.topojson ... NC453.topojson
        //     // NMA.topojson
        //     // NW371.topojson ... NW404.topojson
        //     // TSH.topojson
        //     // WC011.topojson ... WC053.topojson
        // ];
        var fullRouteGeoJsonFile = "/mapdata/" + getRegionFileName();

        var tooltipDiv;
        if (document.getElementsByClassName('tooltip')[0]) {
          tooltipDiv = d3.select(".tooltip");
        } else {
          tooltipDiv = d3.select("body").append("div")	
            .attr("class", className("tooltip"))				
            .style("opacity", 0);
        }

        if (JSON.stringify(process.env).indexOf("docz") != -1) {
            fullRouteGeoJsonFile = "/public" + fullRouteGeoJsonFile;
        }

        console.log("fullRouteGeoJsonFile", fullRouteGeoJsonFile);

        var w = 1400;
        var h = 700;
        container.selectAll("svg").remove();
        var svg = container.append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet").style("background-color","#c9e8fd")
            .attr("viewBox", "0 0 " + w + " " + h)
            .classed("svg-content", true);

        var fo = svg.append('foreignObject')
            .attr('x', w - 100)
            .attr('y', 10)
            .attr('width', 100)
            .attr('height', 30)
            .attr('class', 'map-controls')
        var gobackbutton = fo.append('xhtml:div')
            .append('button')
            .attr('class', 'go-back')
            .html('go back')
            .on("click", function() {
                var regionType = self.state.regionType;
                if (regionType == "province") {
                    self.setState({regionType: "national", regionName: "SA"});
                } else if (regionType == "municipality") {
                    function getProvinceFromMunicipality(municipalityName) {
                        return self.state.parentProvinceName;
                    }
                    self.setState({
                        regionType: "province", 
                        regionName: getProvinceFromMunicipality(self.regionName)
                    });
                }
            });

        var geoJsonLoader = d3.json(fullRouteGeoJsonFile);

        Promise.all([geoJsonLoader]).then(function(values){ 

            console.log("json load Finished");
            var geoJsonData = values[0];

            var getJsonDataFeatures;
            if (fullRouteGeoJsonFile.indexOf(".topojson") != -1) {
                geoJsonData = topojson.feature(geoJsonData, geoJsonData.objects[self.state.regionName]);
            }

            getJsonDataFeatures = geoJsonData.features;

            console.log("getJsonDataFeatures", getJsonDataFeatures);


            var projection = d3.geoMercator().fitSize([w, h], geoJsonData);
            var path = d3.geoPath().projection(projection);

            // fill region with green
            svg.selectAll(`.${className("region")}`)
                .data(getJsonDataFeatures)
                .enter()
                .append("path")
                .attr("class", className("region"))
                .attr('stroke', "#FFF")
                .attr("fill", "green")
                .attr("id", function(d, i) {
                    return `region-${i}`;
                })
                .attr("d", path);
            
            //show place label
            svg.selectAll(".place-label")
                .data(getJsonDataFeatures)
            .enter().append("text")
                .attr("class", "place-label")
                .attr("font-size", "12px")
                .attr("transform", function(d) { 
                    if (d.geometry.type == "Polygon") {
                        var center = polylabel(d.geometry.coordinates);
                        console.log("center", center);
                        var projectionCenter = projection(center);
                        projectionCenter[1] -= 12;
                        return "translate(" + projectionCenter + ")"; 
                    } else { //d.geometry.type == "MultiPolygon"
                        var center = polylabel(d.geometry.coordinates[0]);
                        var projectionCenter = projection(center);
                        projectionCenter[1] -= 5;
                        //projection(center)
                        return "translate(" + projectionCenter + ")"; 
                    }
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function(d) { 
                    if (self.state.regionType == "national") {
                        return d.properties.SPROVINCE;
                    } else if (self.state.regionType == "province") {
                        return d.properties.smunicipal.split("-")[1].split("[")[0]; 
                    } else {//municipality
                        return d.properties.SMUNICIPAL.split("-")[1].split("[")[0]; 
                    }
                })

            var labelElements = document.getElementsByClassName("place-label");

            var regions = {};
            var overlapCnt = {};
            for (var i = 0; i < getJsonDataFeatures.length; i ++) {
                regions[i] = labelElements[i].getBoundingClientRect();
            }

            for (var i = 0; i < getJsonDataFeatures.length; i ++) {
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
            for (var i = 0; i < getJsonDataFeatures.length; i ++) {
                // labelElements[i].setAttribute("font-size", 12 / overlapCnt[i]);
                
            }
            
            console.log("regions", overlapCnt);


            // placeLabelText.append('tspan')
            //     .attr("x", 0)
            //     .attr("dy", '0em')
            //     .text(function(d) { 
            //         if (self.state.regionType == "national") {
            //             return d.properties.SPROVINCE;
            //         } else if (self.state.regionType == "province") {
            //             return d.properties.smunicipal.split("-")[1].split("[")[0]; 
            //         } else {//municipality
            //             return d.properties.SMUNICIPAL.split("-")[1].split("[")[0]; 
            //         }
            //     });
            // placeLabelText.append('tspan')
            //     .attr("x", 0)
            //     .attr("dy", '1em')
            //     .text(function(d) { 
            //         if (d.properties.SPROVINCE) 
            //             return "";
            //         return "[" + d.properties.smunicipal.split("-")[1].split("[")[1]; 
            //     });
            
				
            //hidden area for catching events
            svg.selectAll(".eventLayer")
                .data(getJsonDataFeatures)
            .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "eventLayer")
                .attr("id", function(d, i) {
                    return `eventLayer-${i}`;
                })
                .attr("fill", "transparent")
                .on('mouseover', function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr('stroke-width', 3)
                        .style('fill-opacity', 0.8);
                })
                .on("mousemove", function(d) {		
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 1);
                    function regionName() {
                        if (self.state.regionType == "national") {
                            return d.properties.SPROVINCE;
                        } else if (self.state.regionType == "province") {
                            return d.properties.smunicipal.split("-")[1].split("[")[0]; 
                        } else {//municipality
                            return d.properties.SMUNICIPAL.split("-")[1].split("[")[0]; 
                        }
                    }
                    tooltipDiv.html(regionName())	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                })
                .on('mouseout', function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr('stroke-width', 1)
                        .style('fill-opacity', 1);
                    
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 0);	
                })
                .on("click", function(d, i) {
                    console.log("click event", i, d.properties);
                    
                    var regionType = self.state.regionType;
                    if (regionType == "national") {
                        var newState = {
                            regionType: "province",
                            regionName: d.properties.SPROVINCE
                        }
                        var event = new CustomEvent(events.REGION_CHANGE, newState);
                        document.dispatchEvent(event);
                        self.setState(newState);
                    } else if (regionType == "province") {
                        function getMunicipalityName(properties) {
                            return properties.smunicipal.split("-")[0].replace(/\s/g, "");
                        }
                        var newState = {
                            regionType: "municipality", 
                            regionName: getMunicipalityName(d.properties),
                            parentProvinceName: self.state.regionName
                        }
                        var event = new CustomEvent(events.REGION_CHANGE, newState);
                        document.dispatchEvent(event);

                        self.setState(newState);
                    } else {
                        function getMunicipalityRegionName(properties) {
                            return properties.SMUNICIPAL.split("-")[0].replace(/\s/g, "");
                        }
                        var newState = {
                            regionType: "municipality-region", 
                            regionName: getMunicipalityRegionName(d.properties),
                        }
                        var event = new CustomEvent(events.REGION_CHANGE, newState);
                        document.dispatchEvent(event);
                    }
                })
            console.log("svg drawing finished");
        })

        var redrawChart = function() {

        };

        window.addEventListener("resize", redrawChart, 200);
    }

    draw(container, props) {
        this.drawGraph(container, props);
    }

    componentDidMount() {
        this.draw(this.getContainer(), this.props)
    }

    componentDidUpdate() {
        this.draw(this.getContainer(), this.props)
    }

    getContainer() {
        return d3.select(this.refs.vizcontainer)
    }
      
    render () {
        return (
            <div>
                <div>{this.state.regionName}</div>
                <div ref="vizcontainer" className="map"></div>
            </div>
        )
    }
}

export default Map;
