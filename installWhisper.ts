const path = require("path");
const { downloadWhisperModel, installWhisperCpp } = require("@remotion/install-whisper-cpp");

const to = path.join(process.cwd(), "whisper.cpp");

const install = async () => {
  await installWhisperCpp({
    to,
    version: "1.5.5",
  });

  await downloadWhisperModel({
    model: "medium", // Utilisez un modèle multilingue comme "medium"
    folder: to,
  });

  console.log("Whisper and model installed successfully.");
};

install();