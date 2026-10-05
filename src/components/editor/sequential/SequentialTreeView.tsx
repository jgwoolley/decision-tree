import { Button } from '../../common/Button';
import { findOrphanedQuestions } from '../../../lib/sequentialValidation';
import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import { QuestionNode } from './QuestionNode';
import type { FinalOption, SequentialTree } from '../../../types';

interface SequentialTreeViewProps {
  treeId: string;
  tree: SequentialTree;
  options: FinalOption[];
}

export function SequentialTreeView({ treeId, tree, options }: SequentialTreeViewProps) {
  const addRoot = useTreeLibraryStore((s) => s.addSequentialRoot);
  const orphans = findOrphanedQuestions(tree);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Question flow</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Each answer either continues to another question or ends at a final option.
        </p>
      </div>

      {tree.rootQuestionId ? (
        <QuestionNode treeId={treeId} tree={tree} questionId={tree.rootQuestionId} options={options} isRoot />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">This tree has no questions yet.</p>
          <Button variant="primary" size="sm" className="mt-2" onClick={() => addRoot(treeId)}>
            Add first question
          </Button>
        </div>
      )}

      {orphans.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Unused questions ({orphans.length})
          </h3>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
            Not reachable from any answer yet. Wire an answer to one of these, or delete it.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {orphans.map((questionId) => (
              <div key={questionId} className="flex items-start gap-2">
                <div className="flex-1">
                  <QuestionNode
                    treeId={treeId}
                    tree={tree}
                    questionId={questionId}
                    options={options}
                    isRoot={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
