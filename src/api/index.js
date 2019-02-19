import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://elections2019.xyz/graphql', useGETForQueries: true, headers: {"Content-Type" : "application/graphql" } }),
  cache: new InMemoryCache()
})


export function getVotesData(options) {
    return client.query({
        query: gql`
        {
          allProvincialBallots(
              event_Description_Icontains:"2004", 
            event_EventType_Description_Icontains:"National",
            location_Name:"${options.regionName}"
        
          ) {
            edges {
              node {
                topResult(validVotes_Gt:1000, last:${options.numParties}) {
                  edges {
                    node {
                      validVotes
                      party {
                        name
                        abbreviation
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
        `,
      });
}