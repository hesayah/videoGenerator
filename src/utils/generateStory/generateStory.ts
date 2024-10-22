
import { CinematicProps, Scene, Segment } from '@prisma/client';
import prisma from '@/src/utils/prisma'
import { preGenerateCinematicsProps } from '../generateFromIa/generateFromOpenAi/preGenerateCinematicProps';
import { preGenerateScenes } from '../generateFromIa/generateFromOpenAi/preGenerateScenes';
import { preGenerateSegment } from '../generateFromIa/generateFromOpenAi/preGenerateSegments';
import {  Story } from '@prisma/client';
import { generateImageFromPrompt } from '../generateFromIa/generateFromMidjourney/generateImage';
import { generateVoiceObject } from '../generateFromIa/generateFromElevenLabs/generateVoice';
import path from 'path';


async function generateAudioAndImage(storyUuid: string, segments: Segment[], cinematicProps: CinematicProps): Promise<Story> {
    const updatedSegments: Segment[] = [];

    for (const segment of segments) {
        // Générer l'image avec MidJourney
        let prompt = `
            Style: ${cinematicProps.style},
            Context: ${cinematicProps.context},
            Character Design: ${cinematicProps.characterDesign},
            ${segment.descriptionPrompt},
            Environment: ${cinematicProps.environment},
            Color Palette: ${cinematicProps.colorPalette},
            Lighting: ${cinematicProps.lighting},
            Mood: ${cinematicProps.mood},
            --niji 6 --s 450 --ar 9:16
        `;

        const generatedImageUrl = await generateImageFromPrompt(prompt);

        // Générer la voix
        const date = Date.now();
        const audioProps = await generateVoiceObject(segment.content, path.join(process.cwd(), 'public', 'Story', storyUuid, `audio_${date}.mp3`));
        const formatedAudioProps = {
            audioSrc: path.join('QuizMultiple', storyUuid, `audio_${date}.mp3`),
            duration: audioProps.duration
        };

        const updatedSegment: Segment = {
            ...segment,
            imageUrl: generatedImageUrl,
            audioProps: JSON.stringify(formatedAudioProps),
        };

        // Mettre à jour le segment dans la base de données
        await prisma.segment.update({
            where: { id: segment.id },
            data: updatedSegment,
        });

        updatedSegments.push(updatedSegment);
    }

    const updatedTale = await prisma.story.findUniqueOrThrow({
        where: { uuid: storyUuid },
    });
    return updatedTale;
}
export async function pregenerateTaleProps(tale: Story): Promise<Story> {
    try {
        const cleanedStoryContent = tale.storyContent.replace(/\s+/g, ' ').trim();
        const cinematicProps: CinematicProps = await preGenerateCinematicsProps(tale);
        const scenes: Scene[] = await preGenerateScenes(tale, cleanedStoryContent);
        const allSegments : Segment[][] = []
        for (const scene of scenes) {
           let seg =  await preGenerateSegment(scene, tale);
           allSegments.push(seg)
        }
        const flatSegments : Segment[] = allSegments.flat();
        const finalTale : Story = await  generateAudioAndImage(tale.uuid, flatSegments, cinematicProps)
        console.log('Pré-génération des propriétés du conte terminée avec succès');
        return finalTale;
    } catch (error) {
        console.error("Erreur lors de la pré-génération des propriétés du conte:", error);
        throw error;
    }
}


export async function generateStoryProps(taleContent: string, nameTale: string) : Promise<string> {

    // ##################################################################################################################################### for testing
    // #################################################################################################################################### for testing

    const generation = await prisma.generation.create({
        data: {
          compositionId: "StoryTale",
        },
    });
    let tale = await prisma.story.create({
        data: {
            name: nameTale,
            storyContent: taleContent,
            status : "initied",
            generationId: generation.id,
        }
    });
    tale = await pregenerateTaleProps(tale);

    console.log(JSON.stringify(tale));
    return generation.uuid; // Retourner tous les segments concaténés
} 