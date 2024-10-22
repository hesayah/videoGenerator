import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";
import ffmpeg from 'fluent-ffmpeg';

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
  
export const generateVoiceObject = async (
      text: string,
      outPut: string,
    ): Promise<{ audioSrc : string, duration : number}> => { // Modifié pour retourner un objet avec le nom du fichier et la durée
      return new Promise<{ audioSrc : string, duration: number }>(async (resolve, reject) => {
        try {
          const audio = await client.generate({
            // voice: "H1JjD7OHmS3KIOu5PDkI", // English voice
            // voice : "1jvabdf5R1HNQ4XtskKe", // Arab Voice 
            // voice : "pCFUI8NKdn1YbzEjbkkM", // French Voice
            //  voice : "a5n9pJUnAhX4fn7lx3uo", // French Martin profond,
            // voice :  "FNOttooGMYDRXmqkQ0Fz", // French Martin aimable
            // voice : "kwhtGjoy1GnlkZUxfoUC", // Marcurs Multi
            // voice : "Qrl71rx6Yg8RvyPYRGCQ", // Guillaum
            // voice : "b40q94MErxP9aasHjJ2w", // French Jeremy
            // voice : 'WUAdt1wuIPYQ1XruI5dW', //Nico Radio
            // voice : "DUnzBkwtjRWXPr6wRbmL", // Turkish test
            voice : "pNInz6obpgDQGcFmaJgB", // Adam Legacy
            model_id: "eleven_turbo_v2_5",
            language_code : "fr",
            text,
            voice_settings: {
              stability: 0.40,
              similarity_boost: 0.70,
              use_speaker_boost: true,
            }
          });
          const audioSrc = `${outPut}`;
          const fileStream = createWriteStream(audioSrc);
    
          audio.pipe(fileStream);
          fileStream.on("finish", () => {
            ffmpeg.ffprobe(audioSrc, (err : any, metadata : any) => {
              if (err) {
                reject(err);
              } else {
                const duration = metadata.format.duration;
                resolve({ audioSrc, duration }); // Résoudre avec le nom du fichier et la durée
              }
            });
          });
          fileStream.on("error", reject);
        } catch (error) {
          reject(error);
        }
      });
};
  