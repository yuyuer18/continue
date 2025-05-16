import { Editor, JSONContent } from "@tiptap/react";
import { ContextItemWithId, InputModifiers, RuleWithSource } from "core";
import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { defaultBorderRadius, vscBackground } from "..";
import { useAppSelector } from "../../redux/hooks";
import { selectSlashCommandComboBoxInputs } from "../../redux/selectors";
import { ContextItemsPeek } from "./belowMainInput/ContextItemsPeek";
import { RulesPeek } from "./belowMainInput/RulesPeek";
import { ToolbarOptions } from "./InputToolbar";
import { Lump } from "./Lump";
import { TipTapEditor, TipTapEditorProps } from "./TipTapEditor";

interface ContinueInputBoxProps {
  isLastUserInput: boolean;
  isMainInput?: boolean;
  onEnter: (
    editorState: JSONContent,
    modifiers: InputModifiers,
    editor: Editor,
  ) => void;
  editorState?: JSONContent;
  contextItems?: ContextItemWithId[];
  appliedRules?: RuleWithSource[];
  hidden?: boolean;
  inputId: string; // used to keep track of things per input in redux
}

const EDIT_DISALLOWED_CONTEXT_PROVIDERS = [
  "codebase",
  "tree",
  "open",
  "web",
  "diff",
  "folder",
  "search",
  "debugger",
  "repo-map",
];

const gradient = keyframes`
  0% {
    background-position: 0px 0;
  }
  100% {
    background-position: 100em 0;
  }
`;

const GradientBorder = styled.div<{
  borderRadius?: string;
  borderColor?: string;
  loading: 0 | 1;
}>`
  border-radius: ${(props) => props.borderRadius || "0"};
  padding: 1px;
  background: ${(props) =>
    props.borderColor
      ? props.borderColor
      : `repeating-linear-gradient(
      101.79deg,
      #1BBE84 0%,
      #331BBE 16%,
      #BE1B55 33%,
      #A6BE1B 55%,
      #BE1B55 67%,
      #331BBE 85%,
      #1BBE84 99%
    )`};
  animation: ${(props) => (props.loading ? gradient : "")} 6s linear infinite;
  background-size: 200% 200%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function ContinueInputBox(props: ContinueInputBoxProps) {
  const editorRef = useRef<TipTapEditorProps>(null);
  const isStreaming = useAppSelector((state) => state.session.isStreaming);
  const availableSlashCommands = useAppSelector(
    selectSlashCommandComboBoxInputs,
  );
  const availableContextProviders = useAppSelector(
    (state) => state.config.config.contextProviders,
  );
  const mode = useAppSelector((store) => store.session.mode);
  const editModeState = useAppSelector((state) => state.editModeState);

  const filteredSlashCommands = useMemo(() => {
    return mode === "edit" ? [] : availableSlashCommands;
  }, [mode, availableSlashCommands]);

  const filteredContextProviders = useMemo(() => {
    if (mode === "edit") {
      return (
        availableContextProviders?.filter(
          (provider) =>
            !EDIT_DISALLOWED_CONTEXT_PROVIDERS.includes(provider.title),
        ) ?? []
      );
    }

    return availableContextProviders ?? [];
  }, [availableContextProviders, mode]);

  const historyKey = mode === "edit" ? "edit" : "chat";
  const placeholder = mode === "edit" ? "描述变化" : undefined;
  const selectChange = (e: any) => {
    editorRef.current?.insertPrompt(e);
  };
  const toolbarOptions: ToolbarOptions =
    mode === "edit"
      ? {
          hideAddContext: false,
          hideImageUpload: false,
          hideUseCodebase: true,
          hideSelectModel: false,
          enterText:
            editModeState.applyState.status === "done" ? "重试" : "编辑",
        }
      : {};

  const { appliedRules = [], contextItems = [] } = props;

  return (
    <div
      className={`${props.hidden ? "hidden" : ""}`}
      data-testid="continue-input-box"
    >
      <div className={`relative flex flex-col px-2`}>
        <Lump selectChange={selectChange} />
        <GradientBorder
          loading={isStreaming && props.isLastUserInput ? 1 : 0}
          borderColor={
            isStreaming && props.isLastUserInput ? undefined : vscBackground
          }
          borderRadius={defaultBorderRadius}
        >
          <TipTapEditor
            ref={editorRef}
            editorState={props.editorState}
            onEnter={props.onEnter}
            placeholder={placeholder}
            isMainInput={props.isMainInput ?? false}
            availableContextProviders={filteredContextProviders}
            availableSlashCommands={filteredSlashCommands}
            historyKey={historyKey}
            toolbarOptions={toolbarOptions}
            inputId={props.inputId}
            insertPrompt={selectChange}
          />
        </GradientBorder>
      </div>
      {(appliedRules.length > 0 || contextItems.length > 0) && (
        <div className="mt-2 flex flex-col">
          <RulesPeek appliedRules={props.appliedRules} />
          <ContextItemsPeek
            contextItems={props.contextItems}
            isCurrentContextPeek={props.isLastUserInput}
          />
        </div>
      )}
    </div>
  );
}

export default ContinueInputBox;
