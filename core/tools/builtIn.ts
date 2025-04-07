export enum BuiltInToolNames {
  ReadFile = "builtin_read_file",
  EditExistingFile = "builtin_edit_existing_file",
  ReadCurrentlyOpenFile = "builtin_read_currently_open_file",
  CreateNewFile = "builtin_create_new_file",
  RunTerminalCommand = "builtin_run_terminal_command",
  GrepSearch = "builtin_grep_search",
  FileGlobSearch = "builtin_file_glob_search",
  SearchWeb = "builtin_search_web",
  ViewDiff = "builtin_view_diff",
  LSTool = "builtin_ls",

  // excluded from allTools for now
  ViewRepoMap = "查看仓库地图",
  ViewSubdirectory = "查看子目录",
}

export const BUILT_IN_GROUP_NAME = "内置工具";
