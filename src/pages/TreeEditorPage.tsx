import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EditorHeader } from '../components/editor/EditorHeader';
import { OptionsManager } from '../components/editor/OptionsManager';
import { SequentialTreeView } from '../components/editor/sequential/SequentialTreeView';
import { WeightedQuestionList } from '../components/editor/weighted/WeightedQuestionList';
import { isSequentialRunnable } from '../lib/sequentialValidation';
import { isWeightedRunnable } from '../lib/weightedValidation';
import { useTreeLibraryStore } from '../store/treeLibraryStore';

export function TreeEditorPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const tree = useTreeLibraryStore((s) => (treeId ? s.trees[treeId] : undefined));

  const runnable = useMemo(() => {
    if (!tree) return { ok: false, issues: [] };
    const optionIds = new Set(tree.options.map((o) => o.id));
    return tree.mode === 'sequential'
      ? isSequentialRunnable(tree, optionIds)
      : isWeightedRunnable(tree, tree.options.length);
  }, [tree]);

  if (!tree) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Tree not found.</p>
        <Link
          to="/"
          className="mt-2 inline-block text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to all trees
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8">
      <EditorHeader tree={tree} runnable={runnable} />
      <OptionsManager treeId={tree.id} options={tree.options} />
      {tree.mode === 'sequential' ? (
        <SequentialTreeView treeId={tree.id} tree={tree} options={tree.options} />
      ) : (
        <WeightedQuestionList treeId={tree.id} tree={tree} options={tree.options} />
      )}
    </div>
  );
}
