import { createId } from './id';
import type {
  DecisionTree,
  FinalOption,
  SequentialAnswerChoice,
  SequentialQuestion,
  TreeMode,
  WeightedAnswerChoice,
  WeightedQuestion,
} from '../types';

export function createOption(name: string): FinalOption {
  return { id: createId(), name };
}

export function createSequentialChoice(text = 'New answer'): SequentialAnswerChoice {
  return { id: createId(), text };
}

export function createSequentialQuestion(text = 'New question'): SequentialQuestion {
  return { id: createId(), text, choices: [] };
}

export function createWeightedChoice(
  text = 'New answer',
  options: FinalOption[] = [],
): WeightedAnswerChoice {
  const scores: Record<string, number> = {};
  for (const option of options) scores[option.id] = 0;
  return { id: createId(), text, scores };
}

export function createWeightedQuestion(
  text = 'New question',
  options: FinalOption[] = [],
): WeightedQuestion {
  return {
    id: createId(),
    text,
    choices: [createWeightedChoice('Answer 1', options), createWeightedChoice('Answer 2', options)],
  };
}

export function createTree(name: string, description: string, mode: TreeMode): DecisionTree {
  const now = new Date().toISOString();
  const options = [createOption('Option A'), createOption('Option B')];

  const base = {
    id: createId(),
    name,
    description: description || undefined,
    options,
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1 as const,
  };

  if (mode === 'sequential') {
    const root = createSequentialQuestion('What is the first question?');
    return {
      ...base,
      mode: 'sequential',
      rootQuestionId: root.id,
      questions: { [root.id]: root },
    };
  }

  const question = createWeightedQuestion('What is the first question?', options);
  return {
    ...base,
    mode: 'weighted',
    questionOrder: [question.id],
    questions: { [question.id]: question },
  };
}
