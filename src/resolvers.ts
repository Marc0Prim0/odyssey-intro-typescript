
import { Resolvers } from "./types";
import pool from './db';
export const resolvers: Resolvers = {
    Query: {
        featuredListings: (_, __, { dataSources }) => {
          return dataSources.listingAPI.getFeaturedListings();
        },
        listing: (_, { id }, { dataSources }) => {
          return dataSources.listingAPI.getListing(id);
        },
        listNormative:async (_, __, { dataSources }) => {
          
            const result = await dataSources.listingAPI.getListNormative();
           // console.log("Result from getListNormative:", result);
            return result;
        },
        listControlli:async (_, __, { dataSources }) => {
          
          const result = await dataSources.listingAPI.getListControlli();
         // console.log("Result from getListNormative:", result);
          return result;
        },
        listControlliByNormativa: async (_, { ID_NormativaRiferimento }, { dataSources }) => {
          console.log('Resolver->ID_NormativaRiferimento:', ID_NormativaRiferimento); // Log del parametro
          return await dataSources.listingAPI.getListControlliByNormativa(ID_NormativaRiferimento);
        },
        listMappaControlliByControllo: async (_, { ID_Controllo }, { dataSources }) => {
          console.log('Resolver->ID_NormativaRiferimento:', ID_Controllo); // Log del parametro
          return await dataSources.listingAPI.getControlliById(ID_Controllo);
        },
        listMappaByNormative: async (_, { ID_NormativaMaster,ID_NormativaLinked}, { dataSources }) => {
          console.log('Resolver->ID_NormativaMaster:', ID_NormativaMaster); // Log del parametro
          return await dataSources.listingAPI.getListMappaByNormative(ID_NormativaMaster,ID_NormativaLinked);
        },
        listMappaByNormativa: async (_, { ID_Normativa}, { dataSources }) => {
          console.log('Resolver->ID_Normativa:', ID_Normativa); // Log del parametro
          return await dataSources.listingAPI.getListMappaByNormativa(ID_Normativa);
        },   
           
    },
    Controllo: {
      CategoriaControllo: async (parent, _, { dataSources }) => {
       // console.log('Resolver->parent:', parent); // Log l'oggetto completo
      //  console.log('Resolver->ID_CategoriaControllo:', parent.ID_Categoria); // Log del parametro
        return dataSources.listingAPI.getCategoriaById(parent.ID_Categoria);
      },
      Controllo: async (parent, _, { dataSources }) => {
        // console.log('Resolver->parent:', parent); // Log l'oggetto completo
       //  console.log('Resolver->ID_CategoriaControllo:', parent.ID_Categoria); // Log del parametro
         return dataSources.listingAPI.getControlliById(parent.ID_Controllo);
       },
       Normativa: async (parent, _, { dataSources }) => {
        // console.log('Resolver->parent:', parent); // Log l'oggetto completo
       //  console.log('Resolver->ID_CategoriaControllo:', parent.ID_Categoria); // Log del parametro
         return dataSources.listingAPI.getNormativaById(parent.ID_NormativaRiferimento);
       },
    },
    Listing: {
        amenities: ({ id, amenities }, _, { dataSources }) => {
          return dataSources.listingAPI.getAmenities(id);
        }
    },
    
  };