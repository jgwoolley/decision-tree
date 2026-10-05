import { Button } from '../../common/Button';
import type { FinalOption } from '../../../types';

interface LeafResultProps {
  option: FinalOption;
  onRestart: () => void;
  onBack: () => void;
}

export function LeafResult({ option, onRestart, onBack }: LeafResultProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-8 text-center dark:border-indigo-800 dark:bg-indigo-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
        Result
      </p>
      <h2 className="text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{option.name}</h2>
      {option.description && (
        <p className="max-w-md text-sm text-indigo-700 dark:text-indigo-300">{option.description}</p>
      )}
      <div className="mt-2 flex gap-2">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onRestart}>
          Run again
        </Button>
      </div>
    </div>
  );
}
