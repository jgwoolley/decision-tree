import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { downloadTreeAsJson } from '../../lib/exportImport';
import { useTreeLibraryStore } from '../../store/treeLibraryStore';
import type { DecisionTree, RunnableCheck } from '../../types';

interface EditorHeaderProps {
  tree: DecisionTree;
  runnable: RunnableCheck;
}

export function EditorHeader({ tree, runnable }: EditorHeaderProps) {
  const updateTreeMeta = useTreeLibraryStore((s) => s.updateTreeMeta);

  return (
    <header className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link to="/" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← All trees
        </Link>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {tree.mode === 'sequential' ? 'Sequential' : 'Weighted'} mode
        </span>
      </div>

      <input
        value={tree.name}
        onChange={(e) => updateTreeMeta(tree.id, { name: e.target.value })}
        className="mt-3 w-full border-none bg-transparent p-0 text-xl font-semibold text-slate-900 focus:outline-none dark:text-slate-100"
      />
      <textarea
        value={tree.description ?? ''}
        onChange={(e) => updateTreeMeta(tree.id, { description: e.target.value })}
        placeholder="Add a description…"
        rows={1}
        className="mt-1 w-full resize-none border-none bg-transparent p-0 text-sm text-slate-500 focus:outline-none dark:text-slate-400"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {runnable.ok ? (
          <Link to={`/trees/${tree.id}/run`}>
            <Button variant="primary">Run</Button>
          </Link>
        ) : (
          <Button variant="primary" disabled>
            Run
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => downloadTreeAsJson(tree)}>
          Export JSON
        </Button>
        {!runnable.ok && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {runnable.issues.length} issue{runnable.issues.length === 1 ? '' : 's'} before this tree
            can run
          </span>
        )}
      </div>

      {!runnable.ok && (
        <ul className="mt-2 list-inside list-disc text-xs text-amber-700 dark:text-amber-400">
          {runnable.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </header>
  );
}
