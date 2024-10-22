import prisma from '../prisma';
import { QuizMultipleProps, QuizWhoIAmProps, QuizAffProps } from '@/src/remotion/compositions/interfaces';


export async function getQuiz(uuid: string): 
Promise<(QuizMultipleProps & { compositionId: string }) | 
    (QuizWhoIAmProps & { compositionId: string }) |
    (QuizAffProps & { compositionId: string }) |
    null> {
    if (!uuid || typeof uuid !== 'string') {
        throw new Error('Invalid UUID');
    }

    const generation = await prisma.generation.findUnique({
        where: { uuid },
        include: {
            quizMultiple: {
                include: { quizElements: true }
            },
            quizWhoIAm: {
                include: { quizElements: true }
            },
            quizAff: {
                include: {quizElements : true}
            },
        }
    });

    if (!generation) {
        return null;
    }

    if (generation.quizMultiple) {
        const { quizMultiple } = generation;
        const quiz = quizMultiple.quizElements.map(element => ({
            ...element,
            options: JSON.parse(element.options),
            audioProps: JSON.parse(element.audioProps),
            answerAudioProps : JSON.parse(element.answerAudioProps),
            imgSrc: element.imgSrc || '',  // Assurez-vous que imgSrc est toujours une chaîne
        }));
        return {
            compositionId: generation.compositionId,
            quiz,
            themeQuiz: quizMultiple.themeQuiz,
            hookSentence: JSON.parse(quizMultiple.hookSentence),
            hookSentenceAudioProps : JSON.parse(quizMultiple.hookSenteceAudioProps),
            ctaSentence: quizMultiple.ctaSentence,
            ctaSentenceAudioProps : JSON.parse(quizMultiple.ctaSenteceAudioProps),
            backGroundProps: JSON.parse(quizMultiple.backGroundProps)
        } as QuizMultipleProps & { compositionId: string }; 
    }

    if (generation.quizWhoIAm) {
        const { quizWhoIAm } = generation;
        const quiz = quizWhoIAm.quizElements.map(element => ({
            ...element,
            audioProps: JSON.parse(element.audioProps),
        }));
        return {
            compositionId: generation.compositionId,
            quiz,
            characterName: quizWhoIAm.characterName,
            hookSentence: quizWhoIAm.hookSentence,
            hookSentenceAudioProps : JSON.parse(quizWhoIAm.hookSenteceAudioProps),
            answer : JSON.parse(quizWhoIAm.answer),
            ctaSentence: quizWhoIAm.ctaSentence,
            backGroundProps: JSON.parse(quizWhoIAm.backGroundProps)
        } as QuizWhoIAmProps  & { compositionId: string }; 
    }
    if (generation.quizAff) {
        const { quizAff } = generation;
        const quiz = quizAff.quizElements.map(element => ({
            ...element,
            audioProps: JSON.parse(element.audioProps),
        }));
        return {
            compositionId: generation.compositionId,
            quiz,
            themeQuiz: quizAff.themeQuiz,
            hookSentence: quizAff.hookSentence,
            hookSentenceAudioProps: JSON.parse(quizAff.hookSenteceAudioProps),
            ctaSentence: quizAff.ctaSentence,
            ctaSentenceAudioProps : JSON.parse(quizAff.ctaSenteceAudioProps),
            backGroundProps: JSON.parse(quizAff.backGroundProps)
        } as QuizAffProps & { compositionId: string };
    }

    return null;
}