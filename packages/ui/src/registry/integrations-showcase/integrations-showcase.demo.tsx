import { IntegrationsShowcase } from "@/registry/integrations-showcase/integrations-showcase";

export default function IntegrationsShowcaseDemo() {
  return (
    <IntegrationsShowcase
      title="Connect the tools you already use"
      integrations={[
        { id: "slack", name: "Slack", category: "Communication", description: "Share updates with your team." },
        { id: "github", name: "GitHub", category: "Development", description: "Connect issues and pull requests." },
        { id: "figma", name: "Figma", category: "Design", description: "Keep design work close to delivery." },
        { id: "linear", name: "Linear", category: "Planning", description: "Sync projects and issue status." },
        { id: "notion", name: "Notion", category: "Documentation", description: "Link useful team knowledge." },
      ]}
    />
  );
}
