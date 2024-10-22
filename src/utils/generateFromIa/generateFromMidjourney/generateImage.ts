import axios from 'axios';

const API_URL = process.env.IMAGINE_API_URL || '';
const API_KEY = process.env.IMAGINE_API_KEY || ''; // Remplacez par votre clé API

async function retrieveImageStatus(imageId: string): Promise<string> {
  const checkStatus = async () => {
    while (true) {
      const statusResponse = await axios.get(`${API_URL}${imageId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const statusData = statusResponse.data;

      if (statusData.data.status === 'completed') {
        console.log('Image générée:', statusData.data.url);
        return statusData.data.upscaled_urls[0];
      } else if (statusData.data.status === 'failed') {
        throw new Error('Erreur lors de la génération de l\'image: Échec');
      } else {
        console.log("L'image est en cours de génération. Statut:", statusData.data.status);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes avant de vérifier à nouveau
      }
    }
  };

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Erreur: La génération de l\'image a dépassé le temps limite de 15 minutes')), 15 * 60 * 1000)
  );

  return Promise.race([checkStatus(), timeout]);
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
  const data = {
    prompt: prompt
  };
  try {
    // Envoyer la requête pour générer l'image
    const response = await axios.post(API_URL, data, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const promptResponseData = response.data;
    if (!promptResponseData.data || !promptResponseData.data.id) {
      throw new Error('Erreur lors de la génération de l\'image: ID non trouvé');
    }

    const imageId = promptResponseData.data.id;
    const imageUrl = await retrieveImageStatus(imageId);
    return imageUrl;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    throw error;
  }
}
