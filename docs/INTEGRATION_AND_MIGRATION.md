# Integration and migration

## Wiring into the Tillee app

1. **Port the code.** Copy `src/checkup/` and `src/brand/`. Map `styles.css` custom properties to the real `DESIGN.md` tokens, or replace them with the app's Tailwind/shadcn primitives. The class names map one-to-one to components.
2. **Map the schema.** Add `adapters/schemaAdapter.ts` to translate `Submission.fields[fieldKey]` to the existing API field names and units (cents vs dollars, enum values), and to translate imported payloads into `ImportedFields`.
3. **Implement the real adapters** for the four interfaces in `adapters/contracts.ts`:
   - `CheckupPersistence`: the existing authenticated draft save and resume, plus completion. `complete` must accept an idempotency key or be deduplicated server-side. Treat server validation as authoritative, and return field errors to `errorFor`.
   - `PayrollImportService`: the existing payroll source. Return only fields that really exist, with their as-of date and tax year.
   - `DocumentService`: the existing upload pipeline. Map its statuses to `DocumentStatus`. Never report `processed` before validation.
   - `EstimateService`: the existing estimator. Delete the `demo` variant and add the real result shape and its caveats.
4. **Replace the fixture config** with the audited real questions, reusing the existing IDs. Delete `fixtures.ts` and `PrototypePanel` from production paths.
5. **Fill in placeholders**: approved privacy copy, dashboard routing, clearing state on logout.

## Moving the longer Tax Checkup onto this system

Share foundations now. Don't change its business rules yet.

| Shared now | Stays per-flow |
|---|---|
| `types.ts`, `engine/flow.ts`, `engine/saveTracker.ts`, input renderers, `CheckupShell`, review and processing components | Each flow's `CheckupConfig`, rule registry entries and schema adapter |

Steps:

1. Inventory every long-form field: its downstream consumer, whether it's required for the estimate, and whether it's prefillable. Don't remove any field whose purpose isn't understood.
2. Express the long form as its own `CheckupConfig` with sections. Fields covered by onboarding should resolve as "confirm" (pre-filled from saved onboarding answers), not re-asked.
3. Add new input types only where needed (for example repeatable groups for dependents or W-2s, which would be a new `QuestionType` and renderer).
4. Run both flows in parallel behind a flag, and compare submissions field by field before switching.
5. Shortening the long form is a founder prioritization decision, informed by step 1.

## Known design decisions to revisit

- **Stale branch policy.** Hidden answers are kept in the draft (so flipping a choice back restores them) but are never submitted. If the product wants them cleared from the server draft as well, change `useCheckup.commitAndAdvance` to save `effective` instead of `answers`.
- **Auto-advance.** `advanceMode: 'onSelection'` exists in the contract but isn't implemented. Everything uses an explicit Continue. Add it only with user-testing support, and never for multi-select or consent questions.
- **Uploads.** Continue is blocked while a file is still processing, and there's an explicit "type it in" escape. If processing is slow in production, consider letting users continue and showing the completion state "documents still processing".
