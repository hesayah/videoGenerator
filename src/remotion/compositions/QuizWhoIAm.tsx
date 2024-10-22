"use effect"
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, staticFile, Audio, Img} from 'remotion';
import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';


import { elementQuizWhoIAm, WhoIAmAnswer } from './interfaces';
import { QuizWhoIAmProps } from './interfaces';

export const QuizWhoIAm: React.FC<QuizWhoIAmProps> = ({ quiz, characterName, hookSentence, hookSentenceAudioProps, ctaSentence, backGroundProps, answer }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height} = useVideoConfig();
  const hookDuration = 2 * fps; // Hook phrase duration (2 seconds)
  const answerDuration = (answer.audioProps.duration * fps) + fps;
  const ctaDuration = 3 * fps; // Call to action duration (3 seconds)
  const questionDuration = Math.floor(((durationInFrames - hookDuration - answerDuration - ctaDuration) - fps * quiz.length) / quiz.length); // Duration per question excluding pause
  const pauseDuration =  (0.5 * fps) + 1; // 1 second pause
  const quizDuration = quiz.length * (questionDuration + pauseDuration);
  const quizH = (height * 0.60);

  const levels = ['EXPERT', 'DIFFICILE', 'MOYEN', 'FACILE'];
  const colors = ['red', 'orange', 'blue', 'green'];
  const levelCount = levels.length;
  const levelLength = Math.ceil(quiz.length / levelCount); // Nombre d'éléments par niveau

  // Calculate the translateY value for the slide-up effect
  const translateY = interpolate(frame, [hookDuration - fps, hookDuration], [0, -height], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* <BackGround  url={backGroundProps.url} start={backGroundProps.start}  end={backGroundProps.end} />  */}
      <Img
          src={staticFile(answer.imgSrc)}
          alt="Quiz Image"
          className='blur-3xl backdrop-blur-3xl backdrop-brightness-50'
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        /> 
      <HookPhraseSequence hookDuration={hookDuration} translateY={translateY} hookSentence={hookSentence} />
       <SoundEffect
        frame={15}
        volume={1}
        local={true}
        // duration={30} // 1 seconde IN frame
        // url='soundEffects/whistling.mp3'
        duration={hookSentenceAudioProps.duration * 30} // 1 seconde IN frame
        url={hookSentenceAudioProps.audioSrc}
      /> 
      <TitleSection hookDuration={hookDuration}  quizDuration={quizDuration}/> 
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={hookDuration + quizDuration}>
          <SideBar 
            hookDuration={hookDuration} 
            quizLen={quiz.length} 
            quizDuration={quizDuration} 
            levelLength={levelLength}
            levels={levels}
            colors={colors}
            quizH={quizH}
          />
          <QuizSection
            quiz={quiz}
            hookDuration={hookDuration}
            questionDuration={questionDuration}
            pauseDuration={pauseDuration}
            quizDuration={quizDuration}
            levelLength={levelLength}
            levels={levels}
            colors={colors}
            quizH={quizH}
          />
        </TransitionSeries.Sequence> 
         <TransitionSeries.Transition 
           presentation={slide()}
         timing={linearTiming({ durationInFrames: 10 })}
        />
       </TransitionSeries>
      <AnswerSection 
            characterName={characterName} 
            answer={answer} 
            hookDuration={hookDuration} 
            answerDuration={answerDuration} 
            quizDuration={quizDuration}
      />
      <CTASection hookDuration={hookDuration} quizDuration={quizDuration} answerDuration={answerDuration} ctaDuration={ctaDuration} ctaSentence={ctaSentence} />
      <FooterBranding /> 
    </AbsoluteFill>
  );
};

const SoundEffect : React.FC<{frame : number , duration: number, local : boolean, url : string, volume : number}> = ({frame, duration, local, url, volume}) => (
  <Sequence  
    from={frame} 
    durationInFrames={duration}
    >
    <Audio loop volume={volume} src={ local ? staticFile(url) : url } />
  </Sequence>
)

