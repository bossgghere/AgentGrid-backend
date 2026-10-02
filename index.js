import "dotenv/config";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { buildGraph } from "./src/graph.js";
import { loadMemory, saveMemory } from "./src/memory/store.js";
import { getProvider, PROVIDER } from "./src/providers/index.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log();
  console.log(chalk.bold.hex("#6366F1")("  ╔══════════════════════════════╗"));
  console.log(chalk.bold.hex("#6366F1")("  ║       AgentGrid  v0.1        ║"));
  console.log(chalk.bold.hex("#6366F1")("  ║   Multi-Agent Code Engine    ║"));
  console.log(chalk.bold.hex("#6366F1")("  ╚══════════════════════════════╝"));
  console.log();

  // Validate the right key is set for the chosen provider
  const keyMap = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    gemini: "GEMINI_API_KEY",
  };
  const requiredKey = keyMap[PROVIDER];
  if (!requiredKey || !process.env[requiredKey]) {
    console.log(chalk.red(`  ✗ ${requiredKey} not set for provider "${PROVIDER}".`));
    console.log(chalk.dim("    Copy .env.example → .env and add your key.\n"));
    process.exit(1);
  }

  // Warm up provider (lazy load)
  const provider = await getProvider();
  console.log(
    chalk.dim(`  Provider : `) + chalk.hex("#6366F1")(`${provider.info.name}`) +
    chalk.dim(`  Model : `) + chalk.hex("#818CF8")(provider.info.model)
  );

  const memory = loadMemory();
  const graph = buildGraph();

  console.log(chalk.dim("  Agents   : Orchestrator → Planner → Coder → Reviewer"));
  console.log(chalk.dim("  Type a coding task. 'exit' to quit.\n"));

  const rawDir = await ask(chalk.cyan("  Working directory (Enter = current): "));
  const workingDir = rawDir.trim() || process.cwd();
  console.log(chalk.dim(`  Dir: ${workingDir}\n`));

  while (true) {
    const task = await ask(chalk.bold.hex("#818CF8")("  ▶ Task: "));

    const cmd = task.toLowerCase().trim();
    if (cmd === "exit") break;
    if (!task.trim()) continue;

    if (cmd === "help") {
      console.log(chalk.dim("\n  Commands:"));
      console.log(chalk.dim("    help     — show this message"));
      console.log(chalk.dim("    history  — view past sessions"));
      console.log(chalk.dim("    config   — show active provider & settings"));
      console.log(chalk.dim("    exit     — quit AgentGrid\n"));
      continue;
    }

    const spinner = ora({
      text: chalk.dim("  Agents running..."),
      color: "magenta",
    }).start();

    try {
      const result = await graph.invoke({
        task: task.trim(),
        workingDir,
        memory,
        iterations: 0,
        status: "planning",
      });

      spinner.stop();

      console.log("\n" + chalk.bold.hex("#6366F1")("  ━━━━━━━━ Result ━━━━━━━━"));
      console.log(chalk.white("  " + result.output));

      if (result.executionResult) {
        console.log(chalk.dim("\n  Execution log:"));
        result.executionResult
          .split("\n")
          .slice(0, 10)
          .forEach((l) => console.log(chalk.dim("  " + l)));
      }

      // Persist session to memory
      memory.sessions = memory.sessions || [];
      memory.sessions.push({
        task,
        status: result.status,
        timestamp: new Date().toISOString(),
      });
      saveMemory(memory);

      console.log(chalk.dim("\n  ─────────────────────────────────\n"));
    } catch (err) {
      spinner.stop();
      console.log(chalk.red(`\n  ✗ Error: ${err.message}\n`));
    }
  }

  console.log(chalk.dim("\n  Goodbye.\n"));
  rl.close();
}

main();
