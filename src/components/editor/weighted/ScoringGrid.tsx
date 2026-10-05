import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import type { FinalOption, WeightedAnswerChoice } from '../../../types';

interface ScoringGridProps {
  treeId: string;
  questionId: string;
  choices: WeightedAnswerChoice[];
  options: FinalOption[];
}

export function ScoringGrid({ treeId, questionId, choices, options }: ScoringGridProps) {
  const setChoiceScore = useTreeLibraryStore((s) => s.setChoiceScore);
  const updateChoiceText = useTreeLibraryStore((s) => s.updateChoiceText);
  const deleteChoice = useTreeLibraryStore((s) => s.deleteWeightedChoice);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-1/3 p-1 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
              Answer
            </th>
            {options.map((option) => (
              <th
                key={option.id}
                className="p-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {option.name}
              </th>
            ))}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {choices.map((choice) => (
            <tr key={choice.id}>
              <td className="p-1">
                <input
                  value={choice.text}
                  onChange={(e) => updateChoiceText(treeId, questionId, choice.id, e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </td>
              {options.map((option) => (
                <td key={option.id} className="p-1">
                  <input
                    type="number"
                    value={choice.scores[option.id] ?? 0}
                    onChange={(e) =>
                      setChoiceScore(
                        treeId,
                        questionId,
                        choice.id,
                        option.id,
                        Number(e.target.value) || 0,
                      )
                    }
                    className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </td>
              ))}
              <td className="p-1 text-center">
                <button
                  disabled={choices.length <= 2}
                  title={choices.length <= 2 ? 'At least 2 answers are required' : 'Remove answer'}
                  onClick={() => deleteChoice(treeId, questionId, choice.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-500 dark:hover:text-rose-400"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
