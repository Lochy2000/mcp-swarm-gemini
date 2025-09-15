export var AgentRole;
(function (AgentRole) {
    AgentRole["COORDINATOR"] = "coordinator";
    AgentRole["RESEARCHER"] = "researcher";
    AgentRole["ANALYZER"] = "analyzer";
    AgentRole["EXECUTOR"] = "executor";
})(AgentRole || (AgentRole = {}));
export const CAPABILITIES = {
    [AgentRole.COORDINATOR]: ["task_decomposition", "agent_orchestration", "priority_management"],
    [AgentRole.RESEARCHER]: ["data_gathering", "information_synthesis", "source_validation"],
    [AgentRole.ANALYZER]: ["pattern_recognition", "insight_generation", "statistical_reasoning"],
    [AgentRole.EXECUTOR]: ["action_execution", "result_validation", "output_formatting"]
};
