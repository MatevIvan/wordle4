const WORD_CHECKER_URL =
  "https://word-checker-api.p.rapidapi.com/v1/generator/random-word";
const WORD_CHECKER_HOST = "word-checker-api.p.rapidapi.com";

export async function getRandomWord({
  length = 6,
  commonOnly = true,
  signal,
} = {}) {
  const apiKey = import.meta.env.VITE_WORD_CHECKER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("VITE_WORD_CHECKER_API_KEY is not configured");
  }

  const query = new URLSearchParams({
    min_length: String(length),
    max_length: String(length),
    is_common: commonOnly ? "1" : "0",
  });

  const response = await fetch(`${WORD_CHECKER_URL}?${query}`, {
    headers: {
      "x-rapidapi-host": WORD_CHECKER_HOST,
      "x-rapidapi-key": apiKey,
    },
    signal,
  });

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
