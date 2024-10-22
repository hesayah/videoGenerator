  
export type backGroundProps = {
    url : string,
    start: number,
    end : number
}
    
export  type backGroundInfo = {
    url: string;
    durationInFps: number;
}

// type Caption = {
    // text: string;
    // startInSeconds: number;
// };

export type audioProps = {
    audioSrc : string,
    duration : number,
    // captions : Caption[],
}

export type ParamsProps = {
    fps : number,
    width: number,
    height: number,
    durationInFps : number,
    pauseDuration : number,
    reflectionDuration : number;  
}


export type preElementQuizAff = { affirmation : string }

export type elementQuizAff = {
    affirmation : string;
    audioProps: audioProps;
}

export type QuizAffProps = {
    quiz: elementQuizAff[];
    themeQuiz: string;
    hookSentence: string;
    hookSentenceAudioProps: audioProps;
    ctaSentence: string;
    ctaSentenceAudioProps: audioProps;
    backGroundProps: backGroundProps;
}


export type preElementQuizWhoIAm = {fact : string}


export type elementQuizWhoIAm = {
    fact: string;
    audioProps : audioProps;
}

export type WhoIAmAnswer = {
    imgSrc : string;
    audioProps : audioProps;
}

export type QuizWhoIAmProps = {
    quiz: elementQuizWhoIAm[];
    characterName : string;
    answer : WhoIAmAnswer;
    hookSentence : string;
    hookSentenceAudioProps : audioProps
    ctaSentence : string;
    backGroundProps : backGroundProps;
}

export type preElementQuizMultiple = {question : string, options : string[], correctAnswerIndex : number}

export type elementQuizMultiple = {
    question: string;
    options: string[];
    correctAnswerIndex : number;
    answerAudioProps : audioProps
    imgSrc : string;
    audioProps : audioProps;
}

export type QuizMultipleProps = {
    quiz: elementQuizMultiple[];
    themeQuiz : string;
    hookSentence : {hook : string, title : string};
    hookSentenceAudioProps : audioProps;
    ctaSentenceAudioProps : audioProps
    ctaSentence : string;
    backGroundProps : backGroundProps;
}

export interface themeQuizMultipletForOpenAi {
    theme: string;
    category: {
        name: string;
        subCategory: string[];
    };
}

export type TaleProps = {
    name: string; // Nom du conte
    storyContent: string; // Contenue de l'histoire
    scenes: SceneProps[]; // Relation vers le modèle Scene
    cinematicProps : CinematicPropsType; // Propriété cinématique
    status: 'Initied' | 'Processing' | 'Complete'; // Statut du conte
    generationId: number; // Identifiant de génération unique
};
  
export type SceneProps = {
    content: string; // Contenu en text de la scène
    segments: SegmentProps[]; // Tableau optionnel de SegmentProps
};
  
export type SegmentProps = {
    descriptionPrompt: string; // Prompt décrivant le segment pour midjourney
    content: string; // Contenu du segment
    imageUrl: string; // URL de l'image générée
    audioProps: audioProps; // URL de la voix générée
};
  
export  type CinematicPropsType = {
    context: string; // Contexte de la scène
    style: string; // Style cinématique
    colorPalette: string; // Palette de couleurs
    lighting: string; // Éclairage
    mood: string; // Ambiance
    characterDesign: string; // Design des personnages
    environment: string; // Environnement
    generationId: number; // Clé étrangère vers Scene
};