const HookPhraseSequence: React.FC<{ hookDuration: number, translateY: number, hookSentence: string }> = ({ hookDuration, translateY, hookSentence }) => (
  <Sequence from={0} durationInFrames={hookDuration}>
    <AbsoluteFill className="flex items-center justify-center text-center z-20" style={{ transform: `translateY(${translateY}px)` }}>
      <div className="bg-red-600  text-white text-wrap  text-center text-7xl mx-24 p-16 font-bold rounded-badge w-[80%] drop-shadow-xl font-serif">
        {hookSentence}
      </div>
    </AbsoluteFill>
  </Sequence>
);

const TitleSection: React.FC<{ hookDuration: number , quizDuration : number }> = ({ hookDuration, quizDuration  }) => (
  <Sequence from={hookDuration} durationInFrames={quizDuration}>
    <div className="absolute top-[10%] w-full flex justify-center">
      <div className="bg-yellow-500 text-shadow-black text-white text-center text-wrap text-5xl font-extrabold p-8 rounded-3xl drop-shadow-xl w-[80%] font-serif">
        Quiz : {"Qui suis-je ?"}!
      </div>
    </div>
  </Sequence>
);

const SideBar: React.FC<{
  hookDuration: number;
  quizLen: number;
  quizDuration: number;
  levelLength: number;
  levels : string[]
  colors : string[]
  quizH : number
}> = ({
  hookDuration,
  quizLen,
  quizDuration,
  levelLength,
  levels,
  colors,
  quizH
}) => {

  return (
    <AbsoluteFill >
      <Sequence from={0} durationInFrames={hookDuration + quizDuration}>
      <div style={{ position: 'absolute', top: '20%', left: '10%', height : `${quizH}px`, display: 'grid', gridTemplateRows: `repeat(${levels.length}, 1fr)`, gap: '20px' }}>
        {levels.map((level, levelIndex) => {
          const startIndex = levelIndex * levelLength;
          const endIndex = Math.min(startIndex + levelLength, quizLen);
          const items = Array.from({ length: endIndex - startIndex }, (_, index) => startIndex + index);

          // Calculer la position de chaque niveau
          return items.length > 0 && (
            <div key={levelIndex} style={{ display: 'grid', gridTemplateRows: `repeat(${items.length + 1}, ${quizH / (levels.length * (items.length + 1))}px)`, gap: '10px' }}>
              <p className='text-5xl font-bold drop-shadow-xl font-serif text-shadow-black' style={{ color: colors[levelIndex] }}>
                {level}
              </p>

              {items.map((quizIndex) => {
                // Utiliser des valeurs fixes pour éviter les décalages
                return (
                  <p key={quizIndex} className='text-shadow-black text-4xl font-bold drop-shadow-xl font-serif'  style={{ color: colors[levelIndex] }}>
                    {quizIndex + 1 + ")"}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
      </Sequence>
    </AbsoluteFill>
  );
};

const QuizSection: React.FC<{
  quiz: elementQuizWhoIAm[],
  hookDuration: number,
  questionDuration: number,
  pauseDuration: number,
  quizDuration: number,
  levelLength: number,
  levels: string[],
  colors: string[],
  quizH: number
}> = ({
  quiz,
  hookDuration,
  questionDuration,
  pauseDuration,
  quizDuration,
  quizH,
  levelLength,
  levels,
  colors
}) => {
  return (
    <Sequence from={hookDuration} durationInFrames={quizDuration} layout="none">
      <AbsoluteFill style={{width : "70%", display : "flex", justifySelf : "center", alignItems : "start", marginLeft : "20px" }}>
        <div
        style={{
          position : "relative",
          top: '20%',
          alignItems : "start",
          height: `${quizH}px`,
          display: 'grid',
          gridTemplateRows: `repeat(${levels.length}, 1fr)`,
          gap: '20px',
          width: "100%"
        }}>
                  {levels.map((level, levelIndex) => {
          const startIndex = levelIndex * levelLength;
          const items = quiz.slice(startIndex, startIndex + levelLength);

          return (
            <div className='w-full' key={levelIndex}  
              style={{ display: 'grid',
                gridTemplateRows: `repeat(${items.length + 1}, ${quizH / (levels.length * (items.length + 1))}px)`, 
                gap: '10px', 
                width : "100%"}}>
              <p 
                className="text-white text-5xl font-bold drop-shadow-xl font-serif"
                style={{ color: colors[levelIndex], margin: '0', opacity: 0 }}
              >
                {level}
              </p>
              {items.map((quizElement, index) => {
                // Utiliser des valeurs fixes pour éviter les décalages
                const itemStartFrame = hookDuration + quiz.slice(0, startIndex + index).reduce((acc, item) => acc + item.audioProps.duration * 30 + pauseDuration, 0);
                return (
                  <>
                  <Sequence
                    key={index}
                    from={itemStartFrame}
                    durationInFrames={quizDuration - itemStartFrame}
                    layout="none">
                      <div className='flex text-shadow-black justify-center items-center  w-full]'>
                        <p
                          className="text-white text-center justify-center min-w-full
                          items-center h-full bg-yellow-500 rounded-md p-2  text-3xl
                          font-bold font-serif ml-[5%]">
                          {quizElement.fact}
                        </p>
                      </div>
                    <SoundEffect
                    key={`audio_${index}`}
                    volume={1}
                    frame={0}
                    local={true}
                    duration={quizElement.audioProps.duration * 30} //
                    url={quizElement.audioProps.audioSrc}
                  /> 
                  </Sequence>
                  </>
                );
              })}
            </div>
          );
        })}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

const AnswerSection: React.FC<{ characterName: string, answer: WhoIAmAnswer, hookDuration: number, answerDuration : number,  quizDuration: number}> = ({ characterName, answer,answerDuration, hookDuration, quizDuration }) => (
  <Sequence from={hookDuration + quizDuration } durationInFrames={answerDuration} layout='none'>
    <AbsoluteFill className="flex flex-col align-middle items-center justify-center text-center">
      <AbsoluteFill>
        <Img
          src={staticFile(answer.imgSrc)}
          alt="Quiz Image"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        /> 
        {/* <div className="absolute inset-0 flex items-center justify-center"> */}
          <div className=" absolute   bottom-48 bg-yellow-500 text-white text-shadow-black text-wrap text-center text-7xl mx-32 py-12 px-16 font-bold rounded-badge w-[80%] drop-shadow-xl font-serif">
            {characterName}
          </div>
        {/* </div> */}
      </AbsoluteFill>
      <SoundEffect
        frame={0}
        volume={1}
        local={true}
        duration={answer.audioProps.duration * 30}
        url={answer.audioProps.audioSrc}
      />
    </AbsoluteFill>
  </Sequence>
);

const CTASection: React.FC<{ hookDuration: number, quizDuration: number, answerDuration : number, ctaDuration: number, ctaSentence: string }> = ({ hookDuration, quizDuration, answerDuration, ctaDuration, ctaSentence }) => (
  <Sequence from={hookDuration + quizDuration + answerDuration} durationInFrames={ctaDuration}>
    <AbsoluteFill className="flex items-center justify-center text-center">
      <div className="bg-red-600 text-white text-wrap text-center text-7xl mx-32 py-12 px-16 font-bold rounded-badge w-[80%] drop-shadow-xl font-serif">
        {ctaSentence}
      </div>
    </AbsoluteFill>
  </Sequence>
);

const FooterBranding: React.FC = () => (
  <Sequence from={15}>
    <div className="absolute bottom-[5%] w-full flex justify-center p-4">
      <div className="text-white text-6xl font-bold drop-shadow-xl font-serif text-shadow-black">
        @MurphyQuiz
      </div>
    </div>
  </Sequence>
);
