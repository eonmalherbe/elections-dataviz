import * as d3 from "d3";
import config from "../config";

function calcPercent(a, b) {
  if (b == 0) {
    return 0;
  } else {
    return (a/b*100).toFixed(2);
  }
}

export function parseVotesData(data, props) {
    var results, firstEdge;
    var regionType = props.regionType;
    if (regionType == "national") {
      firstEdge = data["data"]["allBallots"].edges[0];
    } else if (regionType == "province") {
      firstEdge = data["data"]["allProvincialBallots"].edges[0];
    } else if (regionType == "municipality") {
      firstEdge= data["data"]["allMunicipalBallots"].edges[0];
    } else { //"municipality-vd"
      firstEdge = data["data"]["allVotingDistrictBallots"].edges[0];
    }
    if (!firstEdge){
      console.error("party data is empty!!");
      return null;
    }

    var nodeData = firstEdge["node"];
    var partyResults = nodeData["partyResults"] || nodeData["topResult"];
    results = partyResults["edges"];
    results = results.sort(function(a, b) {return b.node.percOfVotes - a.node.percOfVotes});

    results = results.slice(0, props.numParties);

    console.log("data", data);
    console.log("results", results)

    return results.map(function(node) {
        var el = node["node"];
        return {
            name: el["party"]["abbreviation"],
            validVotes: el["validVotes"].toFixed(2),
            percOfVotes: el["percOfVotes"].toFixed(2),
            partyInfo: el["party"]
        }
    });
}

export function parseVotesComparisonData(data, props) {
  var results, edges;
  var regionType = props.regionType;
  if (regionType == "national") {
    edges = data["data"]["allBallots"].edges;
  } else if (regionType == "province") {
    edges = data["data"]["allProvincialBallots"].edges;
  } else if (regionType == "municipality") {
    edges= data["data"]["allMunicipalBallots"].edges;
  } else { //"municipality-vd"
    edges = data["data"]["allVotingDistrictBallots"].edges;
  }

  var partyfilter_edges = edges.map(edge => {
    var nodeData = edge["node"];
    var partyResults = nodeData["partyResults"] || nodeData["topResult"];
    results = partyResults["edges"]
      .filter(a => props.partyIecId
        ? (a.node["party"]["iecId"] == props.partyIecId) 
        : (a.node["party"]["abbreviation"] == props.partyAbbr));
    var result = results[0];
    if (result) {
      var el = result["node"];
      return {
          name: nodeData["event"]["description"],
          percOfVotes: el["percOfVotes"].toFixed(2),
          partyInfo: el["party"]
      }
    }
    return {
      name: nodeData["event"]["description"],
      percOfVotes: 0,
      partyInfo: {
        name: props.partyAbbr,
        abbreviation: props.partyAbbr,
      }
    }
  });
  var results = partyfilter_edges.filter(edge => props.eventDescriptions.indexOf(edge.name) != -1).reverse();

  var new_results = [];
  for(var i = 0; i < props.eventDescriptions.length; i ++) {
    var available = false;
    for (var j = 0; j < results.length; j ++) {
      if (results[j].name == props.eventDescriptions[i]) {
        var available = true;
        new_results.push(results[j]);
        break;
      }
    }
    if (!available) {
      new_results.push({
        name: props.eventDescriptions[i],
        percOfVotes: 0,
        partyInfo: {
          name: props.partyAbbr,
          abbreviation: props.partyAbbr,
        } 
      })
    }
  }
  return new_results;
}

export function parseVotesComparisonDataMultipleParties(data, props) {
  return props.partyAbbrs.map((partyAbbr, partyIdx) => {
    var newProps = {...props};
    newProps.partyAbbr = partyAbbr;
    newProps.partyIecId = props.partyIecIds[partyIdx];
    return {
      partyAbbr,
      data: parseVotesComparisonData(data, newProps)
    }
  })
}

