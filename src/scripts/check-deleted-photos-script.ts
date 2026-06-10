import { CheckDeletedPhotos } from "../class/check-deleted-photo.ts";
import { conn2, db_publico, db_vendas } from "../database/mysql-connection.ts";


type resultPathPhotosErp = {
    FOTOS:string
}



type resultarrCad_prod = {
    CODIGO:number
}

export class ScriptDeletePhotos{
    static async exec(){
      const [ resultPathPhotosErp ] = await conn2.query(`SELECT cast(FOTOS AS CHAR(10000) CHARACTER SET latin1 ) as FOTOS FROM ${db_vendas}.parametros;`) 
      const arrPathPhotosErp = resultPathPhotosErp as resultPathPhotosErp[];

      //caminho das fotos do sistema.
    const { FOTOS } =arrPathPhotosErp[0]
    console.log(`[*] Iniciando verificação dos produtos sem foto.`);

     const [arrCad_prod] = await conn2.query(`SELECT cp.CODIGO 
                            FROM  
                            ${db_publico}.cad_prod cp 
                            join ${db_publico}.fotos_prod fp on fp.PRODUTO = cp.CODIGO
                            WHERE cp.ATIVO = 'S'
                            group by cp.CODIGO;`);

    const cad_prod = arrCad_prod as resultarrCad_prod[];
    const total =cad_prod.length;

    console.log(`[*] ${total} produtos encontrados...`);

    const processed = []
    for(const product of cad_prod){

        await CheckDeletedPhotos.verify(product.CODIGO, FOTOS)
        processed.push(product.CODIGO);
        console.log(`[V] Processando ${processed.length } de ${total}... `)
    }   
console.log(`[V] Total de itens verificados ${processed.length}...`)

    }
}

