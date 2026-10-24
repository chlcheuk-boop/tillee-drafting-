/**
 * Content dictionary for the onboarding checkup.
 *
 * Edit wording here without touching components or config. Keys are stable;
 * saved option values live in config and never change when a label changes.
 * All copy is PROPOSED draft voice pending founder review; privacy, consent
 * and result caveat wording must be replaced with approved Tillee language.
 */
export const en: Record<string, string> = {
  // Common
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.edit': 'Edit',
  'common.retry': 'Try again',
  'common.notSure': "I'm not sure",
  'common.skip': 'Skip this one',
  'common.whyWeAsk': 'Why we ask',
  'common.notAnswered': 'Not answered',
  'common.unknown': 'Not sure yet',
  'common.skipped': 'Skipped',

  // Shell
  'shell.brand': 'Tillee',
  'shell.checkupName': 'Tax checkup',
  'shell.progressLabel': 'Checkup progress',
  'shell.sectionOf': 'Section {current} of {total}: {title}',
  'save.saving': 'Saving…',
  'save.saved': 'Progress saved',
  'save.error': "Couldn't save. Your answers are still here.",

  // Welcome
  'welcome.title': "Let's make your taxes a little less mysterious.",
  'welcome.body':
    "A few questions about your pay and household help Tillee see whether you're trending toward a refund or a bill for {taxYear}, and what you can do about it.",
  'welcome.list.1': 'Bring in pay info from payroll, a pay stub, or type it in',
  'welcome.list.2': 'Answer only what applies to you',
  'welcome.list.3': 'Review everything before you save',
  'welcome.cta': "Let's start",
  'welcome.resume': 'Pick up where you left off',
  'welcome.privacyNote':
    'PLACEHOLDER: approved Tillee privacy language about who can see your answers goes here.',

  // Sections
  'section.payInfo': 'Your pay',
  'section.aboutYou': 'About you',
  'section.aboutYou.intro': "That's your pay sorted. Next, a couple of quick things about you.",
  'section.household': 'Household',
  'section.household.intro': "That's the basics. A few details about your household next.",
  'section.otherIncome': 'Other income',
  'section.intro.cta': "Let's go",

  // Periods, units, sources
  'period.yearToDate': 'Year to date',
  'period.fullYear': 'Expected for the full year',
  'unit.people': 'people',
  'source.payroll': "From your employer's payroll",
  'source.document': 'From your uploaded document',
  'source.asOf': 'as of {date}',

  // Pay info source
  'q.payInfoSource.title': 'How should we get your pay details?',
  'q.payInfoSource.help': "Pick whichever is easiest. You can review everything before it's saved.",
  'q.payInfoSource.opt.payroll': 'Use my payroll info',
  'q.payInfoSource.opt.payroll.help': 'Pulled from your employer. You confirm each number.',
  'q.payInfoSource.opt.upload': 'Upload a pay stub',
  'q.payInfoSource.opt.upload.help': 'PDF, JPG or PNG of your most recent pay stub.',
  'q.payInfoSource.opt.manual': "I'll type it in",
  'q.payInfoSource.opt.manual.help': 'Two numbers from your latest pay stub.',
  'q.payInfoSource.payrollUnavailable':
    "Payroll info isn't available right now. Upload a pay stub or type it in instead.",
  'q.payInfoSource.payrollChecking': 'Checking for payroll info…',

  // Pay stub upload
  'q.payStub.title': 'Upload your most recent pay stub',
  'q.payStub.help': "We'll look for your year-to-date pay and federal tax withheld. You'll confirm both.",
  'upload.choose': 'Choose a file',
  'upload.drop': 'or drag it here',
  'upload.limits': '{types} up to {size}',
  'upload.status.uploading': 'Uploading…',
  'upload.status.processing': 'Reading your document…',
  'upload.status.processed': 'Pay details found',
  'upload.status.noTaxData': "We couldn't find pay details in this file. Try another file, or type the numbers in.",
  'upload.status.failed': "That file didn't go through. Try again, or choose another file.",
  'upload.status.rejected.type': "That file type isn't supported. Use {types}.",
  'upload.status.rejected.size': 'That file is larger than {size}.',
  'upload.remove': 'Remove {name}',
  'upload.retry': 'Try again',
  'upload.waiting': 'Hang on while we finish reading your file.',
  'upload.skipToManual': "Skip, I'll type it in",

  // Confirm imported
  'q.confirmYtdWages.title': 'Does your year-to-date pay look right?',
  'q.confirmYtdWages.help': 'This is your total pay before taxes and deductions so far this year.',
  'q.confirmYtdWithholding.title': 'And federal income tax withheld so far?',
  'q.confirmYtdWithholding.help': 'The federal income tax taken out of your paychecks this year.',
  'q.confirmYtdWithholding.why':
    "Comparing what's been withheld with what you may owe is how Tillee spots a surprise bill or a big refund early.",
  'confirm.looksRight': 'Looks right',
  'confirm.edit': 'Change this number',
  'confirm.editLabel': 'Correct amount',
  'confirm.conflict':
    'Newer info arrived: {newValue} {asOf}. You previously confirmed {oldValue}. Which should we use?',
  'confirm.useNew': 'Use the newer amount',
  'confirm.keepMine': 'Keep {oldValue}',

  // Manual pay
  'q.ytdWagesManual.title': 'How much have you earned so far this year?',
  'q.ytdWagesManual.help': 'Look for "YTD gross" on your latest pay stub.',
  'q.ytdWagesManual.example': 'Example: if your stub shows YTD gross of $41,234.00, enter 41234.',
  'q.ytdWithholdingManual.title': 'How much federal income tax has been withheld so far?',
  'q.ytdWithholdingManual.help': 'Look for "Federal income tax" or "FIT" in the YTD column.',
  'fallback.payrollMissing': "Payroll didn't include this one, so we'll need it from you.",
  'fallback.documentMissing': "We couldn't read this from your document, so we'll need it from you.",

  // About you
  'q.preferredName.title': 'What should we call you?',
  'q.preferredName.help': 'Optional. Just for how we greet you.',
  'q.preferredName.label': 'Preferred name',
  'q.legalName.title': "What's your legal name?",
  'q.legalName.help': 'As it appears on your tax documents.',
  'q.legalName.first': 'First name',
  'q.legalName.last': 'Last name',
  'q.startedThisYear.title': 'Did you start your current job in {taxYear}?',
  'q.jobStartDate.title': 'When did you start?',
  'q.jobStartDate.help': 'Your first day is fine. An approximate date works too.',
  'q.jobStartDate.why':
    'Withholding assumes you work the whole year. Starting partway through can change how much was taken out.',
  'q.expectedFilingStatus.title': 'How do you expect to file for {taxYear}?',
  'q.expectedFilingStatus.help': "Filing status isn't always the same as relationship status.",
  'q.expectedFilingStatus.why':
    'Filing status sets your standard deduction and tax brackets, which shape the whole estimate.',
  'q.expectedFilingStatus.opt.single': 'Single',
  'q.expectedFilingStatus.opt.marriedJoint': 'Married, filing jointly',
  'q.expectedFilingStatus.opt.marriedSeparate': 'Married, filing separately',
  'q.expectedFilingStatus.opt.headOfHousehold': 'Head of household',
  'q.expectedFilingStatus.opt.headOfHousehold.help': 'Usually unmarried and paying most costs for a qualifying person.',

  // Household
  'q.spouseWorks.title': 'Does your spouse earn income?',
  'q.spouseWorks.help': 'On a joint return, both incomes count toward one tax bill.',
  'q.spouseIncome.title': "Roughly how much will your spouse earn in {taxYear}?",
  'q.spouseIncome.help': 'A ballpark is fine. Use their pay before taxes.',
  'q.hasDependents.title': 'Does anyone depend on you financially?',
  'q.hasDependents.help': 'For example, children or relatives you support. We\'ll sort out who qualifies later.',
  'q.dependentsUnder17.title': 'How many of them are under 17?',
  'q.dependentsUnder17.help': 'Count people who may be your dependents. Enter 0 if none are under 17.',

  // Other income
  'q.otherIncomeTypes.title': 'Any income beyond your main job?',
  'q.otherIncomeTypes.help': 'Choose every type that applies.',
  'q.otherIncomeTypes.why':
    "This helps us understand income your employer may not know about, since no one's withholding tax on it.",
  'q.otherIncomeTypes.opt.freelance': 'Freelance or contract work',
  'q.otherIncomeTypes.opt.secondJob': 'Another job with a paycheck',
  'q.otherIncomeTypes.opt.investments': 'Investments (interest, dividends, sales)',
  'q.otherIncomeTypes.opt.rental': 'Rental property',
  'q.otherIncomeTypes.opt.none': 'None of these',
  'q.freelanceIncome.title': 'How much do you expect to earn from freelance work in {taxYear}?',
  'q.freelanceIncome.help': 'After business expenses, if you know them.',
  'q.freelanceIncome.example': 'Example: $12,000 in invoices minus $2,000 in expenses → enter 10000.',
  'q.secondJobIncome.title': 'How much do you expect to earn at your other job in {taxYear}?',
  'q.investmentIncome.title': 'Roughly how much investment income do you expect in {taxYear}?',
  'q.investmentIncome.help': 'Include interest, dividends and gains from selling investments.',
  'q.rentalIncome.title': 'What do you expect your rental income to be after expenses?',
  'q.rentalIncome.help': 'Enter a negative number if expenses are higher than rent.',

  // Inputs
  'input.amountLabel': 'Amount in US dollars',
  'input.countLabel': 'Number of {unit}',
  'input.dateLabel': 'Date',
  'input.dateHint': 'Month, day and year',
  'input.month': 'Month',
  'input.day': 'Day',
  'input.year': 'Year',

  // Errors
  'error.required': 'Please answer this to continue.',
  'error.fieldsRequired': 'Please fill in each field.',
  'error.uploadRequired': 'Add a file, or choose to type your numbers in.',
  'error.amountNonNegative': 'Enter an amount of $0 or more, like 1250 or 1250.50.',
  'error.amountInvalid': 'Enter an amount like 1250 or 1250.50.',
  'error.wholeNumber': 'Enter a whole number.',
  'error.outOfRange': 'Enter a number between {min} and {max}.',
  'error.dateInvalid': "That date doesn't exist. Check the month, day and year.",
  'error.dateNotInTaxYear': 'Enter a date in {taxYear}.',
  'error.confirmChoice': 'Confirm this number or change it.',

  // Review
  'review.title': 'Quick check before we save',
  'review.body': 'Tap Edit to change anything. Only answers that apply to you are saved.',
  'review.unresolved': 'Needs attention',
  'review.cta': 'Save my checkup',
  'review.incomplete': 'A few answers still need attention before you can save.',

  // Processing (real statuses only)
  'processing.title': 'Working on it',
  'processing.failedTitle': "That didn't go through",
  'processing.step.save': 'Saving your answers',
  'processing.step.documents': 'Checking your documents',
  'processing.step.estimate': 'Requesting your estimate',
  'processing.failed.save': "We couldn't save your checkup. Nothing was lost. Try again.",
  'processing.failed.estimate': 'Your answers are saved, but we couldn\'t get an estimate right now.',

  // Result
  'result.saved.title': 'Your checkup is saved. Here\'s what comes next.',
  'result.unavailable.body':
    "We've saved your answers. Your estimate isn't available in this preview yet, so there's no number to show. That's on us, not you.",
  'result.processing.body': "Your answers are saved. We're still working on your estimate and will let you know when it's ready.",
  'result.missing.body': 'Your answers are saved. To estimate where you stand, we still need:',
  'result.error.body': "Your answers are saved, but the estimate didn't come through. You can try again.",
  'result.demo.label': 'Demo data: not a real estimate',
  'result.demo.mayOwe': 'You may owe {low}–{high} when you file',
  'result.demo.mayGetRefund': 'You may get {low}–{high} back when you file',
  'result.demo.onTrack': 'Your withholding looks close to on track',
  'result.demo.caveat':
    "An estimate based on what you've told us {asOf}, not a guarantee. A refund is money you overpaid during the year; a bill means too little was withheld.",
  'result.next': 'Go to my dashboard',
  'result.editAnswers': 'Review my answers',
  'missing.ytdWithholding': 'Federal income tax withheld so far this year',
};

export type Copy = typeof en;

/** Resolve a copy key with `{param}` interpolation; unknown keys are shown loudly in dev. */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const raw = en[key];
  if (raw === undefined) return `⟦${key}⟧`;
  return raw.replace(/\{(\w+)\}/g, (_, p: string) => (p in params ? String(params[p]) : `{${p}}`));
}
