import { AddPhotoProduct } from "../class/add-photo-product.ts";
import { conn2, db_vendas } from "../database/mysql-connection.ts";

type resultPathPhotosErp = {
    FOTOS:string
}

export class ScriptAddPhoto{
    static async  exec(){
      const [ resultPathPhotosErp ] = await conn2.query(`SELECT cast(FOTOS AS CHAR(10000) CHARACTER SET latin1 ) as FOTOS FROM ${db_vendas}.parametros;`) 
      const PathPhotosErp = resultPathPhotosErp as resultPathPhotosErp[];


        await AddPhotoProduct.add(PathPhotosErp[0].FOTOS);
    }
}

