const OpenAI = require("openai");

const {
  endpoint,
  apiKey,
  deployment,
} = require("../config/azureConfig");

const {
  calculateComplexity
} = require("./complexityService");

const {
  generateShootPlan
} = require(
  "./shootPlanService"
);

const client = new OpenAI({
  apiKey,
  baseURL: endpoint,
});

const analyzeScript = async (text) => {

  try {

    const response =
      await client.responses.create({
        model: deployment,

        input: `
Analyze the screenplay excerpt below.

Return ONLY raw JSON.

Do not wrap the JSON in markdown.

Do not use code fences.

Do not include explanations.

Return a JSON object only.

Schema:

{
  "projectSummary": "string",
  "genre": "string",
  "estimatedSceneCount": number,

  "scenes": [
    {
      "sceneNumber": number,
      "title": "string",
      "location": "string",

      "actors": ["string"],
      "props": ["string"],
      "costumes": ["string"],

      "specialRequirements": ["string"]
    }
  ]
}

For each scene identify:
- title
- location
- actors
- props
- costumes
- special requirements

Special requirements may include:
- crowd scenes
- vehicles
- animals
- stunts
- special effects
- outdoor weather dependency
- location permissions

Return at most 20 scenes.

Screenplay:

${text.substring(0, 30000)}`
      });

    const cleanedJson =
  response.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  const analysis =
  JSON.parse(cleanedJson);
  
  analysis.scenes =
  analysis.scenes.map(scene => {

    const complexity =
      calculateComplexity(scene);

    return {
      ...scene,

      complexityScore:
        complexity.score,

      complexityReasons:
        complexity.reasons,
    };
  });

analysis.shootPlan =
  generateShootPlan(
    analysis.scenes
  );

return analysis;

  } catch (error) {

    console.error(
      "Azure AI call failed",
      error
    );

    throw error;
  }
};

module.exports = {
  analyzeScript,
};