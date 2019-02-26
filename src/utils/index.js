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
    console.log("parseMainPartyData", data, regionType);
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