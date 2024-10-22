import openai from "./openai";
import OpenAI from "openai";
import { preElementQuizAff, themeQuizMultipletForOpenAi } from "@/src/remotion/compositions/interfaces";

function correctQuizFromOpenAi(questions: preElementQuizAff[]): OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
      model: "gpt-4o-mini",
      temperature: 0.60,
      max_tokens: 8192,
      response_format: { "type": "json_object" },
      messages: [
          {
              role: 'system',
              content: `
            Vous êtes un expert en quiz et votre tâche est de corriger les affirmations suivantes pour qu'elles soient précises, engageantes et adaptées à un public de lycéens et de jeunes adultes.
            **Instructions pour chaque affirmation** :

            1. **Affirmation** : Vérifiez que l'affirmation est claire, concise et amusante. Ajoutez des **emojis** pour rendre l'affirmation plus dynamique et attrayante si nécessaire.

            ***CONSEILS POUR RÉUSSIR*** :
            - Le quiz doit être accessible à tous avec un **niveau de difficulté équilibré** (pas trop facile, ni trop difficile).
            - Utilisez un **ton amical et cool**, comme si vous parliez à des amis.
            - Assurez-vous que toutes les affirmations soient cohérentes et non contradictoires, qu'elles soient positives ou négatives, mais toujours dans le même sens.
            - Les affirmations doivent être formulées à la **deuxième personne du singulier**.
            - ***MAXIMUM 20 MOTS PAR AFFIRMATION***

            **Format JSON ARRAY** :
            {
              "affirmations" : [
                {
                  "affirmation": "Texte de l'affirmation bien formulée",
                },
                ...
              ]
            }
            `
          },
          {
            role: "user",
            content: `quiz à corriger ${JSON.stringify(questions)}`
          }
      ],
  }
}

function createQuizFromOpenAi(quizTheme: themeQuizMultipletForOpenAi): OpenAI.ChatCompletionCreateParamsNonStreaming {
  const subCategory = JSON.stringify(quizTheme.category.subCategory);
  return {
    model: "gpt-4o-mini",
    temperature: 0.65,
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `
          Tu es un créateur de quiz amusants et engageants ayant pour mission d'identifier subtilement des traits psychologiques, des comportements ou des habitudes spécifiques en fonction du thème suivant : **${quizTheme.theme}**.

          **Catégories** : "${quizTheme.category.name}"
          **Sous-catégories** : ${subCategory}

          Objectif : Générer **10 affirmations de quiz** qui aideront à identifier des traits ou comportements spécifiques de manière amusante et non intrusive, tout en restant pertinent pour un public de jeunes adultes (18-28 ans).

          **Instructions pour chaque affirmation** :

          1. **Affirmation** : Rédige une affirmation courte, claire et amusante (maximum **13 mots**) qui explore un comportement ou un sentiment lié aux sous-catégories choisies. Utilise des **emojis** pour rendre l'affirmation plus accessible et légère.

          ***CONSEILS POUR RÉUSSIR*** :
          - Utilise un **jargon jeune** et moderne pour que le quiz soit drôle et engageant pour un public de 18-28 ans (par exemple, des mots comme "chiller", "crush", "vibes", "flexer", "ghoster", "mood", "relou", "swag", "seum", etc.).
          - Formule les affirmations de manière à ce qu'elles encouragent une auto-réflexion honnête, mais en douceur.
          - Adopte un **ton amical, léger et bienveillant** pour mettre les joueurs à l'aise, sans les juger.
          - Utilise des scénarios du quotidien ou des situations courantes chez les jeunes pour que les joueurs puissent facilement s'identifier (par ex. : parler de soirées, d'applications de rencontres, de réseaux sociaux, de séries Netflix, etc.).
          - Varie les types d'affirmations (par ex. : humeur, comportement social, habitudes de sommeil, réactions émotionnelles, etc.) pour obtenir une vue d'ensemble équilibrée.
          - Évite les termes médicaux ou diagnostiques directs. Concentre-toi plutôt sur les comportements et sentiments.
          - Assure-toi que les affirmations soient équilibrées entre aspects positifs et négatifs du comportement ou du trait psychologique.
          - Les affirmations doivent être formulées à la **deuxième personne du singulier** et doivent inclure des éléments de la culture pop et du langage courant chez les jeunes adultes.
          - N'hesiste pas à utilise des reference internet : exemple : ( "wesh la zone", "coucou les babies", "pres a kiffer" "swag, boff, demon, tarpin bien, la hess, la street, beaugosse")
          **Format JSON ARRAY** :
          {
            "affirmations" : [
              {
                "affirmation": "Texte de l'affirmation bien formulée avec jargon jeune et emojis" ***20 MOTS MAXIMUM***,
              }
            ]
          }

        `
      },
      {
        role: "user",
        content: `Génère 10 affirmations de quiz pour les sous-catégories suivantes : ${subCategory}, avec des emojis et du jargon jeune dans les affirmations et les options pour plus de fun, tout en favorisant une réflexion personnelle et un diagnostic doux !
        **Format ATTENDU : FORMAT JSON ARRAY** :
          {
            "affirmations" : [
              {
                "affirmation": "Texte de l'affirmation bien formulée avec jargon jeune et emojis",
              }
            ]
          }
        
        `
      }
    ],
  }
}


