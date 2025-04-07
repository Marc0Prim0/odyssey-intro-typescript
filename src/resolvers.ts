
import { Resolvers } from "./types";
import pool from './db';
import * as ort from 'onnxruntime-node';  // Importa ONNX Runtime
import { QueryResolvers } from "./types"; // Assicurati di avere il tipo QueryResolvers
import { DataSourceContext } from "./context";
//import {BertTokenizer} from "bert-tokenizer";
let model: ort.InferenceSession | null = null;

// Funzione per caricare il modello ONNX
async function loadModel() {
  try {
    model = await ort.InferenceSession.create("./all-MiniLM-L6-v2/onnx/model_quantized.onnx");
    console.log("Modello ONNX caricato con successo.");
      // Stampa i nomi e i tipi degli input
      console.log("Nomi degli input:", model.inputNames);
      
  } catch (error) {
    console.error("Errore durante il caricamento del modello ONNX:", error);
  }
}
// Funzione per calcolare la similarità del coseno
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, value, index) => sum + value * vecB[index], 0);
  const normA = Math.sqrt(vecA.reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt(vecB.reduce((sum, value) => sum + value * value, 0));
  return dotProduct / (normA * normB);
};

const max_length = 200;
const pad = (arr: number[], maxLength: number) => {
    while (arr.length < maxLength) arr.push(0);
    return arr;
};

// Tokenizzazione con padding
const tokenizer = (text: string) => {
  let tokens = [101, ...text.split(' ').map(word => word.length), 102];
  tokens = pad(tokens, max_length);

  return {
    input_ids: tokens,
    attention_mask: pad(Array(tokens.length).fill(1), max_length),
    token_type_ids: pad(Array(tokens.length).fill(0), max_length)
  };
};

const prepareFeeds = (text: string) => {
  const { input_ids, attention_mask, token_type_ids } = tokenizer(text);

  // Aggiungi la dimensione batch (rango 2)
  const batchInputIds = [input_ids];
  const batchAttentionMask = [attention_mask];
  const batchTokenTypeIds = [token_type_ids];

  // Appiattisci gli array bidimensionali
  const flattenedInputIds = batchInputIds.flat();
  const flattenedAttentionMask = batchAttentionMask.flat();
  const flattenedTokenTypeIds = batchTokenTypeIds.flat();

  // Creiamo i tensori per il modello con la forma corretta

const inputTensor = new ort.Tensor('int64', BigInt64Array.from(flattenedInputIds.map(BigInt)), [1, input_ids.length]);
const attentionMaskTensor = new ort.Tensor('int64', BigInt64Array.from(flattenedAttentionMask.map(BigInt)), [1, attention_mask.length]);
const tokenTypeIdsTensor = new ort.Tensor('int64', BigInt64Array.from(flattenedTokenTypeIds.map(BigInt)), [1, token_type_ids.length]);

  return {
    input_ids: inputTensor,
    attention_mask: attentionMaskTensor,
    token_type_ids: tokenTypeIdsTensor,
  };
};

const getEmbedding = async (text: string): Promise<number[]> => {
  const feeds = prepareFeeds(text);  // Assicurati che questa funzione restituisca i giusti feeds
  const results = await model.run(feeds); // Chiamata al modello ONNX
  
  const embedding:any = results[model.outputNames[0]].data; // Ottieni l'output dal modello
  
  // Usa Array.from per convertire l'output in un array di numeri
  return Array.from(embedding);  // Converte l'output in un array di numeri
};
// Funzione per confrontare due testi e restituire un codice di affinità
const compareTexts = async (text1: string, text2: string): Promise<number> => {
  try {
    const embedding1 = await getEmbedding(text1);
    const embedding2 = await getEmbedding(text2);
 
    console.log(embedding1.length, embedding2.length);
    console.log(embedding1.some(isNaN), embedding2.some(isNaN));

    const similarity = cosineSimilarity(embedding1, embedding2);
    console.log('SIMILARITà calcolata= ', similarity);

    return similarity;
  } catch (error) {
    console.error('Errore nel confronto dei testi:', error);
    throw new Error('Errore nel confronto dei testi');
  }
};

// Carica il modello all'avvio
loadModel();

export const resolvers: Resolvers = {
    Query: {
        // Nuovo resolver per la predizione ONNX
        predict: async (_, { inputData }: {  inputData: string[] }, context: DataSourceContext): Promise<number> => {
          if (!model) {
            throw new Error("Modello ONNX non caricato.");
          
          }else{
         
            console.log('Numero di stringhe in input', inputData.length);
            console.log('Testo 1=', inputData[0]);
            console.log('Testo 2=', inputData[1]);
          }
          try {
            console.log('AFFINITà da caalcolare.... ');
            const affinity = await compareTexts(inputData[0], inputData[1]);
          //const affinity = await compareTexts('pirla che sei', 'pirlotto non dirlo a marzabotto');
            console.log('AFFINITà calcolata= ',affinity);
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
      insertAssociazioneMappaControllo: async ( _,{ ID_Controllo1, ID_Controllo2 },   { dataSources }   ) => {
        try {
               
            const mappaControlloAggiornata = 
              await dataSources.listingAPI.insertMappaControllo(
                ID_Controllo1,
                ID_Controllo2,
                true
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