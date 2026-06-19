import cron from 'node-cron';
import { ScriptAddPhoto } from '../scripts/add-photo-script.ts';
import { ScriptDeletePhotos } from '../scripts/check-deleted-photos-script.ts';

export class JobPhotos{
    static async exec (){
        

        const CRON_ADD_PHOTO = process.env.CRON_ADD_PHOTO || '*/30 6-20 * * 1-6'   
        let inExec = false;
                console.log("[V] Tarefa de adicionar fotos agendada com sucesso!");
                console.log(CRON_ADD_PHOTO);
        
        cron.schedule( CRON_ADD_PHOTO , async () => {

            if (inExec) {
                console.log("[X] Tarefa de adicionar fotos ainda em execução.");
                return;
            }

            try {
                inExec = true;
                await ScriptAddPhoto.exec();
                 await ScriptDeletePhotos.exec();
                
            } catch (e) {
                console.error("Erro na tarefa de  adicionar fotos ", e);
            } finally {
                inExec = false;
            }
            
       });
        
    }
}