import OpenAI from 'openai';

export const openAIService: any = new OpenAI({
  apiKey: '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',
  //   apiKey: process.env.OPENAI_API_KEY,
});
