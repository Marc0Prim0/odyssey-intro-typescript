import { RESTDataSource } from "@apollo/datasource-rest";
import { Listing, Amenity,Normativa,Controllo, CategoriaControllo,MappaRelazione,MappaControllo } from "../types";
import pool from '../db';  // Percorso relativo al file db.ts
import { log } from "console";


export class ListingAPI extends RESTDataSource {
  
  baseURL = "https://rt-airlock-services-listing.herokuapp.com/";
  getFeaturedListings(): Promise<Listing[]> {
    return this.get<Listing[]>("featured-listings");
  }
  getListing(listingId: string): Promise<Listing> {
    return this.get<Listing>(`listings/${listingId}`);
  }
  getAmenities(listingId: string): Promise<Amenity[]> {
    return this.get<Amenity[]>(`listings/${listingId}/amenities`);
  }


  getListNormative = async (): Promise<Normativa[]> => {
     // Esegui la query e stampa il risultato con then()
      return pool.query<Normativa>(
        'SELECT  '+
          ' normative."ID_Normativa" , '+
          ' normative."Codice", '+
          ' normative."Descrizione", '+
          ' normative."Titolo", '+
          '  COUNT(controlli."ID_Controllo") AS numero_controlli '+
          '  FROM '+
          '    normative '+
          ' LEFT JOIN '+
          '     controlli  ON controlli."ID_NormativaRiferimento" =normative."ID_Normativa" '+
          ' GROUP BY '+
          '     normative."ID_Normativa", '+
          '     normative."Codice", '+
          '     normative."Descrizione", '+
          '     normative."Titolo"; '
        )
      .then(result => {
        //console.log("Ecco le rows:", result.rows);
        return result.rows;
      })
      .catch(error => {
        console.error("Error fetching normative:", error);
        throw error;
      });
  }
  getListControlli = async (): Promise<Controllo[]> => {
    // Esegui la query e stampa il risultato con then()
     return pool.query<Controllo>('SELECT * FROM controlli')
     .then(result => {
       //console.log("Ecco le rows:", result.rows);
       return result.rows;
     })
     .catch(error => {
       console.error("Error fetching normative:", error);
       throw error;
     });
  }
  
