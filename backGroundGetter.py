import os
import random
from pathlib import Path
import subprocess
from moviepy.editor import VideoFileClip
from typing import List
import yt_dlp

# Passer à 30frameRate et ne pas modifer l'encodage pour le crop

# Étape 1 : Télécharger la vidéo depuis YouTube
def download_video(url: str, output_path: str = os.path.join(os.getcwd(), 'background', '4.mp4')) -> str:
    ydl_opts = {
        'format': 'bestvideo[height<=480][ext=mp4]/worst[ext=mp4]',
        'outtmpl': output_path,
        'noplaylist': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=False)
        formats = info_dict.get('formats', [])
        
        # Filter formats to get the smallest file size under 480p
        best_format = min(
            (f for f in formats if f['height'] <= 480 and f['ext'] == 'mp4'),
            key=lambda f: f['filesize'] or float('inf')
        )
        
        ydl_opts['format'] = best_format['format_id']
        ydl.download([url])

# Utilisation
youtube_url = 'https://www.youtube.com/watch?v=-yPjP85CbQE'  # Remplace par l'URL de ta vidéo
downloaded_video_path = download_video(youtube_url)