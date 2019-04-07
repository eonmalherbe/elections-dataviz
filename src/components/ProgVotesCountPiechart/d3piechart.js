import * as d3 from "../../d3";
import {createTooltip} from "../../utils";

export function Chart(container, width, height, className, options) {
    var data = [],
        width = 700,
        height = 300,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        variable = options.variable,
        category = options.category,
        padAngle = 0.015,
        transTime = 750,
        floatFormat = d3.format('.4r'),
        cornerRadius = 3,
        colorsData = null;


        

    function colour(key) {
        // console.log("colorsData", colorsData);
        if (colorsData && colorsData[key]) {
            return colorsData[key];
        }
        return 'rgb(' + Math.random()*250 + ',' + Math.random()*250 + ',' + Math.random()*250 + ')';
    }

    container.selectAll("svg").remove();

    var radius = Math.min(width, height) / 2;

    var pie = d3.pie()
        .value(function(d) { return floatFormat(d[variable]); })
        .sort(null);

    var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.6)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

    var totalSvg = container.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .classed("svg-content", true);
    
    var svg = totalSvg
        .append('g')
        .attr('transform', 'translate(' + height / 2 + ',' + height / 2 + ')');
    
    var labelSvg = totalSvg
        .append('g')
        .attr('transform', 'translate(' + height * 6 / 5 + ',' + height / 2 + ')');

    svg.append('g').attr('class', 'slices');
    svg.append('g').attr('class', 'lines');

    var path = svg.select('.slices')
        .selectAll('path')
        .data(pie(data))
        .enter().append('path')
        .attr('fill', function(d) { return colour(d.data[category]); })
        .attr('d', arc);

    var errorText = svg.append("g")
        .append("text")
        .attr("text-anchor", "middle");
      
    this.destroy = function() {
        container.selectAll("svg").remove();
    }
    this.draw = function(value, colorsDataP) {
        if (!value) {
            errorText.text("chart data is not available");
            return;
        } else {
            errorText.text("");
        }

        if (options.chartType === 'Progress on Votes Count') {
            colorsData = colorsDataP;
        } else {
            var partyColorByName = {};

            var partyColorsData = colorsDataP;
            if (partyColorsData && partyColorsData["data"]["allParties"]["edges"]) {
                partyColorsData["data"]["allParties"]["edges"].forEach(edge => {
                    partyColorByName[edge.node.abbreviation] = edge.node.colour;
                })
            }
            colorsData = partyColorByName;
        }
        
        data = value;

        if (options.chartType === 'Progress on Votes Count') {
            labelSvg.append('text')
                .attr('x', 0)
                .attr('y', -15)
                .style('font-size', '.7em')
                .style('text-anchor', 'middle')
                .text('Completed' + ': ' + data[0]["percent"] + '%');
            labelSvg.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .text('Captured Votes' + ': ' + data[0]["count"])
                .style('font-size', '.7em')
                .style('text-anchor', 'middle');
            labelSvg.append('text')
                .attr('x', 0)
                .attr('y', 15)
                .text('Total' + ': ' + data[0]["totalCount"])
                .style('font-size', '.7em')
                .style('text-anchor', 'middle');
        }

        var updatePath = d3.select('.slices').selectAll('path');

        var data0 = path.data(),
            data1 = pie(data);

        updatePath = updatePath.data(data1, key);

        updatePath.enter().append('path')
            .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
            .attr('fill', function(d) {  return colour(d.data[category]); })
            .attr('d', arc);

        updatePath.exit()
            .transition()
            .duration(transTime)
            .attrTween("d", arcTween)
            .remove();

        updatePath.transition().duration(transTime)
            .attrTween('d', arcTween);

        d3.selectAll('.labelName text, .slices path').call(toolTip);

    };

    function toolTip(selection) {

        selection.on('mouseenter', function (data) {

            // console.log("mouseenter", data);

            svg.append('text')
                .attr('class', 'toolCircle')
                .attr('dy', -15)
                .html(toolTipHTML(data))
                .style('font-size', '.7em')
                .style('text-anchor', 'middle');

            svg.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', radius * 0.55)
                .style('fill', colour(data.data[category]))
                .style('fill-opacity', 0.35);

        });

        selection.on('mouseout', function () {
            d3.selectAll('.toolCircle').remove();
        });
    }

    function toolTipHTML(data) {

        if (options.chartType === 'Progress on Votes Count') {
            var tip = '';
            tip += '<tspan x="0">' + 'Progress' + ': ' + data.data["percent"] + '%' + '</tspan>';
            tip += '<tspan x="0" dy="1.2em">' + 'Captured Votes' + ': ' + data.data["count"] + '</tspan>';
            tip += '<tspan x="0" dy="1.2em">' + 'Total' + ': ' + data.data["totalCount"] + '</tspan>';
        } else { //'Race for Seats Donut chart'
            var tip = '';
            tip += '<tspan x="0">' + 'Seats' + ': ' + data.data["seats"] + '</tspan>';
            tip += '<tspan x="0" dy="1.2em">' + 'Party' + ': ' + data.data["name"] + '</tspan>';
        }
        return tip;
    }

    function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return function(t) { return arc(i(t)); };
    }

    function findNeighborArc(i, data0, data1, key) {
        var d;
        return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
            : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
                : null;
    }

    function findPreceding(i, data0, data1, key) {
        var m = data0.length;
        while (--i >= 0) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }

    function key(d) {
        return d.data[category];
    }

    function findFollowing(i, data0, data1, key) {
        var n = data1.length, m = data0.length;
        while (++i < n) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }
}
