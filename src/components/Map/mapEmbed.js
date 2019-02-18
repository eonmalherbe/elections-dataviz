import React, { Component } from 'react';
import bootstrapStyles from 'bootstrap/dist/css/bootstrap.min.css';
import styles from './mapEmbed.css'

function className(originClassName) {
    return bootstrapStyles[originClassName] || styles[originClassName] || originClassName;
}

class MapEmbed extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            elementId: 'root',
            eventType: 'National',
            locationName: 'Western Cape',
            numParties: 5
        }
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }
      
    render () {
        return (
          <div>
            <h3> Embed Script Generation </h3>
            <div className={className("form-group")}>
                <label>Embed Code</label>
                <div className={className("embedcode")}>
                    <span>{`<script src="DOMAIN/embed/embed.js"></script><script>showMap(document.getElementById('${elementId}'));</script>`}</span>
                </div>
            </div>
          </div>
        )
    }
}

export default MapEmbed;


