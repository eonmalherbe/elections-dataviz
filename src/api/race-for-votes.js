import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import gql from "graphql-tag"


var API_URI = "https://elections2019.xyz/graphql";
const client = new ApolloClient({
  link: new HttpLink({ uri: API_URI, useGETForQueries: true, headers: {"Content-Type" : "application/graphql" } }),
  cache: new InMemoryCache()
})

export function getVotesDataM(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
    return;
    if (options.regionType == "national") {
      return client.query({
        query: gql`
        {
          allBallots(
            event_Description:"${eventDescription}"
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
    } else if (options.regionType == "province") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            event_Description:"${eventDescription}",
            location_Name_Icontains:"${options.provinceName}"
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
    } else if (options.regionType == "municipality") {
      var muniCode = options.muniName.split(" - ")[0];
  
      return client.query({
        query: gql`
        {
          allMunicipalBallots(
            event_Description:"${eventDescription}",
            location_Province_Name:"${options.provinceName}", 
            location_Code: "${muniCode}"
          ) {
            edges{
              node {
                partyResults {
                  edges{
                    node{
                      party {               
                        name
                        abbreviation
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
    } else if (options.regionType == "municipality-vd") {
      return client.query({
        query: gql`
        {
          allVotingDistrictBallots(
          event_Description:"${eventDescription}",
          location_Id:"${options.vdNumber}", 
          location_Ward_Municipality_Name_Icontains:"${options.muniCode}") {
            edges{
              node{
                location {
                  vdNumber
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
  
  export function getMainParties(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType == "national") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            event_Description:"${eventDescription}"
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
    } else if (options.regionType == "province") {
      return client.query({
        query: gql`
        {
          allMunicipalBallots(
            event_Description:"${eventDescription}",
            location_Province_Name:"${options.provinceName}"
          ) {
            edges{
              node {
                partyResults {
                  edges{
                    node{
                      party {               
                        name
                        abbreviation
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
    } else if (options.regionType == "municipality") {
      var muniRegName = options.muniName.split(" - ")[1];
        return client.query({
          query: gql`
          {
            allVotingDistrictBallots( 
            event_Description:"${eventDescription}",
            location_Ward_Municipality_Name_Icontains:"${muniRegName}") {
              edges{
                node{
                  location {
                    vdNumber
                  }
                  partyResults {
                    edges{
                      node{
                        party{
                          name
                          abbreviation
                        }
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
  