async function createQuiz(quizTheme : themeQuizMultipletForOpenAi): Promise<preElementQuizAff[]> {

    let parsedResponse: { affirmations : preElementQuizAff[] };
    let attempts = 0;
    const maxAttempts = 1;

    while (attempts < maxAttempts) {
        const response = await openai.chat.completions.create(createQuizFromOpenAi(quizTheme));
        const jsonResponse = response.choices[0].message?.content || '';
        const cleanedResponse = jsonResponse.trim();

        try {
            parsedResponse = JSON.parse(cleanedResponse);
            console.log(JSON.stringify(parsedResponse));
            if (parsedResponse && Array.isArray(parsedResponse.affirmations)) {

                return parsedResponse.affirmations;
            } else {
                throw new Error("Format des affirmations invalide.");
            }
        } catch (error) {
            console.error("Erreur lors de l'analyse de la réponse JSON:", error);
            throw error;
        }
        attempts++;
    }
    throw new Error("Échec de la génération du QuizFact après plusieurs tentatives.");
}

async function correctQuiz( questions: preElementQuizAff[] ) : Promise<preElementQuizAff[]> {
  let parsedResponse : { affirmations : preElementQuizAff[]  };
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    const response = await openai.chat.completions.create(correctQuizFromOpenAi(questions));
    const jsonResponse = response.choices[0].message?.content || '';
    const cleanedResponse = jsonResponse.trim();

    try {
        parsedResponse = JSON.parse(cleanedResponse);

        if (parsedResponse && Array.isArray(parsedResponse.affirmations)) {
            return parsedResponse.affirmations;
        }
    } catch (error) {
        console.error("Erreur lors de l'analyse de la réponse JSON:", error);
        throw (error)
    }
    attempts++;
}
throw new Error("Échec de la génération des segments après plusieurs tentatives."); 
}


function createHook(
  themes: string,
  quiz: preElementQuizAff[]
): OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.65,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
          Tu es un expert en création de hooks captivants. Crée 3 hooks engageants pour un quiz sur le thème : "${themes}". Ces hooks doivent :
          - Attirer l'attention immédiatement.
          - Mettre en avant le fait qu'un score de 10 sur 10 révèle quelque chose de spécial.
          - Utiliser un ton jeune et dynamique avec des emojis.
          - Se limiter à *** 12 MOTS MAXIMUMS ***.
          - Peut commencé par "Tu est vraiment ${themes} ..."
          - Se terminer par une invitation directe comme "On commence !!!".
          - Assurer que chaque hook est unique et ne répète pas les questions.

          **Exemples de Hooks :**
          - "tu es ${themes} 🌟, si tu as 10 sur 10 à ce test ! On commence !!!"
          - "Es-tu ${themes},  Score parfait = expert reconnu 🏆 ! On commence !!!"
          - "Decouvre à quel point du es ${themes}!!!"

          **Format attendu : JSON FORMAT**
          {
              "hooks": [
                  "hook 1",
                  "hook 2",
                  "hook 3"
              ]
          }
        `,
      },
      {
        role: "user",
        content: `
          Génère 3 hooks en français pour le thème : "${themes}" basés sur les questions du quiz : ${JSON.stringify(quiz)}.
          Chaque hook doit :
          - Être captivant et inciter à tester le quiz.
          - N'hesite pas à modifié legerment le ${themes} pour que ce soit une phrase correcte et souple en FRANCAIS!!!!
          - Mettre en avant l'importance d'un score parfait de 10 sur 10.
          - Utiliser un ton jeune et dynamique avec des emojis.
          - Se terminer par une invitation directe à commencer le quiz.
          - Utilise Un Jargon de JEUNE exemple: "wesh la zone", "coucou les babies", "pres a kiffer" "swag, boff, demon, tarpin bien, la hess, la street, beaugosse"
          
          **Format attendu :**
          {
              "hooks": [
                  "hook 1",
                  "hook 2",
                  "hook 3"
              ]
          }
        `,
      },
    ],
  };
}


export async function createHookFromOpenAi(themes: string, quiz : preElementQuizAff[]): Promise<string[]> {
    let parsedResponse : {hooks : string[]};
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        const response = await openai.chat.completions.create(createHook(themes, quiz));
        const jsonResponse = response.choices[0].message?.content || '';
        const cleanedResponse = jsonResponse.trim();

        try {
            parsedResponse = JSON.parse(cleanedResponse);
            if (parsedResponse && Array.isArray(parsedResponse.hooks)) {
                // return parsedResponse;
                console.log(parsedResponse.hooks)
                return parsedResponse.hooks
            }
        } catch (error) {
            console.error("Erreur lors de l'analyse de la réponse JSON:", error);
            throw (error)
        }
        attempts++;
    }
    throw new Error("Échec de la génération du hook plusieurs tentatives.");
}



export async function preGenerateQuizAff(quizTheme : themeQuizMultipletForOpenAi) : Promise<preElementQuizAff[]> {

    const preElementQuizMultiples : preElementQuizAff[] = await createQuiz(quizTheme);
    const correctedQuiz : preElementQuizAff[] = await correctQuiz(preElementQuizMultiples);

    return(correctedQuiz)
};
