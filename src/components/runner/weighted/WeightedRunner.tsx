import { useMemo, useState } from 'react';
import { Button } from '../../common/Button';
import { EmptyState } from '../../common/EmptyState';
import { computeScores, rankOptions } from '../../../lib/scoring';
import { ResultsScreen } from './ResultsScreen';
import type { DecisionTree, WeightedTree } from '../../../types';

interface WeightedRunnerProps {
  tree: DecisionTree & WeightedTree;
}

export function WeightedRunner({ tree }: WeightedRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalCount = tree.questionOrder.length;

  const ranked = useMemo(() => {
    const scored = computeScores(tree, tree.options, answers);
    return rankOptions(scored);
  }, [tree, answers]);

  if (totalCount === 0) {
    return <EmptyState title="This tree has no questions to run yet." />;
  }

  if (showResults) {
    return (
      <ResultsScreen
        ranked={ranked}
        onBack={() => setShowResults(false)}
        onRestart={() => {
          setAnswers({});
          setShowResults(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Answer every question</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {answeredCount} of {totalCount} answered
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {tree.questionOrder.map((questionId) => {
          const question = tree.questions[questionId];
          if (!question) return null;
          return (
            <fieldset key={questionId} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <legend className="px-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                {question.text}
              </legend>
              <div className="mt-1 flex flex-col gap-1.5">
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="radio"
                      name={questionId}
                      checked={answers[questionId] === choice.id}
                      onChange={() => setAnswers((prev) => ({ ...prev, [questionId]: choice.id }))}
                    />
                    {choice.text}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>

      <Button variant="primary" disabled={answeredCount === 0} onClick={() => setShowResults(true)}>
        See results
      </Button>
    </div>
  );
}
