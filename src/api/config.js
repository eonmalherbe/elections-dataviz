import { ApolloClient } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"

var API_URI = "https://elections2019.xyz/graphql";
API_URI = "http://localhost/graphql";


const client = new ApolloClient({
    link: new HttpLink({ uri: API_URI, useGETForQueries: true, headers: {"Content-Type" : "application/graphql" } }),
    cache: new InMemoryCache()
  })

export {
    API_URI,
    client
}
