import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";
import { resolvers } from "./resolvers";
import { ListingAPI } from "./datasources/listing-api";
import { PythonAPI } from './datasources/python-api';

import * as ort from "onnxruntime-node";

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

async function startApolloServer() {


  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    context: async () => {
     
      const { cache } = server;
      return {
      
        dataSources: {
          listingAPI: new ListingAPI({ cache }),
          pythonAPI: new PythonAPI(),
        },
      };
    },
  });
  
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();