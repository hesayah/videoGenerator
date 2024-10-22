import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile, Audio, OffthreadVideo } from 'remotion';
import React, { useState, useEffect } from 'react';
import { audioProps, elementQuizMultiple } from './interfaces';
import { QuizMultipleProps } from './interfaces';
import { ParamsProps } from './interfaces';
import { Captions } from './Captions';

export const QuizMultiple: React.FC<QuizMultipleProps & ParamsProps > = ({
  quiz,
  hookSentence,
  ctaSentence,
  hookSentenceAudioProps,
  ctaSentenceAudioProps,
  pauseDuration,
  reflectionDuration,
  backGroundProps
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height, width } = useVideoConfig();
  const hookDuration = hookSentenceAudioProps.duration * fps;
  const ctaDuration = ctaSentenceAudioProps.duration * fps;
  const [questionDurations, setQuestionDurations] = useState<number[]>([]);
  const [isDurationsReady, setIsDurationsReady] = useState<boolean>(false);

  useEffect(() => {
    const totalQuizDuration = durationInFrames - hookDuration - ctaDuration;
    const durations: number[] = [];
    let remainingDuration = totalQuizDuration;
  
    for (let i = 0; i < quiz.length; i++) {
      const questionAudioDuration = quiz[i].audioProps.duration * fps;
      const answerAudioDuration = quiz[i].answerAudioProps.duration * fps;
      const questionDuration = questionAudioDuration + answerAudioDuration + reflectionDuration;
      durations.push(questionDuration);
      remainingDuration -= (questionDuration + pauseDuration);
    }

    // Vérifier si la durée totale des questions dépasse la durée totale disponible
    if (remainingDuration < 0) {
      console.warn("La durée totale des questions dépasse la durée totale disponible.");
    }

    setQuestionDurations(durations);
    setIsDurationsReady(true);
  }, [quiz, durationInFrames, hookDuration, ctaDuration, fps, pauseDuration, reflectionDuration]);
  
  if (!isDurationsReady) {
    return null;
  }
  
  // Calcul du moment où la transition doit avoir lieu après chaque question
  const quizDuration = questionDurations.reduce((acc, d) => acc + d + pauseDuration, 0);
  
  // Modification du reduce pour calculer correctement le début de la transition

  const translateY = interpolate(frame, [hookDuration - fps, hookDuration], [0, height], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <BackGround url={backGroundProps.url} start={backGroundProps.start} end={backGroundProps.end} duration={durationInFrames} />
      <HookPhraseSequence hookDuration={hookDuration} translateY={translateY} hookSentence={hookSentence.hook} />
      <SoundEffect
        frame={1}
        volume={1}
        local={true}
        duration={hookSentenceAudioProps.duration * 30}
        url={hookSentenceAudioProps.audioSrc}
      />
      <TitleSection hookDuration={hookDuration} title={hookSentence.title} />
      <QuizSection quiz={quiz} questionDurations={questionDurations} frame={frame} fps={fps} width={width} hookDuration={hookDuration} ctaDuration={ctaDuration} pauseDuration={pauseDuration} ctaAudioProps={ctaSentenceAudioProps} ctaSentence={ctaSentence} />
      <FollowMe strartFrame={hookDuration} frame={frame} fps={fps} />
      <FollowMe strartFrame={Math.floor((quizDuration + hookDuration) / 2)} frame={frame} fps={fps} />

      <FooterBranding hookDuration={hookDuration} />
    </AbsoluteFill>
  );
};


const SoundEffect: React.FC<{ frame: number, duration: number, local: boolean, url: string, volume: number }> = ({ frame, duration, local, url, volume }) => (
  <Sequence from={frame} durationInFrames={duration}>
    <Audio loop volume={volume} src={local ? staticFile(url) : url} />
  </Sequence>
);

const BackGround: React.FC<{ url: string, start: number, end: number, duration: number }> = ({ url, start, end, duration }) => {
  return (
    <AbsoluteFill>
      <OffthreadVideo 
        className="absolute top-0 left-0 w-full h-full object-cover blur-sm"
        src={staticFile("/background/7.mp4")}
        muted
      />
    </AbsoluteFill>
  );
};

