import { RESTDataSource } from "@apollo/datasource-rest";


export class PythonAPI extends RESTDataSource {
    constructor() {
      super();
      this.baseURL = 'http://localhost:5001/'; // o IP se containerizzato
    }
  
    async analizzaTesto(testo: string): Promise<any> {
        console.log('Chiamo il servizio Python');
        const result=
         await this.post('analizza', {
            body: { testo },
            headers: { 'Content-Type': 'application/json' }, // opzionale ma esplicito
          });
          if (!Array.isArray(result)) {
            throw new Error("Risposta non valida dal servizio Python");
          }
        console.log('Risultato=',result);
          return result;
    }
  }