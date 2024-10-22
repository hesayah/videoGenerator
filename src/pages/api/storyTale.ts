import { NextApiRequest, NextApiResponse } from 'next';
import Joi from 'joi';
import { generateStoryProps } from '@/src/utils/generateStory/generateStory';

const schema = Joi.object({
  storyContent : Joi.string().required().messages({
    'string.base': "L'histoire  doit être une chaîne de caractères.",
    'any.required': "L'histoire est requis."
  }), 
  name: Joi.string().max(64).required().messages({
    'string.base': "Le nom de l'histoire doit être une chaîne de caractères.",
    'string.max': "Le nom de l'histoire ne doit pas dépasser 64 caractères.",
    'any.required': "Le nom de l'histoire est requis."
  })
});

export default  async function hundler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  
  const { error, value } = schema.validate(req.body);

  if (error)
    return res.status(400).json({ error: error.details[0].message })
  const { storyContent, name } = value;
  const tale = await generateStoryProps(storyContent, name)
  return res.status(200).json({ succes : true, tale : tale });
}

