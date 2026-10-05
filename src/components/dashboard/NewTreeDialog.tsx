import { useState } from 'react';
import { Button } from '../common/Button';
import type { TreeMode } from '../../types';

interface NewTreeDialogProps {
  onCreate: (name: string, description: string, mode: TreeMode) => void;
  onCancel: () => void;
}

export function NewTreeDialog({ onCreate, onCancel }: NewTreeDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<TreeMode>('sequential');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim(), description.trim(), mode);
        }}
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">New decision tree</h3>

        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Notebook vs. Spark vs. NiFi"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">Mode</legend>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Mode can't be changed later — duplicate the tree if you need the other mode.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-md border p-3 text-sm ${
                mode === 'sequential'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="mode"
                className="mr-2"
                checked={mode === 'sequential'}
                onChange={() => setMode('sequential')}
              />
              <span className="font-medium text-slate-900 dark:text-slate-100">Sequential</span>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                A literal branching tree — each answer leads to the next question or a final option.
              </p>
            </label>
            <label
              className={`cursor-pointer rounded-md border p-3 text-sm ${
                mode === 'weighted'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="mode"
                className="mr-2"
                checked={mode === 'weighted'}
                onChange={() => setMode('weighted')}
              />
              <span className="font-medium text-slate-900 dark:text-slate-100">Weighted</span>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Answer every question; each answer scores points toward one or more options.
              </p>
            </label>
          </div>
        </fieldset>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
