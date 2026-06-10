import path from 'node:path';
import test, { describe } from 'node:test';


import { CheckDeletedPhotos } from '../class/check-deleted-photo.ts';
 
 

describe("teste fotos", ()=>{

test.it('', async  ()=>{

})

 
test.it('', async  ()=>{
    
       const pathTest =  path.resolve(import.meta.dirname, '../../imgs');
        
    CheckDeletedPhotos.verify(1, pathTest)

                                   
})



})

/*

// Inicializa o "Watcher" (Vigilante)
const watcher =  watch(pastaMonitorada, {
    ignored: /(^|[\/\\])\../, // Ignora arquivos ocultos
    persistent: true,
    awaitWriteFinish: { // Espera o arquivo terminar de ser copiado/baixado totalmente
        stabilityThreshold: 2000,
        pollInterval: 100
    },
});

// Evento disparado quando um novo arquivo é adicionado
watcher.on('add', (filePath) => {
    const fileName = path.basename(filePath);
    console.log(`\n--- Novo arquivo detectado: ${fileName} ---`);

    try {
        // 1. Extrair o código de referência
        // Supondo que o nome seja "CODIGO_NOME.jpg"
        const codigoReferencia = fileName.split('_')[0].split('.')[0];
        
        console.log(`Código de Referência Identificado: ${codigoReferencia}`);

        // 2. Simular integração com seu sistema (Pode ser uma chamada de API ou SQL)
        processarFoto(codigoReferencia, filePath, fileName);

    } catch (error) {
        console.error(`Erro ao processar ${fileName}:`, error.message);
    }
});


function processarFoto(codigo, caminhoOrigem, nomeArquivo) {
    // Aqui você faria o seu código de envio (Upload para S3, API, Banco de Dados, etc)
    console.log(`Integrando foto do produto ${codigo} ao sistema...`);

    // 3. Mover para a pasta de processados para limpar a entrada
    const caminhoDestino = path.join(pastaProcessados, nomeArquivo);
    
    fs.rename(caminhoOrigem, caminhoDestino, (err) => {
        if (err) throw err;
        console.log(`Sucesso: Arquivo movido para ${pastaProcessados}`);
    });
}
*/