export function parseProgressVotesCount(data, props) {
  var firstEdge;
  var regionType = props.regionType;
  if (regionType == "national") {
    firstEdge = data["data"]["allBallots"].edges[0];
  } else if (regionType == "province") {
    firstEdge = data["data"]["allProvincialBallots"].edges[0];
  } else if (regionType == "municipality") {
    firstEdge= data["data"]["allMunicipalBallots"].edges[0];
  } else { //"municipality-vd"
    firstEdge = data["data"]["allVotingDistrictBallots"].edges[0];
  }
  if (!firstEdge){
    console.error("progress votes count data is empty!!");
    return null;
  }

  var nodeData = firstEdge["node"];

  return [
    {
      name: "Completed",
      percent: calcPercent(nodeData["vdWithResultsCaptured"], nodeData["vdCount"]),
      totalCount: nodeData["vdCount"],
      count: nodeData["vdWithResultsCaptured"]
    }, {
      name: "Not Completed",
      percent: 100 - calcPercent(nodeData["vdWithResultsCaptured"], nodeData["vdCount"]),
      totalCount: nodeData["vdCount"],
      count: nodeData["vdCount"] - nodeData["vdWithResultsCaptured"]
    }
  ]
}

// export function parseMainPartyData(data, props) {
//     if (!data)  return null;
//     var locationToMainParty = {};
//     var edges;
//     var regionType = props.regionType;
//     var sort_results = function(party_results) {
//         party_results["edges"] = party_results["edges"].sort(function(a, b) {
//             return b.node.percOfVotes - a.node.percOfVotes;
//         })
//         return party_results;
//     }
//     if (regionType === "national") {
//         edges = data["data"]["allProvincialBallots"].edges;
//         edges.forEach(function(edge) {
//             var node = edge.node;
//             var provinceName = node["location"]["name"];
//             var partyResults = sort_results(node["partyResults"]);
//             var partyName = partyResults["edges"][0]["node"]["party"]["name"];
//             locationToMainParty[provinceName] = partyName;
//         })
//     } else if (regionType === "province") {
//         edges = data["data"]["allMunicipalBallots"].edges;
//         edges.forEach(function(edge) {
//             var node = edge.node;
//             var muniCode = node["location"]["code"];
//             var partyResults = sort_results(node["partyResults"]);

//             var partyName = partyResults["edges"][0]["node"]["party"]["name"];
//             locationToMainParty[muniCode] = partyName;
//         })
//     } else {// "municipality"
//         edges = data["data"]["allVotingDistrictBallots"].edges;
//         edges.forEach(function(edge) {
//             var node = edge.node;
//             var iecId = node["location"]["iecId"];
//             var partyResults = sort_results(node["partyResults"]);

//             var partyName = partyResults["edges"][0]["node"]["party"]["name"];
//             locationToMainParty[iecId] = partyName;
//         })
//     }
//     return locationToMainParty;
// }

function getTopPartyNameFromNode(node) {
  if (node && node["topParty"] && node["topParty"]["party"] && node["topParty"]["party"]["name"])
      return node["topParty"]["party"]["name"];
  return "";
}

export function parseMainPartyData(data, props) {
  if (!data)  return null;
  var locationToMainParty = {};
  var edges;
  var regionType = props.regionType;
  if (regionType === "national") {
      edges = data["data"]["topPartiesByProvince"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var provinceName = node["location"]["name"];
          locationToMainParty[provinceName] = getTopPartyNameFromNode(node);
      })
  } else if (regionType === "province") {
      edges = data["data"]["topPartiesByMunicipality"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var muniCode = node["location"]["code"];
          locationToMainParty[muniCode] = getTopPartyNameFromNode(node);
      })
  } else {// "municipality"
      edges = data["data"]["topPartiesByVotingDistrict"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var iecId = node["location"]["iecId"];
          locationToMainParty[iecId] = getTopPartyNameFromNode(node);
      })
  }
  return locationToMainParty;
}

export function parseSeatsData(data, props) {
  if (!data)  return null;
  var edges = data["data"]["allSeatCalculations"].edges;
  var regionType = props.regionType;
  var results = edges.map(edge => {
    var node = edge.node;
    var seats = 0;
    if (regionType === "national") {
      seats = node["nationalPr"] + node["regional"];
    } else {//"province"
      seats = node["regional"];
    }
    return {
      seats,
      name: node["party"]["abbreviation"],
      partyInfo: node["party"]
    }
  })
  
  // results.sort(function(a,b) {
  //   return b["seats"] - a["seats"];
  // })
  return results.slice(0, props.numParties);
}

