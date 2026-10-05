import type { FinalOption, WeightedTree } from '../types';

export interface ScoredOption {
  option: FinalOption;
  score: number;
}

export interface RankedGroup {
  rank: number;
  score: number;
  options: FinalOption[];
}

export function computeScores(
  tree: WeightedTree,
  options: FinalOption[],
  answers: Record<string, string>,
): ScoredOption[] {
  const totals: Record<string, number> = {};
  for (const option of options) totals[option.id] = 0;

  for (const questionId of tree.questionOrder) {
    const choiceId = answers[questionId];
    if (!choiceId) continue;
    const question = tree.questions[questionId];
    const choice = question?.choices.find((c) => c.id === choiceId);
    if (!choice) continue;
    for (const [optionId, points] of Object.entries(choice.scores)) {
      if (optionId in totals) totals[optionId] += points;
    }
  }

  return options.map((option) => ({ option, score: totals[option.id] ?? 0 }));
}

export function rankOptions(scored: ScoredOption[]): RankedGroup[] {
  const byScore = new Map<number, FinalOption[]>();
  for (const { option, score } of scored) {
    const group = byScore.get(score) ?? [];
    group.push(option);
    byScore.set(score, group);
  }

  const sortedScores = Array.from(byScore.keys()).sort((a, b) => b - a);
  return sortedScores.map((score, index) => ({
    rank: index + 1,
    score,
    options: byScore.get(score)!,
  }));
}
