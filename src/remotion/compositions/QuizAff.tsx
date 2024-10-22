"use effect"
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Loop,spring, staticFile, Audio, Video} from 'remotion';
import React  from 'react';
import { audioProps, elementQuizAff, QuizAffProps } from './interfaces';
import { Captions } from './Captions';


export const QuizAff: React.FC<QuizAffProps> = ({ quiz, themeQuiz, hookSentence, ctaSentence, hookSentenceAudioProps, ctaSentenceAudioProps, backGroundProps }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height, width } = useVideoConfig();
  const pauseDuration =  (1 * fps) + 1; // 1 second pause

  const hookDuration = hookSentenceAudioProps.duration * fps + pauseDuration;  // Hook phrase duration (2 seconds)
  // const ctaDuration = ctaSentenceAudioProps.duration * fps + pauseDuration; // Call to action duration (3 seconds) // Duration per question excluding pause
  const quizDuration = quiz.reduce((acc, item, index) => acc + (item.audioProps.duration * 30 + pauseDuration), 0);
  // themeQuiz = "Culture G"


  // Calculate the translateY value for the slide-up effect
  const translateY = interpolate(frame, [hookDuration - fps, hookDuration], [0, -height], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const getQuizTransition = (index: number, duration : number) => {
    const transitionStart = duration;
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
    <AbsoluteFill >
      <BackGround url='https://cdn.pixabay.com/video/2023/06/23/168502-839220724_tiny.mp4' start={0} end={durationInFrames} />
      <HookPhraseSequence frame={frame} fps={fps} hookDuration={hookDuration} translateY={translateY} hookAudioProps={hookSentenceAudioProps} />
      <TitleSection hookDuration={hookDuration}  theme={themeQuiz}/>
      <div className='relative flex flex-col h-[80%] justify-start items-start top-[20%] gap-5'>
      {quiz.map((quizItem, quizIndex) => {
          const itemStartFrame = hookDuration + quiz.slice(0,  quizIndex).reduce((acc, item) => acc + (item.audioProps.duration * 30 + pauseDuration), 0);
          return (        
          <React.Fragment key={quizIndex }>
          <QuizSection
            key={quizIndex}
            quizItem={quizItem}
            quizIndex={quizIndex}
            fps={fps}
            frame={frame}
            quizDuration={quizDuration}
            hookDuration={hookDuration}
            pauseDuration={pauseDuration}
            itemStartframe={itemStartFrame}
            getQuizTransition={getQuizTransition}

          />
          <SoundEffect
            key={`audio_${quizIndex}`}
            volume={1}
            frame={itemStartFrame}
            local={true}
            duration={quizItem.audioProps.duration * 30} //
            url={quizItem.audioProps.audioSrc}
          />
        </React.Fragment>)
      })}
      </div>
      <CTASection hookDuration={hookDuration} quizDuration={quizDuration} ctaSentenceAudioProps={ctaSentenceAudioProps} ctaSentence={ctaSentence} />
      <FooterBranding hookDuration={hookDuration} />
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

const BackGround: React.FC <{url : string, start : number, end : number}> = ({url, start, end}) => {
  return (
    <AbsoluteFill>
      <Loop durationInFrames={Math.floor(useVideoConfig().fps * (1200 - start))}>
      <Video
          startFrom={start}
          className="w-full h-full object-cover backdrop-contrast-50"
          // src={staticFile(url)}
          src={url}
          loop
          muted
        />
      </Loop>
    </AbsoluteFill>
  );
};


const HookPhraseSequence: React.FC<{ hookDuration: number, translateY: number, hookAudioProps: audioProps, frame : number, fps : number}> = ({ hookDuration, translateY, hookAudioProps, frame, fps }) => (
  <Sequence from={0} durationInFrames={hookDuration} layout='none'>
    <div className='absolute flex flex-col gap-9 justify-center items-center w-full h-full top-0'>
      <div className='min-h-[50%] flex '>
        <Captions currentText={"✨😌 MurphyQuiz : Découvre Ta Véritable Personnalité ! 😌✨"} duration={hookAudioProps.duration} />
      </div>
      <div className='min-h-[50%] flex flex-col text-4xl top-[50%] w-[90%]'>
        <p className=' text-6xl font-bold bg-red-700 p-6 rounded-lg'>
          {"✨😌 MurphyQuiz : Découvre Ta Véritable Personnalité ! 😌✨"}
        </p>
      </div>
    </div>
    <SoundEffect
        frame={1}
        volume={1}
        local={true}
        duration={hookAudioProps.duration * 30}
        url={hookAudioProps.audioSrc}
      /> 
  </Sequence>
);


const TitleSection: React.FC<{ hookDuration: number, theme : string }> = ({ hookDuration, theme }) => (
  <Sequence from={hookDuration} layout='none'>
    <div className="absolute top-48 w-full flex justify-center">
      <div className="bg-yellow-600 text-white text-center text-wrap text-6xl font-extrabold p-8 rounded-3xl drop-shadow-xl w-[80%] font-serif text-shadow-black">
        MurphyQuiz !
      </div>
    </div>
  </Sequence>
);

const QuizSection: React.FC<{
  quizItem: elementQuizAff,
  quizIndex: number,
  hookDuration: number,
  quizDuration : number,
  pauseDuration: number,
  itemStartframe:number,
  frame : number, 
  fps : number,
  getQuizTransition: (index: number, duraiton : number) => string
}> = ({
  quizItem,
  quizIndex,
  hookDuration,
  pauseDuration,
  quizDuration,
  itemStartframe,
  frame,
  fps,
  getQuizTransition
}) => (
  <Sequence 
      key={quizIndex}
      durationInFrames={hookDuration + quizDuration- itemStartframe}
      layout='none'
      from={itemStartframe}>
    <div className='flex w-[85%] relative ml-8'>
      <p className='absolute inset-0 bg-black/30 backdrop-blur-2xl p-2  rounded-lg '></p>
      <span className='drop-shadow-lg text-5xl text-center font-serif text-shadow-black z-10'>
        {quizIndex + 1 + ') '}
      </span>
      <span className="drop-shadow-lg text-5xl text-center font-serif text-shadow-black z-10">
        {quizItem.affirmation}
      </span>
    </div>
  </Sequence>
);

const CTASection: React.FC<{ hookDuration: number, quizDuration: number,ctaSentenceAudioProps: audioProps, ctaSentence : string }> = ({ hookDuration, quizDuration, ctaSentenceAudioProps, ctaSentence }) => (
  <Sequence from={hookDuration + quizDuration}>
    <AbsoluteFill className="flex items-center justify-center text-center">
      <p className='text-6xl text-center text-balance bg-red-700 p-12 w-[90%] rounded-lg font-extrabold font-serif' >
          {ctaSentence}

      </p>
    </AbsoluteFill>
      {/* */}<SoundEffect   
        frame={1}
        volume={1}
        local={true}
        duration={ctaSentenceAudioProps.duration * 30}
        url={ctaSentenceAudioProps.audioSrc}
      />
    </Sequence>
); 

const FooterBranding: React.FC<{ hookDuration: number }> = ({ hookDuration }) => (
  <Sequence from={hookDuration}>
    <div className="absolute bottom-40 w-full flex justify-center p-4">
      <div className="text-white text-6xl font-bold drop-shadow-xl font-serif text-shadow-black">
        @MurphyQuiz
      </div>
    </div>
  </Sequence>
);