const HookPhraseSequence: React.FC<{ hookDuration: number, translateY: number, hookSentence: string }> = ({ hookDuration, translateY, hookSentence }) => (
  <Sequence from={0} durationInFrames={hookDuration}>
    <AbsoluteFill className="flex items-center justify-center text-center" style={{ transform: `translateY(${translateY}px)` }}>
      <div className="bg-orange-600 text-white text-wrap text-center text-7xl mx-24 p-16 font-bold rounded-badge w-[80%] drop-shadow-xl font-serif text-shadow-black">
        <Captions currentText={hookSentence} duration={hookDuration / 30} />
      </div>
    </AbsoluteFill>
  </Sequence>
);

const TitleSection: React.FC<{ hookDuration: number, title: string }> = ({ title }) => (
  <Sequence from={0}>
    <div className="absolute top-48 w-full flex justify-center">
      <div className="bg-yellow-400 text-white text-center text-wrap text-6xl font-extrabold p-8 rounded-3xl drop-shadow-xl w-[80%] font-serif text-shadow-black">
        MurphyQuiz : {title}
      </div>
    </div>
  </Sequence>
);

const QuizSection : React.FC<{
  quiz: elementQuizMultiple[];
  hookDuration: number;
  ctaDuration : number;
  questionDurations: number[];
  pauseDuration: number;
  frame: number;
  fps : number;
  width : number;
  ctaSentence : string;
  ctaAudioProps : audioProps;
}> = ({
  hookDuration,
  ctaDuration,
  questionDurations,
  pauseDuration,
  frame,
  quiz,
  fps,
  width,
  ctaSentence,
  ctaAudioProps,
}) =>  {

  const middle = Math.floor(quiz.length/2);
  const startCta = hookDuration + questionDurations.slice(0, middle).reduce((sum, d) => sum + d + pauseDuration, 0);
  const middleTime = startCta + ctaDuration + pauseDuration;
  const getQuizTransitionOne = (index: number) => {
    const transitionStart = hookDuration + questionDurations
      .slice(0, index + 1) // Inclut la question en cours
      .reduce((sum, d, i) => sum + d + (i < index ? pauseDuration : 0), 0); // Ajoute la pause uniquement pour les questions précédentes
  
      const transitionProgress = spring({
        frame: frame - transitionStart,
        fps,
        config: {
          damping: 200,
          stiffness: 100,
        },
      });
      return `translateX(${interpolate(transitionProgress, [0, 1], [0, -width])}px)`;
    };
    const getQuizTransitionTwo = (index: number) => {
      const transitionStart = hookDuration + ctaDuration + questionDurations
        .slice(0, index + 1) // Inclut la question en cours
        .reduce((sum, d, i) => sum + d + (i < index ? pauseDuration : 0), 0); // Ajoute la pause uniquement pour les questions précédentes
    
        const transitionProgress = spring({
          frame: frame - transitionStart,
          fps,
          config: {
            damping: 200,
            stiffness: 100,
          },
        });
        return `translateX(${interpolate(transitionProgress, [0, 1], [0, -width])}px)`;
      };
  
  return (
    <>
    {quiz.slice(0,middle).map((quizItem, quizIndex) => (
    <React.Fragment key={quizIndex}>
      <QuizSectionOne
        quizItem={quizItem}
        quizIndex={quizIndex}
        hookDuration={hookDuration}
        questionDurations={questionDurations}
        pauseDuration={pauseDuration}
        frame={frame}
        getQuizTransition={getQuizTransitionOne}
      />
      <SoundEffect
        key={`swipe_${quizIndex}`}
        volume={0.5}
        frame={hookDuration + questionDurations.slice(0, quizIndex + 1).reduce((sum, d, i) => sum + d + (i < quizIndex ? pauseDuration : 0), 0)}
        local={true}
        duration={15}
        url='soundEffects/swipe.mp3'
      />
    </React.Fragment>
    ))}
    {quiz.slice(middle, quiz.length).map((quizItem, quizIndex) => (
    <React.Fragment key={quizIndex}>
      <QuizSectionTwo
        quizItem={quizItem}
        quizIndex={quizIndex}
        middleTime={middleTime}
        questionDurations={questionDurations}
        pauseDuration={pauseDuration}
        frame={frame}
        getQuizTransition={getQuizTransitionTwo}
      />
     {quizIndex < quiz.length - 1 && (
        <SoundEffect
          key={`swipe_${quizIndex}`}
          volume={0.5}
          frame={hookDuration + ctaDuration + questionDurations.slice(0, quizIndex + 1).reduce((sum, d, i) => sum + d + (i < quizIndex ? pauseDuration : 0), 0)}
          local={true}
          duration={15}
          url='soundEffects/swipe.mp3'
        />
      )}
    </React.Fragment>
    ))}
    <CTASection startCta={startCta}  ctaDuration={ctaDuration} ctaAudioProps={ctaAudioProps} ctaSentence={ctaSentence} quizItem={quiz[middle]} />
  </>)
};

