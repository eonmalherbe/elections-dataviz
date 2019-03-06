import * as d3 from "d3";

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
            validVotes: el["validVotes"],
            percOfVotes: el["percOfVotes"],
            partyInfo: el["party"]
        }
    });
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
          var partyName = node["topParty"]["party"]["name"];
          locationToMainParty[provinceName] = partyName;
      })
  } else if (regionType === "province") {
      edges = data["data"]["topPartiesByMunicipality"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var muniCode = node["location"]["code"];
          var partyName = node["topParty"]["party"]["name"];
          locationToMainParty[muniCode] = partyName;
      })
  } else {// "municipality"
      edges = data["data"]["topPartiesByVotingDistrict"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var iecId = node["location"]["iecId"];
          var partyName = node["topParty"]["party"]["name"];
          locationToMainParty[iecId] = partyName;
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
      seats = node["nationalPr"];
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
          var percVoterTurnout = node["percVoterTurnout"]; 
          locationToTurnout[provinceName] = percVoterTurnout;
      })
  } else if (regionType === "province") {
      edges = data["data"]["allMunicipalBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var muniCode = node["location"]["code"];
          var percVoterTurnout = node["percVoterTurnout"]; 
          locationToTurnout[muniCode] = percVoterTurnout;
      })
  } else {// "municipality"
      edges = data["data"]["allVotingDistrictBallots"].edges;
      edges.forEach(function(edge) {
          var node = edge.node;
          var iecId = node["location"]["iecId"];
          var percVoterTurnout = node["percVoterTurnout"]; 
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
    var percVoterTurnout = node["percVoterTurnout"]; 
    return {
      name: event,
      percVoterTurnout
    }
  }).filter(edge => edge.name.toLowerCase().indexOf(props.eventType) != -1)
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

  function calcPercent(a, b) {
    if (b == 0) {
      return 0;
    } else {
      return (a/b*100).toFixed(2);
    }
  }
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
export function createTooltip(className) {
  if (document.getElementsByClassName(className("tooltip"))[0]) {
    return d3.select(`.${className("tooltip")}`);
  } else {
    return d3.select("body").append("div")	
      .attr("class", className("tooltip"))				
      .style("opacity", 0);
  }
}
