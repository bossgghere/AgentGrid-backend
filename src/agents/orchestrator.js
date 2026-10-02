import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function orchestratorNode(state) {
  console.log(chalk.hex("#6366F1")("\n  [Orchestrator] Analyzing task..."));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `You are the orchestrator of AgentGrid, a multi-agent coding system.

Analyze this task and return a brief context summary (2-3 sentences max).
Mention what type of task it is and any key considerations.

Task: ${state.task}
Working Directory: ${state.workingDir}

Respond with just the context summary, nothing else.`,
    }],
  });

  const context = response.content[0].text;
  console.log(chalk.dim(`  → ${context}`));

  return { output: context };
}
