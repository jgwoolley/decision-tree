import { useState } from 'react';
import { Button } from '../../common/Button';
import { EmptyState } from '../../common/EmptyState';
import { LeafResult } from './LeafResult';
import type { DecisionTree, SequentialTree } from '../../../types';

interface SequentialRunnerProps {
  tree: DecisionTree & SequentialTree;
}

export function SequentialRunner({ tree }: SequentialRunnerProps) {
  const [trail, setTrail] = useState<string[]>(tree.rootQuestionId ? [tree.rootQuestionId] : []);
  const [resultOptionId, setResultOptionId] = useState<string | null>(null);

  if (!tree.rootQuestionId || trail.length === 0) {
    return <EmptyState title="This tree has no questions to run yet." />;
  }

  function restart() {
    setTrail(tree.rootQuestionId ? [tree.rootQuestionId] : []);
    setResultOptionId(null);
  }

  function back() {
    if (resultOptionId) {
      setResultOptionId(null);
      return;
    }
    setTrail((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  if (resultOptionId) {
    const option = tree.options.find((o) => o.id === resultOptionId);
    if (option) {
      return <LeafResult option={option} onRestart={restart} onBack={back} />;
    }
  }

  const currentQuestionId = trail[trail.length - 1];
  const question = tree.questions[currentQuestionId];
  if (!question) {
    return <EmptyState title="This question no longer exists." action={<Button onClick={restart}>Restart</Button>} />;
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        Question {trail.length}
      </p>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{question.text}</h2>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
              if (choice.leafOptionId) {
                setResultOptionId(choice.leafOptionId);
              } else if (choice.nextQuestionId) {
                setTrail((prev) => [...prev, choice.nextQuestionId!]);
              }
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-left text-sm text-slate-900 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-600 dark:text-slate-100 dark:hover:border-indigo-500 dark:hover:bg-indigo-950"
          >
            {choice.text}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" disabled={trail.length <= 1} onClick={back}>
          Back
        </Button>
        <Button variant="ghost" size="sm" onClick={restart}>
          Restart
        </Button>
      </div>
    </div>
  );
}
