export enum BuiltInToolNames {
  ReadFile = "读文件",
  EditExistingFile = "编辑现有文件",
  ReadCurrentlyOpenFile = "读当前打开的文件",
  CreateNewFile = "创建新文件",
  RunTerminalCommand = "运行终端命令",
  GrepSearch = "搜索文本",
  FileGlobSearch = "文件搜索",
  SearchWeb = "网页搜索",
  ViewDiff = "查看差异",
  LSTool = "列目录文件",

  // excluded from allTools for now
  ViewRepoMap = "查看仓库地图",
  ViewSubdirectory = "查看子目录",
}

export const BUILT_IN_GROUP_NAME = "内置工具";
