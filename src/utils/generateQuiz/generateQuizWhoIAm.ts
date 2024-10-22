import { generateBackgroundProps } from "@/src/remotion/compositions/constData";
import { backGroundProps, elementQuizWhoIAm, preElementQuizWhoIAm, WhoIAmAnswer } from "@/src/remotion/compositions/interfaces";
import { backgroundsData } from "@/src/remotion/compositions/constData";
import { generateVoiceObject } from "@/src/utils/generateFromIa/generateFromElevenLabs/generateVoice";
import { preGenerateQuizWhoIAm } from "../generateFromIa/generateFromOpenAi/preGenerateQuizWhoIAm";
import { generateImageFromPrompt } from "../generateFromIa/generateFromMidjourney/generateImage";
import prisma from "@/src/utils/prisma";
import path from "path";
import fs from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';

// Fonction utilitaire pour obtenir un élément aléatoire d'un tableau
function getRandomElement<T>(arr: T[]): T {
  try {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  } catch (error) {
    console.error("Erreur lors de l'obtention d'un élément aléatoire:", error);
    throw new Error("L'obtention d'un élément aléatoire a échoué.");
  }
}

// Sentences pour les hooks et les appels à l'action
const hookSentences = [
  "Trop fort si tu trouves direct ! 💪",
  "Devine si t'es chaud ! 🔥",
  "Qui suis-je, t'as une idée ? 🤔",
  "Ça va te faire transpirer ! 😅",
  "Percer le mystère, t'oses ? 👊",
  "Prêt à deviner ou quoi ? 🚀",
  "Montre ta force, devine ! 💥",
  "Trouve mon secret, si tu peux ! 🏅",
  "Défi ultime, t'es prêt ? 🏆",
  "Pas pour les fragiles ! 💪",
  "Défie-toi, qui je suis ? 🥇"
];

const ctaSentences = [
  "N'oublie pas de t'abonner ! ⭐️👍🔔",
  "Rejoins-nous et ne manque rien ! 🚀✨",
  "Abonne-toi pour plus de fun ! 🎉😄",
  "Clique sur s'abonner pour ne rien rater ! 📢🔔",
  "Deviens un pro, abonne-toi ! 🏆📚",
  "Reste à jour, abonne-toi maintenant ! 🕒🔔",
  "Aide-moi à financer mon mariage, abonne-toi ! 💍😂",
  "Ne rate aucune mise à jour, abonne-toi ! 📅🔔",
  "Pour plus de contenu génial, abonne-toi ! 🌟📺",
  "Soutiens-nous en t'abonnant ! 🙌🔔",
  "Rejoins notre communauté, abonne-toi ! 🌐🎉"
];

