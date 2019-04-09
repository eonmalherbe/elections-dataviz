import gql from "graphql-tag"
import {client} from "./config"

export function getSeatsDataForComparison(options) {
  if (options.regionType == "national") {
    return client.query({
      query: gql`
      {
          allSeatCalculations(
            party_Event_Description_Icontains:"national",
            orderBy:["-national_pr"]){
            edges{
              node
              {
                nationalPr
                regional
                party{
                  event {
                    description
                  }
                  name
                  abbreviation
                  iecId
                }
                province{
                  name
                }
              }
            }
          }
      }
      `
    })
  } else { //  if (options.regionType == "province")
    return client.query({
      query: gql`
      {
          allSeatCalculations(province_Name:"${options.provinceName}", orderBy:["-regional"]){
            edges{
              node
              {
                nationalPr
                regional
                party{
                  event {
                    description
                  }
                  name
                  abbreviation
                  iecId
                }
                province{
                  name
                }
              }
            }
          }
      }
      `
    })
  }
}


export function getSeatsData(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType == "national") {
      return client.query({
        query: gql`
        {
            allSeatCalculations(party_Event_Description:"${eventDescription}", orderBy:["-national_pr"]){
              edges{
                node
                {
                  nationalPr
                  regional
                  party{
                    name
                    abbreviation
                    iecId
                  }
                  province{
                    name
                    country{
                      event{
                        description
                      }
                    }
                  }
                }
              }
            }
        }
        `
      })
    } else { //  if (options.regionType == "province")
      eventDescription = eventDescription.replace("National", "Provincial");
      eventDescription = eventDescription.replace("NATIONAL", "PROVINCIAL");
      eventDescription = eventDescription.replace("national", "provincial");
      return client.query({
        query: gql`
        {
            allSeatCalculations(province_Name:"${options.provinceName}", party_Event_Description:"${eventDescription}", orderBy:["-regional"]){
              edges{
                node
                {
                  nationalPr
                  regional
                  party{
                    name
                    abbreviation
                    iecId
                  }
                  province{
                    name
                    country{
                      event{
                        description
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
  
