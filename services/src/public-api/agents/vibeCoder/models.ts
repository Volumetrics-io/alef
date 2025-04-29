export const modelNames = ['llama-3.3-70b', 'deepseek-r1-qwen-32b', 'llama-4-scout-17b', 'gemma-3-12b', 'qwq-32b', 'qwen2.5-coder-32b', 'gemini-2.5-flash'] as const;
export type VibeCoderModel = (typeof modelNames)[number];

export const defaultModel: VibeCoderModel = 'qwen2.5-coder-32b';
