import "dotenv/config";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { buildGraph } from "./src/graph.js";
import { loadMemory, saveMemory } from "./src/memory/store.js";

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

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(chalk.red("  ✗ ANTHROPIC_API_KEY not set."));
    console.log(chalk.dim("    Copy .env.example → .env and add your key.\n"));
    process.exit(1);
  }

  const memory = loadMemory();
  const graph = buildGraph();

  console.log(chalk.dim("  Agents: Orchestrator → Planner → Coder → Reviewer"));
  console.log(chalk.dim("  Type a coding task. 'exit' to quit.\n"));

  const rawDir = await ask(chalk.cyan("  Working directory (Enter = current): "));
  const workingDir = rawDir.trim() || process.cwd();
  console.log(chalk.dim(`  Dir: ${workingDir}\n`));

  while (true) {
    const task = await ask(chalk.bold.hex("#818CF8")("  ▶ Task: "));

    if (task.toLowerCase().trim() === "exit") break;
    if (!task.trim()) continue;

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
