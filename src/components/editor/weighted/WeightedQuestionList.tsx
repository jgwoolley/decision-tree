import { Button } from '../../common/Button';
import { EmptyState } from '../../common/EmptyState';
import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import { QuestionEditorCard } from './QuestionEditorCard';
import type { FinalOption, WeightedTree } from '../../../types';

interface WeightedQuestionListProps {
  treeId: string;
  tree: WeightedTree;
  options: FinalOption[];
}

export function WeightedQuestionList({ treeId, tree, options }: WeightedQuestionListProps) {
  const addQuestion = useTreeLibraryStore((s) => s.addWeightedQuestion);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Questions</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Every question is asked. Each answer scores points toward one or more options.
        </p>
      </div>

      {tree.questionOrder.length === 0 ? (
        <EmptyState
          title="No questions yet"
          action={
            <Button variant="primary" size="sm" onClick={() => addQuestion(treeId)}>
              Add question
            </Button>
          }
        />
      ) : (
        <>
          {tree.questionOrder.map((questionId, index) => {
            const question = tree.questions[questionId];
            if (!question) return null;
            return (
              <QuestionEditorCard
                key={questionId}
                treeId={treeId}
                question={question}
                options={options}
                index={index}
                total={tree.questionOrder.length}
              />
            );
          })}
          <Button variant="secondary" size="sm" onClick={() => addQuestion(treeId)}>
            Add question
          </Button>
        </>
      )}
    </section>
  );
}
