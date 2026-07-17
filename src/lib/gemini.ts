export interface GeneratedTestQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export type TopicVisualType = 'line' | 'bar';

export interface TopicVisualData {
  type: TopicVisualType;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  data: number[];
}

export interface TopicExplanationStep {
  title: string;
  content: string;
  visualData?: TopicVisualData;
}

const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

const systemPrompt = `You are SYNAPSE, a professional quiz generator for an educational platform.
Return ONLY valid JSON. Do not include Markdown, code fences, comments, explanations, or any text before or after the JSON.
The JSON must be an array of exactly 5 objects. Each object must follow this schema:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact text of the correct option from options"
  }
]
Rules:
- Create questions only about the requested topic and difficulty.
- Each question must have exactly 4 answer options.
- correctAnswer must exactly match one string from options.`;

const topicExplainerSystemPrompt = `You are SYNAPSE, a precise educational lecturer.
Return ONLY valid JSON. Do not include Markdown, code fences, comments, explanations, or any text before or after the JSON.
The JSON must be an array of 4 to 5 logical steps. Each step must follow this schema:
[
  {
    "title": "Short step title",
    "content": "A clear explanation for this step",
    "visualData": {
      "type": "line",
      "title": "Optional visual title",
      "xLabel": "Optional horizontal axis label",
      "yLabel": "Optional vertical axis label",
      "data": [1, 2, 3, 4]
    }
  }
]
Rules:
- Explain the requested topic step by step.
- Keep each step focused on one idea.
- Strictly explain the topic only: provide facts, definitions, examples, concise conclusions, and visualization when useful.
- Do not ask the user any questions.
- Do not include questions at the end of paragraphs, steps, or content fields.
- Do not use Socratic prompts, reflection prompts, quiz prompts, or comprehension checks.
- Include visualData only when a visualization is genuinely useful, for example a function graph, trend, comparison, sequence, or changing value.
- visualData.type can be "line" or "bar".
- visualData.data must be an array of 2 to 20 numbers.
- Omit visualData when visualization is not needed.
- Use the same language as the user's topic when possible.`;

const simpleStepSystemPrompt = `Explain the current step in extremely simple terms with a real-life analogy.
Return ONLY valid JSON. Do not include Markdown, code fences, comments, explanations, or any text before or after the JSON.
The JSON must be an array with exactly 1 object:
[
  {
    "title": "Simplified title",
    "content": "Very simple explanation with one real-life analogy",
    "visualData": {
      "type": "line",
      "title": "Optional visual title",
      "data": [1, 2, 3, 4]
    }
  }
]
Include visualData only if it helps explain this simpler version.
Strictly explain the topic only. Do not ask the user any questions, and do not include questions at the end of paragraphs, steps, or content fields.
Use the same language as the user's topic when possible.`;

const stripJsonFences = (text: string): string =>
  text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const normalizeQuestions = (questions: unknown): GeneratedTestQuestion[] => {
  if (!Array.isArray(questions)) {
    throw new Error('AI returned an invalid test format.');
  }

  const normalizedQuestions = questions
    .filter(
      (question): question is GeneratedTestQuestion =>
        typeof question === 'object' &&
        question !== null &&
        typeof (question as GeneratedTestQuestion).question === 'string' &&
        Array.isArray((question as GeneratedTestQuestion).options) &&
        typeof (question as GeneratedTestQuestion).correctAnswer === 'string',
    )
    .map((question) => ({
      question: question.question.trim(),
      options: question.options.filter((option) => typeof option === 'string').slice(0, 4),
      correctAnswer: question.correctAnswer.trim(),
    }))
    .filter((question) => question.question && question.options.length === 4 && question.options.includes(question.correctAnswer));

  if (normalizedQuestions.length === 0) {
    throw new Error('AI did not return valid test questions.');
  }

  return normalizedQuestions;
};

const normalizeVisualData = (visualData: unknown): TopicVisualData | undefined => {
  if (typeof visualData !== 'object' || visualData === null) {
    return undefined;
  }

  const candidate = visualData as Partial<TopicVisualData>;
  const type = candidate.type === 'bar' ? 'bar' : candidate.type === 'line' ? 'line' : undefined;
  const data = Array.isArray(candidate.data)
    ? candidate.data.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)).slice(0, 20)
    : [];

  if (!type || data.length < 2) {
    return undefined;
  }

  return {
    type,
    title: typeof candidate.title === 'string' ? candidate.title.trim() : undefined,
    xLabel: typeof candidate.xLabel === 'string' ? candidate.xLabel.trim() : undefined,
    yLabel: typeof candidate.yLabel === 'string' ? candidate.yLabel.trim() : undefined,
    data,
  };
};

const normalizeExplanationSteps = (steps: unknown): TopicExplanationStep[] => {
  if (!Array.isArray(steps)) {
    throw new Error('AI returned an invalid explanation format.');
  }

  const normalizedSteps = steps
    .filter(
      (step): step is TopicExplanationStep =>
        typeof step === 'object' &&
        step !== null &&
        typeof (step as TopicExplanationStep).title === 'string' &&
        typeof (step as TopicExplanationStep).content === 'string',
    )
    .map((step) => ({
      title: step.title.trim(),
      content: step.content.trim(),
      visualData: normalizeVisualData((step as Partial<TopicExplanationStep>).visualData),
    }))
    .filter((step) => step.title && step.content);

  if (normalizedSteps.length === 0) {
    throw new Error('AI did not return valid explanation steps.');
  }

  return normalizedSteps;
};

const requestGroqJson = async (system: string, prompt: string): Promise<unknown> => {
  if (!apiKey) {
    throw new Error('Groq API key is missing. Add VITE_GROQ_API_KEY to your .env.local file.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.45,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = stripJsonFences(data.choices[0].message.content);

  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI returned invalid JSON. Please try again.');
    }
    throw error;
  }
};

export const generateTest = async (topic: string, difficulty: string): Promise<GeneratedTestQuestion[]> => {
  const questions = await requestGroqJson(
    systemPrompt,
    `Create a quiz about "${topic}" with difficulty "${difficulty}". Number of questions: 5.`,
  );

  return normalizeQuestions(questions);
};

export const explainTopic = async (topic: string, currentStep?: TopicExplanationStep): Promise<TopicExplanationStep[]> => {
  const prompt = currentStep
    ? `Topic: "${topic}". Current step title: "${currentStep.title}". Current step text: "${currentStep.content}".`
    : `Explain this topic in 4-5 logical steps: "${topic}".`;

  const steps = await requestGroqJson(currentStep ? simpleStepSystemPrompt : topicExplainerSystemPrompt, prompt);

  return normalizeExplanationSteps(steps);
};
