# wordle4

Wordle v4

## Word Checker API

New games request a common six-letter word from the
[Word Checker API](https://wordchecker.io/developers/random-word-api/). If the
request fails or no API key is configured, the game automatically falls back to
its bundled word list.

### Local development

1. Create a RapidAPI account and subscribe to the Word Checker API.
2. Copy `.env.example` to `.env.local`.
3. Set `WORD_CHECKER_API_KEY` in `.env.local`.
4. Restart the Vite development server.

The browser requests `/api/word-checker`. Vite proxies that request to RapidAPI
and adds the key server-side, avoiding Word Checker's restrictive CORS header.
The previous `VITE_WORD_CHECKER_API_KEY` name is temporarily supported by the
development proxy, but should be renamed because `VITE_` variables are intended
for browser-visible values.

### Production

GitHub Pages cannot run the Vite development proxy or protect an API key.
Deploy a server-side function that forwards the request to Word Checker, adds
the RapidAPI headers, and allows your GitHub Pages origin. Set its public URL as
`VITE_WORD_CHECKER_PROXY_URL` when building the app. Until that URL is
configured, production builds use the bundled word-list fallback.