const QuizSectionOne: React.FC<{
  quizItem: elementQuizMultiple;
  quizIndex: number;
  hookDuration: number;
  questionDurations: number[];
  pauseDuration: number;
  frame: number;
  getQuizTransition: (index: number) => string;
}> = ({
  quizItem,
  quizIndex,
  hookDuration,
  questionDurations,
  pauseDuration,
  frame,
  getQuizTransition
}) => {
  const questionDuration = questionDurations[quizIndex];
  const questionStartFrame = hookDuration + questionDurations.slice(0, quizIndex).reduce((sum, d) => sum + d + pauseDuration, 0);
  const progressFrame = frame - questionStartFrame;
  const highlightFrame = questionDuration - (quizItem.answerAudioProps.duration * 30) - 15;
  const progress = Math.max(0, Math.min(100, (progressFrame / highlightFrame) * 100));

  return (
    <Sequence from={questionStartFrame} durationInFrames={questionDuration + pauseDuration}>
      <AbsoluteFill className="flex flex-col items-center justify-center text-center space-y-8 gap-8" style={{ transform: getQuizTransition(quizIndex) }}>
        <div className="absolute top-0 w-full h-4 bg-green-900">
          <div className={frame >= questionStartFrame + highlightFrame &&
            frame < questionStartFrame + questionDuration
            ? 'hidden'
            : 'absolute top-0 w-full h-4 bg-red-900'}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-gray-950 bg-white text-5xl font-extrabold p-12 mb-5 text-wrap  rounded-3xl drop-shadow-xl text-center font-serif w-[80%]">
          <Captions currentText={quizItem.question} duration={quizItem.audioProps.duration} />
        </div>
        <div className="grid grid-cols-1 gap-14 w-[70%]">
          {quizItem.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center text-5xl font-bold p-4 rounded-lg transition-colors duration-300 ease-in-out drop-shadow-xl ${
                frame >= questionStartFrame + highlightFrame &&
                frame < questionStartFrame + questionDuration &&
                index === quizItem.correctAnswerIndex
                  ? 'bg-green-500 text-white scale-105'
                  : 'bg-white text-gray-950'
              }`}
            >
              <span className="mr-4 inline-block items-baseline p-4 w-20 h-20 text-center rounded-full bg-yellow-400 text-white shadow-md drop-shadow font-serif">
                {index + 1}
              </span>
              <span className="flex-1 text-5xl text-center font-semibold text-wrap font-serif p-2">
                {option}
              </span>
            </div>
          ))}
        </div>
        <SoundEffect
          key={`audio_${quizIndex}`}
          volume={1}
          frame={0}
          local={true}
          duration={quizItem.audioProps.duration * 30}
          url={quizItem.audioProps.audioSrc}
        />
       <SoundEffect
          key={`timer_${quizIndex}`}
          volume={0.5}
          frame={0}
          local={true}
          duration={highlightFrame - 15}
          url='soundEffects/timer.mp3'
        />
        <SoundEffect
          key={`audio_answer_${quizIndex}`}
          volume={1}
          frame={highlightFrame}
          local={true}
          duration={quizItem.answerAudioProps.duration * 30}
          url={quizItem.answerAudioProps.audioSrc}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

const QuizSectionTwo: React.FC<{
  quizItem: elementQuizMultiple;
  quizIndex: number;
  questionDurations: number[];
  pauseDuration: number;
  frame: number;
  middleTime: number;
  getQuizTransition: (index: number) => string;
}> = ({
  quizItem,
  quizIndex,
  questionDurations,
  pauseDuration,
  frame,
  middleTime,
  getQuizTransition
}) => {
  const questionDuration = questionDurations[quizIndex];
  const questionStartFrame = middleTime + questionDurations.slice(0, quizIndex).reduce((sum, d) => sum + d + pauseDuration, 0);
  const progressFrame = frame - questionStartFrame;
  const highlightFrame = questionDuration - (quizItem.answerAudioProps.duration * 30) - 15;
  const progress = Math.max(0, Math.min(100, (progressFrame / highlightFrame) * 100));

  return (
    <Sequence from={questionStartFrame} durationInFrames={questionDuration + pauseDuration}>
      <AbsoluteFill className="flex flex-col items-center justify-center text-center space-y-8 gap-8" 
      // style={{ transform: getQuizTransition(quizIndex) }}
      >
        <div className="absolute top-0 w-full h-4 bg-green-900">
          <div className={frame >= questionStartFrame + highlightFrame &&
            frame < questionStartFrame + questionDuration
            ? 'hidden'
            : 'absolute top-0 w-full h-4 bg-red-900'}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-gray-950 bg-white text-5xl font-extrabold p-12 mb-5 text-wrap  rounded-3xl drop-shadow-xl text-center font-serif w-[80%]">
          <Captions currentText={quizItem.question} duration={quizItem.audioProps.duration} />
        </div>
        <div className="grid grid-cols-1 gap-14 w-[70%]">
          {quizItem.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center text-5xl font-bold p-4 rounded-lg transition-colors duration-300 ease-in-out drop-shadow-xl ${
                frame >= questionStartFrame + highlightFrame &&
                frame < questionStartFrame + questionDuration &&
                index === quizItem.correctAnswerIndex
                  ? 'bg-green-500 text-white scale-105'
                  : 'bg-white text-gray-950'
              }`}
            >
              <span className="mr-4 inline-block items-baseline p-4 w-20 h-20 text-center rounded-full bg-yellow-400 text-white shadow-md drop-shadow font-serif">
                {index + 1}
              </span>
              <span className="flex-1 text-5xl text-center font-semibold text-wrap font-serif p-2">
                {option}
              </span>
            </div>
          ))}
        </div>
        <SoundEffect
          key={`audio_${quizIndex}`}
          volume={1}
          frame={0}
          local={true}
          duration={quizItem.audioProps.duration * 30}
          url={quizItem.audioProps.audioSrc}
        />
       <SoundEffect
          key={`timer_${quizIndex}`}
          volume={0.5}
          frame={0}
          local={true}
          duration={highlightFrame - 15}
          url='soundEffects/timer.mp3'
        />
        <SoundEffect
          key={`audio_answer_${quizIndex}`}
          volume={1}
          frame={highlightFrame}
          local={true}
          duration={quizItem.answerAudioProps.duration * 30}
          url={quizItem.answerAudioProps.audioSrc}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

