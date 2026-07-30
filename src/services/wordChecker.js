const WORD_CHECKER_URL = import.meta.env.DEV
  ? "/api/word-checker"
  : import.meta.env.VITE_WORD_CHECKER_PROXY_URL?.trim();
const wordValidationCache = new Map();

function requireWordCheckerUrl() {
  if (!WORD_CHECKER_URL) {
    throw new Error("VITE_WORD_CHECKER_PROXY_URL is not configured");
  }
}

export async function getRandomWord({ length = 6, commonOnly = true, signal } = {}) {
  requireWordCheckerUrl();

  const query = new URLSearchParams({
    min_length: String(length),
    max_length: String(length),
    is_common: commonOnly ? "1" : "0",
  });

  const response = await fetch(`${WORD_CHECKER_URL}?${query}`, { signal });

  if (!response.ok) {
    throw new Error(`Word Checker request failed with status ${response.status}`);
  }

  const data = await response.json();
  const word = String(data.random_word ?? "")
    .trim()
    .toLowerCase();
  const expectedWord = new RegExp(`^[a-z]{${length}}$`);

  if (!expectedWord.test(word)) {
    throw new Error("Word Checker returned an invalid word");
  }

  return word;
}

export async function checkWordExists(word, { signal } = {}) {
  const normalizedWord = String(word).trim().toLowerCase();

  if (!/^[a-z]+$/.test(normalizedWord)) {
    return false;
  }

  if (wordValidationCache.has(normalizedWord)) {
    return wordValidationCache.get(normalizedWord);
  }

  requireWordCheckerUrl();

  const query = new URLSearchParams({
    first_letters: normalizedWord,
    min_length: String(normalizedWord.length),
    max_length: String(normalizedWord.length),
    is_common: "0",
  });
  const response = await fetch(`${WORD_CHECKER_URL}?${query}`, { signal });

  if (response.status === 404) {
    wordValidationCache.set(normalizedWord, false);
    return false;
  }

  if (!response.ok) {
    throw new Error(`Word Checker request failed with status ${response.status}`);
  }

  const data = await response.json();
  const isValid =
    String(data.random_word ?? "")
      .trim()
      .toLowerCase() === normalizedWord;

  wordValidationCache.set(normalizedWord, isValid);
  return isValid;
}
