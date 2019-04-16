import gql from "graphql-tag"
import {client} from "./config"

  export function getSpoiltData(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType == "national") {
      return client.query({
        query: gql`
        {
          allBallots(
            event:"${eventDescription}"
          ){
            edges{
              node{
                spoiltVotes
                totalVotesCast
                totalValidVotes
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
            event:"${eventDescription}",
            province:"${options.provinceName}"
          ) {
            edges{
              node {
                spoiltVotes
                totalVotesCast
                totalValidVotes
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
                node{
                  location {
                    code
                    name
                    longName
                  }
                  spoiltVotes
                  totalVotesCast
                  totalValidVotes
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
                event:"${eventDescription}",
                iecId:"${options.iecId}", 
                municipalCode:"${options.muniCode}"
            ) {
              edges{
                node{
                  location {
                    iecId
                  }
                  spoiltVotes
                  totalVotesCast
                  totalValidVotes
                }
              }
            }
          }
          `
        })
      }
  }
  
