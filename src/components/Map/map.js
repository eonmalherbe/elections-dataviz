import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
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
          regionName: "SA"
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
                    self.setState({regionType: "national"});
                } else if (regionType == "municipality") {
                    function getProvinceFromMunicipality(municipalityName) {
                        return "Western Cape";
                    }
                    self.setState({
                        regionType: "province", 
                        regionName: getProvinceFromMunicipality(self.regionName)
                    });
                }
            });

        var geoJsonLoader = d3.json(fullRouteGeoJsonFile);

        Promise.all([geoJsonLoader]).then(function(values){ 
            var geoJsonData = values[0];
            var projection = d3.geoMercator().fitSize([w, h], geoJsonData);
            var path = d3.geoPath().projection(projection);

            var getJsonDataFeatures;
            if (fullRouteGeoJsonFile.indexOf(".topojson") != -1) {
                getJsonDataFeatures = topojson.feature(geoJsonData, geoJsonData.objects[self.state.regionName]);
            } else {
                getJsonDataFeatures = geoJsonData.features;
            }

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
            var placeLabelText = svg.selectAll(".place-label")
                .data(getJsonDataFeatures)
            .enter().append("text")
                .attr("class", "place-label")
                .attr("font-size", "12px")
                .attr("transform", function(d) { 
                    var coordinates = d.geometry.coordinates[0];
                    var sum = coordinates.reduce(function(a, b) { return [a[0] + b[0], a[1] + b[1]]; });
                    var center = [sum[0] / coordinates.length, sum[1] / coordinates.length];
                    var projectionCenter = projection(center);
                    projectionCenter[1] -= 12;
                    return "translate(" + projection(center) + ")"; 
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")

            placeLabelText.append('tspan')
                .attr("x", 0)
                .attr("dy", '0em')
                .text(function(d) { 
                    if (d.properties.SPROVINCE) 
                        return d.properties.SPROVINCE;
                    return d.properties.smunicipal.split("-")[1].split("[")[0]; 
                });
            placeLabelText.append('tspan')
                .attr("x", 0)
                .attr("dy", '1em')
                .text(function(d) { 
                    if (d.properties.SPROVINCE) 
                        return "";
                    return "[" + d.properties.smunicipal.split("-")[1].split("[")[1]; 
                });

            // useful link for wrapping https://bl.ocks.org/mbostock/7555321
            
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
                .on('mouseout', function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr('stroke-width', 1)
                        .style('fill-opacity', 1);
                })
                .on("click", function(d, i) {
                    console.log("click event", i, d.properties, self);
                    var event = new CustomEvent(events.REGION_CHANGE, { properties: d.properties });
                    document.dispatchEvent(event);
                    var regionType = self.state.regionType;
                    if (regionType == "national") {
                        console.log("setState", d.properties.SPROVINCE);
                        self.setState({regionType: "province", regionName: d.properties.SPROVINCE});
                    } else if (regionType == "province") {
                        console.log("setState", getMunicipalityName(d.properties));
                        function getMunicipalityName(properties) {
                            return properties.smunicipal.split("-")[0].replace(/\s/g, "");
                        }
                        self.setState({
                            regionType: "municipality", 
                            regionName: getMunicipalityName(d.properties)
                        });
                    }
                })
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
