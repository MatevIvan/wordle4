# wordle4

Wordle v4

## Word Checker API

New games request a common six-letter word from the
[Word Checker API](https://wordchecker.io/developers/random-word-api/). If the
request fails or no API key is configured, the game automatically falls back to
its bundled word list.

1. Create a RapidAPI account and subscribe to the Word Checker API.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_WORD_CHECKER_API_KEY` in `.env.local`.
4. Restart the Vite development server.

Vite includes `VITE_` variables in the browser bundle. This is sufficient for a
personal GitHub Pages project, but it does not keep the RapidAPI key secret. For
a public production app, route requests through a server-side function and keep
the key there.
