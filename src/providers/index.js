// Provider factory — set PROVIDER= in .env to switch
// Supported: anthropic | openai | gemini

const PROVIDER = (process.env.PROVIDER || "anthropic").toLowerCase();

let _provider = null;

export async function getProvider() {
  if (_provider) return _provider;

  switch (PROVIDER) {
    case "anthropic":
      _provider = await import("./anthropic.js");
      break;
    case "openai":
      _provider = await import("./openai.js");
      break;
    case "gemini":
      _provider = await import("./gemini.js");
      break;
    default:
      throw new Error(
        `Unknown provider: "${PROVIDER}". Valid options: anthropic, openai, gemini`
      );
  }

  return _provider;
}

export { PROVIDER };
