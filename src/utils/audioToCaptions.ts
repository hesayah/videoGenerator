import path from "path";
import { exec } from "child_process";
import { transcribe, convertToCaptions } from "@remotion/install-whisper-cpp";

type TranscribeOptions = {
  inputPath: string;
  combineTokensWithinMilliseconds?: number;
};

const convertToWav = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${inputPath} -ar 16000 ${outputPath} -y`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const transcribeAudio = async ({
  inputPath,
  combineTokensWithinMilliseconds = 200,
}: TranscribeOptions) => {
  const to = path.join(process.cwd(), "whisper.cpp");
  const wavPath = path.join(process.cwd(), "temp.wav");

  // Convert to .wav format
  await convertToWav(inputPath, wavPath);

  const { transcription } = await transcribe({
    model: "medium",
    whisperPath: to,
    inputPath: wavPath,
    language: "French",
    tokenLevelTimestamps: true,
  });

  const { captions } = convertToCaptions({
    transcription,
    combineTokensWithinMilliseconds,
  });

  return captions;
};