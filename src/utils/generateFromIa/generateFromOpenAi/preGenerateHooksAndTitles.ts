import openai from "./openai";
import OpenAI from "openai";

//######################################## HOOOKS AND TITLE ##############################################

function createHooks(themes: string): OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.60,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
          Tu es un expert en création de hooks captivants pour des quiz. 
          Ta mission est de concevoir des accroches dynamiques et motivantes pour chaque thème. 
          Chaque hook servira à générer une série de 7 questions de quiz à choix multiples (QCM), chacune avec 4 options de réponse dont une seule est correcte.

           ***LE PUBLIC EST UN PUBLIC FRANCAIS**** : Vocabulaire et notion adapté au PUBLIC FRANCAIS


          **Objectif** :
          - Créer **1 hook** percutants pour chaque thème fourni.
          - Les hooks doivent etre adapté pour le public français.
          - Chaque hook doit captiver l'utilisateur, le challenger et l'inciter à participer activement au quiz.
          - Les hooks doivent inspirer des questions de quiz amusantes, stimulantes et engageantes.

          **Instructions pour les Hooks** :
          - Fournir une liste de **hooks** avec 1 hook par thème, chaque hook ne dépassant pas **15 mots**.
          - Les hooks ne doivent pas être presenté de manière interpersonnelles.
          - Utiliser un **jargon jeune** et moderne (par exemple : flex, fragile, blazer, squeezer, kiffer, banger, hess, etc.).
          - Chaque hook doit être spécifique au thème et inspirer des questions de quiz.
          - Employez un ton taquin et motivant, en ajoutant des emojis pour plus d'impact.
          - Les Hooks doivent rester impersonnelles, sans impliquer les émotions ou le vécu du joueur.
          - Ne réutilise pas des Hooks déjà générées pour d'autres utilisateurs.

          **Exemples de Hooks Non Valides** :
          - 'Influenceurs au top! 💫 Raconte-nous tes histoires préférées et prouve que tu connais les buzzers du moment!' (erreur : demande au joueur de raconter)
          - 'Revival time! 🎤 Rappelle-toi des sons des années 70 à 90, qui gère ici? Teste tes souvenirs avec notre quiz nostalgique!' (long et pas clair)
          - 'Pop culture coréenne à gogo! 🇰🇷 Qui sait vraiment ce qui fait vibrer la K-culture? Teste tes connaissances et surprends-nous!' (trop général)

          **Exemples de Hooks Valides** :
          - 'Héros badass et guerrières! 🤠💥 Es-tu un vrai fan des westerns? Viens prouver tes connaissances avec notre quiz !'
          - 'Science-fiction en mode renouveau! 🚀 T'es partant pour un voyage dans l'espace des séries ? Montre-nous ce que tu sais avec ce quiz !'
          - 'Revival time! 🎤 Sons des années 70 à 90, qui gère ici ? Teste tes souvenirs avec notre quiz nostalgique !'
          - 'Es-tu prêt à prouver tes connaissances ? 🤔🧠 Teste-toi avec notre quiz !'
          - 'Pop culture coréenne à gogo! 🇰🇷 Tu KIFF la K-culture ? Teste tes connaissances et surprends-nous !'

          ***IMPORTANT*** : Chaque hook doit servir d'introduction à une série de QCM. Assure-toi qu'ils sont captivants et adaptés pour générer des questions engageantes.

          **Format de Réponse** :
          - Retourne un JSON avec les hooks générés pour chaque thème.
          - Format attendu : 
          {
            "hooks": [
              "hook 1",
              "hook 2",
              "hook 3",
              "hook 4",
              "hook 5"
            ]
          }

          **Exigences Importantes** :
          - Les hooks doivent introduire clairement le thème et motiver les utilisateurs à participer.
          - Inclure des défis et des provocations pour susciter l'intérêt.
          - Préparer le terrain pour des questions intrigantes et engageantes.

          **Exemple** :
          - Pour le thème "Mythologie grecque", un bon hook pourrait être : "Prouve que tu connais les dieux grecs ! 🏛️⚡ Prêt à relever le défi ?"
          - Les questions suivantes seront basées sur ce hook, testant les connaissances sur la mythologie.

          Fournis des hooks originaux et spécifiques qui pourront facilement être transformés en séries de questions de quiz.
        `
      },
      {
        role: "user",
        content: `Crée des hooks en français pour les thèmes suivants : ${themes}
        ***ATTENTION*** : 
          - Les Hooks doivent rester impersonnelles, sans impliquer les émotions ou le vécu du joueur.
          - Ne réutilise pas des Hooks déjà générées pour d'autres utilisateurs.
        `
      }
    ]
  };
}


function selectHook(hooks: string[]): OpenAI.ChatCompletionCreateParamsNonStreaming {
  return {
    model: "gpt-4o-mini",
    temperature: 0.65,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
          Tu es un expert en phrases d'accroche (hooks) qui attirent l'attention et créent l'envie de jouer à des quiz. 
          Ton objectif est de transformer chaque hook en une entrée percutante pour un quiz à choix multiple (QCM), avec des titres accrocheurs.

          ***LE PUBLIC EST UN PUBLIC FRANCAIS**** : Vocabulaire et notion adapté au PUBLIC FRANCAIS

          **Ta mission** :
            - Corriger les hooks non pertinents ou pas adaptés pour qu'ils servent d'introduction à un quiz QCM.
            - Attribuer un titre cool et accrocheur à chaque hook.

          **Instructions** :
          1. **Modification des Hooks** : 
            - Ajuste les hooks pour qu'ils soient clairs, engageants, et orientés vers un contexte de quiz.
            - Assure-toi que chaque hook invite à relever un défi ou à tester ses connaissances, avec un ton taquin, amical et motivant.
            - Utilise du **jargon jeune** pour rendre le tout fun et dynamique.
            - Priorise les informations pertinentes pour un public en France, en évitant les questions personnelles ou trop introspectives.
          
          2. **Création des Titres** :
            - Crée des titres courts (3 mots max) qui captent l'essence du hook et du quiz.
            - Garde un ton léger, amusant et accessible, en évitant les termes trop techniques ou complexes.

          **Format attendu** :
          - Retourne un tableau JSON avec chaque hook et son titre associé.
          - Format attendu : ***JSON ARRAY FORMAT***
          {
            "hooks": [
              { "hook": "texte du hook sélectionné", "title": "le titre du quiz" }
            ]
          }

          **Exemples de Hooks Corrigés et Titres Associés** :
          - Hook : 'Es-tu prêt à prouver tes connaissances? 🤔🧠 Teste-toi avec notre quiz !'
            - Titre : 'Culture G Fun!'
          - Hook : 'Pop culture coréenne à gogo! 🇰🇷 Tu KIFF la K-culture? Teste tes connaissances et surprends-nous !'
            - Titre : 'K-Culture Mania!'
          - Hook : 'Revival time! 🎤 Sons des années 70 à 90, qui gère ici? Teste tes souvenirs avec notre quiz nostalgique !'
            - Titre : 'Vintage Vibes'

          **Conseils** :
          - Les hooks doivent être fun et accessibles, tout en incitant les utilisateurs à se défier sur le thème du quiz.
          - Les titres doivent refléter l'esprit du quiz et donner envie de jouer. N'oublie pas d'utiliser un jargon jeune pour maximiser l'impact !

          ***IMPORTANT*** :
          - Assure-toi que les hooks sont adaptés à un contexte francophone, avec des références culturelles en accord avec la France.
        `
      },
      {
        role: "user",
        content: `Voici une liste de hooks : ${hooks}

        **MODIFICATION DES HOOKS** :
        - Assurez-vous que chaque hook est clairement orienté pour un contexte de quiz.
        - Si les hooks ne correspondent pas aux règles, ajustez-les pour qu'ils deviennent des accroches efficaces pour une série de questions QCM.
        - Crée des titres percutants et en adéquation avec le hook.
        `
      }
    ]
  };
}

