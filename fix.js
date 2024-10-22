const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixQuizWhoIAm() {
  try {
    // Récupérer tous les enregistrements QuizWhoIAm
    const quizzes = await prisma.quizWhoIAm.findMany();

    // Parcourir chaque enregistrement et corriger les fautes de frappe dans imgSrc
    for (const quiz of quizzes) {
      let answer;
      try {
        answer = JSON.parse(quiz.answer);
      } catch (parseError) {
        console.error(`Erreur de parsing pour le quiz ID ${quiz.id}:`, parseError);
        continue; // Passer au prochain quiz en cas d'erreur de parsing
      }

      if (answer && answer.imgSrc && typeof answer.imgSrc === 'string' && answer.imgSrc.endsWith("wepb")) {
        // Corriger l'extension de fichier
        answer.imgSrc = answer.imgSrc.slice(0, -4) + "webp";

        // Mettre à jour l'enregistrement avec la correction
        try {
          await prisma.quizWhoIAm.update({
            where: { id: quiz.id },
            data: {
              answer: JSON.stringify(answer),
            },
          });
          console.log(`Quiz ID ${quiz.id} mis à jour avec succès.`);
        } catch (updateError) {
          console.error(`Erreur lors de la mise à jour du quiz ID ${quiz.id}:`, updateError);
        }
      } else {
        console.log(`Aucune correction nécessaire pour le quiz ID ${quiz.id}.`);
      }
    }

    console.log("Tous les enregistrements QuizWhoIAm ont été traités.");
  } catch (error) {
    console.error("Erreur lors de la récupération des enregistrements QuizWhoIAm:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction
fixQuizWhoIAm();