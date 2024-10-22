import { Composition } from 'remotion';
import { QuizMultiple } from './compositions/QuizMultipe';
import { QuizWhoIAm } from './compositions/QuizWhoIAm';
import { QuizAff } from './compositions/QuizAff';
import {  elementQuizMultiple, ParamsProps, QuizAffProps, QuizMultipleProps, QuizWhoIAmProps } from './compositions/interfaces';
import {getInputProps} from 'remotion';
import "../styles/globals.css";

const defaultQuizMultipleValues: QuizMultipleProps = {
    "quiz": [
        {            "question": "🦁 Quel personnage emblématique chante 'Hakuna Matata' dans Le Roi Lion ?",
            "options": [
                "🧙‍♂️ Rafiki",
                "🐗 Pumbaa",
                "🦁 Simba",
                "🦅 Zazu"
            ],
            "correctAnswerIndex": 1,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_0.mp3",
                "duration": 4.022813
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_0.mp3",
                "duration": 0.91425
            },
        },
        {
            "question": "🎈 Quel chef-d'œuvre commence avec une maison flottante suspendue à des ballons colorés ?",
            "options": [
                "👴 En Avant",
                "🏡 Là-Haut",
                "🌈 Ratatouille",
                "🎢 Toy Story"
            ],
            "correctAnswerIndex": 1,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_1.mp3",
                "duration": 4.414688
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_1.mp3",
                "duration": 1.071
            },
        },
        {
            "question": "🚀 Qui est le meilleur pote d'Andy dans Toy Story ?",
            "options": [
                "🤠 Woody",
                "🧸 Buzz l'Éclair",
                "🐍 Ziggy",
                "🐴 Rex"
            ],
            "correctAnswerIndex": 0,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_2.mp3",
                "duration": 2.742813
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_2.mp3",
                "duration": 0.835875
            },
        },
        {
            "question": "👨‍🍳 Quel rat ambitieux rêve de devenir grand chef dans Ratatouille ?",
            "options": [
                "🍽️ Gusteau",
                "🐀 Linguini",
                "🧀 Emile",
                "🐭 Remy"
            ],
            "correctAnswerIndex": 3,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_3.mp3",
                "duration": 3.761625
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_3.mp3",
                "duration": 0.731375
            },
        },
        {
            "question": "🐉 Quel dragon courageux accompagne Mulan dans sa quête héroïque ?",
            "options": [
                "🐉 Mushu",
                "🐉 Sisu",
                "🐉 Draco",
                "🐉 Figment"
            ],
            "correctAnswerIndex": 0,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_4.mp3",
                "duration": 3.709375
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_4.mp3",
                "duration": 0.91425
            },
        },
        {
            "question": "🔍 Quel monstre bleu hilarant bosse avec Mike Wazowski à Monstropolis ?",
            "options": [
                "🚪 George",
                "👾 Randall",
                "👹 Sulley",
                "🐉 Boo"
            ],
            "correctAnswerIndex": 2,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_5.mp3",
                "duration": 4.179563
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_5.mp3",
                "duration": 0.783625
            },
        },
        {
            "question": "🧚 Quelle fée magique est la meilleure amie de Peter Pan ?",
            "options": [
                "🧚‍♀️ La Fée des Neiges",
                "🌼 La Fée des Fleurs",
                "🌟 Fée Clochette",
                "🧚‍♂️ La Fée des Lilas"
            ],
            "correctAnswerIndex": 2,
            "imgSrc": "",
            "audioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_6.mp3",
                "duration": 3.056313
            },
            "answerAudioProps": {
                "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/audio_answer_6.mp3",
                "duration": 0.9665
            },
        }
    ],
    "themeQuiz": "[\"Personnages Disney et Pixar\"]",
    "hookSentence": {
        "hook": "Prêt à plonger dans l'univers magique de Disney-Pixar ? 🌟 Teste tes connaissances et découvre si tu es le vrai expert !",
        "title": "Disney-Pixar Challenge!"
    },
    "hookSentenceAudioProps": {
        "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/hookSentence.mp3",
        "duration": 7.340375
    },
    "ctaSentence": "Yo, clique sur s'abonner pour pas rater les bails ! 🔥📲",
    "ctaSentenceAudioProps": {
        "audioSrc": "QuizMultiple/6c554a5e-92bd-4619-b7ac-bed503b361e4/ctaSentence.mp3",
        "duration": 7.288125
    },
    backGroundProps : {
        "url": "http://localhost:3000/background/4.mp4",
        "start": 9599,
        "end": 11459
    }
};


