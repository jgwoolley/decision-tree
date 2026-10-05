import { Button } from '../../common/Button';
import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import { ScoringGrid } from './ScoringGrid';
import type { FinalOption, WeightedQuestion } from '../../../types';

interface QuestionEditorCardProps {
  treeId: string;
  question: WeightedQuestion;
  options: FinalOption[];
  index: number;
  total: number;
}

export function QuestionEditorCard({ treeId, question, options, index, total }: QuestionEditorCardProps) {
  const updateQuestionText = useTreeLibraryStore((s) => s.updateQuestionText);
  const addChoice = useTreeLibraryStore((s) => s.addWeightedChoice);
  const deleteQuestion = useTreeLibraryStore((s) => s.deleteWeightedQuestion);
  const reorder = useTreeLibraryStore((s) => s.reorderWeightedQuestion);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button
            disabled={index === 0}
            onClick={() => reorder(treeId, question.id, 'up')}
            className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-slate-500 dark:hover:text-slate-300"
            title="Move up"
          >
            ▲
          </button>
          <button
            disabled={index === total - 1}
            onClick={() => reorder(treeId, question.id, 'down')}
            className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-slate-500 dark:hover:text-slate-300"
            title="Move down"
          >
            ▼
          </button>
        </div>
        <input
          value={question.text}
          onChange={(e) => updateQuestionText(treeId, question.id, e.target.value)}
          className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <Button size="sm" variant="ghost" onClick={() => deleteQuestion(treeId, question.id)}>
          Delete
        </Button>
      </div>

      <div className="mt-2">
        <ScoringGrid treeId={treeId} questionId={question.id} choices={question.choices} options={options} />
      </div>

      <Button size="sm" variant="secondary" className="mt-2" onClick={() => addChoice(treeId, question.id)}>
        Add answer
      </Button>
    </div>
  );
}
