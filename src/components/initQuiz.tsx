"use client"
import React, {  useState } from 'react';
import Link from 'next/link'; // Importer Link de Next.js

export const InitQuiz: React.FC = () => {
  const [quizType, setQuizType] = useState('');
  const [onLoad, setOnLoad] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState(''); // Nouvelle variable d'état pour l'URL

  const handleTaleSubmit = () => {
    if (!quizType) {
      setError('Veuillez sélectionner un type de quiz.');
      return;
    }
    setError('');
    setOnLoad(true);
    setTimeout(() => {
      fetch('/api/quiz', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizType }), // Utiliser le type de quiz sélectionné
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          if (data.generationUuid)
            setUrl(`/player/${data.generationUuid}`); // Mettre à jour l'URL avec la réponse du serveur
          setOnLoad(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          setOnLoad(false);
        });
    }, 200);
  };

  return (
    <main className="flex h-[100%] box-border w-[100%] flex-col items-center justify-between p-24">
      <section className="flex h-[100%] justify-center">
        <div className='flex flex-col h-[100%] gap-2'>
          <h2>Choisissez un type de Quiz</h2>
          <div className="flex gap-4">
            <button 
              className={`btn bg-indigo-600 hover:bg-indigo-700 text-white  font-bold py-2 px-4 rounded ${quizType === 'multiple' ? 'border-2 border-yellow-500' : ''}`}
              onClick={() => setQuizType('multiple')}>
              Quiz Multiple
            </button>
            <button 
              className={`btn bg-indigo-600 hover:bg-indigo-700 text-white  font-bold py-2 px-4 rounded ${quizType === 'aff' ? 'border-2 border-yellow-500' : ''}`}
              onClick={() => setQuizType('aff')}>
              Quiz Affirmation
            </button>
            <button 
              className={`btn bg-indigo-600 hover:bg-indigo-700 text-white  font-bold py-2 px-4 rounded ${quizType === 'whoiam' ? 'border-2 border-yellow-500' : ''}`}
              onClick={() => setQuizType('whoiam')}>
              Quiz Who I Am
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {onLoad && (
            <button className="btn font-bold py-2 px-4 rounded">
              <span className="loading loading-ring loading-xs"></span>
            </button>
          )}
          {!onLoad && (
            <button 
              className={`btn bg-indigo-600 hover:bg-indigo-700 font-bold py-2 px-4 rounded ${!quizType ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleTaleSubmit()}
              disabled={!quizType}>
              Submit
            </button>
          )}
          {url && (
            <Link className='btn btn-success mt-4 p-4"' href={url} passHref>
              Voir le quiz
            </Link>
          )}
        </div>
      </section>
    </main>
  );
};