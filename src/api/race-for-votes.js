import gql from "graphql-tag"
import {client} from "./config"

export function getVotesPredictionData(options) {
    return [[1, 3], [5,7], [7, 9]]
}

export function getVotesDataForComparison(options) {
  if (options.regionType === "national") {
    return client.query({
      query: gql`
      {
        allBallots{
          edges{
            node{
              event {
                description
              }
              partyResults {
                edges{
                  node{
                    percOfVotes
                    party {
                      name
                      abbreviation
                      iecId
                    }
                  }
                }
              }
              location {
                name
              }
            }
          }
        }
      }
      `
    })
  } else if (options.regionType === "province") {
    return client.query({
      query: gql`
      {
        allProvincialBallots(
          province:"${options.provinceName}"
        ){
          edges{
            node{
              event {
                description
              }
              partyResults {
                edges{
                  node{
                    percOfVotes
                    party {
                      name
                      abbreviation
                      iecId
                    }
                  }
                }
              }
              location {
                name
              }
            }
          }
        }
      }
      `
    })
  } else if (options.regionType === "municipality") {
    var muniCode = options.muniCode || options.muniName.split(" - ")[0];

    return client.query({
      query: gql`
      {
        allMunicipalBallots(
          province:"${options.provinceName}", 
          municipalCode: "${muniCode}"
        ) {
          edges{
            node {
              event {
                description
              }
              partyResults {
                edges{
                  node{
                    party {               
                      name
                      abbreviation
                      iecId
                    }
                    validVotes
                    percOfVotes
                  }
                }
                
              }
              location {
                code
                name
                longName
              }
            }
          }
        }
      }
      `
    })
  } else if (options.regionType === "municipality-vd") {
    return client.query({
      query: gql`
      {
        allVotingDistrictBallots(
          iecId:"${options.iecId}", 
        ) {
          edges{
            node{
              event {
                description
              }
              location {
                iecId
              }
              partyResults {
                edges{
                  node{
                    party{
                      name
                    }
                    percOfVotes
                  }
                }  
              }
            }
          }
        }
      }
      `
    })
  }
}

export function getVotesDataForAllEvents(options) {
    if (options.regionType === "national") {
      return client.query({
        query: gql`
        {
          allBallots{
            edges{
              node{
                event {
                  description
                  eventType {
                    description
                  }
                }
                partyResults {
                  edges{
                    node{
                      validVotes
                      percOfVotes
                      party {
                        id
                        name
                        abbreviation
                        iecId
                      }
                    }
                  }
                  
                }
                location {
                  id
                  name
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "province") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            province:"${options.provinceName}"
          ){
            edges{
              node{
                event {
                  description
                  eventType {
                    description
                  }
                }
                partyResults {
                  edges{
                    node{
                      validVotes
                      percOfVotes
                      party {
                        id
                        name
                        abbreviation
                        iecId
                      }
                    }
                  }
                }
                location {
                  id
                  name
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "municipality") {
      var muniCode = options.muniCode || options.muniName.split(" - ")[0];
  
      return client.query({
        query: gql`
        {
          allMunicipalBallots(
            province:"${options.provinceName}", 
            municipalCode: "${muniCode}"
          ) {
            edges{
              node {
                event {
                  description
                  eventType {
                    description
                  }
                }
                partyResults {
                  edges{
                    node{
                      party {               
                        name
                        abbreviation
                        iecId
                      }
                      validVotes
                      percOfVotes
                    }
                  }
                  
                }
                location {
                  code
                  name
                  longName
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "municipality-vd") {
      return client.query({
        query: gql`
        {
          allVotingDistrictBallots(
            iecId:"${options.iecId}"
          ) {
            edges{
              node{
                event {
                  description
                  eventType {
                    description
                  }
                }
                location {
                  iecId
                }
                partyResults {
                  edges{
                    node{
                      party{
                        name
                        abbreviation
                        iecId
                      }
                      validVotes
                      percOfVotes
                    }
                  }  
                }
              }
            }
          }
        }
        `
      })
    }
  }

export function getVotesDataM(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
    return;
    if (options.regionType === "national") {
      return client.query({
        query: gql`
        {
          allBallots(
            event:"${eventDescription}"
          ){
            edges{
              node{
                partyResults {
                  edges{
                    node{
                      validVotes
                      percOfVotes
                      party {
                        id
                        name
                        abbreviation
                        iecId
                      }
                    }
                  }
                  
                }
                location {
                  id
                  name
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "province") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            event:"${eventDescription}",
            province:"${options.provinceName}"
          ){
            edges{
              node{
                partyResults {
                  edges{
                    node{
                      validVotes
                      percOfVotes
                      party {
                        id
                        name
                        abbreviation
                        iecId
                      }
                    }
                  }
                }
                location {
                  id
                  name
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "municipality") {
      var muniCode = options.muniCode || options.muniName.split(" - ")[0];
  
      return client.query({
        query: gql`
        {
          allMunicipalBallots(
            event:"${eventDescription}",
            province:"${options.provinceName}", 
            municipalCode: "${muniCode}"
          ) {
            edges{
              node {
                partyResults {
                  edges{
                    node{
                      party {               
                        name
                        abbreviation
                        iecId
                      }
                      validVotes
                      percOfVotes
                    }
                  }
                  
                }
                location {
                  code
                  name
                  longName
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "municipality-vd") {
      return client.query({
        query: gql`
        {
          allVotingDistrictBallots(
            event:"${eventDescription}",
            iecId:"${options.iecId}"
          ) {
            edges{
              node{
                location {
                  iecId
                  ward {
                    municipality {
                      code
                      province {
                        name
                      }
                    }
                  }
                }
                partyResults {
                  edges{
                    node{
                      party{
                        name
                        abbreviation
                        iecId
                      }
                      validVotes
                      percOfVotes
                    }
                  }  
                }
              }
            }
          }
        }
        `
      })
    }
  }

  export function getMainParties(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType === "national") {
      return client.query({
        query: gql`
        {
          topPartiesByProvince(event:"${eventDescription}") {
            edges {
              node {
                location{
                  id
                  name
                }
                totalVotesCast
                topParty{
                  validVotes
                  percOfVotes
                  party {
                      id
                      name
                      abbreviation
                      iecId
                  }
                }
              }
            }
          }
        }
        `
      })
    } else if (options.regionType === "province") {
      return client.query({
        query: gql`
        {
          topPartiesByMunicipality(
            event:"${eventDescription}", 
            province:"${options.provinceName}") {
            
            edges {
              node {
                location{
                    code
                    name
                    longName
                }
                totalVotesCast
                topParty{
                  party {               
                    name
                    abbreviation
                    iecId
                  }
                  validVotes
                  percOfVotes
                }
              }
            }
          }
        }
        `
      })
    } else { //if (options.regionType === "municipality") {
        return client.query({
          query: gql`
          {
            topPartiesByVotingDistrict(
              event:"${eventDescription}", 
              province:"${options.provinceName}",
              municipalCode: "${options.muniCode}"
            ) {
              
              edges {
                node {
                  location{
                    iecId
                  }
                  topParty{
                    party{
                      name
                      abbreviation
                      iecId
                    }
                  }
                }
              }
            }
          }
          `
        })
    }
  }
  
