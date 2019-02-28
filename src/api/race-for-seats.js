import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import gql from "graphql-tag"


var API_URI = "https://elections2019.xyz/graphql";
const client = new ApolloClient({
  link: new HttpLink({ uri: API_URI, useGETForQueries: true, headers: {"Content-Type" : "application/graphql" } }),
  cache: new InMemoryCache()
})


export function getSeatsData(options) {
    var eventDescription = options.eventDescription;
    if (!eventDescription)
      return;
    if (options.regionType == "national") {
      return client.query({
        query: gql`
        {
            allSeatCalculations(province:"", party_Event_Description:"${eventDescription}", orderBy:["-national_pr"]){
              edges{
                node
                {
                  nationalPr
                  regional
                  party{
                    name
                    abbreviation
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
    } else if (options.regionType == "province") {
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
  