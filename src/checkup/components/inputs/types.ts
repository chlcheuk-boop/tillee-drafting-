import type { AnswerRecord, QuestionDefinition } from '../../types';

export type InputProps<Q extends QuestionDefinition = QuestionDefinition> = {
  q: Q;
  record: AnswerRecord | undefined;
  onChange: (rec: AnswerRecord | undefined) => void;
  /** id of the heading that labels this input group. */
  labelledBy: string;
  /** ids of help / error text. */
  describedBy?: string;
  invalid: boolean;
  taxYear: number;
};
