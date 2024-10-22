import { generateBackgroundProps, themeQuizData } from "@/src/remotion/compositions/constData";
import { backGroundProps, elementQuizMultiple,  preElementQuizMultiple,themeQuizMultipletForOpenAi } from "@/src/remotion/compositions/interfaces";
import { backgroundsData } from "@/src/remotion/compositions/constData";
import { preGenerateQuizMulitiple } from "../generateFromIa/generateFromOpenAi/preGenerateQuizMultiple";
import { createHooksAndTitlesFromOpenAi } from "../generateFromIa/generateFromOpenAi/preGenerateHooksAndTitles";
import { generateVoiceObject } from "@/src/utils/generateFromIa/generateFromElevenLabs/generateVoice";
import prisma from "@/src/utils/prisma";
import path from "path";
import fs from 'fs'

// Fonction utilitaire pour obtenir un élément aléatoire d'un tableau
function getRandomElement<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function getRandomQuizCategory(): themeQuizMultipletForOpenAi {
  // Fonction utilitaire pour obtenir un certain nombre d'éléments uniques aléatoires dans un tableau
  function getRandomUniqueElements<T>(arr: T[], num: number): T[] {
    const shuffled = arr.slice(); // Copie du tableau original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Échange d'éléments
    }
    return shuffled.slice(0, num); // Retourne les 'num' premiers éléments aléatoires
  }

  // Sélection de 3 thèmes aléatoires
  const randomThemes = getRandomUniqueElements<themeQuizMultipletForOpenAi>(themeQuizData, 7);

  // Extraction des sous-catégories de ces thèmes
  const allSubCategories = randomThemes.flatMap(theme => theme.category.subCategory);

  // Sélection de 7 sous-catégories aléatoires parmi celles disponibles
  const randomSubCategories = getRandomUniqueElements<string>(allSubCategories, 1);

  // Retour de l'objet avec le thème et les sous-catégories sélectionnées
  return {
    theme: JSON.stringify(randomThemes.map(theme => theme.theme)), // Thèmes choisis
    category: {
      name: randomThemes.map(theme => theme.category.name).join(", "), // Noms des catégories choisis
      subCategory: randomSubCategories // Sous-catégories aléatoires choisies
    }
  };
}

const ctaSentences = [
  "Yo, abonne-toi pour kiffer les moves de Murphy, le robot danseur ! 🕺🤖🔥",
  "Tu valides ? Rejoins la team Murphy, abonne-toi direct ! 🎮✨",
  "Murphy, le robot danseur, te met bien ? Clique sur s'abonner ! 🚀🤖😎",
  "T'as kiffé le show de Murphy ? Hop, appuie sur s'abonner ! 💯🔔",
  "Trop de flow avec Murphy ! Fais pas le timide, abonne-toi ! 😜📢",
  "Viens dans la vibe de Murphy, lâche ton like et abonne-toi ! 💥🤖🎉",
  "Hey toi, fan de moves stylés ! Rejoins Murphy et clique sur s'abonner ! 😄✌️",
  "Tu veux rester dans le game avec Murphy, le robot danseur ? Abonne-toi ! 🎮🔥",
  "On rigole bien avec Murphy ! Clique, abonne-toi et c'est parti ! 😂🔔",
  "Murphy est trop stylé, non ? Reviens pour plus en t'abonnant ! 😎🤖🚀",
  "Deviens un pro avec Murphy ! Abonne-toi et prends le lead ! 🧠🏆",
  "On s'éclate avec Murphy, abonne-toi pour encore plus de fun ! 🎉🤖😆",
  "Tu veux suivre les bails de Murphy ? Reste connecté, abonne-toi ! 📲🔔",
  "Rejoins la hype de Murphy, le robot danseur, abonne-toi pour tout voir ! 🔥👀",
  "Soutiens Murphy, abonne-toi et deviens un vrai du crew ! 💪🎬"
];


// Fonction pour créer un nouveau quiz dans la base de données
async function createNewQuiz(generationId : number, themeQuiz: string, hookSentenceAndTitleOpenAi : {hook : string, title : string}, ctaSentence: string, backGroundProps: backGroundProps) {
  try {
    const newQuiz =  await prisma.quizMultiple.create({
      data: {
        themeQuiz: themeQuiz,
        hookSentence: JSON.stringify(hookSentenceAndTitleOpenAi),
        hookSenteceAudioProps : '',
        ctaSenteceAudioProps : '',
        ctaSentence: ctaSentence,
        backGroundProps: JSON.stringify(backGroundProps),
        generationId : generationId
      },
    });
    const outDir = path.join(process.cwd(), 'public', 'QuizMultiple', newQuiz.uuid);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const audioProps = await generateVoiceObject(hookSentenceAndTitleOpenAi.hook, path.join(outDir, `hookSentence.mp3`));
    const hookSenteceAudioProps  = {
      audioSrc :  path.join('QuizMultiple', newQuiz.uuid, `hookSentence.mp3`),
      duration : audioProps.duration
    }
    const ctaAudioProps = await generateVoiceObject(ctaSentence, path.join(outDir, `ctaSentence.mp3`));
    const ctaSenteceAudioProps  = {
      audioSrc :  path.join('QuizMultiple', newQuiz.uuid, `ctaSentence.mp3`),
      duration : ctaAudioProps.duration
    }

    return await prisma.quizMultiple.update({
      where : {
        id : newQuiz.id
      },
      data: {
        hookSenteceAudioProps : JSON.stringify(hookSenteceAudioProps),
        ctaSenteceAudioProps : JSON.stringify(ctaSenteceAudioProps),
        backGroundProps: JSON.stringify(backGroundProps),
      },
    });

  } catch (error) {
    console.error("Erreur lors de la création d'un nouveau quiz:", error);
    throw new Error("La création du nouveau quiz a échoué.");
  }
}

