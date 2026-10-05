import { getAvailableTargetQuestions } from '../../../lib/sequentialValidation';
import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import type { FinalOption, SequentialAnswerChoice, SequentialTree } from '../../../types';

const NEW_QUESTION = '__new__';
const UNSET = '__unset__';

interface TargetPickerProps {
  treeId: string;
  tree: SequentialTree;
  questionId: string;
  choice: SequentialAnswerChoice;
  options: FinalOption[];
}

export function TargetPicker({ treeId, tree, questionId, choice, options }: TargetPickerProps) {
  const wireToNewQuestion = useTreeLibraryStore((s) => s.wireChoiceToNewQuestion);
  const wireToExistingQuestion = useTreeLibraryStore((s) => s.wireChoiceToExistingQuestion);
  const wireToOption = useTreeLibraryStore((s) => s.wireChoiceToOption);

  const availableQuestions = getAvailableTargetQuestions(tree, questionId, choice.id);
  const currentValue = choice.leafOptionId
    ? `option:${choice.leafOptionId}`
    : choice.nextQuestionId
      ? `question:${choice.nextQuestionId}`
      : UNSET;

  function handleChange(value: string) {
    if (value === NEW_QUESTION) {
      wireToNewQuestion(treeId, questionId, choice.id);
    } else if (value.startsWith('option:')) {
      wireToOption(treeId, questionId, choice.id, value.slice('option:'.length));
    } else if (value.startsWith('question:')) {
      wireToExistingQuestion(treeId, questionId, choice.id, value.slice('question:'.length));
    }
  }

  return (
    <select
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-md border px-2 py-1.5 text-sm text-slate-900 focus:outline-none dark:text-slate-100 ${
        currentValue === UNSET
          ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950'
          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
      }`}
    >
      <option value={UNSET} disabled>
        Choose where this leads…
      </option>
      <optgroup label="End at option">
        {options.map((option) => (
          <option key={option.id} value={`option:${option.id}`}>
            {option.name}
          </option>
        ))}
      </optgroup>
      {availableQuestions.length > 0 && (
        <optgroup label="Continue to existing question">
          {availableQuestions.map((q) => (
            <option key={q.id} value={`question:${q.id}`}>
              {q.text || 'Untitled question'}
            </option>
          ))}
        </optgroup>
      )}
      <option value={NEW_QUESTION}>+ Create new question</option>
    </select>
  );
}
