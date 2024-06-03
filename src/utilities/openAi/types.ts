import {Field, InputType} from 'type-graphql';

@InputType()
export class TextToSpeechInput {
  @Field()
  text: string;
  @Field()
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

@InputType()
export class ChatCompletionInput {
  @Field()
  content: string;
  @Field()
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  @Field()
  role: 'user' | 'system' | 'assistant' | 'tool';
  @Field()
  model: 'gpt-3.5-turbo' | 'gpt-3.5' | 'gpt-3';
}
