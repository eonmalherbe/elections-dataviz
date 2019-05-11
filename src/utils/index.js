import * as d3 from "d3";
import config from "../config";

function calcPercent(a, b) {
  if (b == 0) {
    return 0;
  } else {
    return (a/b*100).toFixed(2);
  }
}

export function getShortenedEventDescription(event) {
  var year = /(19|20)\d{2}/g.exec(event["description"])[0];
  var shortenedNatProv = (event["eventType"]["description"] == "National Election"? "Nat": "Prov");
  return `${year} ${shortenedNatProv}`;
}

export function getYear(desc) {
  return /(19|20)\d{2}/g.exec(desc)[0];
}

export function parseVotesDataForAllEvents(data, props) {
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

    console.log("props", props)
    return edges.map(edge => {
      var nodeData = edge["node"];

      var eventDescription = getShortenedEventDescription(nodeData["event"]); //nodeData["event"]["description"];
      var partyResults = nodeData["partyResults"] || nodeData["topResult"];
      results = partyResults["edges"];
      results = results.sort(function(a, b) {return b.node.percOfVotes - a.node.percOfVotes});
      results = results.slice(0, props.numPartiesSplitNatProv);

      return {
        longEventDescription: nodeData["event"]["description"],
        eventDescription,
        data: results.map(function(node) {
          var el = node["node"];
          return {
              name: el["party"]["abbreviation"],
              iecId: el["party"]["iecId"],
              validVotes: el["validVotes"].toFixed(2),
              percOfVotes: el["percOfVotes"].toFixed(2),
              partyInfo: el["party"]
          }
        })
      }
    }).filter(edge => props.eventDescriptionsSplitNatProv.indexOf(edge.longEventDescription) != -1)
    .sort(function(edge1, edge2) {
      var edge1Year = parseInt(/(19|20)\d{2}/g.exec(edge1.eventDescription)[0]);
      var edge2Year = parseInt(/(19|20)\d{2}/g.exec(edge2.eventDescription)[0]);
      if (edge1Year == edge2Year) {
        if (edge1.eventDescription > edge2.eventDescription) {
          return 1;
        }
        return -1;
      }
      return -edge1Year + edge2Year;
    })
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

    return results.map(function(node) {
        var el = node["node"];
        return {
            name: el["party"]["abbreviation"],
            iecId: el["party"]["iecId"],
            validVotes: el["validVotes"].toFixed(2),
            percOfVotes: el["percOfVotes"].toFixed(2),
            partyInfo: el["party"]
        }
    });
}

export function fetchLocationTrackFromVDdata(data) {
  var firstEdge = data["data"]["allVotingDistrictBallots"].edges[0];
  var nodeData = firstEdge["node"];
  var locationResult = nodeData["location"];
  var newState = {
    regionType: "municipality-vd",
    iecId: locationResult["iecId"],
    muniCode: locationResult["ward"]["municipality"]["code"],
    provinceName: locationResult["ward"]["municipality"]["province"]["name"],
  };     
  return newState;      
}

export function parseVotesComparisonData(data, props) {
  var results, edges;

  var regionType = props.regionType;
  var eventDescriptions = props.eventDescriptions["national"]
  if (props.electionType === "provincial")
    eventDescriptions = props.eventDescriptions["provincial"]

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
  var results = partyfilter_edges.filter(edge => eventDescriptions.indexOf(edge.name) != -1);

  var new_results = [];
  for(var i = 0; i < eventDescriptions.length; i ++) {
    var available = false;
    for (var j = 0; j < results.length; j ++) {
      if (results[j].name == eventDescriptions[i]) {
        var available = true;
        new_results.push({
          ...results[j],
          name: getYear(results[j].name)
        });
        break;
      }
    }
    if (!available) {
      new_results.push({
        name: getYear(eventDescriptions[i]),
        percOfVotes: 0,
        partyInfo: {
          name: props.partyAbbr,
          abbreviation: props.partyAbbr,
        } 
      })
    }
  }
  // new_results.sort(function(a, b) {
  //   return a.name - b.name;
  // })
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
      iecId: node["party"]["iecId"],
      partyInfo: node["party"],
    }
  })
  
  // results.sort(function(a,b) {
  //   return b["seats"] - a["seats"];
  // })
  return results.slice(0, props.numParties);
}

