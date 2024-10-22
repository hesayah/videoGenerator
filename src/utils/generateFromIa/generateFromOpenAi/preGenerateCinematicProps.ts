import OpenAI from "openai";
import openai from "./openai";
import prisma from "../../prisma";
import { CinematicPropsType } from "@/src/remotion/compositions/interfaces";
import { CinematicProps } from "@prisma/client";
import { Story } from "@prisma/client";

function generateCinematicPropsFromOpenAi(storyContent: string) : OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `
        You are a highly intelligent assistant. I will provide you with a scene, and I want you to generate cinematic properties for it. The properties should include:

        1. **style**: The cinematic style of the scene.
        2. **context**: the context of the scene 
        3. **colorPalette**: The color palette used in the scene.
        4. **lighting**: The type of lighting used in the scene.
        5. **mood**: The overall mood of the scene.
        6. **characterDesign**: The design of the characters in the scene.
        7. **environment**: The environment where the scene takes place.
        Your response should be a valid JSON FORMAT.

        "cinematicProps": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "style": {
                "type": "string",
                "description": "The cinematic style of the scene. Example: 'Film noir, with marked shadows and high contrast.'"
              },
              "context": {
                "type": "string",
                "description": "The context of the scene, which encompasses the entire setting and situation. This context will always be sent to the generative image AI. Example: 'A detective interrogating a suspect in a dimly lit room.'"
              },
              "colorPalette": {
                "type": "string",
                "description": "The color palette used in the scene. Example: 'Sepia tones and shades of gray for a retro ambiance.'"
              },
              "lighting": {
                "type": "string",
                "description": "The type of lighting used in the scene. Example: 'Soft and diffused lighting to create an intimate atmosphere.'"
              },
              "mood": {
                "type": "string",
                "description": "The overall mood of the scene. Example: 'A dark and mysterious ambiance, with palpable tension.'"
              },
              "characterDesign": {
                "type": "string",
                "description": "The design of the characters in the scene. Example: 'Characters with angular features and period costumes.'"
              },
              "environment": {
                "type": "string",
                "description": "The environment where the scene takes place. Example: 'A dark and narrow alley, with brick buildings and flickering streetlights.'"
              }
            },
            "required": ["style", "colorPalette", "lighting", "mood", "characterDesign", "environment"],
            "additionalProperties": false
          }
        }
        **IMPORTANT**: Ensure that the cinematic properties accurately reflect the content of the scene. Each property should be detailed and comprehensive, ensuring no aspect of the scene's visual and emotional elements is omitted or generalized.        `
      },
      {
        role: "user",
        content: storyContent
      }
    ],
  }
}

async function generateCinematicProps(storyContent : string) : Promise<CinematicPropsType> {
  try {
    let parsedResponse;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const response = await openai.chat.completions.create(generateCinematicPropsFromOpenAi(storyContent));
      const jsonResponse = response.choices[0].message.content || '';
      const cleanedResponse = jsonResponse.trim();

      try {
        parsedResponse = JSON.parse(cleanedResponse);
        if (parsedResponse && Array.isArray(parsedResponse.cinematicProps)) {
          // Vérifier que toutes les propriétés sont présentes
          const allPropertiesPresent = parsedResponse.cinematicProps.every((segmentData : {
            style : string,
            context : string, 
            colorPalette: string,
            lighting: string,
            mood: string,
            characterDesign: string,
            environment: string
          }) => 
            segmentData.style && 
            segmentData.context && 
            segmentData.colorPalette && 
            segmentData.lighting && 
            segmentData.mood && 
            segmentData.characterDesign && 
            segmentData.environment
          );

          if (allPropertiesPresent) {
            break; // Sortir de la boucle si toutes les propriétés sont présentes
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse de la réponse JSON:", error);
      }

      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("Échec de la génération des propriétés cinématiques après plusieurs tentatives.");
      }
    }

    if (!parsedResponse || !Array.isArray(parsedResponse.cinematicProps)) {
      throw new Error("Réponse JSON invalide ou propriétés cinématiques manquantes.");
    }

    return parsedResponse.cinematicProps;
  } catch (error) {
    console.error("Erreur lors de la génération des propriétés cinématiques:", error);
    throw new Error("Erreur lors de la génération des propriétés cinématiques.");
  }
}

export async function preGenerateCinematicsProps(tale : Story) : Promise<CinematicProps> {
  try {
    const cinematicProps : CinematicPropsType = await generateCinematicProps(tale.storyContent)
      const ret = await prisma.cinematicProps.create({
        data: {
          context: cinematicProps.context,
          style: cinematicProps.style,
          colorPalette: cinematicProps.colorPalette,
          lighting: cinematicProps.lighting,
          mood: cinematicProps.mood,
          characterDesign: cinematicProps.characterDesign,
          environment: cinematicProps.environment,
          storyId: tale.id,
        },
      });
    return (ret)
  } catch (error) {
    console.error(`Erreur lors de l'analyse des CinematicProps  pour le Tale : ${tale.uuid} de la réponse JSON:`, error);
    throw (error)
  }
}
