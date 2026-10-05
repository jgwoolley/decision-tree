import { Button } from '../../common/Button';
import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import { TargetPicker } from './TargetPicker';
import type { FinalOption, SequentialAnswerChoice, SequentialTree } from '../../../types';

interface AnswerChoiceRowProps {
  treeId: string;
  tree: SequentialTree;
  questionId: string;
  choice: SequentialAnswerChoice;
  options: FinalOption[];
  canDelete: boolean;
}

export function AnswerChoiceRow({
  treeId,
  tree,
  questionId,
  choice,
  options,
  canDelete,
}: AnswerChoiceRowProps) {
  const updateChoiceText = useTreeLibraryStore((s) => s.updateChoiceText);
  const deleteChoice = useTreeLibraryStore((s) => s.deleteSequentialChoice);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md bg-slate-50 p-2 dark:bg-slate-800">
      <input
        value={choice.text}
        onChange={(e) => updateChoiceText(treeId, questionId, choice.id, e.target.value)}
        className="min-w-[8rem] flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
      <TargetPicker treeId={treeId} tree={tree} questionId={questionId} choice={choice} options={options} />
      <Button
        size="sm"
        variant="ghost"
        disabled={!canDelete}
        title={canDelete ? 'Remove answer' : 'At least 2 answers are required'}
        onClick={() => deleteChoice(treeId, questionId, choice.id)}
      >
        Remove
      </Button>
    </div>
  );
}
