import React from 'react';
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

// Composant principal qui gère l'affichage des sous-titres
export const Captions: React.FC<{ currentText: string; duration: number }> = ({ currentText, duration }) => {
  const currentFrame = useCurrentFrame();
  const videoFps = useVideoConfig().fps;
  const subtitleStartFrame = 0; // Début à 0 pour toute la durée
  const subtitleEndFrame = duration * videoFps; // Calcul de la fin en frames
  
  return (
    <Sequence
      layout='none'
      from={subtitleStartFrame}
      durationInFrames={10 * videoFps}
      key={currentText}
    >
      <div className='relative w-full h-full flex flex-col justify-center items-center text-center'>
        <Subtitle text={currentText} frame={currentFrame} startFrame={subtitleStartFrame} endFrame={subtitleEndFrame} />
      </div>
    </Sequence>
  );
};

// Composant qui gère l'affichage du texte avec un mot courant mis en évidence
const Subtitle: React.FC<{ text: string; frame: number; startFrame: number; endFrame: number }> = ({ text, frame, startFrame, endFrame }) => {
  const words = text.split(' ');

  // Calculer la progression en fonction des frames
  const progress = (frame - startFrame) / (endFrame - startFrame);
  const totalWords = words.length;
  const currentWordIndex = Math.min(Math.floor(progress * totalWords), totalWords - 1); // Assure que l'index est valide

  return (
    <div className="flex justify-center items-center flex-wrap gap-4">
      {words.map((word, index) => {
        const isCurrentWord = index === currentWordIndex;
        const colorClass = isCurrentWord ? 'text-yellow-400' : ''; // Couleur du mot courant
        return (
          <span
            key={index}
            className={`text-center transition-transform  ${colorClass}`}
          >
            {word}
            {index < words.length - 1 && ' '}
          </span>
        );
      })}
    </div>
  );
};
