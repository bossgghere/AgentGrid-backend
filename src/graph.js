import { StateGraph, END, START } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { orchestratorNode } from "./agents/orchestrator.js";
import { plannerNode } from "./agents/planner.js";
import { coderNode } from "./agents/coder.js";
import { reviewerNode } from "./agents/reviewer.js";

// State shared across all agents
export const AgentState = Annotation.Root({
  task:            Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  plan:            Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  code:            Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  executionResult: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  review:          Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  output:          Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  status:          Annotation({ reducer: (x, y) => y ?? x, default: () => "planning" }),
  iterations:      Annotation({ reducer: (x, y) => y ?? x, default: () => 0 }),
  workingDir:      Annotation({ reducer: (x, y) => y ?? x, default: () => process.cwd() }),
  memory:          Annotation({ reducer: (x, y) => ({ ...x, ...y }), default: () => ({}) }),
});

// After reviewer: loop back to coder or finish
function shouldContinue(state) {
  if (state.status === "done") return END;
  if (state.iterations >= 3) return END;   // circuit breaker
  return "coder";
}

export function buildGraph() {
  const graph = new StateGraph(AgentState)
    .addNode("orchestrator", orchestratorNode)
    .addNode("planner",      plannerNode)
    .addNode("coder",        coderNode)
    .addNode("reviewer",     reviewerNode)
    .addEdge(START,          "orchestrator")
    .addEdge("orchestrator", "planner")
    .addEdge("planner",      "coder")
    .addEdge("coder",        "reviewer")
    .addConditionalEdges("reviewer", shouldContinue);

  return graph.compile();
}
