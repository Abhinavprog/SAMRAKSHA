import raw from '@/data/symptom-doctor-dataset.json';
import { SYMPTOM_SPECIALTY_RULES } from '@/lib/symptomSpecialtyRules';

export type LabeledExample = { symptoms: string; specialty: string };

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'with', 'for', 'to', 'of', 'in', 'is', 'my', 'have', 'been',
  'feeling', 'am', 'i', 'it', 'on', 'at', 'by', 'as', 'be', 'this', 'that', 'from', 'are', 'was',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Multinomial Naive Bayes with Laplace smoothing — trained from the symptom↔specialty dataset. */
export class SymptomSpecialtyClassifier {
  private vocab = new Set<string>();
  private classWordCounts = new Map<string, Map<string, number>>();
  private classTotalWords = new Map<string, number>();
  private classDocCounts = new Map<string, number>();
  private totalDocs = 0;
  private readonly alpha = 1;

  constructor(examples: LabeledExample[]) {
    for (const ex of examples) {
      const c = ex.specialty;
      const tokens = tokenize(ex.symptoms);
      this.totalDocs += 1;
      this.classDocCounts.set(c, (this.classDocCounts.get(c) ?? 0) + 1);
      if (!this.classWordCounts.has(c)) this.classWordCounts.set(c, new Map());
      const wc = this.classWordCounts.get(c)!;
      let tw = 0;
      for (const w of tokens) {
        this.vocab.add(w);
        wc.set(w, (wc.get(w) ?? 0) + 1);
        tw += 1;
      }
      this.classTotalWords.set(c, (this.classTotalWords.get(c) ?? 0) + tw);
    }
  }

  /** Log P(word | class) with Laplace smoothing. */
  private logPwGivenC(word: string, c: string): number {
    const wc = this.classWordCounts.get(c);
    const count = wc?.get(word) ?? 0;
    const total = this.classTotalWords.get(c) ?? 0;
    const v = this.vocab.size;
    return Math.log((count + this.alpha) / (total + this.alpha * v));
  }

  /** Log prior P(class). */
  private logPrior(c: string): number {
    const n = this.classDocCounts.get(c) ?? 0;
    return Math.log(n / this.totalDocs);
  }

  /**
   * Returns top-k predicted specialties with approximate confidence (0–100) from softmax over log posteriors.
   */
  predictTop(symptomsText: string, k: number): { specialty: string; confidence: number }[] {
    const tokens = tokenize(symptomsText);
    if (tokens.length === 0) return [];

    const classes = [...this.classDocCounts.keys()];
    const logScores: { c: string; logP: number }[] = [];

    // Keyword rule boosting: each matched pattern nudges the corresponding specialty upward.
    const ruleScores = new Map<string, number>();
    for (const rule of SYMPTOM_SPECIALTY_RULES) {
      let hits = 0;
      for (const re of rule.patterns) {
        if (re.test(symptomsText)) hits += 1;
      }
      if (hits > 0) ruleScores.set(rule.specialty, (ruleScores.get(rule.specialty) ?? 0) + hits);
    }
    const RULE_BOOST = 1.75; // tuned for small datasets; higher = rules dominate

    for (const c of classes) {
      let lp = this.logPrior(c);
      for (const w of tokens) {
        lp += this.logPwGivenC(w, c);
      }
      const hits = ruleScores.get(c) ?? 0;
      if (hits > 0) lp += hits * RULE_BOOST;
      logScores.push({ c, logP: lp });
    }

    logScores.sort((a, b) => b.logP - a.logP);
    const top = logScores.slice(0, Math.min(k, logScores.length));
    const maxLog = top[0]?.logP ?? 0;
    const exps = top.map((t) => Math.exp(t.logP - maxLog));
    const sum = exps.reduce((a, b) => a + b, 0) || 1;

    // One decimal place, but guaranteed sum = 100.0% (largest remainder on tenths).
    const tenths = exps.map((e) => (e / sum) * 1000);
    const floors = tenths.map((t) => Math.floor(t + 1e-9));
    let deficit = 1000 - floors.reduce((a, b) => a + b, 0);
    const fracParts = tenths.map((t, i) => ({
      i,
      frac: t - Math.floor(t + 1e-9),
    }));
    if (deficit > 0) {
      const order = [...fracParts].sort((a, b) => b.frac - a.frac);
      for (let j = 0; j < deficit && j < order.length; j++) {
        floors[order[j].i] += 1;
      }
    } else if (deficit < 0) {
      const order = [...fracParts].sort((a, b) => a.frac - b.frac);
      for (let j = 0; j < -deficit && j < order.length; j++) {
        floors[order[j].i] -= 1;
      }
    }

    return top.map((t, i) => ({
      specialty: t.c,
      confidence: floors[i]! / 10,
    }));
  }
}

let cached: SymptomSpecialtyClassifier | null = null;

export function getSymptomClassifier(): SymptomSpecialtyClassifier {
  if (!cached) {
    const examples = (raw as { examples: LabeledExample[] }).examples;
    cached = new SymptomSpecialtyClassifier(examples);
  }
  return cached;
}
