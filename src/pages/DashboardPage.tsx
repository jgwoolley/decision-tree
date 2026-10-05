import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportExportControls } from '../components/dashboard/ImportExportControls';
import { NewTreeDialog } from '../components/dashboard/NewTreeDialog';
import { TreeCard } from '../components/dashboard/TreeCard';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { fetchDefaultTree } from '../lib/exportImport';
import { useTreeLibraryStore } from '../store/treeLibraryStore';
import type { TreeMode } from '../types';

export function DashboardPage() {
  const trees = useTreeLibraryStore((s) => s.trees);
  const createTree = useTreeLibraryStore((s) => s.createTree);
  const importTrees = useTreeLibraryStore((s) => s.importTrees);
  const [creating, setCreating] = useState(false);
  const [loadingExample, setLoadingExample] = useState(false);
  const navigate = useNavigate();
  const push = useToast();

  const treeList = Object.values(trees).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  function handleCreate(name: string, description: string, mode: TreeMode) {
    const id = createTree(name, description, mode);
    setCreating(false);
    navigate(`/trees/${id}/edit`);
  }

  async function handleLoadExample() {
    setLoadingExample(true);
    try {
      const imported = await fetchDefaultTree();
      importTrees(imported);
      push('Loaded the example tree.');
    } catch (error) {
      push(error instanceof Error ? error.message : 'Could not load the example tree.', 'error');
    } finally {
      setLoadingExample(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Decision Trees</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Build sequential or weighted decision trees for technical choices.
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExportControls />
          <Button variant="primary" onClick={() => setCreating(true)}>
            New tree
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {treeList.length === 0 ? (
          <EmptyState
            title="No decision trees yet"
            message="Create a sequential tree for step-by-step branching, or a weighted tree to score every answer against your final options."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="primary" onClick={() => setCreating(true)}>
                  Create your first tree
                </Button>
                <Button variant="secondary" disabled={loadingExample} onClick={handleLoadExample}>
                  {loadingExample ? 'Loading…' : 'Load example tree'}
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {treeList.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}
      </div>

      {creating && <NewTreeDialog onCreate={handleCreate} onCancel={() => setCreating(false)} />}
    </div>
  );
}
