export enum BuiltInToolNames {
  ReadFile = "读文件",
  ReadCurrentlyOpenFile = "读取当前打开的文件",
  CreateNewFile = "新建文件",
  RunTerminalCommand = "执行命令",
  ExactSearch = "精确搜索",
  SearchWeb = "web搜索",
  ViewDiff = "查看差异",
  LSTool = "显示文件列表",

  // excluded from allTools for now
  ViewRepoMap = "查看仓库地图",
  ViewSubdirectory = "查看子目录",
}

export const BUILT_IN_GROUP_NAME = "内置工具";
