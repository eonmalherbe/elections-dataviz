import React, { Component } from "react";
import MetisMenu from 'react-metismenu';

import config from '../../config'
import styles from "./navbar.css";
import events from "../../events";
import {
    getProvincesData,
    getMetrosData
} from "../../api";

import {
    triggerCustomEvent,
    fetchDataFromOBJ
} from "../../utils";

function className(originName) {
  return styles[originName] || originName;
}

function cssPrefix(originName) {
    return config.CSS_PREFIX+originName;
}

var provincesData = getProvincesData();
var metrosData = getMetrosData();

class CustomLink extends React.Component {
    constructor() {
      super();
  
      this.onClick = this.onClick.bind(this);
    }
  
    onClick(e) {
      if (this.props.hasSubMenu) this.props.toggleSubMenu(e);
      else {
        this.props.activateMe({
          newLocation: this.props.to,
          selectedMenuLabel: this.props.label,
        });
      }
    }
  
    render() {
      if (this.props.hasSubMenu) {
        return (
          <div className="metismenu-link" onClick={this.onClick}>
            {this.props.children}
          </div>
      )} else {
        return (
          <div className="metismenu-link metismenu-end" onClick={this.onClick}>
            {this.props.children}
          </div>
        );
      }
    }
  };

class NavBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            eventDescription: "2019 National Election",
            nationalEventDescription: "2019 National Election",
            provincialEventDescription: "2019 Provincial Election",
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            iecId: "",
            comp: "Race for Votes",
            activeLinkId: ''
        }

        fetchDataFromOBJ(this.state, props);

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
        if (e.target.className.indexOf("metismenu-link") == -1) {
            return;
        }
        if (this.activeElement && this.activeElement.classList && this.activeElement.classList.remove) {
            this.activeElement.classList.remove("active");
        }
        e.target.classList.add("active");
        this.activeElement = e.target;

        var iconClass = e.target.childNodes[0].className;
        var classList = iconClass.split(' ');
        var lastClass = classList[classList.length - 1];
        console.log("handleNavBarSelection", lastClass);
        var passInfo = lastClass.split('-');
        var enableMap = true;
        var enableTurnoutProgressSpoilt = true;

        var eventDescription, electionType, regionType, selectionData = {}, chartType = "";
        var activeLinkId = passInfo.slice(1, passInfo.length).join('-');

        console.log("activeLinkId", activeLinkId);

        if (passInfo[1] == '1') {
            eventDescription = this.state.nationalEventDescription;
            regionType = "national";
            if (passInfo[2] == '1') {
                switch (passInfo[3]) {
                    case '1':
                        chartType = "votes-default";
                        break;
                    case '2':
                        chartType = "votes-comparisons";
                        enableMap = false;
                        break;
                    case '3':
                        chartType = "votes-predictions";
                        enableMap = false;
                        enableTurnoutProgressSpoilt = false;
                        // if (passInfo[4] > 0) {
                        //     regionType = "province";
                        //     selectionData = provincesData[passInfo[4]-1];
                        // }
                        break;
                    case '4':
                        chartType = "votes-progress";
                        break;
                    case '5':
                        chartType = "votes-turnout";
                        break;
                    case '6':
                        chartType = "votes-myvd";
                        break;
                    default:
                        return;
                }
            } else if (passInfo[2] == '2') {
                switch (passInfo[3]) {
                    case '1':
                        chartType = "seats-default";
                        enableMap = false;
                        break;
                    case '2':
                        chartType = "seats-comparisons";
                        enableMap = false;
                        break;
                    case '3':
                        chartType = "seats-electeds";
                        break;
                    case '4':
                        chartType = "seats-women";
                        break;
                    case '5':
                        chartType = "seats-age";
                        break;
                    default:
                        return;
                }
            } else if (passInfo[3] == '4') {
                // Main page for National Assembly
                chartType = "votes-default";
            } else {
                return;
            }
        } else if (passInfo[1] == '2') {
            eventDescription = this.state.provincialEventDescription;
            regionType = "province";
            selectionData = provincesData[passInfo[2]];
            if (passInfo[3] == '1') {
                switch (passInfo[4]) {
                    case '1':
                        chartType = "votes-default"; // done
                        break;
                    case '2':
                        chartType = "votes-comparisons";
                        enableMap = false;
                        break;
                    case '3':
                        chartType = "votes-progress"; // done
                        break;
                    case '4':
                        chartType = "votes-turnout";// done
                        break;
                    case '5':
                        chartType = "votes-split";
                        break;
                    case '6':
                        chartType = "votes-predictions";
                        enableMap = false;
                        enableTurnoutProgressSpoilt = false;
                        break;
                    default:
                        return;
                }
            } else if (passInfo[3] == '2') {
                switch (passInfo[4]) {
                    case '1':
                        chartType = "seats-default"; // done
                        enableMap = false;
                        break;
                    case '2':
                        chartType = "seats-comparisons";
                        enableMap = false;
                        break;
                    case '3':
                        chartType = "seats-electeds";
                        break;
                    case '4':
                        chartType = "seats-women";
                        break;
                    case '5':
                        chartType = "seats-age";
                        break;
                    default:
                        return;
                }

            } else if (passInfo[3] == '4') {
                // Main page for National Legislature
                regionType = "national";
                chartType = "votes-default";
            } else {
                return;
            }
        } else if (passInfo[1] == '3') { // metros
            eventDescription = this.state.nationalEventDescription;
            regionType = "municipality"
            selectionData = metrosData[passInfo[2]];
            chartType = "votes-default-metro";
        } else {
            return;
        }

        if (!chartType)
            return;

        if (eventDescription)
            if (eventDescription.toLowerCase().indexOf("provincial") >= 0) {
                electionType = "provincial"
            }
        else {
            electionType = "national"
        }

        e.preventDefault();
        var newState;
        if (regionType == "national") {
            newState = {
                regionType: regionType
            };
            // if (this.state.regionType == newState.regionType 
            //     && this.state.comp == chartType)
            //     return;
        } else if (regionType == "province") {
            newState = {
                regionType: regionType,
                provinceName: selectionData.name
            };
            // if (this.state.regionType == newState.regionType 
            //     && this.state.provinceName == newState.provinceName 
            //     && this.state.comp == chartType)
            //     return;
        } else if (regionType == "municipality") {
            newState = {
                regionType: regionType,
                provinceName: selectionData.provinceName,
                muniName: selectionData.muniName,
                muniCode: selectionData.muniCode,
            }; 
            // if (this.state.regionType == newState.regionType 
            //     && this.state.provinceName == newState.provinceName
            //     && this.state.muniName == newState.muniName
            //     && this.state.comp == chartType)
            //     return;
        }
        newState.eventDescription = eventDescription;
        newState.electionType = electionType
        newState.comp = chartType;
        newState.enableMap = enableMap;
        newState.enableTurnoutProgressSpoilt = enableTurnoutProgressSpoilt;

        console.log("newState", newState);

        if (newState.comp == "votes-myvd") {
            newState.regionType = "municipality-vd";
            newState.iecId = "";
        }

        if (newState.comp == "seats-electeds" || newState.comp == "seats-women" || newState.comp == "seats-age") {
            triggerCustomEvent(events.SEATS_ELECTEDS_EVENT, newState);
            return;
        }

        triggerCustomEvent(events.QUICK_RESULTS_PREVIEW, newState);
        // triggerCustomEvent(events.REGION_CHANGE, newState);
        // triggerCustomEvent(events.MAP_PREVIEW, newState);

        newState.activeLinkId = activeLinkId;
        console.log("newState", newState);
        this.setState(newState);
    }
      
    render () {
        var content = [
            {
                label: 'National Assembly',
                icon: `1-3-4-1`,
                content: [
                    {
                        label: "Race for votes",
                        content: [
                            {
                                id: `1-1-1`,
                                icon: `1-1-1`,
                                label: `National assembly`,
                                to: `1-1-1`,
                            },
                            {
                                id: `1-1-2`,
                                icon: `1-1-2`,
                                label: `Comparisons`,
                                to: `1-1-2`,
                            },
                            {
                                icon: `1-1-3`,
                                label: `CSIR predictions`,
                                to: `1-1-3`,
                                // content: [
                                //     {
                                //         icon: `1-1-3-0`,
                                //         label: `National Assembly`,
                                //         to: `1-1-3-0`,
                                //     },
                                //     ...provincesData.map((province, i) => {
                                //         return {
                                //             icon: `1-1-3-${i+1}`,
                                //             label: province.name,
                                //             to: `1-1-3-${i+1}`,
                                //         }
                                //     })
                                // ]
                            },
                            {
                                icon: `1-1-4`,
                                label: `Counting progress`,
                                to: `1-1-4`,
                            },
                            {
                                icon: `1-1-5`,
                                label: `Turnout`,
                                to: `1-1-5`,
                            },
                            {
                                icon: `1-1-6`,
                                label: `My voting District`,
                                to: `1-1-6`,
                            },
                            {
                                label: `Metros`,
                                icon: `3-2`, // Setting default metros view to JHB
                                content: metrosData.map((metro, i) => {
                                    return {
                                        icon: `3-${i}`,
                                        label: metro.muniName.split("-")[1].split("[")[0],
                                        to: `3-${i}`,
                                    }
                                })
                            },
                        ]
                    },
                    {
                        label: "Race for seats",
                        content: [
                            {
                                icon: `1-2-1`,
                                label: `National assembly`,
                                to: `1-2-1`
                            },
                            {
                                icon: `1-2-2`,
                                label: `Comparisons`,
                                to: `1-2-2`,
                            },
                            // {
                            //     icon: `1-2-3`,
                            //     label: `Electeds`,
                            //     to: `1-2-3`,
                            // },
                            // {
                            //     icon: `1-2-4`,
                            //     label: `Women`,
                            //     to: `1-2-4`,
                            // },
                            // {
                            //     icon: `1-2-5`,
                            //     label: `Age`,
                            //     to: `1-2-5`,
                            // }
                        ]
                    }
                ]
            },
            {
                label: 'Provincial Legislature',
                icon: `2-3-4-1`,
                content: provincesData.map((province, i) => {
                    return {
                        label: province.name,
                        content: [
                            {
                                label: "Race for votes",
                                content: [
                                    {
                                        icon: `2-${i}-1-1`,
                                        label: `Provincial legislature`,
                                        to: `2-${i}-1-1`,
                                    },
                                    {
                                        icon: `2-${i}-1-2`,
                                        label: `Comparisons`,
                                        to: `2-${i}-1-2`,
                                    },
                                    {
                                        icon: `2-${i}-1-3`,
                                        label: `Counting progress`,
                                        to: `2-${i}-1-3`,
                                    },
                                    {
                                        icon: `2-${i}-1-4`,
                                        label: `Turnout`,
                                        to: `2-${i}-1-4`,
                                    },
                                    {
                                        icon: `2-${i}-1-5`,
                                        label: `Split (Nat/Prov)`,
                                        to: `2-${i}-1-5`,
                                    },
                                    {
                                        icon: `2-${i}-1-6`,
                                        label: `CSIR Predictions`,
                                        to: `2-${i}-1-6`,
                                    },
                                ]
                            },
                            {
                                label: "Race for seats",
                                content: [
                                    {
                                        icon: `2-${i}-2-1`,
                                        label: `Provincial legislature`,
                                        to: `2-${i}-2-1`,
                                    },
                                    {
                                        icon: `2-${i}-2-2`,
                                        label: `Comparisons`,
                                        to: `2-${i}-2-2`,
                                    },
                                    // {
                                    //     icon: `2-${i}-2-3`,
                                    //     label: `Electeds`,
                                    //     to: `2-${i}-2-3`,
                                    // },
                                    // {
                                    //     icon: `2-${i}-2-4`,
                                    //     label: `Women`,
                                    //     to: `2-${i}-2-4`,
                                    // },
                                    // {
                                    //     icon: `2-${i}-2-5`,
                                    //     label: `Age`,
                                    //     to: `2-${i}-2-5`,
                                    // }
                                ]
                            }
                        ]
                    }
                })
            },
            // {
            //     icon: '',
            //     label: 'Metros',
                // content: metrosData.map((metro, i) => {
                //     return {
                //         icon: `4-${i}`,
                //         label: metro.muniName.split("-")[1].split("[")[0],
                //         to: `4-${i}`,
                //         // content: toShowCharts.map((toshowchart, chartIdx) => {
                //         //     return {
                //         //         icon: `4-${i}-${chartIdx}`,
                //         //         label: toshowchart,
                //         //         to: `4-${i}-${chartIdx}`,
                //         //     }
                //         // })
                //     }
                // })
            // }
        ];
        // this.state.activeLinkId
        
        return (
            <div className={[className(cssPrefix("menu-widget")), cssPrefix("menu-widget")].join(" ")} ref="navbar">
                <MetisMenu activeLinkTo={`1-2-1`} content={content} LinkComponent={CustomLink}/>
            </div>
        )
    }
}

export default NavBar;
