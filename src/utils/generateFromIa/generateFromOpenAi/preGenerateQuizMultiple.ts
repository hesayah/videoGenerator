import openai from "./openai";
import OpenAI from "openai";
import { preElementQuizMultiple} from "@/src/remotion/compositions/interfaces";

type quizInit =  {
  question : string, 
  options : string[]
}

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;

  // Pendant qu'il reste des éléments à mélanger
  while (currentIndex !== 0) {
    // Choisir un élément restant
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // Échanger l'élément avec celui à l'index courant
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array
}

// ########################### create Quiz #########################################

function createQuizFromOpenAi(hook : string, title : string): OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.75,
    max_tokens: 16384,
    response_format: { type: "json_object" },
    messages: [
      {
        role: 'system',
        content: `
          Tu es un pro des quiz fun et engageants ! Ta mission est de créer des questions captivantes pour un hook et un titre spécifiques :
          - Hook : **${hook}**
          - Titre : **${title}**

          **Objectif** : 
          1. : Génère **7 questions** intéressantes et adaptées aux lycéens et jeunes adultes en lien avec le hook "${hook}" et le thème "${title}". 
          2. : Utilise du **jargon jeune** pour rendre les questions encore plus attractives.

          **IMPORTANT** : Les questions doivent être **impersonnelles** et **ne pas s'adresser directement au joueur** ni solliciter ses émotions ou son vécu personnel.

          **Instructions pour chaque question** :
          1. **Question** : Rédige une question claire, concise, et stylée avec un maximum de **13 mots**. Utilise des **emojis** pour rendre la question plus fun et visuellement attrayante.
          2. **Aucun contenu susceptible de changer avec le temps**. Le quiz doit rester stable et intemporel.
          3. Évite les questions qui pourraient prêter à confusion.
          4. Assure-toi que le quiz est **accessible** et a un **niveau de difficulté équilibré**.
          5. Utilise un **ton amical et cool**, comme si tu parlais à des amis, avec du **jargon jeune**.
          6. Varie les questions pour couvrir tous les aspects du hook et du thème.
          7. **Pas de langage technique ou trop complexe**. Garde un ton simple, direct et amusant.
          8. Intègre des faits intéressants ou des anecdotes cool pour capter l'attention.

          **Exemple de questions** :
          Hook : 'Héros et anti-héros des contes ! 🏰 Qui connaît vraiment Barbe Bleue et Cendrillon ?',
          Titre : 'Contes en Folie !'
          "questions" : 
          [
            {
              question: '👠 Qui a perdu sa chaussure à minuit ?',
            },
            {
              question: '🐉 Quel héros a battu un dragon pour sauver une princesse ?',
            },
            {
              question: '💀 Qui est le célèbre tueur de femmes dans les contes ?',
            },
            {
              question: '👧 Quelle héroïne a des cheveux incroyablement longs ?',
            },
            {
              question: '😼 Quel chat rusé a aidé son maître à devenir riche ?',
            },
            {
              question: '💤 Quelle princesse a été maudite et s\'est endormie pendant 100 ans ?',
            },
            {
              question: '🕵️‍♂️ Quel héros a volé aux riches pour donner aux pauvres ?',
            }
          ]

          **Rappelle-toi** :
          - Chaque question doit être unique, amusante, et bien dans le thème : ${title}.
          - Les questions doivent rester impersonnelles, sans impliquer les émotions ou le vécu du joueur.
          - Ne réutilise pas des questions déjà générées pour d'autres utilisateurs.

          **Format JSON ARRAY attendu** :
          {
            "questions" : [
              {
                "question": "Texte de la question bien formulée",
              }
            ]
          }
        `
      },
      {
        role: 'user',
        content: `
          Génère 7 questions de quiz en accord avec le titre : "${title}" et le hook suivant : "${hook}" !

          *** STRICTEMENT SUIVRE CE FORMAT ***
          **Format JSON ARRAY** :
          {
            "questions" : [
              {
                "question": string,
              }
            ]
          }

          **Instructions pour chaque question** :
            1. : **Question** : Écris une question courte, simple et fun avec un maximum de **13 mots**. Utilise des **emojis** pour rendre la question plus cool et dynamique.
            2. : Assure-toi que les questions sont impersonnelles et ne sollicitent pas les émotions du joueur.
            3. : **Aucun contenu susceptible de changer avec le temps**. Le quiz doit rester stable et intemporel.
            4. : Évite les questions qui pourraient prêter à confusion.
        `
      }
    ]
  }
}


