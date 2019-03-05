import React, { Component } from "react";
import MetisMenu from 'react-metismenu';

import config from '../../config'
import styles from "./navbar.css";
import events from "../../events";
import {
    getProvincesData,
    getMetrosData
} from "../../api";

function className(originName) {
  return styles[originName] || originName;
}

var provincesData = getProvincesData();
var metrosData = getMetrosData();


class CustomLink extends React.Component {
    constructor() {
      super();
  
      this.onClick = this.onClick.bind(this);
    }
  
    onClick(e) {
      console.log("onClick item", e, this.props.hasSubMenu);
      if (this.props.hasSubMenu) this.props.toggleSubMenu(e);
      else {
        this.props.activateMe({
          newLocation: this.props.to,
          selectedMenuLabel: this.props.label,
        });
      }
    }
  
    render() {
      return (
        <div className="metismenu-link" onClick={this.onClick}>
          {this.props.children}
        </div>
      );
    }
  };

class NavBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            eventDescription: "2014 National Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            activeLinkId: ''
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
        this.handleNavBarSelection = this.handleNavBarSelection.bind(this);
    }

    componentDidMount() {
        if(!document.getElementById('navbarcss')) {
            var link = document.createElement('link');
            link.id = 'navbarcss';
            link.rel = 'stylesheet';
            link.href = config.DOMAIN + '/navbar.css';
            document.head.appendChild(link);
        }

        if(!document.getElementById('font-awesome')) {
            var link = document.createElement('link');
            link.id = 'font-awesome';
            link.rel = 'stylesheet';
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
            document.head.appendChild(link);
        }

        this.refs.navbar.addEventListener("click", this.handleNavBarSelection);
    }

    componentWillUnmount() {
        this.refs.navbar.removeEventListener("click", this.handleNavBarSelection);
    }

    componentDidUpdate() {
    }

    handleNavBarSelection(e) {
        var iconClass = e.target.childNodes[0].className;
        var classList = iconClass.split(' ');
        var lastClass = classList[classList.length - 1];
        var passInfo = lastClass.split('-');

        var regionType, selectionData = {};
        var activeLinkId = '';

        if (passInfo[1] == '1') {
            regionType = "national";
            activeLinkId = '1';
        } else if (passInfo[1] == '2') {
            regionType = "province";
            selectionData = provincesData[passInfo[2]];
        } else if (passInfo[1] == '3') { // muni level
            regionType = "municipality";
            selectionData = provincesData[passInfo[2]].munis[passInfo[3]];
            activeLinkId = `3-${passInfo[2]}-${passInfo[3]}`;
        } else if (passInfo[1] == '4') { // metros
            regionType = "municipality"
            selectionData = metrosData[passInfo[2]];
            activeLinkId = `4-${passInfo[2]}`;
        } else {
            return;
        }
        
        e.preventDefault();
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

        var event = new CustomEvent(events.MAP_PREVIEW, { detail: newState });
        document.dispatchEvent(event);
        newState.activeLinkId = activeLinkId;
        console.log("activeLinkId", activeLinkId);
        this.setState(newState);
    }
      
    render () {
        const theme = {
            selectionColor: "#C51162"
        };
        var content = [
            {
                icon: '1',
                label: 'National',
                to: '1',
            },
            {
                icon: '',
                label: 'Provinces',
                content: provincesData.map((province, i) => {
                    return {
                        icon: `2-${i}`,
                        label: province.name,
                        content: province.munis.map((muni, j) => {
                            return {
                                icon: `3-${i}-${j}`,
                                label: muni.muniName.split("-")[1].split("[")[0],
                                to: `2-${i}`,
                            }
                        })
                    }
                })
            },
            {
                icon: '',
                label: 'Metros',
                content: metrosData.map((metro, i) => {
                    return {
                        icon: `4-${i}`,
                        label: metro.muniName.split("-")[1].split("[")[0],
                        to: `4-${i}`,
                    }
                })
            }
        ]
        
        return (
            <div className={className("menu-widget")} ref="navbar">
                <MetisMenu activeLinkId={this.state.activeLinkId} content={content} LinkComponent={CustomLink}/>
            </div>
        )
    }
}

export default NavBar;