export function parseSeatsComparisonData(data, props) {
  if (!data)  return null;
  var edges = data["data"]["allSeatCalculations"].edges;
  var regionType = props.regionType;

  var results = edges.map(edge => {
    var node = edge.node;
    var seats = 0;
    if (regionType === "national") {
      seats = node["nationalPr"] + node["regional"];
    } else {//"province"
      seats = node["regional"];
    }
    return {
      seats,
      name: node["party"]["event"]["description"],
      partyInfo: node["party"]
    }
  }).filter(result => props.eventDescriptions.indexOf(result.name) != -1)
  .filter(result => 
    props.partyIecId
    ? (result.partyInfo["iecId"] == props.partyIecId)
    : (result.partyInfo["abbreviation"] == props.partyAbbr)
  )

  console.log("filter", data, results, props.partyIecId);

  var new_results = [];
  for(var i = 0; i < props.eventDescriptions.length; i ++) {
    var available = false;
    for (var j = 0; j < results.length; j ++) {
      if (results[j].name == props.eventDescriptions[i]) {
        var available = true;
        new_results.push(results[j]);
        break;
      }
    }
    if (!available) {
      new_results.push({
        name: props.eventDescriptions[i],
        seats: 0,
        partyInfo: {
          name: props.partyAbbr,
          abbreviation: props.partyAbbr,
        } 
      })
    }
  }
      // name: nodeData["event"]["description"],
      // percOfVotes: 0,
      // partyInfo: {
      //   name: props.partyAbbr,
      //   abbreviation: props.partyAbbr,
      // }
  // results.sort(function(a,b) {
  //   return b["seats"] - a["seats"];
  // })
  console.log("new_results", new_results);
  return new_results;
}

export function parseSeatsComparisonDataMultipleParties(data, props) {
  console.log("parseSeatsComparisonDataMultipleParties", data, props);
  return props.partyAbbrs.map((partyAbbr, partyIdx) => {
    var newProps = {...props};
    newProps.partyAbbr = partyAbbr;
    newProps.partyIecId = props.partyIecIds[partyIdx];
    console.log("parseSeatsComparisonData", data, newProps);
    return {
      partyAbbr,
      data: parseSeatsComparisonData(data, newProps)
    }
  })
}

export function parseTurnoutData(data, props) {
  if (!data)  return null;
  var locationToTurnout = {};
  var edges;
  var regionType = props.regionType;
  if (regionType === "national") {
      edges = data["data"]["allProvincialBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var provinceName = node["location"]["name"];
          var percVoterTurnout = node["percVoterTurnout"].toFixed(2); 
          locationToTurnout[provinceName] = percVoterTurnout;
      })
  } else if (regionType === "province") {
      edges = data["data"]["allMunicipalBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var muniCode = node["location"]["code"];
          var percVoterTurnout = node["percVoterTurnout"].toFixed(2); 
          locationToTurnout[muniCode] = percVoterTurnout;
      })
  } else {// "municipality" or "municipality-vd"
      edges = data["data"]["allVotingDistrictBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var iecId = node["location"]["iecId"];
          var percVoterTurnout = node["percVoterTurnout"].toFixed(2); 
          locationToTurnout[iecId] = percVoterTurnout;
      })
  }
  return locationToTurnout;
}

export function parseTurnoutDataForAllEvents(data, props) {
  if (!data)  return null;
  var edges;
  var regionType = props.regionType;
  if (regionType == "national") {
    edges = data["data"]["allBallots"].edges;
  } else if (regionType == "province") {
    edges = data["data"]["allProvincialBallots"].edges;
  } else if (regionType == "municipality") {
    edges = data["data"]["allMunicipalBallots"].edges;
  } else if (regionType == "municipality-vd") {
    edges = data["data"]["allVotingDistrictBallots"].edges;
  }
  
  return edges.map(function(edge) {
    var node = edge.node;
    var event = node["event"]["description"];
    var eventType = node["event"]["eventType"]["description"];
    var percVoterTurnout = node["percVoterTurnout"].toFixed(2); 
    return {
      name: event,
      eventType: eventType,
      percVoterTurnout
    }
  }).filter(edge => edge.eventType.toLowerCase().indexOf(props.eventType) != -1)
}

