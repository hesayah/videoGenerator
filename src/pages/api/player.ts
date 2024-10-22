import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const generations = await prisma.generation.findMany({
                orderBy: {
                    createdAt: 'desc',
                }
            });
            const generationUuids = generations.map(generation => generation.uuid);
            res.status(200).json(generationUuids);
        } catch (error) {
            console.error('Erreur lors de la récupération des générations:', error);
            res.status(500).json({ success: false, error: 'Erreur lors de la récupération des générations' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
