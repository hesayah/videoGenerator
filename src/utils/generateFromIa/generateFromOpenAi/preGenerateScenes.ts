
import openai from "./openai";
import OpenAI from "openai";
import { Story } from "@prisma/client";
import prisma from "../../prisma";
import { Scene } from "@prisma/client";

function generateScenesFromOpenAi(storyContent: string) : OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `
        You are a highly intelligent expert in literature and narrative analysis. I will provide you with a text excerpt, 
        and I want you to divide it into scenes. Each scene should be a continuous and complete segment of the text, maintaining narrative coherence. 
        A scene is a subdivision of an act, marked by a change of setting, characters, or situation. 
        It represents a continuous unit of action in the same place and with the same characters. 
        Each scene must have strict narrative coherence, meaning it should tell a part of the story in a complete and autonomous way, while integrating harmoniously into the overall piece. 
        Transitions between scenes are often used to mark the passage of time, a change of place, or an evolution in the plot.
        If no change of situation, environment, or place is detected, the content should be considered as a single unique scene.
        Your response should be a JSON array of scenes.

        "scenes": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "content": {
                "type": "string",
                "description": "The strictly complete text for the part you consider a unique scene."
              },
            "required": ["content"],
            "additionalProperties": false
          }
        }
        **IMPORTANT**: Ensure that the entire provided text is covered in the JSON output. Each scene should be a continuous and complete segment of the text, maintaining narrative coherence. Ensure that no part of the input text is omitted or summarized.
      `
      },
      {
        role: "user",
        content: storyContent
      }],
  }
}

export async function preGenerateScenes(tale : Story, storyContent : string): Promise<Scene[]> {
  let parsedResponse;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const response = await openai.chat.completions.create(generateScenesFromOpenAi(storyContent));
    const jsonResponse = response.choices[0].message.content || '';
    const cleanedResponse = jsonResponse.trim();

    try {
      parsedResponse = JSON.parse(cleanedResponse);
      if (parsedResponse && Array.isArray(parsedResponse.scenes)) {
        // Vérifier que chaque scène a le contenu requis
        const allScenesValid = parsedResponse.scenes.every((scene : {
          content : string,
        }) => scene.content);
        if (allScenesValid) {
          const scenes : Scene[] = [];
          for (const scene of parsedResponse.scenes) {
            const savedScene = await prisma.scene.create({
              data: {
                content: scene.content,
                storyId: tale.id,
              },
            });
            scenes.push(savedScene);
          }
          return (scenes);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de l'analyse de la réponse JSON pour le Tale suivant : ${tale.uuid}:`, error);
    }

    attempts++;
  }
  throw new Error(`Échec de la génération des scènes après plusieurs tentatives pour le Tale suivant : ${tale.uuid}.`);
}