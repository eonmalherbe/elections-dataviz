import React, { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { SideNav, Nav } from "react-sidenav";
import MetisMenu from 'react-metismenu';
import { slide as Menu } from 'react-burger-menu'


import config from "../../config";
import styles from "./navbar.css";
import events from "../../events";
import {
    getMainParties,
    getPartyColors,
    getProvincesData
} from "../../api";
import {
  parseMainPartyData,
  getRegionName,
  createTooltip
} from "../../utils";

function className(originName) {
  return styles[originName] || originName;
}

var provincesData = getProvincesData();

class NavBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
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
        this.handleNavBarSelection = this.handleNavBarSelection.bind(this);
    }

    componentDidMount() {
        this.refs.navbar.addEventListener("click", this.handleNavBarSelection);
    }

    componentWillUnmount() {
        this.refs.navbar.removeEventListener("click", this.handleNavBarSelection);
    }

    componentDidUpdate() {
    }

    handleNavBarSelection(e) {
        console.log("event.target", e.target);
        // var newState;
        // if (regionType == "national") {
        //     newState = {regionType: regionType};
        //     if (this.state.regionType == newState.regionType)
        //         return;
        // } else if (regionType == "province") {
        //     newState = {
        //         regionType: regionType,
        //         provinceName: selectionData.name
        //     };
        //     if (this.state.regionType == newState.regionType && this.state.provinceName == newState.provinceName)
        //         return;
        // } else if (regionType == "municipality") {
        //     newState = {
        //         regionType: regionType,
        //         provinceName: selectionData.provinceName,
        //         muniName: selectionData.muniName,
        //         muniCode: selectionData.muniCode,
        //     }; 
        //     if (this.state.regionType == newState.regionType 
        //         && this.state.provinceName == newState.provinceName
        //         && this.state.newState == newState.muniName)
        //         return;
        // }

        // var event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
        // document.dispatchEvent(event);
        // this.setState(newState);
    }

    handleNavBarSelection1(regionType, selectionData) {
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
      
    render () {
        const theme = {
            selectionColor: "#C51162"
        };
        var content = [
            {
                icon: 'icon-class-name',
                label: 'National',
                to: 'national',
            },
            {
                icon: 'icon-class-name',
                label: 'Provinces',
                to: '##',
                content: provincesData.map(province => {
                    return {
                        icon: 'icon-class-name',
                        label: province.name,
                        to: 'province#'+JSON.stringify({
                            name: province.name,
                            abbreviation: province.abbreviation,
                        }),
                        content: province.munis.map(muni => {
                            return {
                                icon: 'icon-class-name',
                                label: muni.muniName.split("-")[1].split("[")[0],
                                to: 'municipality#'+JSON.stringify(muni),
                            }
                        })
                    }
                })
            },
            {
                icon: 'icon-class-name',
                label: 'Metros',
                to: 'metros',
            }
        ]

        return (
            <div className="menu-widget" ref="navbar">
                <MetisMenu content={content}/>
                {/* <div className={className("menu-navbar")}>
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
                </div>  */}
            </div>
        )
    }
}

export default NavBar;
