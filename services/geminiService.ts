import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StoryChoice } from '../types';
import { translations } from '../i18n/translations';
import { LanguageCode, languages } from "../i18n/languages";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStorySegmentSchema = (t: (key: any) => string) => ({
  type: Type.OBJECT,
  properties: {
    paragraph: {
      type: Type.STRING,
      description: "The next paragraph of the story, written in a child-friendly and immersive tone.",
    },
    videoSuggestion: {
      type: Type.STRING,
      description: "A short, one-sentence description for a video scene that visually represents the paragraph.",
    },
    choices: {
      type: Type.ARRAY,
      description: "Exactly three distinct, creative, and logical choices for the user to decide what happens next. Each choice should be a short, actionable phrase.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["paragraph", "videoSuggestion", "choices"],
});

const getStoryConclusionSchema = (t: (key: any) => string) => ({
    type: Type.OBJECT,
    properties: {
        conclusion: {
            type: Type.STRING,
            description: "A final, concluding paragraph for the story that wraps up the narrative beautifully.",
        },
        summary: {
            type: Type.STRING,
            description: "A short, one-paragraph summary of the entire story from beginning to end.",
        },
    },
    required: ["conclusion", "summary"],
});


const parseAndValidateResponse = <T>(response: GenerateContentResponse, fallback: T): T => {
  try {
    const text = response.text.trim();
    const cleanText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const data = JSON.parse(cleanText);
    if (!data) throw new Error("Parsed data is empty.");
    return data as T;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return fallback;
  }
};

const getT = (lang: LanguageCode) => (key: keyof typeof translations.en, replacements: Record<string, string | number> = {}) => {
    const langTranslations = translations[lang] || translations.en;
    let translation = langTranslations[key] || translations.en[key] || key;
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
    });
    return translation;
};

export const generateInitialStory = async (protagonist: string, setting: string, lang: LanguageCode): Promise<StoryChoice> => {
  const t = getT(lang);
  const languageName = languages[lang].name;
  const prompt = `You are an AI assistant for creating interactive, child-friendly stories. Your response MUST be in ${languageName}. The user has provided a protagonist and a setting. Protagonist: "${protagonist}". Setting: "${setting}". Generate the first paragraph of the story. It should be immersive and creative. After the paragraph, provide a short, descriptive suggestion for a video scene that matches the paragraph. Finally, provide exactly three distinct, creative, and logical choices for the user to decide what happens next. Return the response as a JSON object matching the provided schema.`;

  const response = await ai.models.generateContent({
    model: "ai_life_story_builder-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: getStorySegmentSchema(t) },
  });

  return parseAndValidateResponse(response, {
      paragraph: t('ai_life_story_builder_fallback_paragraph'),
      videoSuggestion: t('ai_life_story_builder_fallback_video'),
      choices: [t('ai_life_story_builder_fallback_choice1'), t('ai_life_story_builder_fallback_choice2'), t('ai_life_story_builder_fallback_choice3')],
  });
};

export const continueStory = async (fullStoryText: string, userChoice: string, lang: LanguageCode): Promise<StoryChoice> => {
  const t = getT(lang);
  const languageName = languages[lang].name;
  const prompt = `You are an AI assistant continuing an interactive, child-friendly story. Your response MUST be in ${languageName}. Here is the story so far: ---\n${fullStoryText}\n--- The user has just chosen to: "${userChoice}". Continue the story from this point. Write one new paragraph that follows logically from the user's choice and the previous story. After the paragraph, provide a short, descriptive suggestion for a video scene that matches the new paragraph. Finally, provide exactly three new, distinct, creative, and logical choices for the user to decide what happens next. Do not refer to the choices that were not picked previously. Return the response as a JSON object matching the provided schema.`;

  const response = await ai.models.generateContent({
    model: "ai_life_story_builder-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: getStorySegmentSchema(t) },
  });

  return parseAndValidateResponse(response, {
      paragraph: t('ai_life_story_builder_fallback_paragraph_continue'),
      videoSuggestion: t('ai_life_story_builder_fallback_video_continue'),
      choices: [t('ai_life_story_builder_fallback_choice_continue1'), t('ai_life_story_builder_fallback_choice_continue2'), t('ai_life_story_builder_fallback_choice_continue3')],
  });
};

export const generateStoryConclusion = async (fullStoryText: string, lang: LanguageCode): Promise<{ conclusion: string; summary: string }> => {
    const t = getT(lang);
    const languageName = languages[lang].name;
    const prompt = `You are an AI assistant concluding an interactive, child-friendly story. Your response MUST be in ${languageName}. Here is the full story so far: ---\n${fullStoryText}\n---. The user has decided to end the story here. Please write a beautiful, final concluding paragraph that wraps up the narrative. Then, provide a concise one-paragraph summary of the entire adventure from start to finish. Return the response as a JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
        model: "ai_life_story_builder-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: getStoryConclusionSchema(t) },
    });

    return parseAndValidateResponse(response, {
        conclusion: t('ai_life_story_builder_fallback_conclusion'),
        summary: t('ai_life_story_builder_fallback_summary'),
    });
};


export const generateSceneImage = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `A cinematic, child-friendly, digital painting style image for a fantasy story. The scene is: ${prompt}`;
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Failed to generate image:", error);
    // In a real app, you might have a set of default placeholder images.
    return `https://via.placeholder.com/1280x720.png?text=Image+Generation+Error`;
  }
};