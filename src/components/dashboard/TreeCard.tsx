import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { downloadTreeAsJson } from '../../lib/exportImport';
import { useTreeLibraryStore } from '../../store/treeLibraryStore';
import type { DecisionTree } from '../../types';

interface TreeCardProps {
  tree: DecisionTree;
}

export function TreeCard({ tree }: TreeCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTree = useTreeLibraryStore((s) => s.deleteTree);
  const duplicateTree = useTreeLibraryStore((s) => s.duplicateTree);

  const questionCount = Object.keys(tree.questions).length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{tree.name}</h3>
          {tree.description && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{tree.description}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {tree.mode === 'sequential' ? 'Sequential' : 'Weighted'}
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {questionCount} question{questionCount === 1 ? '' : 's'} · {tree.options.length} option
        {tree.options.length === 1 ? '' : 's'}
      </p>

      <div className="mt-1 flex flex-wrap gap-2">
        <Link to={`/trees/${tree.id}/edit`}>
          <Button size="sm">Edit</Button>
        </Link>
        <Link to={`/trees/${tree.id}/run`}>
          <Button size="sm" variant="primary">
            Run
          </Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={() => duplicateTree(tree.id)}>
          Duplicate
        </Button>
        <Button size="sm" variant="ghost" onClick={() => downloadTreeAsJson(tree)}>
          Export
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(true)}>
          Delete
        </Button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete decision tree?"
          message={`"${tree.name}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            deleteTree(tree.id);
            setConfirmingDelete(false);
          }}
        />
      )}
    </div>
  );
}
