const searchEngineId = process.env.SEARCH_ENGINE_ID;
const apiKey = process.env.GOOGLE_API_KEY;

export async function getVideoFromGoogleApi(toSearch : string): Promise<string> {
  const cleanedQuery = toSearch
  .replace(/["']/g, '') // Enlever les guillemets simples et doubles
  .replace(/[^\w\s]/g, '') // Enlever les autres caractères spéciaux sauf les espaces
  .trim(); // Supprimer les espaces en début et fin de chaîne

    const query = encodeURIComponent(cleanedQuery);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${searchEngineId}&key=${apiKey}&searchType=video&num=1`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].link;
      } else {
        throw new Error('No video found');
      }
    } catch (error) {
      console.error('Error fetching video from Google API:', error);
      throw error;
    }
}

export async function getImageFromGoogleApi(characterName: string): Promise<string> {
    const query = encodeURIComponent(characterName);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${searchEngineId}&key=${apiKey}&searchType=image&num=1`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].link;
      } else {
        throw new Error('No image found');
      }
    } catch (error) {
      console.error('Error fetching image from Google API:', error);
      throw error;
    }
}
  