// Fonction pour créer un nouveau quiz dans la base de données
async function createNewQuiz(generationId: number, characterName: string, hookSentence: string, ctaSentence: string, backGroundProps: backGroundProps) {
  try {
    const newQuiz = await prisma.quizWhoIAm.create({
      data: {
        characterName: characterName,
        hookSentence: hookSentence,
        ctaSentence: ctaSentence,
        answer: '',
        hookSenteceAudioProps: '',
        backGroundProps: JSON.stringify(backGroundProps),
        generationId: generationId
      },
    });

    const audioDir = path.join(process.cwd(), 'public', 'QuizWhoIAm', newQuiz.uuid);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    const audioProps = await generateVoiceObject(hookSentence, path.join(audioDir, `hookSentence.mp3`));
    const hookSenteceAudioProps = {
      audioSrc: path.join('QuizWhoIAm', newQuiz.uuid, `hookSentence.mp3`),
      duration: audioProps.duration
    }
    // Mettre à jour la réponse avec la vraie valeur
    const updatedAnswer = await generateWhoIAmAnswer(characterName, newQuiz.uuid);

    return await prisma.quizWhoIAm.update({
      where: { id: newQuiz.id },
      data: {
        answer: JSON.stringify(updatedAnswer),
        hookSenteceAudioProps: JSON.stringify(hookSenteceAudioProps),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création d'un nouveau quiz:", error);
    throw new Error("La création du nouveau quiz a échoué.");
  }
}

// Fonction pour générer les éléments du quiz
async function generateQuizElements(preQuiz: preElementQuizWhoIAm[], quizUuid: string): Promise<elementQuizWhoIAm[]> {
  const outDir = path.join(process.cwd(), 'public', 'QuizWhoIAm', quizUuid);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const quizElements: elementQuizWhoIAm[] = [];
  try {
    const len = preQuiz.length;
    for (let index = 0; index < len; index++) {
      const quiz = preQuiz[index];
      console.log(quiz)
      const audioProps = await generateVoiceObject(quiz.fact, path.join(process.cwd(), 'public', 'QuizWhoIAm', quizUuid, `audio_${index}.mp3`));
      const formatedAudioProps = {
        audioSrc: path.join('QuizWhoIAm', quizUuid, `audio_${index}.mp3`),
        duration: audioProps.duration,
        captions : []
      }
      quizElements.push({
        ...quiz,
        audioProps: formatedAudioProps,
      });
    }
    return quizElements;
  } catch (error) {
    console.error("Erreur lors de la génération des éléments du quiz:", error);
    throw new Error("La génération des éléments du quiz a échoué.");
  }
}

// Fonction pour sauvegarder les éléments du quiz dans la base de données
async function saveQuizElements(quiz: elementQuizWhoIAm[], quizWhoIAmId: number): Promise<void> {
  try {
    for (let index = 0; index < quiz.length; index++) {
      const quizItem = quiz[index];
      await prisma.elementQuizWhoIAm.create({
        data: {
          fact: quizItem.fact,
          audioProps: JSON.stringify(quizItem.audioProps),
          quizWhoIAmId: quizWhoIAmId,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des éléments du quiz:", error);
    throw new Error("La sauvegarde des éléments du quiz a échoué.");
  }
}

async function generateWhoIAmAnswer(characterName: string, quizUuid: string): Promise<WhoIAmAnswer> {
  try {
    const formatedCharacterName = characterName.replace(/\s*\(.*?\)/, '');
    const revelation = `Je suis : ${formatedCharacterName}!`
    const prompt = `
            generate the following character: "${characterName}",
            Style: "realistic",
            Context: "revelation",
            Character Design: "colorful,
            Lighting: "soft and natural lighting",
            Quality : FullHD,
            --niji 6 --s 450 --ar 9:16
        `
    const imageUrl = await generateImageFromPrompt(prompt);
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();
    const dir = path.join(process.cwd(), 'public', 'QuizWhoIAm', quizUuid);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const webpImagePath = path.join(dir, `revelation.webp`);
    await sharp(imageBuffer).webp().toFile(webpImagePath);
    const audioProps = await generateVoiceObject(revelation, path.join(dir, `audio_answer.mp3`));

    const formatedAudioProps = {
      audioSrc: path.join('QuizWhoIAm', quizUuid, `audio_answer.mp3`),
      duration: audioProps.duration,
      captions : []
    }

    return {
      imgSrc: path.join('QuizWhoIAm', quizUuid, `revelation.webp`),
      audioProps: formatedAudioProps
    };
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse WhoIAm:", error);
    throw new Error("La génération de la réponse WhoIAm a échoué.");
  }
}

export const generateQuizWhoIAmProps = async (): Promise<string> => {
  try {
    const characters = await prisma.characterName.findMany({
      where: { used: false },
      orderBy: { id: 'asc' }
    });

    if (!characters || characters.length === 0) {
      throw Error("Aucun nom de personnage disponible.");
    }

    const character = getRandomElement(characters);
    if (!character) {
      throw Error("Erreur lors de la sélection d'un personnage.");
    }

    await prisma.characterName.update({
      where: { id: character.id },
      data: { used: true },
    });

    const hookSentence = getRandomElement(hookSentences);
    const ctaSentence = getRandomElement(ctaSentences);
    const backGroundProps = generateBackgroundProps(backgroundsData);

    const generation = await prisma.generation.create({
      data: {
        compositionId: "QuizWhoIAm",
      },
    });

    const newQuiz = await createNewQuiz(generation.id, character.characterName, hookSentence, ctaSentence, backGroundProps);
    const preQuiz = await preGenerateQuizWhoIAm(newQuiz.characterName);
    const quizElements = await generateQuizElements(preQuiz, newQuiz.uuid);

    await saveQuizElements(quizElements, newQuiz.id);

    console.log("characterName:", newQuiz.characterName);
    console.log("L'Answer est :", JSON.stringify(newQuiz.answer));
    console.log("Phrase d'accroche:", newQuiz.hookSentence);
    console.log("Phrase d'appel à l'action:", newQuiz.ctaSentence);
    console.log("Propriétés de l'arrière-plan:", JSON.stringify(newQuiz.backGroundProps));
    console.log("Éléments du quiz générés:", JSON.stringify(quizElements));

    return generation.uuid;
  } catch (error) {
    console.error("Erreur lors de la génération des propriétés du quiz WhoIAm:", error);
    throw new Error("La génération des propriétés du quiz WhoIAm a échoué.");
  }
};