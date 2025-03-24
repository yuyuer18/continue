import { ContextSection } from "./ContextSection";
import DocsSection from "./docs/DocsSection";
import { MCPSection } from "./MCPSection";
import { ModelsSection } from "./ModelsSection";
import { PromptsSection } from "./PromptsSection";
import { RulesSection } from "./RulesSection";
import { ToolsSection } from "./ToolsSection";

interface SelectedSectionProps {
  selectedSection: string | null;
}

export function SelectedSection(props: SelectedSectionProps) {
  switch (props.selectedSection) {
    case "models":
      return <ModelsSection />;
    case "rules":
      return <RulesSection />;
    case "docs":
      return <DocsSection />;
    case "prompts":
      return <PromptsSection />;
    case "context":
      return <ContextSection />;
    case "tools":
      return <ToolsSection />;
    case "mcp":
      return <MCPSection />;
    default:
      return null;
  }
}
