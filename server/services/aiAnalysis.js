const OpenAI = require('openai');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class AIAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeDesign(imagePath, dimensions) {
    try {
      // Read and process the image
      const imageBuffer = await fs.readFile(imagePath);
      
      // Convert to base64 for OpenAI API
      const base64Image = imageBuffer.toString('base64');
      
      // Create the analysis prompt
      const prompt = this.createAnalysisPrompt(dimensions);
      
      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      });

      const analysisText = response.choices[0].message.content;
      return this.parseAnalysisResponse(analysisText, dimensions);
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  createAnalysisPrompt(dimensions) {
    return `Analyze this UI design screenshot and provide structured feedback. The image dimensions are ${dimensions.width}x${dimensions.height} pixels.

Please analyze the design for:
1. Accessibility issues (color contrast, text readability, navigation)
2. Visual hierarchy problems (spacing, alignment, typography)
3. Content and copy quality (tone, clarity, messaging)
4. UI/UX patterns (button placement, user flow, best practices)

For each issue found, provide:
- Category: accessibility, visual_hierarchy, content, or ui_patterns
- Severity: high, medium, or low
- Title: Brief descriptive title
- Description: Detailed explanation of the issue
- Coordinates: x, y, width, height in pixels (be precise)
- Recommendations: 2-3 actionable suggestions
- Tags: Relevant keywords
- Relevant Roles: Which team roles should see this (designer, reviewer, product_manager, developer)

Format your response as JSON with this structure:
{
  "feedbackItems": [
    {
      "id": "unique-id",
      "category": "accessibility",
      "severity": "high",
      "title": "Low color contrast",
      "description": "Text has insufficient contrast against background",
      "coordinates": {
        "x": 100,
        "y": 200,
        "width": 300,
        "height": 50
      },
      "recommendations": [
        "Increase text color contrast to meet WCAG AA standards",
        "Consider using a darker background or lighter text"
      ],
      "tags": ["contrast", "accessibility", "text"],
      "relevantRoles": ["designer", "developer"]
    }
  ],
  "overallScore": 75,
  "summary": "Overall design assessment with key strengths and areas for improvement"
}

Be thorough but concise. Focus on actionable feedback that will help improve the design.`;
  }

  parseAnalysisResponse(responseText, dimensions) {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      if (!analysisData.feedbackItems || !Array.isArray(analysisData.feedbackItems)) {
        analysisData.feedbackItems = [];
      }

      // Add unique IDs if missing and validate coordinates
      analysisData.feedbackItems = analysisData.feedbackItems.map((item, index) => ({
        id: item.id || `feedback-${Date.now()}-${index}`,
        category: item.category || 'ui_patterns',
        severity: item.severity || 'medium',
        title: item.title || 'Design Issue',
        description: item.description || 'No description provided',
        coordinates: this.validateCoordinates(item.coordinates, dimensions),
        recommendations: item.recommendations || [],
        tags: item.tags || [],
        relevantRoles: item.relevantRoles || ['designer']
      }));

      return {
        feedbackItems: analysisData.feedbackItems,
        overallScore: Math.max(0, Math.min(100, analysisData.overallScore || 75)),
        summary: analysisData.summary || 'Design analysis completed'
      };
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return a fallback analysis
      return {
        feedbackItems: [{
          id: `fallback-${Date.now()}`,
          category: 'ui_patterns',
          severity: 'medium',
          title: 'Analysis Incomplete',
          description: 'AI analysis could not be parsed properly. Please review manually.',
          coordinates: {
            x: 0,
            y: 0,
            width: dimensions.width,
            height: 50
          },
          recommendations: ['Review the design manually for potential improvements'],
          tags: ['manual-review'],
          relevantRoles: ['designer', 'reviewer']
        }],
        overallScore: 50,
        summary: 'AI analysis encountered an error. Manual review recommended.'
      };
    }
  }

  validateCoordinates(coords, dimensions) {
    if (!coords || typeof coords !== 'object') {
      return { x: 0, y: 0, width: 100, height: 50 };
    }

    return {
      x: Math.max(0, Math.min(coords.x || 0, dimensions.width - 1)),
      y: Math.max(0, Math.min(coords.y || 0, dimensions.height - 1)),
      width: Math.max(10, Math.min(coords.width || 100, dimensions.width)),
      height: Math.max(10, Math.min(coords.height || 50, dimensions.height))
    };
  }

  async getImageDimensions(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height
      };
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return { width: 800, height: 600 }; // Default fallback
    }
  }
}

module.exports = new AIAnalysisService();