const defaultQuizWhoIAmValues: QuizWhoIAmProps = {
  quiz: [
    {
      fact: "Je suis une planète",
      audioProps: {
        audioSrc: 'soundEffects/answer.mp3',
        duration: 30,
      }
    },
    {
      fact: "Je suis rouge",
      audioProps: {
        audioSrc: 'soundEffects/answer.mp3',
        duration: 30,
      }
    },
    {
      fact: "Je suis la quatrième planète du système solaire",
      audioProps: {
        audioSrc: 'soundEffects/answer.mp3',
        duration: 30,

      }
    }
  ],
  characterName: "Harry Potter",
  answer: {
    imgSrc: 'https://resize.elle.fr/square_1280/var/plain_site/storage/images/loisirs/livres/news/harry-potter-de-nouveaux-secrets-devoiles-2913738/53231812-1-fre-FR/Harry-Potter-de-nouveaux-secrets-devoiles.jpg',
    audioProps: {
      audioSrc: 'soundEffects/answer.mp3',
      duration: 60,

    }
  },
  hookSentence: "Bienvenue au quiz Qui suis-je?",
  hookSentenceAudioProps: {
    audioSrc: 'soundEffects/answer.mp3',
    duration: 60,
  },
  ctaSentence: "Devinez qui je suis pour tester vos connaissances!",
  backGroundProps: {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    start: 0,
    end: 2100
  }
};

const defaultQuizAff: QuizAffProps = {
  quiz: [
    {
      affirmation: "Le soleil se lève à l'est.",
      audioProps: {
        audioSrc: 'soundEffects/answer.mp3',
        duration: 30,
      }
    },
    {
      affirmation: "L'eau gèle à 0 degrés Celsius.",
      audioProps: {
        audioSrc: 'soundEffects/answer.mp3',
        duration: 30,
      }
    },
    {
      affirmation: "La terre est ronde.",
      audioProps: {
        audioSrc: 'soundEffects/answer.mp3',
        duration: 30,
      }
    }
  ],
  themeQuiz: "Connaissances Générales",
  hookSentence: "Bienvenue au quiz de connaissances générales!",
  hookSentenceAudioProps: {
    audioSrc: 'soundEffects/answer.mp3',
    duration: 60,
  },
  ctaSentence: "Répondez aux questions pour tester vos connaissances!",
  ctaSentenceAudioProps: {
    audioSrc: 'soundEffects/answer.mp3',
    duration: 60,
  },
  backGroundProps: {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    start: 0,
    end: 2100
  }
};

export const RemotionRoot: React.FC = () => {

 
  let fps = 30;
  let durationInFrames = 1900;
  let pauseDuration = 0.5 * fps;
  let reflectionDuration = 2 * fps;

  const calculateQuizDuration = (quiz : elementQuizMultiple[], reflectionDuration : number,  pauseDuration : number, fps : number) => {
    return quiz.reduce((totalDuration, item) => {
      const questionDuration = item.audioProps.duration * fps;
      const answerDuration = item.answerAudioProps.duration * fps;
      return totalDuration + questionDuration + answerDuration + pauseDuration + reflectionDuration;
    }, 0);
  };
  
  const calculateTotalDuration = (
    quizProps: QuizMultipleProps, 
    pauseDuration : number, 
    reflectionDuration: number,
  ): {durationInFps : number, newPauseDuration : number, newReflectionDuration : number} => {
    const hookDuration = quizProps.hookSentenceAudioProps.duration * fps;
    const ctaDuration = quizProps.ctaSentenceAudioProps.duration * fps + fps;
    const quizDuration = calculateQuizDuration(quizProps.quiz, reflectionDuration, pauseDuration, fps);
    const result = Math.floor(hookDuration + quizDuration + ctaDuration);

    // Continue incrementing pauseDuration and reflectionDuration until result >= 1860
    if (result < 1860) {
      pauseDuration += 5, 
      reflectionDuration += 15
      return calculateTotalDuration(
        quizProps, 
        pauseDuration, 
        reflectionDuration
      );
    }
    const newPauseDuration = pauseDuration;
    const newReflectionDuration =  reflectionDuration;
    return ({
      durationInFps : result, 
      newPauseDuration, 
      newReflectionDuration,
    });
  };

  const inputProps : QuizMultipleProps = getInputProps();
  const quizProps = inputProps || defaultQuizMultipleValues;
  const  result = calculateTotalDuration(quizProps, pauseDuration, reflectionDuration);

  const paramsProps : ParamsProps = {
    fps : fps,
    durationInFps: result.durationInFps,
    pauseDuration: result.newPauseDuration,
    reflectionDuration: result.newReflectionDuration,
    width : 1080,
    height : 1920,
  }
  durationInFrames = result.durationInFps;

  return (
  <>
    <Composition
      id="QuizMultiple"
      component={QuizMultiple}
      durationInFrames={paramsProps.durationInFps} // 70 seconds at 30 fps
      fps={paramsProps.fps}
      width={paramsProps.width}
      height={paramsProps.height}
      defaultProps={{ ...quizProps , ...paramsProps }}
    />
    <Composition
      id="QuizWhoIAm"
      component={QuizWhoIAm}
      durationInFrames={durationInFrames} // 70 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ ...defaultQuizWhoIAmValues }}
    />
    <Composition
      id="QuizAff"
      component={QuizAff}
      durationInFrames={durationInFrames} // 70 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ ...defaultQuizAff }}
    />
  </>
  );
};