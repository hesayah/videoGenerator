import { generateBackgroundProps, themeQuizAffData } from "@/src/remotion/compositions/constData";
import { audioProps, backGroundProps, elementQuizAff,   preElementQuizAff,  themeQuizMultipletForOpenAi } from "@/src/remotion/compositions/interfaces";
import { backgroundsData } from "@/src/remotion/compositions/constData";
import { createHookFromOpenAi, preGenerateQuizAff } from "../generateFromIa/generateFromOpenAi/preGenerateQuizAff";
import { generateVoiceObject } from "@/src/utils/generateFromIa/generateFromElevenLabs/generateVoice";
import prisma from "@/src/utils/prisma";
import path from "path";
import fs from 'fs'

type Caption = {
  text: string;
  startInSeconds: number;
};

function isEmoji(character: string): boolean {
  return /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(character);
}

const generateCaptions = ({
  text,
  duration,
}: {
  text: string;
  duration: number;
  maxWordsPerSegment?: number;
}): Caption[] => {
  const words = text.split(' ');

  const maxWordsPerSegment = Math.floor(words.length / duration); // Nombre maximum de mots par segment (modifiable)
  // Calculer le nombre de caractères sans compter les emojis
  const totalCharsWithoutEmojis = text.split('').filter(char => !isEmoji(char)).length;
  const charsPerSecond = totalCharsWithoutEmojis / duration; // Nombre de caractères par seconde basé sur la durée totale

  let currentTime = 0;
  const captions: Caption[] = [];

  for (let i = 0; i < words.length;) {
    let segmentWords: string[] = [];
    let segmentCharCount = 0;
    let segmentWordCount = 0;

    // Ajouter des mots jusqu'à atteindre le nombre maximum de mots par segment
    while (i < words.length && segmentWordCount < maxWordsPerSegment) {
      const wordWithoutEmojis = words[i].split('').filter(char => !isEmoji(char)).join('');
      const wordCharCount = wordWithoutEmojis.length;

      // Si ajouter ce mot dépasse les caractères par seconde, terminer le segment ici
      if (segmentCharCount + wordCharCount > charsPerSecond * (currentTime + 1)) {
        break;
      }

      segmentWords.push(words[i]);
      segmentCharCount += wordCharCount;
      segmentWordCount++;
      i++;
    }

    // Si le segment est vide, ajouter au moins un mot pour éviter une boucle infinie
    if (segmentWords.length === 0 && i < words.length) {
      const wordWithoutEmojis = words[i].split('').filter(char => !isEmoji(char)).join('');
      segmentWords.push(words[i]);
      segmentCharCount += wordWithoutEmojis.length;
      i++;
    }

    // Récupérer les emojis associés au segment
    const segmentTextWithEmojis = segmentWords
      .map(word => word.split('').filter(char => isEmoji(char)).join(''))
      .join(' ');

    // Durée du segment en fonction du nombre de caractères (sans emojis)
    const segmentDuration = segmentCharCount / charsPerSecond;
    const startTime = currentTime;
    currentTime += segmentDuration;

    captions.push({
      text: segmentWords.join(' ') + segmentTextWithEmojis, // Ajouter les emojis récupérés
      startInSeconds: parseFloat(startTime.toFixed(3)), // En secondes avec trois décimales
    });
  }

  // Ajuster le dernier segment pour s'assurer que tout le contenu est affiché dans la durée totale
  if (currentTime < duration) {
    captions[captions.length - 1].startInSeconds = parseFloat(duration.toFixed(3));
  }

  return captions;
};

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
  const randomThemes = getRandomUniqueElements<themeQuizMultipletForOpenAi>(themeQuizAffData, 3);

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
  "Yo, c'est Murphy le Robot Danseur! Smash ce bouton 's'abonner' pour des vibes de ouf! 🤖💃🔥",
  "Murphy le Robot Danseur en mode show! Clique sur 's'abonner' et rejoins la team! 🚀😎",
  "Hey, Murphy le Robot Danseur ici! Pour des moves encore plus fous, abonne-toi! 🕺⚡",
  "Yo, c'est Murphy le Robot Danseur! Deviens une légende, tape 's'abonner' et brille avec nous! 🌟🤩",
  "C'est Murphy le Robot Danseur! Trop cool pour manquer ça? Clique sur 's'abonner'! 📢💥",
  "Murphy le Robot Danseur te parle! Soutiens ton robot préféré, abonne-toi! 💪🤖",
  "Tu veux du fun avec Murphy le Robot Danseur? Tape 's'abonner' direct! 🎉🕺",
  "On reste connectés avec Murphy le Robot Danseur? Go sur 's'abonner' et rejoins le crew! 🌐🔥",
  "Murphy le Robot Danseur à l'écran! Clique sur 's'abonner' pour devenir un VIP! 😜🔝",
  "Murphy le Robot Danseur te hype! Abonne-toi, y'a encore plein de surprises! 🤫👀",
  "C'est Murphy le Robot Danseur! T'as aimé le show? Abonne-toi et fais partie de la miff! 🤩❤️"
];

