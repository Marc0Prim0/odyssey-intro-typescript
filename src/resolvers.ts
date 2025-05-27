
import { Resolvers } from "./types";
import pool from './db';
import * as ort from 'onnxruntime-node';  // Importa ONNX Runtime
import { QueryResolvers } from "./types"; // Assicurati di avere il tipo QueryResolvers
import { DataSourceContext } from "./context";
import * as sbd from 'sbd';
import { pipeline } from '@xenova/transformers';


//const basePython3URL = "http://localhost:5001"; // Assicurati che sia l'URL corretto per il tuo microservizio Python


// Media su tutti gli embeddings dei token
function meanPooling(tensor: any): number[] {
  const { data, dims } = tensor;
  const [_, numTokens, dim] = dims;

  const result = new Array(dim).fill(0);

  for (let i = 0; i < numTokens; i++) {
    for (let j = 0; j < dim; j++) {
      result[j] += data[i * dim + j];
    }
  }

  return result.map(x => x / numTokens);
}

// Similarità coseno tra due vettori
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// 🔁 Funzione principale che ora restituisce la similarità diretta
export async function compareTexts(text1: string, text2: string): Promise<number> {
  const embed = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

  const output1 = await embed(text1);
  const output2 = await embed(text2);

  const vector1 = meanPooling(output1);
  const vector2 = meanPooling(output2);

  const similarity = cosineSimilarity(vector1, vector2);
  return similarity;
}



export const resolvers: Resolvers = {
    Query: {

      //questa è la parte che chiama il reasonning  su python
        analizzaTesto: async (_: any, { testo }: { testo: string }, { dataSources }: any) => {
          console.log('Ricevuta richiesta da analizzaTesto per testo: ',testo);
          return await dataSources.pythonAPI.analizzaTesto(testo);
        },
      

      /*
        separaFrase: async (_: any, { testo }: { testo: string }, { dataSources }) => {
          return dataSources.pythonAPI.separaTesto(testo);
        },
      */
        // Nuovo resolver per la predizione della similarità.
        // Eseguito quando l'utente clicca su "Calcola Affinità" nella modale.
        // Il parametro inputData è un array di stringhe che contiene le due frasi da confrontare.
        predict: async (_, { inputData }: {  inputData: string[] }, context: DataSourceContext): Promise<number> => {
      
          try {
           
            const affinity = await compareTexts(inputData[0], inputData[1]);
          //const affinity = await compareTexts('pirla che sei', 'pirlotto non dirlo a marzabotto');
            console.log('AFFINITà calcolata= ',affinity);
            inputData = [];
            if (typeof affinity !== "number") {
              throw new Error("Il modello ha restituito un valore non numerico.");
            }
    
            return affinity; // Ora è garantito essere un numero
          } catch (error) {
            console.error("Errore durante la previsione:", error);
            throw new Error("Errore nell'elaborazione del modello.");
          }
        },
      

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
        listControlliById: async (_, { ID_Controllo }, { dataSources }) =>{
          console.log('Resolver->listControlloById->ID_Controllo:', ID_Controllo); // Log del parametro
          return await dataSources.listingAPI.getListControlliById(ID_Controllo);
        },
        listControlliByNormativa: async (_, { ID_NormativaRiferimento }, { dataSources }) => {
          console.log('Resolver->listControlliByNormativa->ID_NormativaRiferimento:', ID_NormativaRiferimento); // Log del parametro
          return await dataSources.listingAPI.getListControlliByNormativa(ID_NormativaRiferimento);
        },
        listControlliByNormativaDeep: async (_, { ID_NormativaRiferimento ,includeDeep,includeDesc}, { dataSources }) => {
          console.log('Resolver->listControlliByNormativa->ID_NormativaRiferimento:', ID_NormativaRiferimento); // Log del parametro
          return await dataSources.listingAPI.getListControlliByNormativa(ID_NormativaRiferimento);
        },
        listMappaControlliByControllo: async (_, { ID_Controllo }, { dataSources }) => {
          console.log('Resolver->listMappaControlliByControllo->ID_NormativaRiferimento:', ID_Controllo); // Log del parametro
          return await dataSources.listingAPI.getControlliById(ID_Controllo);
        },
        listMappaByNormative: async (_, { ID_NormativaMaster,ID_NormativaLinked}, { dataSources }) => {
          console.log('Resolver->listMappaByNormative->ID_NormativaMaster:', ID_NormativaMaster); // Log del parametro
          return await dataSources.listingAPI.getListMappaByNormative(ID_NormativaMaster,ID_NormativaLinked);
        },
        listMappaByNormativa: async (_, { ID_Normativa}, { dataSources }) => {
          console.log('Resolver->listMappaByNormativa->ID_Normativa:', ID_Normativa); // Log del parametro
          return await dataSources.listingAPI.getListMappaByNormativa(ID_Normativa);
        },  
        listMappaControlliByControlloByNormativa: async (_, {ID_Controllo, ID_Normativa}, { dataSources }) => {
          console.log('Resolver->listMappaControlliByControlloByNormativa->ID_Normativa:'+ ID_Normativa+', ID_Controllo:'+ID_Controllo); // Log del parametro
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
      insertAssociazioneMappaControllo: async ( _,{ ID_Controllo1, ID_Controllo2, Affinita },   { dataSources }   ) => {
        console.log("insertAssociazioneMappaControllo chiamato con Affinita=",Affinita);
        try {
      
            const mappaControlloAggiornata = 
              await dataSources.listingAPI.insertMappaControllo(
                ID_Controllo1,
                ID_Controllo2,
                true,
                Affinita
              );
              if (!mappaControlloAggiornata) {
                throw new Error("MappaControlli non inserita.");
              }
              return {
                ID_Controllo1: mappaControlloAggiornata.ID_Controllo1,
                ID_Controllo2: mappaControlloAggiornata.ID_Controllo2,
                Abilitato: mappaControlloAggiornata.Abilitato,
                ID_Mappa: mappaControlloAggiornata.ID_Mappa, // Correzione qui
              };
        } catch (error) {
            console.error(
                "Errore durante l'inserimento di MappaControllo:",
                error
            );
           throw error;
        }
        
      },
      updateAbilitatoMappaControllo: async ( _,  { ID_Controllo1, ID_Controllo2, Abilitato },   { dataSources }  ) => {
        try {
         
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
    
    },
    
};