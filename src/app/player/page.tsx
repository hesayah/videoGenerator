"use client"
import { useEffect, useState } from 'react';
import PlayerPage from '@/src/app/player/[uuid]/page';

const PlayerWithSidebar = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  useEffect(() => {
    const fetchUuids = async () => {
      try {
        const response = await fetch('/api/player', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch UUIDs');
        }

        const data = await response.json();
        setUuids(data);
      } catch (error) {
        console.error('Error fetching UUIDs:', error);
      }
    };
    fetchUuids();
  }, []);

  useEffect(() => {
    console.log(uuids.length)
  }, [uuids])

  const handleUuidClick = (uuid: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Empêche la soumission du formulaire ou tout autre comportement par défaut
    setSelectedUuid(uuid);
  };
  

  return (
    <div className="flex h-[90%] box-border">
      <div className="flex  w-1/4 justify-center items-center">
        <div className="carousel-vertical overflow-y-auto  scrollbar-none h-[90%] w-[90%] bg-indigo-950 rounded-2xl justify-center">
            {uuids.map((uuid) => (
                <div key={uuid} className="carousel-item justify-center p-4">
                    <button 
                        key={uuid}
                        className={`hover:bg-indigo-750   text-white  bg-indigo-600 font-bold py-2  w-[90%] rounded ${selectedUuid === uuid ? 'bg-indigo-900' : 'bg-indigo-600'}`}
                        onClick={(event) => handleUuidClick(uuid, event)}
                      >
                        {uuid}
                    </button>
                </div>
          ))}
        </div>
      </div>
      <div className="w-3/4 flex justify-center items-center">
        {selectedUuid ? (
          <PlayerPage key={selectedUuid} params={{ uuid: selectedUuid }} />
        ) : (
          <div className="text-center">Sélectionnez un UUID pour jouer la vidéo</div>
        )}
      </div>
    </div>
  );
};

export default PlayerWithSidebar;
