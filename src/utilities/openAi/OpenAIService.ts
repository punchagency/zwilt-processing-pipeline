import OpenAI from 'openai';
import {Service} from 'typedi';
import {openAIService} from '../../utilities/openAi/openAi';

@Service()
export class OpenAIService {
  private openAIInstance: OpenAI;

  constructor() {
    this.openAIInstance = openAIService;
  }

  async useOpenAi(request: any) {
    try {
      const response = await this.openAIInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: request,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      if (
        !response.choices ||
        !response.choices.length ||
        !response.choices[0]['message'] ||
        !response.choices[0]['message']['content']
      ) {
        return null;
      }
      return response.choices[0]['message']['content'];
    } catch (error) {
      console.log('OpenAi error:', error);
      return null;
    }
  }

  async analyzeTranscript(prompt: string) {
    try {
      console.log("analyzing...");
        const response = await this.useOpenAi(prompt);
        if (response) {
            return response;
        }
        return null;
    } catch (error) {
        console.error('OpenAI analysis error:', error);
        return null;
    }
}
}