async function createQuiz(hook : string, title : string): Promise<{ questions: {question : string}[]}> {

  let parsedResponse: { questions: {question : string}[]} ;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
      const response = await openai.chat.completions.create(createQuizFromOpenAi(hook, title));
      const jsonResponse = response.choices[0].message?.content || '';
      const cleanedResponse = jsonResponse.trim();
      try {
          parsedResponse = JSON.parse(cleanedResponse);
          if (parsedResponse && Array.isArray(parsedResponse.questions) && parsedResponse.questions.length === 7) {
              const validQuestions = parsedResponse.questions.every((element : {question : string})  => 
              (typeof element.question === 'string' ));
              if (validQuestions) {
                  return parsedResponse;
              } else {
                  throw new Error("Format des questions invalide.");
              }
          }
      } catch (error) {
          console.error("Erreur lors de l'analyse de la réponse JSON:", error);
          throw error;
      }
      attempts++;
  }
  throw new Error("Échec de la génération du QuizMultiple après plusieurs tentatives.");
}


// ############## ADD OPTION #################

function addOptionsQuizFromOpenAi(hook: string, title: string, quiz: { questions: { question: string }[] }): OpenAI.ChatCompletionCreateParamsNonStreaming {
  const quizFormatted = JSON.stringify(quiz);

  return {
    model: "gpt-4o-mini",
    temperature: 0.75,
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `
          T'es un expert en creation de QUIZ DE TYPE QCM : et ton objectif est de creer un tableau d'options avec une seule et unique bonne reponse.
          Voici la liste de  questions de quiz : 

          ${quizFormatted}
          
          **Ce qu'il faut faire pour chaque question** :
            1. Vérifie si la question est claire, amusante et bien alignée avec le thème : "${title}".
            2. Crée un tableau **options : string[]** avec **4 choix** dont **UNE SEULE BONNE REPONSE**.
            3. Assure-toi qu'il y a **une seule réponse correcte** et qu'elle est bien évidente.
            4. Les options doivent inclure des ***emojis*** pour pimper le tout.
            5. La bonne réponse doit être ***super claire*** pour que le joueur n'ait aucun doute.
            6. La bonne réponse doit ***ÊTRE ÉVIDENTE***
          

          **Règles à suivre** :
           - Si une question ou ses options ne collent pas avec le hook "${hook}" et le thème "${title}", ou si elles sont répétitives ou bancales ==> reformule la question et crée des options appropriées.
    
          *** IMPORTANT : 
           1. LE TABLEAU D'OPTIONS DOIT CORRECTEMNT CORRESPONDRE A LA QUESTIONS
           2. TU DOIS PLACER LA BONNE REPONSE DE MANIERE ALEATOIRE DANS LE TABLEAU d'options*** 

          **Exemple de quiz parfait** :
            Hook : 'Héros et anti-héros des contes! 🏰 Qui connaît vraiment Barbe Bleue et Cendrillon? Montre-nous ce que tu sais!',
            Titre : 'Contes en Folie!'
            "questions" : 
            [
              {
                question: '👠 Qui a zappé sa godasse à minuit ?',
                options: ['🧚 Fée Clochette', '🌹 Belle', '👸 Blanche-Neige', '👸 Cendrillon'],
              },
              {
                question: '🐉 Quel héros a explosé un dragon pour sa go ?',
                options: [ '⚔️ Pierre', '🎉 Arthur', '🛡️ Georges', '🏰 Ulysse' ],
              },
              {
                question: '💀 Qui est le boss des tueurs de femmes dans les contes ?',
                options: ['🧚 La Fée des Lilas', '🔪 Barbe Bleue', '🎩 Le Chat Botté', '🐺 Le Loup'],
              },
            ]

          **Format JSON ARRAY attendu** :
          {
            "questions" : [
              {
                "question": "Texte de la question bien formulée",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"], (***IMPORTANT*** une seule est la bonne réponse)
              }
            ]
          }
        `
      },
      {
        role: "user",
        content: `Dans le contexte de création d'un jeu de quiz QCM avec une seule bonne réponse par question :
         Ajoute des options stylées pour le **options : string[]** des questions suivantes : 
        
          ${quizFormatted} 


          ***IMPORTANT*** : 
            1. ****LE TABLEAU OPTIONS pour chaque question DOIT CONTENIR UNE SEULE BONNE REPONSE PARMI LES 4 OPTIONS***
            2. ***LES OPTIONS DOIVENT CONTENIR DES EMOJIS***
            3. Si une question ne correspond pas au thème "${title}" ou au hook "${hook}", reformule-la et attribue-lui un tableau d'options approprié.
            4. TU DOIS PLACER DE MANIERE ALEATOIRE LA BONNE REPONSE DANS LE TABLEAU.
            5. LE TABLEAU D'OPTIONS DOIT CORRECTEMENT CORRESPONDRE A LA QUESTON !!

          *Format JSON ARRAY attendu** :
          {
            "questions" : [
              {
                "question": "Texte de la question bien formulée",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"], 
              }
            ]
          }
        `
      }
    ],
  }
}

