import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { type ModelDescription } from "core";
import { defaultBorderRadius } from "../../components";
import { ToolTip } from "../../components/gui/Tooltip";
import InfoHover from "../../components/InfoHover";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "../../components/ui";
import { fontSize } from "../../util";

interface ModelRoleSelectorProps {
  models: ModelDescription[];
  selectedModel: ModelDescription | null;
  onSelect: (model: ModelDescription | null) => void;
  displayName: string;
  description: string;
}

const ModelRoleSelector = ({
  models,
  selectedModel,
  onSelect,
  displayName,
  description,
}: ModelRoleSelectorProps) => {
  function handleSelect(title: string | null) {
    onSelect(models.find((m) => m.title === title) ?? null);
  }

  return (
    <>
      <div className="mt-2 flex flex-row items-center gap-1 sm:mt-0">
        <span
          style={{
            fontSize: fontSize(-3),
          }}
        >
          {displayName}
        </span>
        <InfoHover size="3" id={displayName} msg={description} />
        <ToolTip id={`${displayName}-description`} place={"bottom"}>
          {description}
        </ToolTip>
      </div>
      <Listbox value={selectedModel?.title ?? null} onChange={handleSelect}>
        <div className="relative">
          <ListboxButton
            disabled={models.length === 0}
            className={`bg-vsc-editor-background hover:bg-list-active hover:text-list-active-foreground w-full justify-between`}
          >
            {models.length === 0 ? (
              <span className="text-lightgray line-clamp-1 italic">{`无 ${displayName} 模型 ${["Chat", "Apply", "Edit"].includes(displayName) ? ". 使用对话模型" : ""}`}</span>
            ) : (
              <span className="line-clamp-1">
                {selectedModel?.title ?? `选择 ${displayName} 模型`}
              </span>
            )}
            {models.length ? (
              <div className="pointer-events-none flex items-center">
                <ChevronUpDownIcon className="h-3 w-3" aria-hidden="true" />
              </div>
            ) : null}
          </ListboxButton>

          <Transition>
            <ListboxOptions
              style={{ borderRadius: defaultBorderRadius }}
              className="min-w-40"
            >
              {models.map((option, idx) => (
                <ListboxOption key={idx} value={option.title} className={""}>
                  <span
                    className="line-clamp-1 flex h-4 items-center gap-2"
                    style={{ fontSize: fontSize(-3) }}
                  >
                    {option.title}
                  </span>
                  {option.title === selectedModel?.title && (
                    <CheckIcon className="h-3 w-3" aria-hidden="true" />
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </>
  );
};

export default ModelRoleSelector;