// Fonction pour générer les éléments du quiz
async function generateQuizElements(preQuiz: preElementQuizMultiple[], quizUuid: string): Promise<elementQuizMultiple[]> {

  const outDir = path.join(process.cwd(), 'public', 'QuizMultiple', quizUuid);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const quizElements: elementQuizMultiple[] = [];
  try {

    for (let index = 0; index < preQuiz.length; index++) {
      const quiz = preQuiz[index];
      const audioProps = await generateVoiceObject(quiz.question, path.join(process.cwd(), 'public', 'QuizMultiple', quizUuid, `audio_${index}.mp3`));
      const formatedAudioProps = {
        audioSrc :  path.join('QuizMultiple', quizUuid, `audio_${index}.mp3`),
        duration : audioProps.duration,
      }
      const answer = quiz.options[quiz.correctAnswerIndex]
      const correctAnswerAudioProps = await generateVoiceObject(answer, path.join(process.cwd(), 'public', 'QuizMultiple', quizUuid, `audio_answer_${index}.mp3`));
      const formatedAnserAudioProps = {
        audioSrc :  path.join('QuizMultiple', quizUuid, `audio_answer_${index}.mp3`),
        duration : correctAnswerAudioProps.duration,
      }
      quizElements.push({
        ...quiz,
        imgSrc: "",
        audioProps: formatedAudioProps,
        answerAudioProps : formatedAnserAudioProps,
      });
    }
    return quizElements;
  } catch (error) {
    console.error("Erreur lors de la génération des éléments du quiz:", error);
    throw new Error("La génération des éléments du quiz a échoué.");
  }
}

// Fonction pour sauvegarder les éléments du quiz dans la base de données
async function saveQuizElements(quiz: elementQuizMultiple[], quizMultipleId: number): Promise<void> {
  try {
    for (let index = 0; index < quiz.length; index++) {
      const quizItem = quiz[index];
      await prisma.elementQuizMultiple.create({
        data: {
          question: quizItem.question,
          options: JSON.stringify(quizItem.options), // Utilisation de JSON.stringify ici
          correctAnswerIndex: quizItem.correctAnswerIndex,
          answerAudioProps : JSON.stringify(quizItem.answerAudioProps),
          imgSrc: quizItem.imgSrc,
          audioProps: JSON.stringify(quizItem.audioProps),
          quizMultipleId: quizMultipleId,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des éléments du quiz:", error);
    throw new Error("La sauvegarde des éléments du quiz a échoué.");
  }
}

// Fonction principale pour générer les propriétés du quiz multiple
export const generateQuizMultipleProps = async (): Promise<string> => {
  try {

    const ctaSentence = getRandomElement(ctaSentences);
    console.log("Phrase d'appel à l'action:", ctaSentence);
 
    const backGroundProps = generateBackgroundProps(backgroundsData);
    console.log("Propriétés de l'arrière-plan:", JSON.stringify(backGroundProps));

    let finalTheme = '';
    let usedTheme = true;
    const usedThemes = new Set();
    const maxAttempts =  300; // Limite le nombre de tentatives
    let attempts = 0;
    
    while (usedTheme && attempts < maxAttempts) {
      let randomQuizCategory = getRandomQuizCategory();
      finalTheme = JSON.stringify(randomQuizCategory.category.subCategory);
      if (!usedThemes.has(finalTheme)) {
        let quiz = await prisma.quizMultiple.findFirst({
          where: {
            themeQuiz: finalTheme
          }
        });
    
        if (!quiz) {
          usedTheme = false;
          usedThemes.add(finalTheme);
        }
      }
      attempts++;
    }
    // Gérer le cas où la limite de tentatives est atteinte
    if (attempts >= maxAttempts) {
      throw "Generation quizMultiple impossible, Tous les thèmes ont été utilisés. "
    }
    
    const hookSentenceAndTitleOpenAi = await createHooksAndTitlesFromOpenAi(finalTheme)
    const randomHookAndTitle = getRandomElement(hookSentenceAndTitleOpenAi)
    console.log("Phrase d'accroche et Titre :", randomHookAndTitle);
 
    const preQuiz = await preGenerateQuizMulitiple(randomHookAndTitle.hook, randomHookAndTitle.title);
    console.log(preQuiz.length)

    const generation = await prisma.generation.create({
      data: {
        compositionId: "QuizMultiple",
      },
    });
    const newQuiz = await createNewQuiz(generation.id, finalTheme, randomHookAndTitle, ctaSentence, backGroundProps);
    console.log("UUID du nouveau quiz:", newQuiz.uuid);

    const quizElements = await generateQuizElements(preQuiz, newQuiz.uuid);
    
    console.log("Éléments du quiz générés:", JSON.stringify(quizElements)); 
    await saveQuizElements(quizElements, newQuiz.id);

    return generation.uuid;
  } catch (error) {
    console.error("Erreur lors de la génération des propriétés du quiz multiple:", error);
    throw new Error("La génération des propriétés du quiz multiple a échoué.");
  }
};
