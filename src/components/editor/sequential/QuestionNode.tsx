import { Button } from '../../common/Button';
import { useTreeLibraryStore } from '../../../store/treeLibraryStore';
import { AnswerChoiceRow } from './AnswerChoiceRow';
import type { FinalOption, SequentialTree } from '../../../types';

interface QuestionNodeProps {
  treeId: string;
  tree: SequentialTree;
  questionId: string;
  options: FinalOption[];
  isRoot: boolean;
}

export function QuestionNode({ treeId, tree, questionId, options, isRoot }: QuestionNodeProps) {
  const question = tree.questions[questionId];
  const updateQuestionText = useTreeLibraryStore((s) => s.updateQuestionText);
  const addChoice = useTreeLibraryStore((s) => s.addSequentialChoice);
  const deleteQuestion = useTreeLibraryStore((s) => s.deleteSequentialQuestion);

  if (!question) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <input
            value={question.text}
            onChange={(e) => updateQuestionText(treeId, questionId, e.target.value)}
            className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <Button
            size="sm"
            variant="ghost"
            title="Deletes this question and every question below it"
            onClick={() => deleteQuestion(treeId, questionId)}
          >
            {isRoot ? 'Delete tree root' : 'Delete'}
          </Button>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {question.choices.map((choice) => (
            <AnswerChoiceRow
              key={choice.id}
              treeId={treeId}
              tree={tree}
              questionId={questionId}
              choice={choice}
              options={options}
              canDelete={question.choices.length > 2}
            />
          ))}
        </div>

        <Button size="sm" variant="secondary" className="mt-2" onClick={() => addChoice(treeId, questionId)}>
          Add answer
        </Button>
      </div>

      {question.choices
        .filter((choice) => choice.nextQuestionId)
        .map((choice) => (
          <div key={choice.id} className="ml-6 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
            <p className="mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">If "{choice.text}" →</p>
            <QuestionNode
              treeId={treeId}
              tree={tree}
              questionId={choice.nextQuestionId!}
              options={options}
              isRoot={false}
            />
          </div>
        ))}
    </div>
  );
}
