# Changing questions and copy

Three layers, three kinds of change:

| You want to… | Edit | Don't touch |
|---|---|---|
| Change wording, help or an error | `content/en.ts` | config, components |
| Add, remove or reorder an option or question, or change branching | `config/onboarding.ts` (+ a rule in `rules/registry.ts` if needed) and the schema mapping | components |
| Add a new kind of input | a renderer in `components/inputs/` + a case in `QuestionRenderer` + types | — |

> The brief asks for these examples on a real existing question. The real question list wasn't available, so the examples use the fixture question `otherIncomeTypes`. Redo them against a real question once it's mapped.

## Example 1: wording change (copy only)

Before:

```ts
'q.otherIncomeTypes.title': 'Any income beyond your main job?',
'q.otherIncomeTypes.opt.freelance': 'Freelance or contract work',
```

After:

```ts
'q.otherIncomeTypes.title': 'Do you make money anywhere else?',
'q.otherIncomeTypes.opt.freelance': 'Side gigs, freelance or 1099 work',
```

The question `id`, its `fieldKey` and the saved option value `freelance` don't change, so existing drafts and submissions stay valid. Don't bump `structureVersion`.

## Example 2: add an option without touching the renderer

1. Config (`config/onboarding.ts`), in `otherIncomeTypes.options`, before `none`:

   ```ts
   { value: 'gambling', labelKey: 'q.otherIncomeTypes.opt.gambling', iconKey: 'chart' },
   ```

2. Copy (`content/en.ts`):

   ```ts
   'q.otherIncomeTypes.opt.gambling': 'Gambling or prize winnings',
   ```

3. Optional follow-up: add a `currency` question with `visibilityRuleKey: 'hasGambling'`, and register `hasGambling: (a) => includes(a, 'otherIncomeTypes', 'gambling')`.
4. Map the new value and field in the schema adapter, and confirm the backend accepts them.
5. Bump `structureVersion`, and run `npm test` (the integrity test catches missing copy keys or rules).

`MultiChoiceInput` renders the new option and "None" stays exclusive with no component change.

## Rules of thumb

- Option `value`s are permanent. To retire one, remove it from config. Resume reconciliation drops saved answers that no longer fit.
- Visibility predicates may only read answers to questions *earlier* in the config. The path is resolved in order.
- `allowUnknown` and `allowSkip` are product decisions. Don't use them to get past inputs the calculation requires.
- Keep consent, privacy, money and caveat copy literal; the voice guide applies to everything else.