export function parseTurnoutDataForOneEvent(data, props) {
  if (!data)  return null;
  var edges;
  var regionType = props.regionType;
  if (regionType == "national") {
    edges = data["data"]["allBallots"].edges;
  } else if (regionType == "province") {
    edges = data["data"]["allProvincialBallots"].edges;
  } else if (regionType == "municipality") {
    edges = data["data"]["allMunicipalBallots"].edges;
  } else if (regionType == "municipality-vd") {
    edges = data["data"]["allVotingDistrictBallots"].edges;
  }
  
  return edges.map(function(edge) {
    var node = edge.node;
    var event = node["event"]["description"];
    var percVoterTurnout = node["percVoterTurnout"].toFixed(2); 
    return {
      name: event,
      percVoterTurnout
    }
  })
}

export function parseSpoiltVotesData(data, props) {
  var firstEdge;
  var regionType = props.regionType;
  if (regionType == "national") {
    firstEdge = data["data"]["allBallots"].edges[0];
  } else if (regionType == "province") {
    firstEdge = data["data"]["allProvincialBallots"].edges[0];
  } else if (regionType == "municipality") {
    firstEdge= data["data"]["allMunicipalBallots"].edges[0];
  } else { //"municipality-vd"
    firstEdge = data["data"]["allVotingDistrictBallots"].edges[0];
  }
  if (!firstEdge){
    console.error("spoilt data is empty!!");
    return null;
  }

  var nodeData = firstEdge["node"];

  return [
    {
      name: "Valid",
      percent: calcPercent(nodeData["totalValidVotes"], nodeData["totalVotesCast"])
    }, {
      name: "Spoilt",
      percent: calcPercent(nodeData["spoiltVotes"], nodeData["totalVotesCast"])
    }
  ]
}

export function getRegionName(state) {
  function beautifiedMuniName(muniName) {
    if (muniName.indexOf(" - ") != -1) {
        muniName = muniName.split(" - ")[1];
    }
    if (muniName.indexOf("[") != -1) {
        muniName = muniName.split("[")[0];
    }
    return muniName;
  }
  if (state.regionType == "national") {
    return "South Africa";
  }
  if (state.regionType == "province") {
    return state.provinceName;
  }
  if (state.regionType == "municipality") {
    return beautifiedMuniName(state.muniName);
  }
  if (state.regionType == "municipality-vd") {
    return beautifiedMuniName(state.muniName) + "-" + state.iecId;
  }
}

export function getRegionName2(state) {
  if (state.regionType == "national")
    return "National Assembly";
  return getRegionName(state);
}

export function getRegionName3(state) {
  if (state.regionType == "national")
    return "NATIONAL";
  return getRegionName(state);
}



export function getNationOrProvinceName(state) {
  if (state.regionType == "national") {
    return "South Africa";
  }
  return state.provinceName;
}

export function getNationOrProvinceName2(state) {
  if (state.regionType == "national") {
    return "National Assembly";
  }
  return state.provinceName;
}

export function createTooltip(className) {
  var tooltipClassName = className(config.CSS_PREFIX + "tooltip")
  if (document.getElementsByClassName(tooltipClassName)[0]) {
    return d3.select(`.${tooltipClassName}`);
  } else {
    return d3.select("body").append("div")	
      .attr("class", tooltipClassName)				
      .style("opacity", 0);
  }
}



