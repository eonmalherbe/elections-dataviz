import React, { Component } from 'react';
import * as d3 from 'd3'
import './Box.css';

class Box extends Component {
    draw() {
        d3.select(this.refs.box)
            .append("rect")
            .attr("height", this.props.height)
            .attr("width", this.props.width)
            .classed(this.props.className, true)
            .classed("box", true)
    }

    componentDidMount() {
        this.draw()
    }

    componentDidUpdate() {
        this.draw()
    }
      
    render () {
        return (
          <svg width={this.props.width} height={this.props.height}>
            <g ref="box"></g>
          </svg>
        )
    }
}

export default Box;