export function parseVotesPredictionData(data, props) {
  // TODO actually implement a function that removes hypens and .s
  var edges = data["data"]["CSIRPrediction"]["results"].edges;
  var partyIecIds = [];
  var lineData = [];
  edges.forEach(function(edge) {
    var nodeData = edge.node;
    var percVds = nodeData.percVds;
    var prediction = nodeData.prediction;
    var predictionEdges = prediction.edges;
    predictionEdges.forEach(function(predictionEdge) {
      console.log("predictionEdge", predictionEdge);
      var predictionNodeData = predictionEdge.node;
      var partyInfo = predictionNodeData.party;
      if (!partyInfo) {
        return;
      }
      var predictedPercent = predictionNodeData.predictedPercent;
      var actualPercent = predictionNodeData.actualPercent;

      var partyIndex = partyIecIds.indexOf(partyInfo.iecId);
      if (partyIndex == -1) {
        partyIecIds.push(partyInfo.iecId);
        lineData.push({
          name: partyInfo.name,
          iecId: partyInfo.iecId,
          abbreviation: partyInfo.abbreviation,
          cleaned_name: partyInfo.abbreviation.replace(/[^a-zA-Z0-9]+/g, ''),
          data: []
        });
        partyIndex = partyIecIds.length - 1;
      }
      lineData[partyIndex].data.push({
        'x': percVds,
        'y': predictedPercent
      })
    })
  })
  lineData.forEach(oneLine => {
    oneLine.data.sort(function(a, b) {
      return a.x - b.x;
    })
  })
  console.log("parsedLineData", lineData);
  // var lineData = [{
  //     name : "AFRICAN NATIONAL CONGRESS",
  //     cleaned_name : "anc",
  //     data : [
  //       {'x': 3, 'y': 51.6},
  //       {'x': 6, 'y': 59.3},
  //       {'x': 12, 'y': 55.4},
  //       {'x': 20, 'y': 56},
  //       {'x': 27, 'y': 59.5},
  //       {'x': 33, 'y': 59.8},
  //       {'x': 39, 'y': 61.2},
  //       {'x': 45, 'y': 61.8},
  //       {'x': 51, 'y': 62.7},
  //       {'x': 57, 'y': 63.1},
  //       {'x': 63, 'y': 63.6},
  //       {'x': 69, 'y': 62.7},
  //       {'x': 69, 'y': 62.7},
  //       {'x': 75, 'y': 62.3},
  //       {'x': 81, 'y': 62.9},
  //       {'x': 87, 'y': 63},
  //       {'x': 93, 'y': 62.8},
  //       {'x': 100, 'y': 62.8},
  //     ]
  //   },
  //   {
  //     name : "DEMOCRATIC ALLIANCE",
  //     cleaned_name: "da",
  //     data : [
  //       {'x': 3, 'y': 31.6},
  //       {'x': 6, 'y': 39.3},
  //       {'x': 12, 'y': 35.4},
  //       {'x': 20, 'y': 36},
  //       {'x': 27, 'y': 39.6},
  //       {'x': 33, 'y': 39.8},
  //       {'x': 39, 'y': 31.2},
  //       {'x': 45, 'y': 31.4},
  //       {'x': 51, 'y': 22.7},
  //       {'x': 57, 'y': 33.1},
  //       {'x': 63, 'y': 23.6},
  //       {'x': 69, 'y': 32.7},
  //       {'x': 69, 'y': 32.7},
  //       {'x': 75, 'y': 22.3},
  //       {'x': 81, 'y': 32.9},
  //       {'x': 87, 'y': 33},
  //       {'x': 93, 'y': 22.8},
  //       {'x': 100, 'y': 22.8},
  //     ]
  //   }
  // ];

  return lineData;
}

