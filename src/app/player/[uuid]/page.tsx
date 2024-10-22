"use client"; // Indique que ce composant est un Client Component
import { useEffect, useState } from 'react';
import VideoPlayer from '@/src/components/player';
import { QuizAffProps, QuizMultipleProps, QuizWhoIAmProps } from '@/src/remotion/compositions/interfaces';

interface Params {
  uuid: string;
}

const PlayerPage = ({ params }: { params: Params }) => {
  const [quizMultiple, setQuizMultiple] = useState< {compositionId : string} & QuizMultipleProps | null>(null);
  const [quizWhoIAm, setQuizWhoIAm] = useState<{compositionId : string} & QuizWhoIAmProps | null>(null);
  const [quizAff, setQuizAff] = useState<{compositionId : string} & QuizAffProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Ajout de l'état de chargement

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`/api/quiz?uuid=${params.uuid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }

        const data : 
        {compositionId : string} & QuizMultipleProps |
         {compositionId : string} & QuizWhoIAmProps |
          {compositionId : string} & QuizAffProps | null = await response.json();
        console.log("data", data)
        if (!data)
        {
          throw new Error('Failed to fetch quiz data'); 
        }
        if (data.compositionId == "QuizMultiple") {
          setQuizMultiple(data as {compositionId : string} & QuizMultipleProps);
        }
        if (data.compositionId == "QuizWhoIAm") {
          setQuizWhoIAm(data as {compositionId : string} & QuizWhoIAmProps);
        }
        if (data.compositionId == "QuizAff") {
          setQuizAff(data as {compositionId : string} & QuizAffProps)
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchQuizData();
  }, [params.uuid]);

  const handleRenderClick = async () => {
    try {
      const response = await fetch(`/api/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: params.uuid }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger rendering');
      }

      console.log('Rendering triggered successfully');
    } catch (error) {
      console.error('Error triggering rendering:', error);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center w-[100%] h-[100%] flex-col p-20">
        {loading ? (
          <span className="loading loading-ring loading-md" /> // Visuel de chargement
        ) : (
          (quizMultiple || quizWhoIAm || quizAff)  ? (
            <>
              <div className="mockup-phone flex h-[100%] rounded-md box-content py-2 justify-center" style={{ aspectRatio: '9 / 16' }}>
                <VideoPlayer 
                  quizMultiple={quizMultiple || undefined} 
                  quizWhoIAm={quizWhoIAm || undefined}
                  quizAff={quizAff || undefined}
                />
              </div>
              <button onClick={handleRenderClick} className="btn m-2 p-2 bg-blue-500 text-white rounded">Lancer la Création</button>
            </>
          ) : (
            <div className="flex justify-center items-center ">
              {"Le quiz n'existe pas."}
            </div>
          )
        )}
      </div>
    </>
  );
}

export default PlayerPage;