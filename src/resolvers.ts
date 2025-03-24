
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
         // console.log('Resolver->ID_NormativaRiferimento:', ID_NormativaRiferimento); // Log del parametro
          return await dataSources.listingAPI.getListControlliByNormativa(ID_NormativaRiferimento);
        },
        listMappaControlliByControllo: async (_, { ID_Controllo }, { dataSources }) => {
         // console.log('Resolver->ID_NormativaRiferimento:', ID_Controllo); // Log del parametro
          return await dataSources.listingAPI.getControlliById(ID_Controllo);
        },
        listMappaByNormative: async (_, { ID_NormativaMaster,ID_NormativaLinked}, { dataSources }) => {
         // console.log('Resolver->ID_NormativaMaster:', ID_NormativaMaster); // Log del parametro
          return await dataSources.listingAPI.getListMappaByNormative(ID_NormativaMaster,ID_NormativaLinked);
        },
        listMappaByNormativa: async (_, { ID_Normativa}, { dataSources }) => {
         // console.log('Resolver->ID_Normativa:', ID_Normativa); // Log del parametro
          return await dataSources.listingAPI.getListMappaByNormativa(ID_Normativa);
        },  
        listMappaControlliByControlloByNormativa: async (_, {ID_Controllo, ID_Normativa}, { dataSources }) => {
          console.log('Resolver->ID_Normativa:'+ ID_Normativa+', ID_Controllo:'+ID_Controllo); // Log del parametro
          return await dataSources.listingAPI.getListControlliByNormativaControllo(ID_Controllo,ID_Normativa);
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
    Mutation: {
      insertAssociazioneMappaControllo: async ( _,{ ID_Controllo1, ID_Controllo2, Abilitato },   { dataSources }   ) => {
          try {
               
            const result = await dataSources.listingAPI.insertMappaControllo( ID_Controllo1, ID_Controllo2, Abilitato);
    
            if (result && result.id) { // Assumi che la funzione di inserimento restituisca l'ID del nuovo elemento
              return { success: true, id: result.id, message: 'Associazione mappa controllo inserita con successo.' };
            } else {
              return { success: false, message: 'Errore durante l\'inserimento della mappa controllo.' };
            }
          } catch (error) {
            console.error(
              'Errore durante l\'inserimento della mappa controllo nel database:',
              error
            );
            return { success: false, message: error.message };
          }
        
      },
      deleteAssociazioneMappaControllo: async (_, { ID_Controllo1,ID_Controllo2,Abilitato }, { dataSources }) => {
        try {
          console.log('ID_Controllo1,ID_Controllo2,Abilitato= '+ID_Controllo1+', '+ID_Controllo2+', '+Abilitato);
          // Logica per eliminare la riga dal database utilizzando l'ID fornito
          const success = 
          await dataSources.listingAPI.deleteAssociazioneControlli(ID_Controllo1,ID_Controllo2,Abilitato);
          return { success: success  };
        } catch (error) {
          console.error('Errore durante l\'eliminazione della riga:', error);
          return {  success: false };
        }
      },
      updateAbilitatoMappaControllo: async ( _,  { ID_Controllo1, ID_Controllo2, Abilitato },   { dataSources }  ) => {
        try {
          console.log('Abilitato= ',Abilitato);
          const mappaControlloAggiornata =
            await dataSources.listingAPI.patchMappaControllo(
              ID_Controllo1,
              ID_Controllo2,
              Abilitato
            );
          if (!mappaControlloAggiornata) {
            throw new Error("MappaControlli non trovata.");
          }
          return {
            ID_Controllo1: mappaControlloAggiornata.ID_Controllo1,
            ID_Controllo2: mappaControlloAggiornata.ID_Controllo2,
            Abilitato: mappaControlloAggiornata.Abilitato,
            ID_Mappa: mappaControlloAggiornata.ID_Mappa, // Correzione qui
          };
        } catch (error) {
          console.error(
            "Errore durante l'aggiornamento di MappaControllo:",
            error
          );
          throw error;
        }
      },
    },
    
};