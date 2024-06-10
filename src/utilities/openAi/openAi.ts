import OpenAI from 'openai';

export const openAIService: any = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
