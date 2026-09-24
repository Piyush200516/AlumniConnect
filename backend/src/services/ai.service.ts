// Make sure to configure the API key in the .env file (GEMINI_API_KEY)
let aiInstance: any = null;

const getAiInstance = async () => {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    const { GoogleGenAI } = await import('@google/genai');
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
};

export const parseResumeText = async (text: string) => {
  const ai = await getAiInstance();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const prompt = `
You are an expert AI resume parser. I will provide you with the text extracted from a resume or LinkedIn profile. 
Extract the information into the following exact JSON structure. If information is missing, leave it as null, an empty string, or an empty array as appropriate. Do not return any text outside of the JSON.

JSON Schema:
{
  "skills": ["string"],
  "experience": number (total years of experience, default to 0 if not found),
  "currentCompany": "string",
  "designation": "string",
  "bio": "string",
  "workExperiences": [
    {
      "companyName": "string",
      "role": "string",
      "startDate": "YYYY-MM-DD" (or approximate if only month/year is available, e.g. "2020-01-01"),
      "endDate": "YYYY-MM-DD" (or null if currently working),
      "description": "string"
    }
  ],
  "educations": [
    {
      "institution": "string",
      "degree": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": "string"
    }
  ]
}

Resume Text:
"""
${text}
"""
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
        throw new Error("Failed to get response text from AI.");
    }
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    throw new Error('Failed to parse resume using AI.');
  }
};
