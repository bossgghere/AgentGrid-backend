import Anthropic from "@anthropic-ai/sdk";
import chalk from "chalk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function reviewerNode(state) {
  console.log(chalk.hex("#f59e0b")("\n  [Reviewer] Checking output..."));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a reviewer agent inside AgentGrid. Determine if the coding task was completed correctly.

Original Task: ${state.task}
Plan:
${state.plan}

Execution Result:
${state.executionResult}
${state.code ? `\nCode Written:\n${state.code.slice(0, 3000)}` : ""}

Respond with this exact JSON (no markdown):
{
  "status": "done" or "needs_revision",
  "feedback": "one sentence — what's missing or wrong (only if needs_revision)",
  "output": "user-facing summary of what was accomplished"
}`,
    }],
  });

  let result;
  const raw = response.content[0].text.trim();

  try {
    const cleaned = raw
      .replace(/^```json\n?/i, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    result = JSON.parse(cleaned);
  } catch {
    result = {
      status: "done",
      feedback: "",
      output: state.executionResult || "Task execution complete.",
    };
  }

  if (result.status === "done") {
    console.log(chalk.green("  ✓ Approved"));
  } else {
    console.log(chalk.yellow(`  ↻ Needs revision: ${result.feedback}`));
  }

  return {
    review: result.feedback,
    status: result.status,
    output: result.output || state.executionResult,
  };
}