export function parseCSIRTurnoutTimestamp(data) {
  var predictionData = data["data"]["CSIRPrediction"];
  var {
    turnout,
    timestamp
  } = predictionData;
  return {
    turnout: turnout.toFixed(2),
    timestamp
  }
}

export function parseCSIRMinMax(data) {
  var predictionData = data["data"]["CSIRPrediction"];
  var {
    minX,
    maxX
  } = predictionData;
  return {
    minX,
    maxX
  }
}

export function parseSeatsComparisonData(data, props) {
  if (!data)  return null;
  var edges = data["data"]["allSeatCalculations"].edges;
  var regionType = props.regionType;
  var eventDescriptions = props.eventDescriptions["national"]
  if (props.electionType === "provincial")
    eventDescriptions = props.eventDescriptions["provincial"]

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
  }).filter(result => eventDescriptions.indexOf(result.name) != -1)
  .filter(result => 
    props.partyIecId
    ? (result.partyInfo["iecId"] == props.partyIecId)
    : (result.partyInfo["abbreviation"] == props.partyAbbr)
  )

  var new_results = [];
  for(var i = 0; i < eventDescriptions.length; i ++) {
    var available = false;
    for (var j = 0; j < results.length; j ++) {
      if (results[j].name == eventDescriptions[i]) {
        var available = true;
        new_results.push({
          ...results[j],
          name: getYear(results[j].name)
        });
        break;
      }
    }
    if (!available) {
      new_results.push({
        name: getYear(props.eventDescriptions[i]),
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
  return new_results;
}

export function parseSeatsComparisonDataMultipleParties(data, props) {
  return props.partyAbbrs.map((partyAbbr, partyIdx) => {
    var newProps = {...props};
    newProps.partyAbbr = partyAbbr;
    newProps.partyIecId = props.partyIecIds[partyIdx];
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

export function parseCountingProgressDataForMap(data, props) {
  if (!data)  return null;
  var locationToProgVotes = {};
  var edges;
  var regionType = props.regionType;
  if (regionType === "national") {
      edges = data["data"]["allProvincialBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var provinceName = node["location"]["name"];
          
          locationToProgVotes[provinceName] = calcPercent(node["vdWithResultsCaptured"], node["vdCount"]); 
      })
  } else if (regionType === "province") {
      edges = data["data"]["allMunicipalBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var muniCode = node["location"]["code"];
          locationToProgVotes[muniCode] = calcPercent(node["vdWithResultsCaptured"], node["vdCount"]); 
      })
  } else {// "municipality" or "municipality-vd"
      edges = data["data"]["allVotingDistrictBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var iecId = node["location"]["iecId"];
          locationToProgVotes[iecId] = calcPercent(node["vdWithResultsCaptured"], node["vdCount"]); 
      })
  }
  return locationToProgVotes;
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
      name: getYear(event),
      eventType: eventType,
      percVoterTurnout
    }
  }).filter(edge => edge.eventType.toLowerCase().indexOf(props.eventType) != -1)
  .sort(function(edge1, edge2) {
    var edge1Year = parseInt(/(19|20)\d{2}/g.exec(edge1.name)[0]);
    var edge2Year = parseInt(/(19|20)\d{2}/g.exec(edge2.name)[0]);
    return -edge1Year + edge2Year;
  })
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
      name: getYear(event),
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
  if (state.regionType == "national") {
    var event = state.eventDescription.toLocaleLowerCase()

    if (event.indexOf("national election") >= 0) {
      return "National Assembly"
    }
    else if (event.indexOf("provincial election") >= 0) {
      return "Results for Provincial Legislatures"
    }
    else
      return ""
  }
  else if (state.regionType == "province") {
    return getRegionName(state) + " Legislature";
  }
  return getRegionName(state);
}

