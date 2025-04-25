import OpenAI from 'openai';
import natural from 'natural';
import profanityFilter from './profanityFilter.js';

class ContentModerationService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    }

    async analyzeContent(content) {
        try {
            // Check for profanity
            const hasProfanity = profanityFilter.isProfane(content);
            if (hasProfanity) {
                return {
                    isAppropriate: false,
                    reason: 'Contains inappropriate content',
                    flaggedWords: profanityFilter.list.filter(word => content.toLowerCase().includes(word))
                };
            }

            // Analyze sentiment
            const sentiment = this.analyzeSentiment(content);
            if (sentiment < -0.5) {
                return {
                    isAppropriate: false,
                    reason: 'Content has negative sentiment',
                    sentiment
                };
            }

            try {
                // Use OpenAI for advanced content analysis
                const completion = await this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a content moderator. Analyze the following content for appropriateness. Consider factors like hate speech, harassment, violence, and inappropriate content. Return a JSON response with 'isAppropriate' (boolean) and 'reason' (string) fields."
                        },
                        {
                            role: "user",
                            content: content
                        }
                    ],
                    response_format: { type: "json_object" }
                });

                const analysis = JSON.parse(completion.choices[0].message.content);
                return analysis;
            } catch (openaiError) {
                // If OpenAI API fails, fall back to basic moderation
                console.warn('OpenAI API unavailable, using basic moderation:', openaiError.message);
                return {
                    isAppropriate: true,
                    reason: 'Content passed basic moderation checks',
                    details: {
                        profanityCheck: 'passed',
                        sentiment: sentiment,
                        openaiAnalysis: 'unavailable'
                    }
                };
            }
        } catch (error) {
            console.error('Error in content analysis:', error);
            // Return a safe default response
            return {
                isAppropriate: false,
                reason: 'Error in content analysis',
                details: {
                    error: error.message
                }
            };
        }
    }

    analyzeSentiment(text) {
        try {
            const tokens = new natural.WordTokenizer().tokenize(text);
            return this.sentimentAnalyzer.getSentiment(tokens);
        } catch (error) {
            console.error('Error in sentiment analysis:', error);
            return 0; // Neutral sentiment as fallback
        }
    }
}

export const contentModerationService = new ContentModerationService(); 