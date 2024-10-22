const { PrismaClient, quizMultiple } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { enableTailwind } = require('@remotion/tailwind');

const prisma = new PrismaClient();


 type preElementQuizMultiple = {question : string, options : string[], correctAnswerIndex : number}

 type elementQuizMultiple = {
    question: string;
    options: string[];
    correctAnswerIndex : number;
    answerAudioProps : audioProps
    imgSrc : string;
    audioProps : audioProps;
}


 type backGroundProps = {
  url : string,
  start: number,
  end : number
}
  
  type backGroundInfo = {
  url: string;
  durationInFps: number;
}


 type audioProps = {
  audioSrc : string,
  duration : number,
}

 type QuizMultipleProps = {
    quiz: elementQuizMultiple[];
    themeQuiz : string;
    hookSentence : {hook : string, title : string};
    hookSentenceAudioProps : audioProps;
    ctaSentenceAudioProps : audioProps
    ctaSentence : string;
    backGroundProps : backGroundProps;
}

const deleteRemotionFolders = async (): Promise<void> => {
  const tmpDir = '/tmp'; // Répertoire /tmp à la racine du système

  // Vérifie si le répertoire /tmp existe
  if (fs.existsSync(tmpDir)) {
    // Lit le contenu du répertoire /tmp
    const files = fs.readdirSync(tmpDir);

    // Supprime chaque dossier qui contient "remotion" dans le nom
    const remotionFolders = files.filter((file: string) => file.includes('remotion'));

    remotionFolders.forEach((folder: string) => {
        const folderPath = path.join(tmpDir, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`Suppression du dossier : ${folderPath}`);
        }
    });
    
    if (remotionFolders.length === 0) {
      console.log("Aucun dossier contenant 'remotion' trouvé dans /tmp.");
    }
  } else {
    console.log("Le répertoire /tmp n'existe pas.");
  }
};

const render = async (uuid: string): Promise<boolean> => {
  const generation = await prisma.generation.findFirstOrThrow({
    where: { uuid: uuid },
    include: {
      quizMultiple: {
        include: { quizElements: true }
      },
      quizWhoIAm: {
        include: { quizElements: true }
      },
      quizAff: {
        include: { quizElements: true }
      }
    }
  });

  if (!generation) throw new Error('Generation not found');

  let inputProps: QuizMultipleProps
  if (generation.quizMultiple) {
    const quiz = generation.quizMultiple.quizElements.map((element : any) => ({
      ...element,
      options: JSON.parse(element.options),
      audioProps: JSON.parse(element.audioProps),
      answerAudioProps : JSON.parse(element.answerAudioProps),
      imgSrc: element.imgSrc || ''  // Assurez-vous que imgSrc est toujours une chaîne
  }));
    const hookSentenceAudioProps = JSON.parse(generation.quizMultiple.hookSenteceAudioProps)
    const ctaSentenceAudioProps = JSON.parse(generation.quizMultiple.ctaSenteceAudioProps)
    const backGroundProps = JSON.parse(generation.quizMultiple.backGroundProps);
    const hookSentence = JSON.parse(generation.quizMultiple.hookSentence)


    inputProps = {
      quiz,
      themeQuiz: generation.quizMultiple.themeQuiz,
      hookSentence,
      hookSentenceAudioProps,
      ctaSentence: generation.quizMultiple.ctaSentence,
      ctaSentenceAudioProps,
      backGroundProps,
    };
  } else {
    throw new Error('Aucune donnée de quiz trouvée');
  }

  try {
    const bundleLocation = await bundle(
      path.resolve('src/remotion/index.ts'),
      (progress: number) => console.log(`Progress: ${progress}%`),
      {
        webpackOverride: (config: any) => enableTailwind(config),
        publicDir: path.join(process.cwd(), 'public'),
      }
    );

    console.log('selectComposition');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: generation.compositionId!,
      inputProps
    });

    const outputLocation = `out/${generation.compositionId}/${generation.id}/video.mp4`;

    console.log('renderMedia');
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      disallowParallelEncoding: true,
      overwrite: true,
      logLevel: 'verbose',
      inputProps
    });
    return true;
  } catch (error) {
    console.error("Erreur lors du rendu:", error);
    return false;
  }
};

const bot = async (): Promise<void> => {
  try {
    const generations = await prisma.generation.findMany({
      where: {
        quizMultiple: {
          isNot: null,
        },
        status: false
      },
      include: {
        quizMultiple: {
          include: { quizElements: true }
        },
      },
    });

    let index = 0;
    for (const generation of generations) {
      if (generation.quizMultiple?.quizElements && index < 15) {
        const success = await render(generation.uuid);
        if (success) {
          await deleteRemotionFolders();
          await prisma.generation.update({
            data: { status: true },
            where: { uuid: generation.uuid }
          });
        } else {
          console.log(`Echec de generation pour ${generation.uuid}`);
        }
      }
      console.log(`Rendu terminé pour la génération: ${generation.id}`);
      index++;
    }
  } catch (error) {
    console.error("Erreur lors de la génération des rendus:", error);
  }
};

bot();
