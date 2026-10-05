import { Button } from '../../common/Button';
import type { RankedGroup } from '../../../lib/scoring';

interface ResultsScreenProps {
  ranked: RankedGroup[];
  onRestart: () => void;
  onBack: () => void;
}

export function ResultsScreen({ ranked, onRestart, onBack }: ResultsScreenProps) {
  const topScore = ranked[0]?.score ?? 0;
  const maxScore = Math.max(topScore, 1);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Results</h2>

      <div className="flex flex-col gap-3">
        {ranked.map((group) => (
          <div key={group.rank}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.rank === 1 ? (group.options.length > 1 ? 'Tied winners' : 'Winner') : `Rank ${group.rank}`}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{group.score} pts</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {group.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${group.rank === 1 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      style={{ width: `${Math.max(4, (group.score / maxScore) * 100)}%` }}
                    />
                  </div>
                  <span
                    className={`w-40 shrink-0 text-sm ${
                      group.rank === 1
                        ? 'font-semibold text-indigo-900 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {option.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" onClick={onBack}>
          Back to answers
        </Button>
        <Button variant="primary" onClick={onRestart}>
          Run again
        </Button>
      </div>
    </div>
  );
}
