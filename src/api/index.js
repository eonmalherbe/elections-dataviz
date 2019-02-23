import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import gql from "graphql-tag"


var API_URI = "https://elections2019.xyz/graphql";
const client = new ApolloClient({
  link: new HttpLink({ uri: API_URI, useGETForQueries: true, headers: {"Content-Type" : "application/graphql" } }),
  cache: new InMemoryCache()
})

export function getElectionEvents() {
  return client.query({
    query: gql`
    {
      allEvents {
        description
      }
    }
    `
  })
}

export function getVotesDataM(options) {
  var eventDescription = options.eventDescription;
  if (options.regionType == "national") {
    return client.query({
      query: gql`
      {
        allProvincialBallots(
          location_Name_Icontains:"Country",
          event_Description:"${eventDescription}"
        ){
          edges{
            node{
              topResult(last:${options.numParties}) {
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
          location_Name_Icontains:"${options.provinceName}",
          event_Description:"${eventDescription}"
        ){
          edges{
            node{
              topResult(last:${options.numParties}) {
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

    return client.query({
      query: gql`
      {
        allMunicipalBallots(location_Province_Name:"${options.provinceName}", 
          event_Description:"${eventDescription}",
          location_Name: "${options.muniName}"
        ) {
          edges{
            node {
              topResult(last:${options.numParties}){
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
        allVotingDistrictBallots(location_Id:"${options.vdNumber}", 
        event_Description:"${eventDescription}",
        location_Ward_Municipality_Name_Icontains:"${options.muniCode}") {
          edges{
            node{
              location {
                vdNumber
              }
              topResult(last:${options.numParties}) {
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
