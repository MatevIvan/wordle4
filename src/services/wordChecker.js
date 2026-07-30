const WORD_CHECKER_URL = import.meta.env.DEV
  ? "/api/word-checker"
  : import.meta.env.VITE_WORD_CHECKER_PROXY_URL?.trim();

export async function getRandomWord({ length = 6, commonOnly = true, signal } = {}) {
  if (!WORD_CHECKER_URL) {
    throw new Error("VITE_WORD_CHECKER_PROXY_URL is not configured");
  }

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