  async getListControlliByNormativa(ID_NormativaRiferimento: string): Promise<Controllo[]> {
    // Esegui la query e stampa il risultato con then()
    return pool.query<Controllo>(
      ' SELECT CTL.*,categoriecontrollo."Nome" as "CategoriaNome", normative."Codice" as "NormativaCodice" FROM controlli as CTL '+
      ' left join categoriecontrollo on categoriecontrollo."ID_Categoria"=CTL."ID_Categoria"  '+
      ' left join normative on normative."ID_Normativa" =CTL."ID_NormativaRiferimento"  '+
      ' where CTL."ID_NormativaRiferimento" ='+ID_NormativaRiferimento)
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching normative:", error);
      throw error;
    });
  }
  async getListMappaByNormative(ID_NormativaMaster: string, ID_NormativaLinked: string): Promise<MappaRelazione[]> {
    // Esegui la query e stampa il risultato con then()
    return pool.query<MappaRelazione>('SELECT * FROM mappa_relazioni where ("ID_Normativa_Master" = '+ID_NormativaMaster+' AND  "ID_Normativa_Linked" = '+ID_NormativaLinked+') OR  ("ID_Normativa_Master" = '+ID_NormativaLinked+' AND  "ID_Normativa_Linked" = '+ID_NormativaMaster+')')
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching normative:", error);
      throw error;
    });
  }
  async getListMappaByNormativa(ID_Normativa: string): Promise<MappaRelazione[]> {
    // Esegui la query e stampa il risultato con then()
    return pool.query<MappaRelazione>('SELECT * FROM mappa_relazioni where ("ID_Normativa_Master" = '+ID_Normativa+') OR  ("ID_Normativa_Linked" = '+ID_Normativa+')')
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching normative:", error);
      throw error;
    });
  }
  async listRelazioniByControllo(ID_Controllo: string): Promise<Controllo[]> {
    // Esegui la query e stampa il risultato con then()

    return pool.query<Controllo>('SELECT * FROM controlli where "ID_NormativaRiferimento" = '+ID_Controllo)
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching normative:", error);
      throw error;
    });
  }


  async getCategoriaById(ID_CategoriaControllo: string): Promise<CategoriaControllo[]> {
    return pool.query<CategoriaControllo>('SELECT * FROM categoriecontrollo where "ID_Categoria" = '+ID_CategoriaControllo)
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching categorie:", error);
      throw error;
    });
  }

  async getControlliById(ID_Controllo: string): Promise<Controllo[]> {
    return pool.query<Controllo>(
      ' SELECT MP."Abilitato" ,CTL.*,categoriecontrollo."Nome" as "CategoriaNome", normative."Codice" as "NormativaCodice" FROM controlli as CTL '+
      ' left join categoriecontrollo on categoriecontrollo."ID_Categoria"=CTL."ID_Categoria"  '+
      ' left join normative on normative."ID_Normativa" =CTL."ID_NormativaRiferimento"  '+
      ' left join mappacontrolli MP  on MP.id_controllo2 = CTL."ID_Controllo"  '+
      ' where MP.id_controllo1=  '+ID_Controllo+
      ' union '+
      ' SELECT MP."Abilitato" ,CTL.*,categoriecontrollo."Nome" as "CategoriaNome", normative."Codice" as "NormativaCodice" FROM controlli as CTL '+
      ' left join categoriecontrollo on categoriecontrollo."ID_Categoria"=CTL."ID_Categoria"  '+
      ' left join normative on normative."ID_Normativa" =CTL."ID_NormativaRiferimento"  '+
      ' left join mappacontrolli MP  on MP.id_controllo1 = CTL."ID_Controllo"  '+
      ' where MP.id_controllo2=  '+ID_Controllo
/*
          'SELECT * FROM controlli CR inner join mappacontrolli MP '+
          ' on MP.id_controllo2 = CR."ID_Controllo" '+
          ' where '+
          ' MP.id_controllo1= '+ID_Controllo+
          ' union '+
          ' SELECT * FROM controlli CR inner join mappacontrolli MP '+
          ' on MP.id_controllo1 = CR."ID_Controllo" '+
          ' where  '+
          ' MP.id_controllo2= '+ID_Controllo
*/
    )
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching categorie:", error);
      throw error;
    });
  }
  async getNormativaById(ID_Normativa: string): Promise<Normativa[]> {
   // console.log("getNormativaById fetching ID_Normativa:", ID_Normativa);
    return pool.query<Normativa>(
          'SELECT * FROM normative Where "ID_Normativa"='+ID_Normativa
    )
    .then(result => {
      //console.log("Ecco le rows:", result.rows);
      return result.rows;
    })
    .catch(error => {
      console.error("Error fetching categorie:", error);
      throw error;
    });
  }
  async patchMappaControllo(ID_Controllo1:string, ID_Controllo2:string, Abilitato: boolean) {
   // console.log('patchMappaControllo fetching input:', Abilitato);
    try {
      let query = 'UPDATE mappacontrolli SET "Abilitato" = $3 '+
      ' WHERE (id_controllo1 = $1 OR id_controllo1 = $2)  AND (id_controllo2 = $2 OR id_controllo2 = $1) RETURNING *';
      const values = [ID_Controllo1, ID_Controllo2, Abilitato];
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        console.log('null');
        return null;
      }
     // console.log('RESULT=',result.rows[0]);
      const row = result.rows[0];
      return {
       
        ID_Controllo1: row.id_controllo1, // Mappa id_controllo1 a ID_Controllo1
        ID_Controllo2: row.id_controllo2, // Mappa id_controllo2 a ID_Controllo2
        Abilitato: row.Abilitato,
        ID_Mappa: row.id_mappa, // Assicurati che questo campo sia mappato correttamente
      }
    } catch (error) {
      console.error(
        'Errore durante l\'aggiornamento di MappaControlli nel database:',
        error
      );
      throw error;
    }
  

  }

  async insertMappaControllo(ID_Controllo1:string, ID_Controllo2:string, Abilitato: boolean,Affinita:string) {
    try {
      let query =  'INSERT INTO mappacontrolli (id_controllo1, id_controllo2, "Abilitato","Affinita") VALUES ($1, $2, $3, $4) RETURNING id_mappa';
      const values = [ID_Controllo1, ID_Controllo2, Abilitato,parseFloat(Affinita)];


      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        console.log('null');
        return null;
      }
     // console.log('RESULT=',result.rows[0]);
      const row = result.rows[0];
     // console.log('ID_Controllo1,ID_Controllo2,ID_Mappa= '+row.id_controllo1+', '+row.id_controllo2+', '+row.id_mappa);
      return {
       
        ID_Controllo1: ID_Controllo1, // Mappa id_controllo1 a ID_Controllo1
        ID_Controllo2: ID_Controllo2, // Mappa id_controllo2 a ID_Controllo2
        Abilitato: true,
        ID_Mappa: row.id_mappa, // Assicurati che questo campo sia mappato correttamente
      
      }

    } catch (error) {
      console.error(
        'Errore durante l\'aggiornamento di MappaControlli nel database:',
        error
      );
      throw error;
    }
  }
  
  async deleteAssociazioneControlli(ID_Controllo1:string, ID_Controllo2:string, Abilitato: boolean) : Promise<boolean>{
    //onsole.log('deleteAssociazioneControlli fetching input:', Abilitato);
    try {
      let query = 'delete from mappacontrolli where ( (id_controllo1 = $1 and  id_controllo2 = $2) or  (id_controllo2 = $1 and  id_controllo1 = $2)) and "Abilitato"=$3 ';
     // ' WHERE (id_controllo1 = $1 OR id_controllo1 = $2)  AND (id_controllo2 = $2 OR id_controllo2 = $1) RETURNING *';
      const values = [ID_Controllo1, ID_Controllo2, Abilitato];
  
      const result = await pool.query(query, values);
  
      if (result.rowCount === 0) {
        console.log('result.rowCount ' , false);
        return false;
      }
    
   
      return  true;
      
    } catch (error) {
      console.error(
        'Errore durante la cancellazione di MappaControlli nel database:',
        error
      );
      throw error;
    }
  

  }

  async getListControlliByNormativaControllo(ID_Controllo: string,ID_Normativa: string): Promise<Controllo[]> {

  
    console.log('getListControlliByNormativaControllo...')
     try {
       let query = 
      ' SELECT '+
      ' MP."Abilitato" , '+
      ' CTL.*, '+
     '  normative."Codice" as "NormativaCodice",  '+
     '  CTL.*,categoriecontrollo."Nome" as "CategoriaNome" '+
     '  FROM controlli as CTL  '+
     '  inner join normative on ( normative."ID_Normativa" =CTL."ID_NormativaRiferimento")   '+
     ' inner join categoriecontrollo on ( categoriecontrollo."ID_Categoria"  =CTL."ID_Categoria")  '+
      '  left join mappacontrolli MP  on  (MP.id_controllo1 = CTL."ID_Controllo" or  MP.id_controllo2 = CTL."ID_Controllo")    '+
      ' and (MP.id_controllo1=  $1 or MP.id_controllo2=  $1)  '+
     ' where CTL."ID_NormativaRiferimento" =$2 ';
       const values = [ID_Controllo,  ID_Normativa];
   
       const result = await pool.query(query, values);
       //console.log('getListControlliByNormativaControllo... result.row', result.rows);
       return  result.rows;
     } catch (error) {
       console.error(
         'Errore durante l\'aggiornamento di MappaControlli nel database:',
         error
       );
       throw error;
     }
  }

}
