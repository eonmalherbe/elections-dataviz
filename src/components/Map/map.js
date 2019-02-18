import React, { Component } from 'react';
import * as d3 from 'd3';
import styles from './map.css';
import events from '../../events';

function className(originName) {
  return styles[originName] || originName;
}

class Map extends Component {

    drawGraph(container, props) {
        var geoJSONFileNames = [
            "ec_lo-res.geojson",
            "fs_lo-res.geojson",
            "gt_lo-res.geojson",
            "kzn_lo-res.geojson",
            "lim_lo-res.geojson",
            "mp_lo-res.geojson",
            "nc_lo-res.geojson",
            "nw_lo-res.geojson",
            "wc_lo-res.geojson",
            "province_hires.geojson",
            "province_lo-res.geojson",
        ];
        var fullRouteGeoJsonFile = "/mapdata/" + geoJSONFileNames[0];

        if (JSON.stringify(process.env).indexOf("docz") != -1) {
            fullRouteGeoJsonFile = "/public" + fullRouteGeoJsonFile;
        }

        var w = 1400;
        var h = 700;
        var svg = container.append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet").style("background-color","#c9e8fd")
            .attr("viewBox", "0 0 " + w + " " + h)
            .classed("svg-content", true);

        var geoJsonLoader = d3.json(fullRouteGeoJsonFile);

        Promise.all([geoJsonLoader]).then(function(values){ 
            var geoJsonData = values[0];
            var projection = d3.geoMercator().fitSize([w, h], geoJsonData);
            var path = d3.geoPath().projection(projection);

            // fill region with green
            svg.selectAll(`.${className("region")}`)
                .data(geoJsonData.features)
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
                .data(geoJsonData.features)
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
                    return d.properties.smunicipal.split("-")[1].split("[")[0]; 
                });
            placeLabelText.append('tspan')
                .attr("x", 0)
                .attr("dy", '1em')
                .text(function(d) { 
                    return "[" + d.properties.smunicipal.split("-")[1].split("[")[1]; 
                });

            // useful link for wrapping https://bl.ocks.org/mbostock/7555321
            
            //hidden area for catching events
            svg.selectAll(".eventLayer")
                .data(geoJsonData.features)
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
                    console.log("click event", i, d.properties.smunicipal);
                    var event = new CustomEvent(events.REGION_CHANGE, { regionName: d.properties.smunicipal });
                    document.dispatchEvent(event);
                })
        })

        var redrawChart = function() {

        };

        window.addEventListener("resize", redrawChart, 200);
    }

    draw(container, props) {
        var self = this;
        self.drawGraph(container, props);
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
          <div ref="vizcontainer" className="map"></div>
        )
    }
}

export default Map;
