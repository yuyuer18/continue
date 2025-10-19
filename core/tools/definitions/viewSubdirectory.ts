import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const viewSubdirectoryTool: Tool = {
  type: "function",
  displayTitle: "View Subdirectory",
  wouldLikeTo: 'view a map of "{{{ directory_path }}}"',
  isCurrently: 'getting a map of "{{{ directory_path }}}"',
  hasAlready: 'viewed a map of "{{{ directory_path }}}"',
  readonly: true,
  group: BUILT_IN_GROUP_NAME,
  isInstant: true,
  function: {
    name: BuiltInToolNames.ViewSubdirectory,
    description: "View the contents of a subdirectory",
    parameters: {
      type: "object",
      required: ["directory_path"],
      properties: {
        directory_path: {
          type: "string",
          description:
            "要查看的子目录的路径，相对于工作区的根目录（请勿使用绝对路径）",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `To view a map of a specific folder within the project, you can use the ${BuiltInToolNames.ViewSubdirectory} tool. This will provide a visual representation of the folder's structure and organization.`,
    exampleArgs: [["directory_path", "path/to/subdirectory"]],
  },
  defaultToolPolicy: "allowedWithPermission",
  toolCallIcon: "FolderOpenIcon",
};