async function addOptionsQuiz(hook : string, title : string, quiz : {questions: {question : string}[]}): Promise<{questions: quizInit[]}> {

  let parsedResponse: { questions: preElementQuizMultiple[] };
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
      const response = await openai.chat.completions.create(addOptionsQuizFromOpenAi(hook, title, quiz));
      const jsonResponse = response.choices[0].message?.content || '';
      const cleanedResponse = jsonResponse.trim();

      try {
          parsedResponse = JSON.parse(cleanedResponse);
          if (parsedResponse && Array.isArray(parsedResponse.questions)) {
              const validQuestions = parsedResponse.questions.every((element : quizInit) => 
                  typeof element.question === 'string' &&
                  Array.isArray(element.options) &&
                  element.options.length === 4
              );
              if (validQuestions) {
                  return parsedResponse;
              } else {
                  throw new Error("Format des questions invalide.");
              }
          }
      } catch (error) {
          console.error("Erreur lors de l'analyse de la réponse JSON:", error);
          throw error;
      }
      attempts++;
  }
  throw new Error("Échec de la génération du QuizMultiple après plusieurs tentatives.");
}

// ################################## Correct Option Quiz ######################################

function correctOptionsQuizFromOpenAi(theme : string, item : quizInit): OpenAI.ChatCompletionCreateParamsNonStreaming {
  const quizFormatted = JSON.stringify(item);

  return {
    model: "gpt-4o-mini",
    temperature: 0.50,
    max_tokens: 16384,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
          Vous êtes un expert en création de quiz sur le thème : ${theme}.
          Votre tâche est de vérifier que la question du quiz est correctement associée à son tableau d'options, qu'il y a une seule et unique bonne réponse, et de retourner le tableau dans un ordre aléatoire.
          Voici la question et ses options : ${quizFormatted}.

          **Instructions** :
          1. Vérifiez que la question correspond bien au thème : **${theme}**.
          2. Vérifiez que les options sont bien associées à la question. Si elles ne sont pas pertinentes, modifiez la question ou les options pour assurer leur cohérence.
          3. Assurez-vous que les options contiennent une seule bonne réponse évidente et qu'il n'y a aucune confusion possible.
          4. Si aucune réponse n'est correcte, modifiez les options pour en inclure une seule bonne réponse.
          5. Si la question ne respecte pas le thème, reformulez-la et attribuez un nouveau tableau d'options approprié.
          6. Retournez les options dans un ordre aléatoire pour éviter tout biais.

          **Format de réponse attendu (JSON)** :
          {
            "question": {
              "question": string,
              "options": string[] // 4 options possibles, avec une seule bonne réponse
            }
          }

          **Conseils** :
          - Assurez-vous que la question et les options sont cohérentes et spécifiques au thème.
          - Corrigez ou modifiez les questions et options si nécessaire pour garantir qu'il n'y a qu'une seule bonne réponse.
        `,
      },
      {
        role: "user",
        content: 
        `Pour la question du quiz suivante :

        ${quizFormatted}
        
        **Instructions** :
        1. Assure-toi que le tableau d'options contient une seule réponse correcte, bien associée à la question, et que cette réponse est totalement évidente.
        2. Si les options sont ambiguës ou ne correspondent pas à la question, modifie les options ou reformule la question pour rendre la bonne réponse claire.
        3. Reformule la question ou modifie les options si elles ne sont pas alignées avec le thème "${theme}".

        **Format JSON attendu** :
        {
          "question" : {
            "question": "Texte de la question bien formulée",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
          }
        }
      `,
      },
    ],
  };
}

async function correcteOptionsQuiz(theme: string,  element: quizInit): Promise<quizInit> {
  let parsedResponse: { question: quizInit };
  let attempts = 0;
  const maxAttempts = 3; // Augmenter le nombre d'essais si nécessaire

  while (attempts < maxAttempts) {
    try {
      // Appel à l'API OpenAI
      const response = await openai.chat.completions.create(correctOptionsQuizFromOpenAi(theme, element));
      const jsonResponse = response.choices[0].message?.content || '';
      // Nettoyage de la réponse
      const cleanedResponse = jsonResponse.trim();
      // Analyse de la réponse JSON
      parsedResponse = JSON.parse(cleanedResponse);
      // Validation du format
      if (parsedResponse && parsedResponse.question) {
        const validQuestions = (typeof parsedResponse.question.question === 'string' &&
          Array.isArray(parsedResponse.question.options))
        if (validQuestions) {
          return parsedResponse.question;
        } else {
          throw new Error("Format des questions invalide.");
        }
      } else {
        throw new Error("La réponse JSON ne contient pas le format attendu.");
      }
    } catch (error) {
      console.error("Erreur lors de la génération ou de l'analyse du quiz:", error);
      if (attempts >= maxAttempts - 1) {
        throw new Error("Échec de la génération du quiz après plusieurs tentatives.");
      }
    }
    attempts++;
  }
  throw new Error("Échec de la génération du quiz après plusieurs tentatives.");
}

//###############################  INDEX ##############################################################

function addIndexFromOpenAi(title: string, itemQuestion: quizInit): OpenAI.ChatCompletionCreateParamsNonStreaming {
  const quizFormatted = JSON.stringify(itemQuestion);

  return {
    model: "gpt-4o-mini",
    temperature: 0.35,
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `
          Tu es un expert en résolution de QCM sur le thème suivant : **${title}**. 
          Ta mission est d'identifier la bonne réponse parmi les options pour la question du quiz  de type QCM 
          et d'attribuer correctement la valeur de *correctAnswerIndex*.

          VOICI LA QUESTION : ${quizFormatted}

          **Instructions pour chaque question du quiz** :
          1. Ne modifie **en aucun cas** l'ordre des options du tableau "options". L'ordre d'entrée des options doit rester **strictement identique**.
          2. Identifie la bonne réponse parmi les options déjà présentes.
          3. Attribue l'index correct de la bonne réponse dans la variable *correctAnswerIndex* en fonction de la position de la bonne réponse dans le tableau "options".


          ***IMPORTANT***  Si la bonne réponse n'est pas présente dans le tableau "options" :
            1. : remplace **uniquement** la première option [0] par la bonne réponse 
            2. : assigne "correctAnswerIndex" à 0 pour minimiser les erreurs.

          **Exemple attendu** : 
          {
            "question":"💖 Qui est l'influenceur le plus suivi sur Instagram ?",
            "options":["🌟 Kylie Jenner","🎤 Ariana Grande", "📸 Cristiano Ronaldo", "🌈 Kim Kardashian"],
            "correctAnswerIndex":2
          },
          { 
            "question":"🛍️ Quelle fonctionnalité Instagram permet d'acheter directement depuis l'application ?",
            "options":["📖 Guides","📸 Reels","📦 IGTV", "🛒 Instagram Shopping"],
            "correctAnswerIndex":3
          }

          **Règles à suivre** :
          - Retourne le même tableau ${quizFormatted} avec l'ajout de "correctAnswerIndex" pour chaque question.
          - Formate le résultat en JSON comme suit :

          {
            "question": string,
            "options": string[],
            "correctAnswerIndex": Index de la bonne réponse (0-3)
          }
          - **IMPORTANT : L'ordre des options dans le tableau "options" ne doit pas être modifié. Seul le "correctAnswerIndex" doit être ajusté.**
        `
      },
      {
        role: 'user',
        content: ` Tu es un export en QCM sur le theme : ${title}.
            Identifie la bonne reponse dans le tableau d'options de la question suivante : ${quizFormatted} 
            et ajoute  la variable "correctAnswerIndex" qui correspont a l'index de la bonne reponse. 
            N'oublie pas que "correctAnswerIndex" doit correspondre à l'index de la bonne réponse dans le tableau "options". 
          `
      }
    ],
  };
}

async function addIndexInTab(title : string, itemQuestion: quizInit): Promise<preElementQuizMultiple> {
  let parsedResponse: preElementQuizMultiple ;
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
      const response = await openai.chat.completions.create(addIndexFromOpenAi(title, itemQuestion));
      const jsonResponse = response.choices[0].message?.content || '';
      const cleanedResponse = jsonResponse.trim();
      try {
          parsedResponse = JSON.parse(cleanedResponse);
          if (parsedResponse) {
              const validQuestions = (
                  typeof parsedResponse.question === 'string' &&
                  Array.isArray(parsedResponse.options) &&
                  parsedResponse.options.length === 4 &&
                  typeof parsedResponse.correctAnswerIndex === 'number' &&
                  parsedResponse.correctAnswerIndex >= 0 &&
                  parsedResponse.correctAnswerIndex < 4
              );
              if (validQuestions) {
                  return parsedResponse;
              } else {
                  throw new Error("Format des questions invalide.");
              }
          }
      } catch (error) {
          console.error("Erreur lors de l'analyse de la réponse JSON:", error);
          throw error;
      }
      attempts++;
  }
  throw new Error("Échec de la génération du QuizMultiple après plusieurs tentatives.");
}

//############################ Correct QUIZ FINAL ################################

function correctQuizFromOpenAi(theme: string, quiz: preElementQuizMultiple[]): OpenAI.ChatCompletionCreateParamsNonStreaming {
  const quizFormatted = JSON.stringify(quiz);
  return {
    model: "gpt-4o-mini",
    temperature: 0.35, // Ajustement pour plus de précision et moins de variabilité
    max_tokens: 16384,
    response_format: { "type": "json_object" },
    messages: [
      {
        role: 'system',
        content: `
          Vous êtes un expert en validation de quiz sur le thème : ${theme}.
          Votre tâche est de vérifier et valider les réponses pour chaque question du quiz ci-dessous :

          **Quiz à vérifier** :
          ${quizFormatted}

          **Instructions** :
          1. Examinez chaque question et ses options pour vérifier si elles sont cohérentes et bien associées.
          2. Assurez-vous que l'index de la bonne réponse est correctement attribué à "correctAnswerIndex".
          3. Si l'index ne correspond pas à la bonne réponse, corrigez-le.
          4. Si les options sont incorrectement associées à la question, reformulez-les ou ajustez-les pour correspondre.

          **Format de réponse attendu (JSON Array)** :
          { 
            "questions" : [
              {
                question: string,
                options: string[],
                "correctAnswerIndex": Index de la bonne réponse (0-3)
              },
            ]
          }
        `
      },
      {
        role: 'user',
        content: `
          Validez le quiz suivant pour le thème "${theme}" :
      
          Quiz :
          ${quizFormatted}
      
          **Tâches** :
          - Vérifiez que chaque "correctAnswerIndex" correspond à la bonne réponse dans le tableau "options".
          - Corrigez l'index si nécessaire pour qu'il reflète la bonne réponse.
      
          Retournez le quiz mis à jour en respectant le format initial.
        `
      }
    ],
  };
}


async function correcteQuiz(theme: string, quiz: preElementQuizMultiple[]): Promise<preElementQuizMultiple[]> {
  let parsedResponse: { questions: preElementQuizMultiple[] };
  let attempts = 0;
  const maxAttempts = 3; // Augmenter le nombre d'essais si nécessaire
// 
  while (attempts < maxAttempts) {
    try {
      // Appel à l'API OpenAI
      const response = await openai.chat.completions.create(correctQuizFromOpenAi(theme, quiz));
      const jsonResponse = response.choices[0].message?.content || '';
      // Nettoyage de la réponse
      const cleanedResponse = jsonResponse.trim();
      // Analyse de la réponse JSON
      parsedResponse = JSON.parse(cleanedResponse);
      // Validation du format
      if (parsedResponse && Array.isArray(parsedResponse.questions) && parsedResponse.questions.length === 7) {
        const validQuestions = parsedResponse.questions.every((element: preElementQuizMultiple) => 
          typeof element.question === 'string' &&
          Array.isArray(element.options) &&
          element.options.length === 4 &&
          typeof element.correctAnswerIndex === 'number' &&
          element.correctAnswerIndex >= 0 &&
          element.correctAnswerIndex < 4
        );
// 
        if (validQuestions) {
          return parsedResponse.questions;
        } else {
          throw new Error("Format des questions invalide.");
        }
      } else {
        throw new Error("La réponse JSON ne contient pas le format attendu.");
      }
    } catch (error) {
      console.error("Erreur lors de la génération ou de l'analyse du quiz:", error);
      if (attempts >= maxAttempts - 1) {
        throw new Error("Échec de la génération du quiz après plusieurs tentatives.");
      }
    }
    attempts++;
  }
  throw new Error("Échec de la génération du quiz après plusieurs tentatives.");
}

export async function preGenerateQuizMulitiple(hook : string, title : string) : Promise<preElementQuizMultiple[]> {

  const createdQuestion : {questions: {question : string}[]} = await createQuiz(hook, title);
  // console.log("Generated Questions :" , createdQuestion)

  const addedOptionsTab : {questions: quizInit[]} = await addOptionsQuiz(hook, title, createdQuestion)
  // console.log("Added Options:" , JSON.stringify(addedOptionsTab))

  const correctedOptionsTab :  quizInit[] = []
  for (const itemQuestion of addedOptionsTab.questions) {
    const correctedElement : quizInit = await correcteOptionsQuiz(title, itemQuestion)

      const clonedOptions = [...correctedElement.options];
      const shuffledOptions: string[] = shuffleArray(clonedOptions);
      const formatedItem: quizInit = {
        question: itemQuestion.question,
        options: shuffledOptions
      };
    correctedOptionsTab.push(formatedItem)
  }
  // console.log("Corrected Options:" , JSON.stringify(correctedOptionsTab))


  const preQuizElements : preElementQuizMultiple[] = [];
  for (const itemQuestion of correctedOptionsTab) {
    // Cloner le tableau d'options pour préserver les données originales
    const clonedOptions = [...itemQuestion.options];
    // Mélanger les options
    const shuffledOptions: string[] = shuffleArray(clonedOptions);
    // Créer l'objet formaté avec les options mélangées
    const formatedItem: quizInit = {
      question: itemQuestion.question,
      options: shuffledOptions
    };
    const element: preElementQuizMultiple = await addIndexInTab(title, formatedItem); 
    preQuizElements.push(element);
  }

  const correctedPreQuizElements : preElementQuizMultiple[] = await correcteQuiz(title, preQuizElements)
  
  // console.log("First preGeneratedQuiz : " , JSON.stringify(preQuizElements))
  // console.log("Final preGeneratedQuiz : " , JSON.stringify(correctedPreQuizElements))

  // Mélanger le tableau de questions
  const clonedTab = [...correctedPreQuizElements];

  const shuffledQuiz : preElementQuizMultiple[] = shuffleArray(clonedTab)
 
  // Retourner le tableau mélangé
  return shuffledQuiz; 
};
