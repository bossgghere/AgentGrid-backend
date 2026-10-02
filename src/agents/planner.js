import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function plannerNode(state) {
  console.log(chalk.hex("#818CF8")("\n  [Planner] Breaking task into steps..."));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a software planning agent inside AgentGrid.

Break this coding task into clear, executable steps for a coder agent.

Task: ${state.task}
Working Directory: ${state.workingDir}

Rules:
- Maximum 5 steps
- Each step must be specific and actionable
- Focus on: files to create, code to write, commands to run
- Be concise — one line per step

Return a numbered list only. No explanation.`,
    }],
  });

  const plan = response.content[0].text;
  console.log(chalk.dim("\n" + plan.split("\n").map((l) => `  ${l}`).join("\n")));

  return { plan };
}