async function selectBestHookFromOpenAi(hooks: string[]): Promise<{hook : string, title : string}[]> {
  let parsedResponse : {hooks : {hook : string, title : string}[]};
  let attempts = 0;
  const maxAttempts = 1;

  while (attempts < maxAttempts) {
      const response = await openai.chat.completions.create(selectHook(hooks));
      const jsonResponse = response.choices[0].message?.content || '';
      const cleanedResponse = jsonResponse.trim();

      try {
          parsedResponse = JSON.parse(cleanedResponse);
          if (parsedResponse &&  Array.isArray(parsedResponse.hooks)) {
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

export async function createHooksAndTitlesFromOpenAi(themes: string): Promise<{hook : string, title : string}[]> {
  let parsedResponse : {hooks : string[]};
  let attempts = 0;
  const maxAttempts = 1;

  while (attempts < maxAttempts) {
      const response = await openai.chat.completions.create(createHooks(themes));
      const jsonResponse = response.choices[0].message?.content || '';
      const cleanedResponse = jsonResponse.trim();

      try {
          parsedResponse = JSON.parse(cleanedResponse);
          if (parsedResponse && Array.isArray(parsedResponse.hooks)) {
              const bestHookQuiz = await selectBestHookFromOpenAi(parsedResponse.hooks)
              // console.log(parsedResponse);
              // console.log(bestHookQuiz);
              return (bestHookQuiz)
          }
      } catch (error) {
          console.error("Erreur lors de l'analyse de la réponse JSON:", error);
          throw (error)
      }
      attempts++;
  }
  throw new Error("Échec de la génération du hook plusieurs tentatives.");
}

