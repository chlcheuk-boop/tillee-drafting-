/**
 * Core contracts for the reusable checkup question system.
 *
 * PROPOSED: these shapes have not been reconciled with the real Tillee
 * application schema (no app repository was available). `fieldKey` values
 * in the fixture config are placeholders for the real domain field names.
 */

export type CopyKey = string;

export type QuestionType =
  | 'singleChoice'
  | 'multiChoice'
  | 'shortText'
  | 'number'
  | 'currency'
  | 'date'
  | 'relatedFields'
  | 'documentUpload'
  | 'confirmImported';

export type ChoiceOption = {
  /** Stable persisted value. Never derive from the label. */
  value: string;
  labelKey: CopyKey;
  helpKey?: CopyKey;
  iconKey?: string;
  /** Selecting this clears all other options (and vice versa). multiChoice only. */
  exclusive?: boolean;
};

type BaseQuestion = {
  /** Stable identifier, independent of wording. */
  id: string;
  /** Mapped to an existing domain/schema field by the schema adapter. */
  fieldKey: string;
  sectionId: string;
  titleKey: CopyKey;
  helpKey?: CopyKey;
  /** "Why we ask" explanation, shown on demand. */
  whyKey?: CopyKey;
  validationKey?: string;
  visibilityRuleKey?: string;
  /** Defaults to required when omitted. */
  requiredRuleKey?: string;
  allowUnknown?: boolean;
  allowSkip?: boolean;
  advanceMode?: 'explicit' | 'onSelection';
};

export type SingleChoiceQuestion = BaseQuestion & {
  type: 'singleChoice';
  options: ChoiceOption[];
  layout?: 'buttons' | 'cards';
};
export type MultiChoiceQuestion = BaseQuestion & {
  type: 'multiChoice';
  options: ChoiceOption[];
};
export type ShortTextQuestion = BaseQuestion & {
  type: 'shortText';
  labelKey: CopyKey;
  autoComplete?: string;
  maxLength?: number;
};
export type NumberQuestion = BaseQuestion & {
  type: 'number';
  unitKey: CopyKey;
  min?: number;
  max?: number;
};
export type CurrencyQuestion = BaseQuestion & {
  type: 'currency';
  /** The period the amount covers is part of the question, not left implicit. */
  periodKey: CopyKey;
  exampleKey?: CopyKey;
};
export type DateQuestion = BaseQuestion & { type: 'date' };
export type RelatedField = {
  key: string;
  labelKey: CopyKey;
  autoComplete?: string;
  optional?: boolean;
};
export type RelatedFieldsQuestion = BaseQuestion & {
  type: 'relatedFields';
  fields: RelatedField[];
};
export type DocumentUploadQuestion = BaseQuestion & {
  type: 'documentUpload';
  accept: string[];
  maxBytes: number;
};
export type ConfirmImportedQuestion = BaseQuestion & {
  type: 'confirmImported';
  /** Key into the imported-data record from the import adapter. */
  importedFieldKey: string;
  format: 'currency' | 'text';
  periodKey?: CopyKey;
};

export type QuestionDefinition =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | ShortTextQuestion
  | NumberQuestion
  | CurrencyQuestion
  | DateQuestion
  | RelatedFieldsQuestion
  | DocumentUploadQuestion
  | ConfirmImportedQuestion;

export type SectionDefinition = {
  id: string;
  titleKey: CopyKey;
  /** Optional short transition shown before the section's first question. */
  introKey?: CopyKey;
};

export type CheckupConfig = {
  id: string;
  /** Bump when question structure changes (not for wording-only edits). */
  structureVersion: number;
  taxYear: number;
  sections: SectionDefinition[];
  questions: QuestionDefinition[];
};

/** Value shapes by input type. Currency amounts are integer cents. */
export type AnswerValueByType = {
  singleChoice: string;
  multiChoice: string[];
  shortText: string;
  number: number;
  currency: number;
  date: string; // ISO yyyy-mm-dd
  relatedFields: Record<string, string>;
  documentUpload: { documentIds: string[] };
  confirmImported: { value: number | string };
};

export type AnswerStatus = 'answered' | 'unknown' | 'skipped' | 'notApplicable';
export type AnswerSource = 'user' | 'payroll' | 'document';

/**
 * A recorded answer. "Blank" means no record exists at all; a zero amount is
 * `{ status: 'answered', value: 0 }`; "I don't know" is `status: 'unknown'`.
 */
export type AnswerRecord = {
  questionId: string;
  value: unknown;
  status: AnswerStatus;
  source: AnswerSource;
  sourceDate?: string;
  confirmedAt?: string;
};

export type Answers = Record<string, AnswerRecord>;
