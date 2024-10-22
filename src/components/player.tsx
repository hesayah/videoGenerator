import { Player } from '@remotion/player';
import { QuizMultiple } from '@/src/remotion/compositions/QuizMultipe';
import { QuizWhoIAm } from '@/src/remotion/compositions/QuizWhoIAm';
import { QuizAff } from '../remotion/compositions/QuizAff';
import { elementQuizMultiple, ParamsProps, QuizAffProps, QuizMultipleProps, QuizWhoIAmProps } from '@/src/remotion/compositions/interfaces';

interface VideoPlayerProps {
  quizMultiple?: QuizMultipleProps;
  quizWhoIAm?: QuizWhoIAmProps;
  quizAff? : QuizAffProps
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ quizMultiple, quizWhoIAm, quizAff }) => {

  let component;
  let inputProps: QuizMultipleProps & ParamsProps | QuizWhoIAmProps | QuizAffProps;
  let durationInFrames = 2250; // Default duration
  if (quizWhoIAm)
    durationInFrames = 1500;
  if (quizAff)
    durationInFrames = 2000;
  if (quizMultiple) {

 
    let fps = 30;
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
  
    const result = calculateTotalDuration(quizMultiple, pauseDuration, reflectionDuration);
  
    const paramsProps : ParamsProps = {
      fps : fps,
      durationInFps: result.durationInFps,
      pauseDuration: result.newPauseDuration,
      reflectionDuration: result.newReflectionDuration,
      width : 1080,
      height : 1920,
    }

    durationInFrames = result.durationInFps;
    component = QuizMultiple;
    inputProps  = {
      ...quizMultiple, 
      ...paramsProps,
    };

  } else if (quizWhoIAm) {
    component = QuizWhoIAm;
    inputProps = quizWhoIAm;
  } else if (quizAff) {
    component = QuizAff;
    inputProps = quizAff;
  } else {
    return <div>Aucun quiz disponible</div>;
  }

  return (
    <Player
      component={component as React.FC<any>} // Cast to any to bypass type issue
      inputProps={inputProps}
      durationInFrames={durationInFrames} // 70 seconds at 30 fps
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      style={{
        width: '100%',
        height: 'auto',
      }}
      controls
    />
  );
};

export default VideoPlayer;