export function getRegionName3(state) {
  if (state.regionType == "national")
    return "National";
  if (state.regionType == "province") {
    return getRegionName(state) + " Legislature";
  }
  return getRegionName(state);
}

export function getRegionName4(state) {
  if (state.regionType == "national") {
    return "National Assembly";
  } else { // province
    return state.provinceName + " Legislature";
  }
}

export function getNationalProvincialStr(state) {
  var event = state.eventDescription.toLocaleLowerCase()
  var nationalProvincialStr = ""; 
  if (event.indexOf("national election") >= 0) {
      nationalProvincialStr = "National Assembly";
  } else {
      nationalProvincialStr = "Provincial Legislature";
  }
  return nationalProvincialStr;
}

export function getNationalProvincialStr2(state) {
  var event = state.eventDescription.toLocaleLowerCase()
  var nationalProvincialStr = ""; 
  if (event.indexOf("national election") >= 0) {
      nationalProvincialStr = "National Assembly";
  } else {
      nationalProvincialStr = state.provinceName + " Legislature";
  }
  return nationalProvincialStr;
}

export function getNationalProvincialStr3(state) {
  var event = state.eventDescription.toLocaleLowerCase()
  var nationalProvincialStr = ""; 
  if (event.indexOf("national election") >= 0) {
      nationalProvincialStr = "";
  } else {
      nationalProvincialStr = ": " + state.provinceName + " Legislature";
  }
  return nationalProvincialStr;
}

export function getNationalProvincialStr4(state) {
  var event = state.eventDescription.toLocaleLowerCase()
  var nationalProvincialStr = ""; 
  if (event.indexOf("national election") >= 0) {
      nationalProvincialStr = "National";
  } else {
      nationalProvincialStr = state.provinceName + " Legislature";
  }
  return nationalProvincialStr;
}

export function getSeatsCount(state) {
  if (state.regionType == "national") {
    return 400;
  } else {
    var seatsTable = {
      "Eastern Cape": 63,
      "Free State": 30,
      "Gauteng": 73,
      "KwaZulu-Natal": 80,
      "Limpopo": 49,
      "Mpumalanga": 30,
      "North West": 33,
      "Northern Cape": 30,
      "Western Cape": 42,
    }
    return seatsTable[state.provinceName];
  }
  
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
    if (typeof props[key] != 'undefined') {
      state[key] = props[key];
    }
  })
}

export function formatClassNameFromString(str) {
  return "formedClass_" + str.replace(/[^a-zA-Z0-9]+/g, '');
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

export function createSvg(container, width, height) {
  container.selectAll("svg").remove();
  var svg = container.append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width) + " " + (height))
      .classed("svg-content", true);

  return svg;
}

export function createErrorText(container, xOffset, yOffset) {
  if (xOffset === undefined) xOffset = 0;
  if (yOffset === undefined) yOffset = 0;

  var errorText = container.append("g")
    .attr("transform", "translate("+ xOffset + "," + yOffset + ")")
    .append("text")
    .attr("text-anchor", "middle");

  return errorText;
}

export function PartyColours(partyColours) {
  var partyColourByName = {};

  if (partyColours && partyColours["data"]["allParties"]["edges"]) {
      partyColours["data"]["allParties"]["edges"].forEach(edge => {
        partyColourByName[edge.node.name] = edge.node.colour;
      })
  }

  // TODO should used cleaned name
  function getFillColourFromPartyName(partyName, i) {
    // console.log(partyColourByName[partyName])
    // console.log(partyColourByName)
    return partyColourByName[partyName];
    //return partyColourByName[partyName.split("/")[0]] || predefColours[i%predefColours.length];
  }

  return getFillColourFromPartyName;
}

