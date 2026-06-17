import { conn2, db_publico } from "../database/mysql-connection.ts"
    import path from 'node:path';
import fs from 'node:fs/promises'


type resultProduct = {CODIGO:number, OUTRO_COD:string, NUM_ORIGINAL:string}

type resultVerifyPhoto = { SEQ:number, FOTO:string,PRODUTO:number}


export class AddPhotoProduct {


    static async add(PathPhotosErp:string){
    const SQL = `SELECT CODIGO, OUTRO_COD, NUM_ORIGINAL  FROM ${db_publico}.cad_prod WHERE ATIVO = 'S' AND NUM_ORIGINAL <> '' AND NUM_ORIGINAL IS NOT NULL ;`

      const [ resultProducts ] = await conn2.query(SQL)  

    const dirName = import.meta.dirname;

    //const pastaMonitorada = path.resolve(dirName,'../../imgs');
    
    const pastaMonitorada = path.resolve(PathPhotosErp);
    
    const products = resultProducts as resultProduct[];
    
   const datafolder = await fs.readdir(pastaMonitorada)
                        
   console.log(`[*] Iniciando vinculo de fotos...`)
   
   
   console.log(`[*] verificando ${products.length} produtos ....`);
   const processed = []

     for(const product  of products){
        console.log(`[V] Verificando produto ${product.CODIGO}.`);
          const photosFolder = datafolder.filter(( i )=>{ 
                     if(i.startsWith(`${product.NUM_ORIGINAL}-`)   ){
                         return i;
                     };
                 })
 
                        for(const photo of photosFolder){
                            
                            const [ resultMaxSequenc ] = await conn2.query(`SELECT MAX(SEQ) SEQ  FROM ${db_publico}.fotos_prod where PRODUTO = '${product.CODIGO}';`);
                            const maxSequenc = resultMaxSequenc as [{SEQ:number}]      
                            const seq = maxSequenc[0].SEQ && maxSequenc[0].SEQ > 0  ? maxSequenc[0].SEQ + 1 : 1 

                          const [ resultVerifyPhotoProduct ] = await conn2.query(`SELECT SEQ ,PRODUTO, FOTO FROM ${db_publico}.fotos_prod 
                           where PRODUTO = '${product.CODIGO}' AND FOTO = '${photo}';`);

                         const arrVerifyPhoto = resultVerifyPhotoProduct as resultVerifyPhoto[];
                            if(arrVerifyPhoto.length > 0 ){
                                console.log(`Foto ${photo} já foi registrada.`)
                            }else{
                                
                                const sqlInsert = `INSERT INTO ${db_publico}.fotos_prod set produto = '${product.CODIGO}', 
                                    seq = '${seq}', descricao = '${product.NUM_ORIGINAL}', FOTO = '${photo}';`;

                                const [ resultInsert ] = await conn2.query(sqlInsert)

                            }
                             
                         }
                         processed.push(product),
                         console.log(`[V] Processando ${processed.length} de ${products.length} ...`)
            }
   console.log(`[V] Fim da validação,   Total Processado ${processed.length}.`);
 
    } 
}