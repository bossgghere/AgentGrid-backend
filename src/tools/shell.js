import { execSync } from "child_process";

export function runShell(command, cwd = process.cwd()) {
  try {
    const output = execSync(command, {
      cwd,
      encoding: "utf-8",
      timeout: 30000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output || "(no output)";
  } catch (err) {
    return `Error: ${err.message}\n${err.stderr || ""}`;
  }
}
