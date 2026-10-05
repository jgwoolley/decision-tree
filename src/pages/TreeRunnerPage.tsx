import { Link, useParams } from 'react-router-dom';
import { SequentialRunner } from '../components/runner/sequential/SequentialRunner';
import { WeightedRunner } from '../components/runner/weighted/WeightedRunner';
import { useTreeLibraryStore } from '../store/treeLibraryStore';

export function TreeRunnerPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const tree = useTreeLibraryStore((s) => (treeId ? s.trees[treeId] : undefined));

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
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← All trees
        </Link>
        <Link
          to={`/trees/${tree.id}/edit`}
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Edit this tree
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{tree.name}</h1>
      {tree.mode === 'sequential' ? <SequentialRunner tree={tree} /> : <WeightedRunner tree={tree} />}
    </div>
  );
}
