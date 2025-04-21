export enum BuiltInToolNames {
  ReadFile = "读取文件",
  EditExistingFile = "编辑现有文件",
  ReadCurrentlyOpenFile = "读取当前打开的文件",
  CreateNewFile = "创建新文件",
  RunTerminalCommand = "运行终端命令",
  GrepSearch = "grep搜索",
  FileGlobSearch = "文件通配符搜索",
  SearchWeb = "搜索网页",
  ViewDiff = "查看差异",
  LSTool = "ls工具",
  CreateRuleBlock = "创建规则块",

  // excluded from allTools for now
  ViewRepoMap = "查看仓库地图",
  ViewSubdirectory = "查看子目录",
}

export const BUILT_IN_GROUP_NAME = "内置工具";
