import { preElementQuizWhoIAm } from "@/src/remotion/compositions/interfaces";
import openai from "./openai";
import OpenAI from "openai";

function correctQuizFromOpenAi(characterName: string, facts: string[]): OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
      model: "gpt-4o-mini",
      temperature: 0.60,
      max_tokens: 8192,
      response_format: { "type": "json_object" },
      messages: [
          {
              role: 'system',
              content: `
                Vous êtes un expert en personnages célèbres et en faits triviaux.
                Je vais vous donner une liste de faits concernant un personnage.

                - Veuillez vérifier chaque fait et corriger ceux qui sont incorrects.
                - Remplacez les faits incorrects par des faits vérifiables et corrects sur le personnage.
                - Assurez-vous que chaque fait est une information vérifiable sur le personnage.
                - Double-vérifiez l'exactitude de chaque fait pour éviter toute information incorrecte.
                - Chaque fait doit être un fait trivia sur le personnage, tel que la ville de résidence, la taille, la couleur, l'origine, la profession, les pouvoirs ou des faits amusants.
                - Chaque fait doit comporter moins de 10 mots.
                - Reorganize les faits du  fait doit être classé du plus difficile au plus facile et du moins connu au plus connu.
                - Assurez-vous que les faits ne sont pas répétitifs et couvrent une variété d'aspects sur le personnage.
                - Ajoutez une touche de mystère à chaque fait pour rendre le quiz plus engageant.
                - Ajoutez des emojis pour un aspect convivial !

                **IMPORTANT** :
                - Ton retour doit être strictement en français.
                - Tu ne dois pas dépassé 10 Mots par fait !!!!!!!
                - Tu ne dois surtout pas révéler l'identité du personnage !!!
                - En aucun cas Il doit y avoir le nom du personnages dans les faits !!!!!!!!!!!!!

                **Format de réponse JSON**:

                {
                    "facts": [
                        "fait corrigé 1",
                        "fait corrigé 2",
                        ...
                        "fait corrigé 10"
                    ]
                }
            `
          },
          {
              role: "user",
              content: `faits à corriger ${JSON.stringify(facts)} pour ${characterName}`
          }
      ],
  }
}


function createQuizFromOpenAi(characterName: string) : OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.65,
    max_tokens: 8192,
    response_format: { "type": "json_object" },
    messages: [
        {
          role: 'system',
          content: `
              You are an expert in famous characters and trivia facts. You are the best quiz creator for characters.
              Provide a list of 12 facts about this character, ranked from the most difficult to the easiest.
              Each fact should be a trivia fact about the character, such as residence city, height, color, origin, profession, powers, or fun facts.
              Each fact must be less than 10 words.
              Each fact must be stated in the first person singular, example: I live in Springfield.
      
              1. **facts**: A string array of 12 facts approximately about the character. 
              Each fact should be a known piece of information about the character or trivia fact, be creative.
              Ensure that the facts are not repetitive and cover a variety of aspects about the character.
              Feel free to include other relevant facts if you know them, the provided examples are just for reference.
              Add a touch of mystery to each fact to make the quiz more engaging.
  
              **IMPORTANT**: The facts must be strictly ranked from the least known to the most known. 
              Ensure that each fact is a verifiable piece of information about the character. 
              Do not reveal the character's identity in any of the facts.
  
              **FOLLOW THIS Format JSON**:
  
              {
                  "facts": [
                      "least known fact",
                      "slightly more known fact",
                      ...
                      "most known fact"
                  ],
              }
              Your response should be a valid JSON following this structure. 
              Ensure the facts are strictly ordered from least known to most known.
          `
        },
        {
          role: "user",
          content: characterName
        }
      ],
  }
}

async function correctQuiz(characterName: string, facts: string[]) : Promise<string[]> {
  let parsedResponse : { facts: string[] };
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    const response = await openai.chat.completions.create(correctQuizFromOpenAi(characterName, facts));
    const jsonResponse = response.choices[0].message?.content || '';
    const cleanedResponse = jsonResponse.trim();

    try {
        parsedResponse = JSON.parse(cleanedResponse);

        if (parsedResponse && Array.isArray(parsedResponse.facts)) {
            return parsedResponse.facts;
        }
    } catch (error) {
        console.error("Erreur lors de l'analyse de la réponse JSON:", error);
        throw (error)
    }
    attempts++;
}
throw new Error("Échec de la génération des segments après plusieurs tentatives."); 
}

async function createQuiz(characterName: string): Promise<string[]> {
    let parsedResponse : {facts : string[]};
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        const response = await openai.chat.completions.create(createQuizFromOpenAi(characterName));
        const jsonResponse = response.choices[0].message?.content || '';
        const cleanedResponse = jsonResponse.trim();

        try {
            parsedResponse = JSON.parse(cleanedResponse);
            if (parsedResponse && Array.isArray(parsedResponse.facts)) {
                // return parsedResponse;
                console.log(parsedResponse.facts)
                return parsedResponse.facts
            }
        } catch (error) {
            console.error("Erreur lors de l'analyse de la réponse JSON:", error);
            throw (error)
        }
        attempts++;
    }
    throw new Error("Échec de la génération des segments après plusieurs tentatives.");
}


export async function preGenerateQuizWhoIAm(characterName: string) : Promise<preElementQuizWhoIAm[]> {

const facts: string[] = await createQuiz(characterName);
const correctedFacts: string[] = await correctQuiz(characterName, facts);
console.log('#################################')
console.log(facts);
console.log('#################################')
console.log(correctedFacts)
console.log('#################################')
return correctedFacts.map(fact => ({ fact })); 
};
