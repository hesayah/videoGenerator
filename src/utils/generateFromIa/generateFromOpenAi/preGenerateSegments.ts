import OpenAI from "openai";
import openai from "./openai";
import { Scene, Segment, Story } from "@prisma/client";
import prisma from "../../prisma";

function generateSegmentsFromOpenAi(sceneContent: string) : OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.65,
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `You are a highly intelligent expert in literature and narrative analysis. I will provide you with a text excerpt, and I want you to generate a JSON array.
        Each object in this array should describe a scene in the following format:
  
        1. **descriptionPrompt**: Provide a long description of the scene for an image-generating AI. This description must be **no longer than 200 words** and should include:
        - The **location** (where the scene takes place),
        - The **situation** (what is happening),
        - The **characters** involved (who is present).   
        **IMPORTANT**: The descriptionPrompt must be as detailed and expressive as possible, and should especially emphasize the ongoing action(s) so that even a blind person can visualize the scene in their mind.

        2. **content**: The complete and accurate text of the scene. This must include all necessary details to fit the time constraints but ensure that the essential details and coherence are maintained. **No character should be omitted.**
        **IMPORTANT**: Ensure that the entirety of the provided text is covered in the JSON output. Each scene should be a continuous and complete segment of the text, maintaining narrative coherence. Ensure that no part of the input text is omitted or summarized. **Maximize the number of segments by making each segment as short as possible, ideally one to two sentences.**

        **Duration Constraint**: Each segment should be between 1 to 8 seconds long based on a typical speaking rate of 160 words per minute (2.5 words per second). Ensure that no segment exceeds 8 seconds of narration time. This means each segment should contain between 1 to 20 words. If a segment is too long, you may slightly condense the text to fit within the time constraint, but ensure that the narrative coherence is strictly maintained.

        "segments": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "descriptionPrompt": {
                "type": "string",
                "description": "A long and precise prompt describing the scene to be sent to a generative image AI to create a visual representation. This prompt should provide a global synthesis of the associated image. Example: 'A grand scene showcasing the ancient Persian empire's vast expanse from Persia to the borders of China.'"
              },
              "content": {
                "type": "string",
                "description": "The complete and strictly precise text contained in the scene. This text must include all necessary details to match the generated image. Example: 'In the chronicles of the ancient Sassanid dynasty...'"
              },
            },
            "required": ["descriptionPrompt", "content"],
            "additionalProperties": false
          }
        }
        Your response should be a valid JSON array following this structure.`
      },
      {
        role: "user",
        content: sceneContent
      }
    ],
  }
}

export async function preGenerateSegment(scene: Scene, tale: Story): Promise<Segment[]> {
  let parsedResponse;
  const maxAttempts = 3;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    try {
      const response = await openai.chat.completions.create(generateSegmentsFromOpenAi(scene.content));
      const jsonResponse = response.choices[0].message.content?.trim() || '';
      parsedResponse = JSON.parse(jsonResponse);

      if (parsedResponse && Array.isArray(parsedResponse.segments)) {
        const allSegmentsValid = parsedResponse.segments.every((segment: { descriptionPrompt: string, content: string }) =>
          segment.descriptionPrompt && segment.content
        );

        if (allSegmentsValid) {
          const segments: Segment[] = await Promise.all(parsedResponse.segments.map(async (segment: { descriptionPrompt: string, content: string }) => {
            return await prisma.segment.create({
              data: {
                descriptionPrompt: segment.descriptionPrompt,
                content: segment.content,
                sceneId: scene.id,
                imageUrl: '',
                audioProps: '',
              },
            });
          }));
          return segments;
        }
      }
    } catch (error) {
      console.error(`Erreur lors de l'analyse de la réponse JSON pour le Tale suivant : ${tale.uuid}:`, error);
    }
  }
  throw new Error(`Échec de la génération des segments après plusieurs tentatives pour le Tale suivant : ${tale.uuid}.`);
}