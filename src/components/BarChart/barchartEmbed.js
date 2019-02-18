import React, { Component } from 'react';
import bootstrapStyles from 'bootstrap/dist/css/bootstrap.min.css';
import styles from './BarChartEmbed.css'

function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class BarChartEmbed extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            elementId: 'root',
            eventType: 'National',
            regionName: 'Western Cape',
            numParties: 5
        }
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }
      
    render () {
        var {
            elementId,
            eventType,
            regionName,
            numParties
        } = this.state;
        return (
          <div>
            <h3> Embed Script Generation </h3>
            <div className={className("form-group")}>
                <label>Element ID </label>
                <input 
                    type="text" 
                    className={className("form-control")} 
                    placeholder="chart-container"
                    onChange={e => this.setState({elementId: e.target.value})}
                    />
            </div>
              <div className={className("form-group")}>
                  <label>Event Type </label>
                  <input 
                    type="text" 
                    className={className("form-control")} 
                    placeholder="National"
                    onChange={e => this.setState({eventType: e.target.value})}/>
              </div>
              <div className={className("form-group")}>
                  <label>Location Name</label>
                  <input 
                    type="text" 
                    className={className("form-control")} 
                    placeholder="Western Cape"
                    onChange={e => this.setState({regionName: e.target.value})} />
              </div>
              <div className={className("form-group")}>
                  <label>Number Of Parties</label>
                  <input 
                    type="number" 
                    className={className("form-control")} 
                    placeholder="5"
                    onChange={e => this.setState({numParties: e.target.value})} />
              </div>
              <div className={className("form-group")}>
                  <label>Embed Code</label>
                  <div className={className("embedcode")}>
                    <span>{`<script src="DOMAIN/embed/embed.js"></script><script>showBarChart(document.getElementById('${elementId}','${eventType}','${regionName}',${numParties}));</script>`}</span>
                  </div>
              </div>
          </div>
        )
    }
}

export default BarChartEmbed;


