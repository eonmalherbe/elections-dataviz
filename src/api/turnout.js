import gql from "graphql-tag"
import {client} from "./config"

  export function getTurnoutData(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType == "national") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            event:"${eventDescription}"
          ){
            edges{
              node{
                percVoterTurnout
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
            event:"${eventDescription}",
            province:"${options.provinceName}"
          ) {
            edges{
              node {
                percVoterTurnout
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
    } else { // municipality or municipality-vd
      var muniRegName = options.muniName.split(" - ")[1];
        return client.query({
          query: gql`
          {
            allVotingDistrictBallots( 
            event:"${eventDescription}",
            location_Ward_Municipality_Name_Icontains:"${muniRegName}") {
              edges{
                node{
                  location {
                    iecId
                  }
                  percVoterTurnout
                }
              }
            }
          }
          `
        })
    }
  }
  
  export function getTurnoutDataForAllEvents(options) {
    if (options.regionType == "national") {
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
                percVoterTurnout
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
            province:"${options.provinceName}"
          ) {
            edges{
              node {
                event {
                  description
                  eventType {
                    description
                  }
                }
                percVoterTurnout
              }
            }
          }
        }
        `
      })
    } else if (options.regionType == "municipality") {
        var muniCode = options.muniCode || options.muniName.split(" - ")[0];

        return client.query({
          query: gql`
          {
            allMunicipalBallots( 
                province:"${options.provinceName}", 
                municipalCode: "${muniCode}"
            ) {
              edges{
                node{
                  event {
                    description
                    eventType {
                      description
                    }
                  }
                  percVoterTurnout
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
                iecId:"${options.iecId}", 
                municipalCode:"${options.muniCode}"
            ) {
              edges{
                node{
                  event {
                    description
                    eventType {
                      description
                    }

                  }
                  percVoterTurnout
                }
              }
            }
          }
          `
        })
      }
  }
