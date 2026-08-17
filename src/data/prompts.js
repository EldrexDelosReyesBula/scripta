/*
 * Scripta - Warm-Up Prompts Collection
 */

export const WARMUP_PROMPTS = [
  "Write the sentence that has been stuck in your head for the past week.",
  "Describe the room you are sitting in without using any adjectives.",
  "What are you avoiding by being here? Write about that.",
  "Write a letter to the person who taught you the most about thinking.",
  "Explain your current project to a curious twelve-year-old.",
  "What is the ugliest sentence you can write? Then write a beautiful one.",
  "Write for five minutes about anything. The only rule: you cannot use the letter 'e'.",
  "What question are you afraid to answer in your draft?",
  "Describe your central argument as if it were a physical building."
];

export function getRandomPrompt() {
  const index = Math.floor(Math.random() * WARMUP_PROMPTS.length);
  return WARMUP_PROMPTS[index];
}
