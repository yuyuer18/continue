export enum BuiltInToolNames {
  ReadFile = "读取文件",
  ReadFileRange = "读取文件范围",
  EditExistingFile = "编辑现有文件",
  SingleFindAndReplace = "单次查找替换",
  MultiEdit = "多重编辑",
  ReadCurrentlyOpenFile = "读取当前打开文件",
  CreateNewFile = "创建新文件",
  RunTerminalCommand = "运行终端命令",
  GrepSearch = "Grep搜索",
  FileGlobSearch = "文件通配符搜索",
  SearchWeb = "搜索网页",
  ViewDiff = "查看差异",
  LSTool = "列出文件",
  CreateRuleBlock = "创建规则块",
  RequestRule = "请求规则",
  FetchUrlContent = "获取URL内容",
  CodebaseTool = "代码库工具",

  // excluded from allTools for now
  ViewRepoMap = "查看仓库地图",
  ViewSubdirectory = "查看子目录",
}

export const BUILT_IN_GROUP_NAME = "内置";

export const CLIENT_TOOLS_IMPLS = [
  BuiltInToolNames.EditExistingFile,
  BuiltInToolNames.SingleFindAndReplace,
  BuiltInToolNames.MultiEdit,
];
