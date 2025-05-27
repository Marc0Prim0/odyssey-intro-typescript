import { RESTDataSource } from "@apollo/datasource-rest";

export class PythonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:5001/'; // o IP se containerizzato
  }

  async analizzaTesto(testo: string): Promise<any> {
    try {
      console.log('Chiamo il servizio Python');
      const result = await this.post('analizza', {
        body: { testo },
        headers: { 'Content-Type': 'application/json' }, // opzionale ma esplicito
      });

      // Log della risposta raw per il debug
      console.log('Risultato raw:', result);

      // Controllo se la risposta è un oggetto valido
      if (typeof result !== 'object' || result === null) {
        throw new Error("Risposta non valida dal servizio Python");
      }

      console.log('Risultato:', result);
      return result;

    } catch (error) {
      // Log dell'errore nel caso di fallimento della chiamata
      console.error('Errore nella chiamata al servizio Python:', error);
      throw new Error('Errore nella comunicazione con il servizio Python');
    }
  }
/*
  async separaTesto(testo: string): Promise<any> {
    try {
      console.log('Chiamo il servizio Python');
      const result = await this.post('separa', {
        body: { testo },
        headers: { 'Content-Type': 'application/json' }, // opzionale ma esplicito
      });

      // Log della risposta raw per il debug
      console.log('Risultato raw:', result);

      // Controllo se la risposta è un oggetto valido
      if (typeof result !== 'object' || result === null) {
        throw new Error("Risposta non valida dal servizio Python");
      }

      console.log('Risultato:', result);
      return result;

    } catch (error) {
      // Log dell'errore nel caso di fallimento della chiamata
      console.error('Errore nella chiamata al servizio Python:', error);
      throw new Error('Errore nella comunicazione con il servizio Python');
    }
  }
  */
}
