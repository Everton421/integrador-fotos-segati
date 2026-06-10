 import path from 'node:path';
import { conn2, db_publico } from '../database/mysql-connection.ts';
import fs from 'node:fs/promises'


type resultVerifyPhoto = { SEQ:number, FOTO:string,PRODUTO:number}

 

export class CheckDeletedPhotos { 

    static async verify(code:number,pathPhotos:string){
   
         const pastaMonitorada = path.resolve(pathPhotos);
         const datafolder = await fs.readdir(pastaMonitorada)

          const [ resultVerifyPhotoProduct ] = await conn2.query(`SELECT SEQ ,PRODUTO, FOTO FROM ${db_publico}.fotos_prod  
             where PRODUTO = '${code}' ;`);

                         const arrVerifyPhoto = resultVerifyPhotoProduct as resultVerifyPhoto[];

                          if(arrVerifyPhoto.length > 0 ){
                            for(const photo of arrVerifyPhoto){


                                    const photofiltered =   datafolder.filter(   (photofolder)  =>{ 
                                        photofolder == photo.FOTO ? photo.FOTO : null
                                        if(photofolder == photo.FOTO){
                                            return photo.FOTO;
                                        }else{
                                            return null;
                                        }
                                    })
                                    
                                    if(photofiltered.length > 0 ){
                                            console.log(`[V] Foto encontrada ${photo.FOTO}... `);
                                        continue;
                                    }else{
                                            console.log(`[X] Foto ${photo.FOTO} não foi encontrada na pasta, efetuando exclusão`);
                                        await conn2.query(`DELETE FROM ${db_publico}.fotos_prod WHERE PRODUTO = '${photo.PRODUTO}' AND SEQ = '${photo.SEQ}' AND FOTO= '${photo.FOTO}' `)
                                    }
                                }
                            }else{
                                
                                console.log(`[X] produto ${code} esta sem foto.`)

                            }
    }
}
