import gql from "graphql-tag"
import {client} from "./config"



  export function getTurnoutData(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType === "national") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            event:"${eventDescription}"
          ){
            edges{
              node{
                percVoterTurnout
                vdCount
                vdWithResultsCaptured
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
          allMunicipalBallots(
            event:"${eventDescription}",
            province:"${options.provinceName}"
          ) {
            edges{
              node {
                percVoterTurnout
                vdCount
                vdWithResultsCaptured
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
        return client.query({
          query: gql`
          {
            allVotingDistrictBallots( 
              event:"${eventDescription}",
              municipalCode:"${options.muniCode}"
            ) {
              edges{
                node{
                  location {
                    iecId
                  }
                  percVoterTurnout
                  vdCount
                  vdWithResultsCaptured
                }
              }
            }
          }
          `
        })
    }
  }
  
  export function getTurnoutDataForOneEvent(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;

    if (options.regionType === "national") {
      return client.query({
        query: gql`
        {
          allBallots(
            event:"${eventDescription}"
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
    } else if (options.regionType === "province") {
      return client.query({
        query: gql`
        {
          allProvincialBallots(
            event:"${eventDescription}"
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
    } else if (options.regionType === "municipality") {
        var muniCode = options.muniCode || options.muniName.split(" - ")[0];

        return client.query({
          query: gql`
          {
            allMunicipalBallots( 
              event:"${eventDescription}"
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
    } else if (options.regionType === "municipality-vd") {
        return client.query({
          query: gql`
          {
            allVotingDistrictBallots(
              event:"${eventDescription}"
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
                percVoterTurnout
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
                  percVoterTurnout
                }
              }
            }
          }
          `
        })
      }
  }