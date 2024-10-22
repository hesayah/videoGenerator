"use client"
import React, { useState } from 'react';

export const InitStory: React.FC = () => {
  const [storyContent, setStory] = useState('');
  const [name, setNameTale] = useState('');
  const [onLoad, setOnLoad] = useState(false);
  const [error, setError] = useState('');

  const handleTaleSubmit = () => {
    if (storyContent.length > 9000) {
      setError("L'histoire ne doit pas dépasser 9000 caractères. taille actuelle ==> " + storyContent.length);
      return;
    }
    setError('');
    setOnLoad(true);
    setTimeout(() => {
      fetch('/api/storyTale', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyContent, name }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          setStory('');
          setOnLoad(false);
        })
        .catch((error) => {
          console.error('Error:', error);
          setOnLoad(false);
        });
    }, 200);
  };

  return (
    <main className=" flex h-[100%] box-border w-[100%] flex-col items-center justify-between p-24">
      <section className="flex  h-[100%]  justify-center">
        <div className='flex flex-col h-[100%]  gap-2'>
          <h2>Envoyez un Tale nous nous chargerons du reste</h2>
          <input
            type="text"
            className=" rounded-md p-4 focus:outline-none"
            required
            value={name}
            onChange={(e) => setNameTale(e.target.value)}
            placeholder="Nom de l'histoire"
            data-last-active-input={name} // Ajout de l'attribut data-last-active-input
          />
          <textarea
            className='rounded-md h-[80%]  p-4 focus:outline-none'
            required
            value={storyContent}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Entrez votre Tale ici"
            data-last-active-input={storyContent} // Ajout de l'attribut data-last-active-input
          />
          {error && <p className="text-red-500">{error}</p>}
          {onLoad ? (
            <button className="bg-indigo-500  font-bold py-2 px-4 rounded">
              processing....
            </button>
          ) : (
            <button 
              className="bg-indigo-600 hover:bg-indigo-700  font-bold py-2 px-4 rounded w-[100%] "
              onClick={handleTaleSubmit}>
              {"Envoyer l'histoire"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
};