const CtaQuiz: React.FC<{ quizItem: elementQuizMultiple , ctaAudioProps: audioProps, ctaSentence: string}> = ({ quizItem , ctaSentence, ctaAudioProps}) => {
  return (
    <AbsoluteFill className="flex flex-col items-center justify-center text-center space-y-8 gap-1">
      {/* Progress bar */}
      <div className="absolute top-0 w-full h-4 bg-green-900">
        <div className="absolute top-0 w-full h-4 bg-red-900" style={{ width: `1%` }} />
      </div>
      {/* Question */}
      <div className="bg-orange-600 text-white flex flex-col gap-4 text-wrap text-center text-4xl m-8 p-8 font-bold rounded-badge w-[80%] drop-shadow-xl font-serif text-shadow-black">
        <Captions currentText={ctaSentence} duration={ctaAudioProps.duration} />
         <p>On Continue !</p>
      </div>
      <div className="text-gray-950 bg-white text-5xl font-extrabold p-12 mb-5 text-wrap rounded-3xl drop-shadow-xl text-center font-serif w-[80%]">
        <Captions currentText={quizItem.question} duration={100*60} />
      </div>
      {/* Options */}
      <div className="grid grid-cols-1 gap-14 w-[70%]">
        {quizItem.options.map((option, index) => (
          <div
            key={index}
            className="flex items-center text-5xl font-bold p-4 rounded-lg transition-colors duration-300 ease-in-out drop-shadow-xl bg-white text-gray-950"
          >
            <span className="mr-4 inline-block items-baseline p-4 w-20 h-20 text-center rounded-full bg-yellow-400 text-white shadow-md drop-shadow font-serif">
              {index + 1}
            </span>
            <span className="flex-1 text-5xl text-center font-semibold text-wrap font-serif p-2">
              {option}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CTASection: React.FC<{ startCta : number, ctaDuration: number, ctaAudioProps: audioProps, ctaSentence: string , quizItem: elementQuizMultiple}> = ({ startCta, ctaDuration, ctaAudioProps, ctaSentence, quizItem }) => (
  <Sequence from={startCta} durationInFrames={ctaDuration}>
    <CtaQuiz quizItem={quizItem}   ctaAudioProps={ctaAudioProps} ctaSentence={ctaSentence}/>
    <SoundEffect
      frame={0}
      volume={1}
      local={true}
      duration={ctaAudioProps.duration * 30}
      url={ctaAudioProps.audioSrc}
    />
  </Sequence>
);

const FollowMe: React.FC<{ strartFrame: number, frame : number, fps : number }> = ({
  strartFrame,
  frame,
  fps
}) => {

  // Utiliser spring pour un rebond fluide
  const bounce = spring({
    frame: frame % 25, // Boucle tous les 30 frames (1 seconde à 30 fps)
    fps,
    config: {
      damping: 2,
      stiffness: 25,
      mass: 2,
    },
  });

  // Interpolation pour l'animation de rebond
  const translateY = interpolate(bounce, [0, 1], [-10, 0], {
    easing: (t) => t, // Easing linéaire (peut être ajusté)
  });

  return (
    <Sequence from={strartFrame} durationInFrames={100} layout="none">
      <AbsoluteFill className="flex items-center justify-center text-center">
        {/* Flèche verticale et texte avec rebond */}
        <div
          style={{
            transform: `translateY(${translateY}%)`, // Applique l'animation de rebond ici
          }}
          className="absolute top-[10%] right-[1%] w-[10%] flex flex-col items-center justify-between p-4 gap-5"
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              {['ABONNE TOI'].map((word, index) => (
                <div key={index} className="flex flex-col gap-5">
                  {word.split('').map((char, charIndex) => (
                    <span
                      key={charIndex}
                      className="text-6xl font-bold font-serif text-center text-orange-600"
                      style={{
                        transform: `translateY(${translateY}%)`, // Applique aussi l'animation de rebond au texte
                      }}
                    >
                      {char}
                    </span>
                  ))}
                  <div>{" "}</div>
                </div>
              ))}
            </div>
          </div>
          {/* SVG de la flèche avec rebond */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="size-28 text-6xl text-orange-600 font-bold p-2"
            style={{
              transform: `translateY(${translateY}%)`, // Applique l'animation de rebond à la flèche
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0L4.5 13.5M12 21V3"
            />
          </svg>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

export default FollowMe;

const FooterBranding: React.FC<{ hookDuration: number }> = ({ hookDuration }) => (
  <Sequence from={hookDuration}>
    <div className="absolute bottom-40 w-full flex justify-center p-4">
      <div className="text-white text-6xl font-bold drop-shadow-xl font-serif text-shadow-black">
        @MurphyQuiz
      </div>
    </div>
  </Sequence>
);