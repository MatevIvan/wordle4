import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const WORD_CHECKER_ORIGIN = "https://word-checker-api.p.rapidapi.com";
const WORD_CHECKER_HOST = "word-checker-api.p.rapidapi.com";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiKey = env.WORD_CHECKER_API_KEY || env.VITE_WORD_CHECKER_API_KEY;
  const wordCheckerHeaders = {
    "x-rapidapi-host": WORD_CHECKER_HOST,
    ...(apiKey ? { "x-rapidapi-key": apiKey } : {}),
  };

  return {
    base: command === "build" ? "/wordle4/" : "/",
    plugins: [react()],
    server: {
      proxy: {
        "/api/word-checker": {
          target: WORD_CHECKER_ORIGIN,
          changeOrigin: true,
          headers: wordCheckerHeaders,
          rewrite: (path) => path.replace(/^\/api\/word-checker/, "/v1/generator/random-word"),
        },
      },
    },
  };
});
