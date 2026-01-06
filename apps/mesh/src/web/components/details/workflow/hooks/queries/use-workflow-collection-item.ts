import { useRef } from "react";
import { WorkflowExecution } from "@decocms/bindings/workflow";
import { createToolCaller } from "@/tools/client";
import { useWorkflowBindingConnection } from "../use-workflow-binding-connection";
import { useToolCallQuery } from "@/web/hooks/use-tool-call";

type ExecutionQueryResult = {
  item: WorkflowExecution | null;
  step_results: Record<string, unknown> | null;
};

const POLLING_INTERVALS = [1, 500, 1000, 2000, 3000];

export function usePollingWorkflowExecution(executionId?: string) {
  const connection = useWorkflowBindingConnection();
  const toolCaller = createToolCaller(connection.id);
  const intervalIndexRef = useRef(0);

  const { data, isLoading } = useToolCallQuery<
    { id: string | undefined },
    ExecutionQueryResult
  >({
    toolCaller: toolCaller,
    toolName: "COLLECTION_WORKFLOW_EXECUTION_GET",
    toolInputParams: {
      id: executionId,
    },
    scope: connection.id,
    enabled: !!executionId,
    refetchInterval: executionId
      ? (query) => {
          const status = query.state?.data?.item?.status;
          if (status === "running" || status === "enqueued") {
            const interval = POLLING_INTERVALS[intervalIndexRef.current] ?? 1;
            intervalIndexRef.current =
              (intervalIndexRef.current + 1) % POLLING_INTERVALS.length;
            return interval;
          }
          intervalIndexRef.current = 0;
          return false;
        }
      : false,
  });

  return {
    item: data?.item,
    step_results: data?.step_results,
    isLoading,
  } as {
    item: WorkflowExecution | null;
    step_results: Record<string, unknown>[] | null;
    isLoading: boolean;
  };
}
