
import OpenAI from "openai";
import openai from "./openai";


function generateTranslateAndEmojyFromOpenAi(contentToTrad: string, language : string) : OpenAI.ChatCompletionCreateParamsNonStreaming {
    return {
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 8192,
      response_format: { "type": "json_object" },
      messages: [
        {
          role: 'system',
          content: `
            You are a highly skilled translator. Please translate the following text into ${language} and add appropriate emojis to enhance the meaning and context of the text. Do not exaggerate with the quantity of emojis and only add them if they are relevant.
          "translated": {
              content : string; // the translated content
            }
          }
          **IMPORTANT**: Ensure that the entire provided text is covered in the JSON output. Ensure that no part of the input text is omitted or summarized.
        `
        },
        {
          role: "user",
          content: contentToTrad
        }],
    }
  }

// Start Generation Here
export async function generateSubtitlesTranslation(content: string, targetLanguage: string): Promise<string> {
    try {
        let parsedResponse;
        let attempts = 0;
        const maxAttempts = 3;
    
        while (attempts < maxAttempts) {
          const response = await openai.chat.completions.create(generateTranslateAndEmojyFromOpenAi(content, targetLanguage));
          const jsonResponse = response.choices[0].message.content || '';
          const cleanedResponse = jsonResponse.trim();
    
          try {
            parsedResponse = JSON.parse(cleanedResponse);
            if (parsedResponse && parsedResponse.translated && parsedResponse.translated.content) {
              return parsedResponse.translated.content;
            }
          } catch (error) {
            console.error("Erreur lors de l'analyse de la réponse JSON:", error);
          }
          attempts++;
        }
        throw new Error("Échec de la génération des traductions de soustitres");
    } catch (error) {
        console.error("Erreur lors de la génération de la traduction des sous-titres:", error);
        throw error;
    }
}