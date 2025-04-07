import { ListingAPI } from "./datasources/listing-api";
import { InferenceSession } from 'onnxruntime-node';

export type DataSourceContext = {
  dataSources: {
   // listingAPI: ListingAPI;
   listingAPI: any;
  };
  model?: InferenceSession;  // Aggiunto il modello ONNX
};