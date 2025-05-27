import { ListingAPI } from "./datasources/listing-api";
import { InferenceSession } from 'onnxruntime-node';

export type DataSourceContext = {
  dataSources: {
   pythonAPI: any;
   // listingAPI: ListingAPI;
   listingAPI: any;
  };
  model?: InferenceSession;  // Aggiunto il modello ONNX
};