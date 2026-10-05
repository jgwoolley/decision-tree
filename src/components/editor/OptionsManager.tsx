import { useState } from 'react';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useTreeLibraryStore } from '../../store/treeLibraryStore';
import type { FinalOption } from '../../types';

interface OptionsManagerProps {
  treeId: string;
  options: FinalOption[];
}

export function OptionsManager({ treeId, options }: OptionsManagerProps) {
  const addOption = useTreeLibraryStore((s) => s.addOption);
  const renameOption = useTreeLibraryStore((s) => s.renameOption);
  const deleteOption = useTreeLibraryStore((s) => s.deleteOption);
  const [pendingDelete, setPendingDelete] = useState<FinalOption | null>(null);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Final options</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        The possible outcomes this tree resolves to (e.g. Jupyter Notebook, Spark Job, NiFi Dataflow).
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {options.map((option) => (
          <li key={option.id} className="flex items-center gap-2">
            <input
              value={option.name}
              onChange={(e) => renameOption(treeId, option.id, e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <Button
              size="sm"
              variant="ghost"
              disabled={options.length <= 2}
              title={options.length <= 2 ? 'At least 2 options are required' : 'Remove option'}
              onClick={() => setPendingDelete(option)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <Button
        size="sm"
        variant="secondary"
        className="mt-3"
        onClick={() => addOption(treeId, `Option ${options.length + 1}`)}
      >
        Add option
      </Button>

      {pendingDelete && (
        <ConfirmDialog
          title="Remove final option?"
          message={`"${pendingDelete.name}" will be removed. Any answers pointing to it will need to be re-wired.`}
          confirmLabel="Remove"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteOption(treeId, pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      )}
    </section>
  );
}
