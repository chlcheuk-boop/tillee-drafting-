import type { CheckupController } from '../useCheckup';
import { MultiChoiceInput, SingleChoiceInput } from './inputs/ChoiceInputs';
import { CurrencyInput, DateInput, NumberInput, RelatedFieldsInput, ShortTextInput } from './inputs/TextInputs';
import type { InputProps } from './inputs/types';
import { ConfirmImportedInput, DocumentUploadInput } from './inputs/UploadAndImport';

/**
 * Maps a question's `type` to its accessible input. No branching or copy
 * decisions live here; adding an option never requires editing this file.
 */
export function QuestionRenderer(props: InputProps & { c: CheckupController }) {
  const { q, c, ...rest } = props;
  switch (q.type) {
    case 'singleChoice':
      return <SingleChoiceInput q={q} {...rest} />;
    case 'multiChoice':
      return <MultiChoiceInput q={q} {...rest} />;
    case 'shortText':
      return <ShortTextInput q={q} {...rest} />;
    case 'relatedFields':
      return <RelatedFieldsInput q={q} {...rest} />;
    case 'currency':
      return <CurrencyInput q={q} {...rest} />;
    case 'number':
      return <NumberInput q={q} {...rest} />;
    case 'date':
      return <DateInput q={q} {...rest} />;
    case 'documentUpload':
      return <DocumentUploadInput q={q} {...rest} documents={c.documents} upload={c.uploadFile} remove={c.removeFile} />;
    case 'confirmImported':
      return <ConfirmImportedInput q={q} {...rest} imported={c.ctx.imported[q.importedFieldKey]} />;
  }
}
