import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind';
import path from 'path';
import { cwd } from 'process';
import Joi from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/utils/prisma';
import { QuizMultipleProps, QuizWhoIAmProps, QuizAffProps } from '@/src/remotion/compositions/interfaces';

const schema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ success: false, error: 'Bad Request: Invalid UUID' });
  }

  const { uuid } = value;

  const generation = await prisma.generation.findFirstOrThrow({
    where: { uuid: uuid },
    include: {
      quizMultiple: {
        include: { quizElements: true }
      },
      quizWhoIAm: {
        include: { quizElements: true }
      },
      quizAff : {
        include : {quizElements : true}
      }
    }
  });

  if (!generation) throw new Error('Generation not found');

  let inputProps;
  if (generation.quizMultiple) {
    const quiz = generation.quizMultiple.quizElements.map(element => ({
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
      quiz: quiz,
      themeQuiz: generation.quizMultiple.themeQuiz,
      hookSentence,
      hookSentenceAudioProps,
      ctaSentence: generation.quizMultiple.ctaSentence,
      ctaSentenceAudioProps,
      backGroundProps,
    } as QuizMultipleProps;

  } else if (generation.quizWhoIAm) {
      const quiz = generation.quizWhoIAm.quizElements.map(element => ({
          ...element,
          audioProps: JSON.parse(element.audioProps),
      }));

    const answer = JSON.parse(generation.quizWhoIAm.answer)
    const hookSentenceAudioProps = JSON.parse(generation.quizWhoIAm.hookSenteceAudioProps)

    const backGroundProps = JSON.parse(generation.quizWhoIAm.backGroundProps);

    inputProps = {
      quiz: quiz,
      characterName: generation.quizWhoIAm.characterName,
      answer,
      hookSentence: generation.quizWhoIAm.hookSentence,
      hookSentenceAudioProps,
      ctaSentence: generation.quizWhoIAm.ctaSentence,
      backGroundProps,
    } as QuizWhoIAmProps;
  } 
    else if (generation.quizAff) {
      const quiz = generation.quizAff.quizElements.map(element => ({
        ...element,
        audioProps: JSON.parse(element.audioProps),
    }));

    const hookSentenceAudioProps = JSON.parse(generation.quizAff.hookSenteceAudioProps)
    const ctaSenteceAudioProps = JSON.parse(generation.quizAff.ctaSenteceAudioProps)
    const backGroundProps = JSON.parse(generation.quizAff.backGroundProps);

    inputProps = {
      quiz: quiz,
      themeQuiz: generation.quizAff.themeQuiz,
      hookSentence: generation.quizAff.hookSentence,
      hookSentenceAudioProps,
      ctaSenteceAudioProps,
      ctaSentence: generation.quizAff.ctaSentence,
      backGroundProps,
    } as unknown as QuizAffProps;
  }
    else {
    throw new Error('No quiz data found');
  }

  try {
    const bundleLocation = await bundle(
      path.resolve('src/remotion/index.ts'),
      (progress) => console.log(`Progress: ${progress}%`),
      {
        webpackOverride: (config) => {
          return enableTailwind(config);
        },
        publicDir: path.join(cwd(), 'public'),
      }
    );

    console.log('selectComposition');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: generation.compositionId,
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
    res.status(200).json({ success: true, outputLocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error });
  }
}