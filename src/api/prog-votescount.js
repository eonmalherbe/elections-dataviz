import gql from "graphql-tag"
import {client} from "./config"

export function getProgressVotesCount(options) {
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
                vdCount
                vdWithResultsCaptured
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
            location_Name:"${options.provinceName}"
          ){
            edges{
              node{
                vdCount
                vdWithResultsCaptured
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
            event_Description:"${eventDescription}",
            location_Province_Name:"${options.provinceName}", 
            location_Code: "${muniCode}"
          ) {
            edges{
              node {
                vdCount
                vdWithResultsCaptured
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
            location_IecId:"${options.iecId}", 
            location_Ward_Municipality_Code:"${options.muniCode}"
          ) {
            edges{
              node{
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