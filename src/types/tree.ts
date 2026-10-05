export type TreeMode = 'sequential' | 'weighted';

/** One possible final outcome of the tree. */
export interface FinalOption {
  /** Unique id for this option. Referenced by answer choices via `leafOptionId` (sequential) or as a key in `scores` (weighted). */
  id: string;
  /** Display name of this outcome, e.g. "Apache Spark Job". */
  name: string;
  /** Optional longer description shown on the result screen. */
  description?: string;
}

// --- Sequential mode ---

/** One answer choice for a question in a sequential tree. */
export interface SequentialAnswerChoice {
  /** Unique id for this choice. */
  id: string;
  /** The answer text shown as a button. */
  text: string;
  /** Id of the question to continue to after picking this answer. Exactly one of `nextQuestionId` or `leafOptionId` should be set. */
  nextQuestionId?: string;
  /** Id of the final option this answer resolves to, ending the run. Exactly one of `nextQuestionId` or `leafOptionId` should be set. */
  leafOptionId?: string;
}

/** A single question in a sequential tree; its choices lead onward to another question or a final option. */
export interface SequentialQuestion {
  /** Unique id for this question, matching its key in the parent `questions` map. */
  id: string;
  /** The question text shown to the person answering. */
  text: string;
  /**
   * The answer choices for this question. At least 2 are required.
   * @minItems 2
   */
  choices: SequentialAnswerChoice[];
}

/** A literal branching tree: each answer leads to another question or terminates at one final option. */
export interface SequentialTree {
  mode: 'sequential';
  /** Id of the first question asked when running this tree (a key into `questions`). Null only when the tree has no questions yet. */
  rootQuestionId: string | null;
  /** Every question in this tree, keyed by its own id. */
  questions: Record<string, SequentialQuestion>;
}

// --- Weighted mode ---

/** One answer choice for a question in a weighted tree. */
export interface WeightedAnswerChoice {
  /** Unique id for this choice. */
  id: string;
  /** The answer text shown as a radio option. */
  text: string;
  /** Points this answer contributes to each final option, keyed by option id. A missing key counts as 0. */
  scores: Record<string, number>;
}

/** A single question in a weighted tree; its choices each carry point scores. */
export interface WeightedQuestion {
  /** Unique id for this question, matching its key in the parent `questions` map. */
  id: string;
  /** The question text shown to the person answering. */
  text: string;
  /**
   * The answer choices for this question. At least 2 are required.
   * @minItems 2
   */
  choices: WeightedAnswerChoice[];
}

/** Every (or a chosen subset of) questions is answered; each answer scores points toward one or more options, and the highest-scoring option(s) win. */
export interface WeightedTree {
  mode: 'weighted';
  /** The order questions are asked in, as a list of question ids (keys into `questions`). */
  questionOrder: string[];
  /** Every question in this tree, keyed by its own id. */
  questions: Record<string, WeightedQuestion>;
}

// --- Shared envelope ---

export interface TreeMeta {
  /** Unique identifier for this tree. Regenerated whenever a file is imported, so it never collides with a tree already in the library. */
  id: string;
  /** Display name shown on the dashboard card and in the editor/runner header. */
  name: string;
  /** Optional longer description shown under the name on the dashboard and editor. */
  description?: string;
  /**
   * The possible final outcomes this tree can resolve to (e.g. "Jupyter Notebook", "Spark Job"). At least 2 are required.
   * @minItems 2
   */
  options: FinalOption[];
  /**
   * ISO 8601 timestamp of when this tree was first created.
   * @format date-time
   */
  createdAt: string;
  /**
   * ISO 8601 timestamp of the most recent edit. The app updates this automatically on every change.
   * @format date-time
   */
  updatedAt: string;
  /** Data format version. Used to validate (and, in future, migrate) imported files. Currently always 1. */
  schemaVersion: 1;
}

/**
 * A decision tree created by the Decision Tree Builder app.
 *
 * `mode: "sequential"` is a literal branching tree — each answer leads to another question or
 * terminates at one final option. `mode: "weighted"` asks every question and sums per-answer
 * scores toward each final option, with the highest-scoring option(s) winning. Mode is locked
 * once a tree is created.
 */
export type DecisionTree = TreeMeta & (SequentialTree | WeightedTree);

export interface RunnableCheck {
  ok: boolean;
  issues: string[];
}
