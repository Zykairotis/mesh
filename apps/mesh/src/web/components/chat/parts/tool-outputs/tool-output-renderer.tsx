import { ConnectionCard } from "@/web/components/connections/connection-card.tsx";
import { useConnection } from "@/web/hooks/collections/use-connection";
import { useProjectContext } from "@/web/providers/project-context-provider";
import { LinkExternal01 } from "@untitledui/icons";
import { useNavigate } from "@tanstack/react-router";
import { JsonSyntaxHighlighter } from "@/web/components/json-syntax-highlighter.tsx";

interface ToolOutputRendererProps {
  toolName: string;
  input: unknown;
  output: unknown;
}

export function ToolOutputRenderer({
  toolName,
  input,
  output,
}: ToolOutputRendererProps) {
  const stringifiedOutput = JSON.stringify(output, null, 2);
  const isLargeOutput = stringifiedOutput.length > 2000;
  const outputContent = isLargeOutput
    ? stringifiedOutput.slice(0, 2000) + "...[TRUNCATED]"
    : stringifiedOutput;
  // Handle READ_MCP_TOOLS
  if (toolName === "READ_MCP_TOOLS") {
    const connectionId = (input as { id: string })?.id;
    // If we have a connection ID, try to fetch and display the connection card
    if (connectionId) {
      return <ConnectionRenderer connectionId={connectionId} />;
    }
  }

  // Default fallback
  return <JsonSyntaxHighlighter jsonString={outputContent} padding="0" />;
}

function ConnectionRenderer({
  connectionId,
  compact,
}: {
  connectionId: string;
  compact?: boolean;
}) {
  const connection = useConnection(connectionId);
  const {
    org: { slug: org },
  } = useProjectContext();
  const navigate = useNavigate();

  if (!connection) return null;

  const handleOpen = () => {
    navigate({
      to: "/$org/mcps/$connectionId",
      params: { org, connectionId: connection.id },
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
        <span className="font-medium text-foreground">{connection.title}</span>
        <button
          type="button"
          onClick={handleOpen}
          className="hover:text-foreground transition-colors"
          title="Open connection"
        >
          <LinkExternal01 size={12} />
        </button>
      </div>
    );
  }

  return <ConnectionCard connection={connection} onClick={handleOpen} />;
}