export function fixMapLabelIntersect() {
  var labelElements = document.getElementsByClassName("place-label");
  var regions = {};
  var overlapCnt = {};
  var i;

  for (i = 0; i < labelElements.length; i ++) {
      regions[i] = labelElements[i].getBoundingClientRect();
  }

  for (i = 0; i < labelElements.length; i ++) {
      for (var j = 0; j < i; j ++) {
          var rect1 = regions[i];
          var rect2 = regions[j];
          var overlap = !(rect1.right < rect2.left || 
              rect1.left > rect2.right || 
              rect1.bottom < rect2.top || 
              rect1.top > rect2.bottom);
          if (overlap) {
              overlapCnt[i] = overlapCnt[i]? (overlapCnt[i] + 1): 1;
          }
      }
      if (overlapCnt[i] > 2) {
          labelElements[i].setAttribute("opacity", 0)
      } else if (overlapCnt[i] > 0){
          labelElements[i].innerHTML = labelElements[i].innerHTML.slice(0, 3) + "...";
      } else {

      }
  }
}

export function triggerCustomEvent(eventName, eventParam) {
  var event = new CustomEvent(eventName, { detail: eventParam });
  document.dispatchEvent(event);
}

export function formatPartyName(name) {
  return name.split("/")[0].toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase() })
}

export function getSubRegionName(properties, state) {
  if (state.regionType === "national") {
      return properties.SPROVINCE;
  } else if (state.regionType === "province") {
      return properties.smunicipal && properties.smunicipal.split(" - ")[1].split("[")[0]; 
  } else {//municipality
    return getMunicipalityiecId(properties);
    // if (properties.Municipali) {
    //   return properties.Municipali.split(" - ")[1].split("[")[0];
    // }
    // return properties.SMUNICIPAL && properties.SMUNICIPAL.split(" - ")[1].split("[")[0]; 
  }
}

export function getMunicipalityCode(properties) {
  return properties.code || (properties.smunicipal && properties.smunicipal.split(" - ")[0].replace(/\s/g, ""));
}

export function getMunicipalityiecId(properties) {
  return properties.VDNumber || properties.PKLVDNUMBE;
}

export function getRegionFileName(state) {
  var nationalMapFile = "province_lo-res.geojson";
  function getProvinceFileName(provinceName) {
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
      return provinceNameToFileMap[provinceName];
  }
  switch(state.regionType) {
      case "national":
          return nationalMapFile;
      case "province":
          return getProvinceFileName(state.provinceName);
      case "municipality":
          return state.muniCode + ".topojson";//".geojson";
      case "municipality-vd":
          return "vd-data/" + state.muniCode + "-" + state.iecId + ".topojson"; //".geojson";
      default:
          return null;
  }
}

export function loadScript(id, scriptURL, callback) {
  if (document.getElementById(id))
    return;
  var script = document.createElement('script');
  script.onload = function () {
    if(callback) {
      callback();
    }
  };
  script.id = id;
  script.src = scriptURL;

  document.head.appendChild(script);
}

export function loadCanvg() {
  loadScript("canvgScript", "https://cdn.jsdelivr.net/npm/canvg/dist/browser/canvg.min.js", function() {
    console.log("canvgScript load finished");
  });
}

export function loadJSZip() {
  loadScript("jsZipScript", "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.0/jszip.min.js", function() {
    console.log("loadJSZip load finished");
  });
}

export function loadScriptsForEmbedMode() {
  loadCanvg();
  loadJSZip();
}


export function handleRegionChange(event) {
  var newState = JSON.parse(JSON.stringify(event.detail));
  delete newState.componentID;
  this.setState(newState)
}

export function fetchDataFromOBJ(state, props) {
  Object.keys(state).forEach(key => {
    if (props[key]) {
      state[key] = props[key];
    }
  })
}

export function formatClassNameFromPartyAbbr(partyAbbr) {
  return partyAbbr.replace(/[^a-zA-Z0-9]+/g, '');
}

export function onPartyAbbrsChange(e) {
    var options = e.target.options;
    var values = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    values = values.slice(0, 4);
    this.setState({
        partyAbbrs: values.map(value => value.split("\x22")[0]),
        partyIecIds: values.map(value => value.split("\x22")[1]),
    })
}

export function nationalEventSelected(state) {
  for (var i = 0; i < state.electionEvents.length; i ++) {
    if (state.electionEvents[i].description == state.eventDescription) {
      if (state.electionEvents[i].eventType.description.toLowerCase().indexOf("national") != -1) {
        return true;
      }
    }
  }
  return false;
}