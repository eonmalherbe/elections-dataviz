import React, { Component } from 'react';
import {InputGroup, FormControl} from 'react-bootstrap';
import bootstrapStyle from 'bootstrap/dist/css/bootstrap.min.css';
import './BoxEmbed.css'

console.log("bootstrapstyle", bootstrapStyle);

import * as d3 from 'd3'

class BoxEmbed extends Component {
 
    componentDidMount() {
    }

    componentDidUpdate() {
    }
      
    render () {
        return (
          <div>
              <div className="form-group">
                  <label htmlFor="formGroupExampleInput">Event Type </label>
                  <input type="text" className={bootstrapStyle.FormControl}"form-control" placeholder="National"/>
              </div>
              <div>
                  <label>Location Name</label>
                  <input type="text" className="form-control" placeholder="Western Cape" />
              </div>
              <div>
                  <label>Number Of Parties</label>
                  <input type="number" className="form-control" placeholder="5" />
              </div>
              <div>
                  <label>Embed Code</label>
                  <div>
                    <span>{`<script src="./embed.js"></script><script>showBarChart(document.getElementById('root'));</script>`}</span>
                  </div>
              </div>
          </div>
        )
    }
}

export default BoxEmbed;


