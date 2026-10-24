# Audit and verification boundaries

## What this work could and could not see

| Source | Available? | Effect |
|---|---|---|
| Implementation brief (pasted in conversation) | ✅ | Governs this build |
| Tillee app repo, `AGENTS.md`, `DESIGN.md`, `Tillee_Brand_Guidelines.md`, `DESIGN_LOG_ARCHIVE.md`, `docs/brand_guidelines/components/` | ❌ Only an empty repo (`tillee-drafting-`) was accessible | All tokens, components and rules here are **proposed** stand-ins |
| `/style` living showcase | ❌ | Built an equivalent at `#/style` for review |
| Mascot, logo, fonts, icon package | ❌ | Code-native **placeholder** mascot and icon set |
| Live app at app.tillee.io, demo profile | ❌ The session's network can't reach external sites, and no credentials were used | **No live walkthrough was done** |
| Real onboarding schema, field names, branching, save, upload, estimate APIs | ❌ | Fixture config and fixture services behind interfaces |
| Tillee background PDFs, Lemonade screenshots, Lemonade PDF | ❌ Not attached to this session | Lemonade patterns applied from the brief's written observations (§5) only |

Labels used throughout:

- **Confirmed**: stated in the brief.
- **Verified in app/repository**: none. Nothing could be checked against the real app.
- **Proposed**: everything in this repo that isn't plain engineering.

## Audit to complete against the real app

Fill in one row per route or step once you have repo and demo access, following brief §4.

| Route / step | Observation (redacted screenshot) | Friction | Proposed behavior | Component | Data contract | Status |
|---|---|---|---|---|---|---|
| _e.g._ `/onboarding/checkup/…` | | | | `QuestionScreen` / … | field → `fieldKey` | Unverified |

Classify each real question as **prefillable**, **needs confirmation**, or **requires a user answer**. Then replace `config/onboarding.ts`, keeping the IDs that already exist.

## Open integration gaps

1. **Question set and field mapping.** Each `fieldKey` in the config is a placeholder, and there is no schema adapter yet.
2. **Persistence.** Need `loadDraft`, `saveDraft` and an idempotent `complete` mapped to the existing save and resume contract and its completion flag.
3. **Payroll import.** Need to know which fields Finch (or the real source) actually provides, their as-of date, and their tax year.
4. **Document processing.** Need the real statuses, allowed formats and size limits, and the extraction response. Don't show extraction confidence unless the service provides it.
5. **Estimate.** Need the real response shape. The `demo` variant must be removed, and the result copy must match the real calculation contract.
6. **Privacy copy.** The welcome screen shows a visible placeholder. The claim that HR can't see employee answers is unverified and is not stated anywhere.
7. **Next-step routing.** "Go to my dashboard" is a disabled placeholder.
8. **Logout clearing.** In-memory state must be cleared using the app's existing logout pattern.
9. **Analytics.** None added. Any future events must exclude answer values and documents.
