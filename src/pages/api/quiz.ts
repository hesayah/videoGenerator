import { NextApiRequest, NextApiResponse } from 'next';
import { generateQuizMultipleProps } from '@/src/utils/generateQuiz/generateQuizMulitipleProps';
import { generateQuizWhoIAmProps } from '@/src/utils/generateQuiz/generateQuizWhoIAm';
import { generateQuizAffProps } from '@/src/utils/generateQuiz/generateQuizAff';
import { QuizAffProps, QuizMultipleProps, QuizWhoIAmProps } from '@/src/remotion/compositions/interfaces';
import { getQuiz } from '@/src/utils/generateQuiz/getQuiz';
import Joi from 'joi'

const schema = Joi.object({
    uuid: Joi.string().guid({ version: 'uuidv4' }).required(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { quizType } = req.body;
        console.log(quizType)

        try {
            let generationUuid;
            switch (quizType) {
                case 'multiple':
                    generationUuid = await generateQuizMultipleProps();
                    break;
                case 'whoiam':
                    generationUuid = await generateQuizWhoIAmProps();
                    break;
                case 'aff':
                    generationUuid = await generateQuizAffProps();
                    break;
                default:
                    return res.status(400).json({ success: false, error: 'Bad Request: Invalid Quiz Type' });
            }
            res.status(200).json({ success: true, generationUuid: generationUuid });
        } catch (error) {
            console.error('Erreur lors de la création du quiz:', error);
            res.status(500).json({ success: false, error: 'Erreur lors de la création du quiz' });
        }
    } else if (req.method === 'GET') {
        const { error, value } = schema.validate(req.query);

        if (error) {
            return res.status(400).json({ success: false, error: 'Bad Request: Invalid UUID' });
        }

        const { uuid } = value;

        try {
            const response: QuizWhoIAmProps | QuizMultipleProps | QuizAffProps |null = await getQuiz(uuid);
            if (!response) {
                return res.status(404).json({ success: false, error: 'Quiz not found' });
            }
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}