// Fonction pour créer un nouveau quiz dans la base de données
async function createNewQuiz(generationId : number, themeQuiz: string, hookSentence: string, ctaSentence: string, backGroundProps: backGroundProps) {
  try {
    const newQuiz =  await prisma.quizAff.create({
      data: {
        themeQuiz: themeQuiz,
        hookSentence: hookSentence,
        hookSenteceAudioProps : '',
        ctaSenteceAudioProps : '',
        ctaSentence: ctaSentence,
        backGroundProps: JSON.stringify(backGroundProps),
        generationId : generationId
      },
    });
    const outDir = path.join(process.cwd(), 'public', 'QuizAff', newQuiz.uuid);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const hookaudioProps = await generateVoiceObject(hookSentence, path.join(outDir, `hookSentence.mp3`));
    const hookSenteceAudioProps : audioProps  = {
      audioSrc :  path.join('QuizAff', newQuiz.uuid, `hookSentence.mp3`),
      duration : hookaudioProps.duration,
    }
    const ctaAudioProps = await generateVoiceObject(ctaSentence, path.join(outDir, `ctaSentence.mp3`));
    const ctaSenteceAudioProps : audioProps   =  {
      audioSrc :  path.join('QuizAff', newQuiz.uuid, `ctaSentence.mp3`),             
      duration : ctaAudioProps.duration,
    }

    return await prisma.quizAff.update({
      where : {
        id : newQuiz.id
      },
      data: {
        hookSenteceAudioProps : JSON.stringify(hookSenteceAudioProps),
        ctaSenteceAudioProps : JSON.stringify(ctaSenteceAudioProps)
      },
    });

  } catch (error) {
    console.error("Erreur lors de la création d'un nouveau quiz:", error);
    throw new Error("La création du nouveau quiz a échoué.");
  }
}

// Fonction pour générer les éléments du quiz
async function generateQuizElements(preQuiz: preElementQuizAff[], quizUuid: string): Promise<elementQuizAff[]> {

  
  const outDir = path.join(process.cwd(), 'public', 'QuizAff', quizUuid);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const quizElements: elementQuizAff[] = [];
  try {

    for (let index = 0; index < preQuiz.length; index++) {
      const quiz = preQuiz[index];
      const audioProps = await generateVoiceObject(quiz.affirmation, path.join(process.cwd(), 'public', 'QuizAff', quizUuid, `audio_${index}.mp3`));
      const transcribeQuestion = generateCaptions({text : quiz.affirmation, duration : audioProps.duration})
      const formatedAudioProps = {
        audioSrc :  path.join('QuizAff', quizUuid, `audio_${index}.mp3`),
        duration : audioProps.duration,
        captions :  transcribeQuestion
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
async function saveQuizElements(quiz: elementQuizAff[], QuizAffId: number): Promise<void> {
  try {
    for (let index = 0; index < quiz.length; index++) {
      const quizItem = quiz[index];
      await prisma.elementQuizAff.create({
        data: {
          affirmation : quizItem.affirmation,
          audioProps: JSON.stringify(quizItem.audioProps),
          quizAffId: QuizAffId,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des éléments du quiz:", error);
    throw new Error("La sauvegarde des éléments du quiz a échoué.");
  }
}

// Fonction principale pour générer les propriétés du quiz multiple
export const generateQuizAffProps = async (): Promise<string> => {
  try {

    const ctaSentence = getRandomElement(ctaSentences);
    const backGroundProps = generateBackgroundProps(backgroundsData);
    const generation = await prisma.generation.create({
      data: {
        compositionId: "QuizAff",
      },
    });
    const themeQuiz = getRandomQuizCategory();
    const preQuiz = await preGenerateQuizAff(themeQuiz);

    const hookSentencesOpenAi = await createHookFromOpenAi(JSON.stringify(themeQuiz.category.subCategory), preQuiz)
    const hookSentence = getRandomElement(hookSentencesOpenAi);
    const newQuiz = await createNewQuiz(generation.id, themeQuiz.theme, hookSentence, ctaSentence, backGroundProps);
    const quizElements = await generateQuizElements(preQuiz, newQuiz.uuid);
    await saveQuizElements(quizElements, newQuiz.id);

    console.log(themeQuiz)
    console.log(preQuiz.length)
    console.log(JSON.stringify(preQuiz))
    console.log("Thème du quiz:", themeQuiz);
    console.log("Phrase d'accroche:", hookSentence);
    console.log("Phrase d'appel à l'action:", ctaSentence);
    console.log("Propriétés de l'arrière-plan:", JSON.stringify(backGroundProps));
    console.log("UUID du nouveau quiz:", newQuiz.uuid);
    console.log("ID du nouveau quiz:", newQuiz.id);
    console.log("Éléments du quiz générés:", JSON.stringify(quizElements)); 

    return generation.uuid;

  } catch (error) {
    console.error("Erreur lors de la génération des propriétés du quiz multiple:", error);
    throw new Error("La génération des propriétés du quiz multiple a échoué.");
  }
};
