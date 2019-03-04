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

export function parseMainPartyData(data, props) {
    if (!data)  return null;
    var locationToMainParty = {};
    var edges;
    var regionType = props.regionType;
    if (regionType === "national") {
        edges = data["data"]["allProvincialBallots"].edges;
        edges.forEach(function(edge) {
            var node = edge.node;
            var provinceName = node["location"]["name"];
            var partyResults = node["partyResults"] || node["topResult"]; 
            var partyName = partyResults["edges"][0]["node"]["party"]["name"];
            locationToMainParty[provinceName] = partyName;
        })
    } else if (regionType === "province") {
        edges = data["data"]["allMunicipalBallots"].edges;
        edges.forEach(function(edge) {
            var node = edge.node;
            var muniCode = node["location"]["code"];
            var partyResults = node["partyResults"] || node["topResult"]; 
            var partyName = partyResults["edges"][0]["node"]["party"]["name"];
            locationToMainParty[muniCode] = partyName;
        })
    } else {// "municipality"
        edges = data["data"]["allVotingDistrictBallots"].edges;
        edges.forEach(function(edge) {
            var node = edge.node;
            var vdNumber = node["location"]["vdNumber"];
            var partyResults = node["partyResults"] || node["topResult"]; 
            var partyName = partyResults["edges"][0]["node"]["party"]["name"];
            locationToMainParty[vdNumber] = partyName;
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
          var vdNumber = node["location"]["vdNumber"];
          var percVoterTurnout = node["percVoterTurnout"]; 
          locationToTurnout[vdNumber] = percVoterTurnout;
      })
  }
  return locationToTurnout;
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
    return beautifiedMuniName(state.muniName) + "-" + state.vdNumber;
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