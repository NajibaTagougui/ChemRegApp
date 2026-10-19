/**
 * SMILES and Chemical Metadata Extractor
 * Parses unstructured technical text (patents, papers, SDS, reports)
 * to automatically detect and extract valid SMILES strings, CAS registry numbers,
 * chemical formulas, and chemical identifiers.
 */

export interface ExtractedChemicalItem {
  id: string;
  type: 'smiles' | 'cas' | 'formula';
  value: string;
  confidence: number;
  contextSnippet: string;
  probableName?: string;
}

// Regex for CAS Registry Number: [2-7 digits]-[2 digits]-[1 digit]
const CAS_REGEX = /\b([1-9]\d{1,6}-\d{2}-\d)\b/g;

// Regex for Chemical Formulas (e.g., C9H8O4, C8H10N4O2, CH3COOH, C2H5OH)
const FORMULA_REGEX = /\b(C[0-9]*H[0-9]*(?:N[0-9]*)?(?:O[0-9]*)?(?:P[0-9]*)?(?:S[0-9]*)?(?:F[0-9]*)?(?:Cl[0-9]*)?(?:Br[0-9]*)?)\b/g;

// Common SMILES characters and patterns
// SMILES contains atoms (C, N, O, S, P, F, Cl, Br, I, c, n, o, s), numbers for rings (1-9),
// branches (parentheses), bonds (=, #, :, -, /,\), charges ([O-], [NH4+]), etc.
const POTENTIAL_SMILES_REGEX = /(?:[A-Z][a-z]?|\[[^\]]+\]|[cnosp0-9=\#\(\)\[\]\+\-\\\/\.\@\:]){4,}/g;

/**
 * Validates whether a candidate string has structural SMILES syntax
 */
export function isValidSmilesCandidate(s: string): boolean {
  if (!s || s.length < 2) return false;
  // Ignore plain english words or acronyms that lack chemical syntax
  if (/^[A-Za-z]+$/.test(s) && !/^(?:C|N|O|S|P|F|Cl|Br|I|c|n|o|s){2,}$/.test(s)) {
    // English words like "TABLE", "PROTEIN", "SAMPLE", "METHOD"
    if (s.length > 3 && !/[=\#1-9\(\)\[\]]/.test(s)) return false;
  }
  
  // Check parenthesis balance
  let openParen = 0;
  for (const char of s) {
    if (char === '(') openParen++;
    if (char === ')') openParen--;
    if (openParen < 0) return false;
  }
  if (openParen !== 0) return false;

  // Check square bracket balance
  let openBracket = 0;
  for (const char of s) {
    if (char === '[') openBracket++;
    if (char === ']') openBracket--;
    if (openBracket < 0) return false;
  }
  if (openBracket !== 0) return false;

  // Must contain at least one organic atom
  const hasOrganicAtom = /[cCnNoOsSpPfFbBiI]/.test(s);
  if (!hasOrganicAtom) return false;

  // Common non-SMILES false positives
  const falsePositives = ['http', 'https', 'rgba', 'calc', 'flex', 'font', 'none', 'uuid', 'test', 'eval', 'auto', 'null', 'true', 'false'];
  if (falsePositives.some(fp => s.toLowerCase().includes(fp))) return false;

  return true;
}

/**
 * Validates CAS Registry Number checksum
 * The checksum is the sum of the digits multiplied by their position from right to left (excluding the check digit) modulo 10
 */
export function validateCasChecksum(cas: string): boolean {
  const parts = cas.split('-');
  if (parts.length !== 3) return false;
  
  const checkDigit = parseInt(parts[2], 10);
  const digits = (parts[0] + parts[1]).split('').reverse().map(Number);
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i + 1);
  }
  
  return sum % 10 === checkDigit;
}

/**
 * Extract all chemical entities from free-form text
 */
export function extractChemicalsFromText(text: string): {
  smiles: ExtractedChemicalItem[];
  casNumbers: ExtractedChemicalItem[];
  formulas: ExtractedChemicalItem[];
} {
  const smilesList: ExtractedChemicalItem[] = [];
  const casList: ExtractedChemicalItem[] = [];
  const formulaList: ExtractedChemicalItem[] = [];

  const seenSmiles = new Set<string>();
  const seenCas = new Set<string>();
  const seenFormulas = new Set<string>();

  // 1. Extract CAS Numbers
  let casMatch;
  while ((casMatch = CAS_REGEX.exec(text)) !== null) {
    const cas = casMatch[1];
    if (!seenCas.has(cas) && validateCasChecksum(cas)) {
      seenCas.add(cas);
      const start = Math.max(0, casMatch.index - 40);
      const end = Math.min(text.length, casMatch.index + cas.length + 40);
      casList.push({
        id: `cas-${casList.length}`,
        type: 'cas',
        value: cas,
        confidence: 0.98,
        contextSnippet: text.substring(start, end).replace(/\n/g, ' ').trim()
      });
    }
  }

  // 2. Extract potential SMILES
  // Look for labeled SMILES first: "SMILES: ...", "smiles = ...", or raw token matches
  const labeledRegex = /(?:SMILES|Smiles|canonical\s+smiles|structure)[:=\s]+([A-Za-z0-9=\#\(\)\[\]\+\-\\\/\.\@\:]+)/gi;
  let labeledMatch;
  while ((labeledMatch = labeledRegex.exec(text)) !== null) {
    const rawSmiles = labeledMatch[1].trim().replace(/[,\.;]+$/, '');
    if (isValidSmilesCandidate(rawSmiles) && !seenSmiles.has(rawSmiles)) {
      seenSmiles.add(rawSmiles);
      const start = Math.max(0, labeledMatch.index - 30);
      const end = Math.min(text.length, labeledMatch.index + rawSmiles.length + 30);
      smilesList.push({
        id: `smiles-${smilesList.length}`,
        type: 'smiles',
        value: rawSmiles,
        confidence: 0.99,
        contextSnippet: text.substring(start, end).replace(/\n/g, ' ').trim()
      });
    }
  }

  // Raw token matches
  const tokens = text.split(/[\s,;"'`<>]+/);
  for (const token of tokens) {
    const cleanToken = token.trim().replace(/^[\(\[\{]+|[\)\]\}\.;,]+$/g, '');
    if (cleanToken.length >= 4 && !seenSmiles.has(cleanToken) && isValidSmilesCandidate(cleanToken)) {
      // Avoid obvious file paths or urls
      if (cleanToken.includes('//') || cleanToken.includes('.com') || cleanToken.includes('.org')) continue;
      // Must have some chemical punctuation or ring index or lowercase aromatic atom
      if (/[1-9=\#\(\)\[\]]/.test(cleanToken) || /[cno]/.test(cleanToken)) {
        seenSmiles.add(cleanToken);
        const idx = text.indexOf(cleanToken);
        const start = Math.max(0, idx - 30);
        const end = Math.min(text.length, idx + cleanToken.length + 30);
        smilesList.push({
          id: `smiles-${smilesList.length}`,
          type: 'smiles',
          value: cleanToken,
          confidence: cleanToken.includes('=') || cleanToken.includes('(') ? 0.92 : 0.78,
          contextSnippet: idx >= 0 ? text.substring(start, end).replace(/\n/g, ' ').trim() : cleanToken
        });
      }
    }
  }

  // 3. Extract Chemical Formulas
  let formulaMatch;
  while ((formulaMatch = FORMULA_REGEX.exec(text)) !== null) {
    const formula = formulaMatch[1];
    if (formula.length > 2 && !seenFormulas.has(formula) && !seenSmiles.has(formula)) {
      seenFormulas.add(formula);
      const start = Math.max(0, formulaMatch.index - 30);
      const end = Math.min(text.length, formulaMatch.index + formula.length + 30);
      formulaList.push({
        id: `formula-${formulaList.length}`,
        type: 'formula',
        value: formula,
        confidence: 0.85,
        contextSnippet: text.substring(start, end).replace(/\n/g, ' ').trim()
      });
    }
  }

  return { smiles: smilesList, casNumbers: casList, formulas: formulaList };
}
