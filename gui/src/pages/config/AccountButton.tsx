import { UserCircleIcon } from "@heroicons/react/24/solid";

import { SecondaryButton } from "../../components";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "../../components/ui";
import { useAuth } from "../../context/Auth";
import { selectSelectedOrganization } from "../../redux";
import { useAppSelector } from "../../redux/hooks";
import { ScopeSelect } from "./ScopeSelect";

export function AccountButton() {
  const { session, logout, login, organizations } = useAuth();
  const selectedOrg = useAppSelector(selectSelectedOrganization);

  if (!session) {
    return (
      <SecondaryButton>Kodemate AI</SecondaryButton>
    );
  }

  return (
    <Popover className="relative">
      <PopoverButton className="bg-vsc-background hover:bg-vsc-input-background text-vsc-foreground my-0.5 flex cursor-pointer rounded-md border-none px-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">
            {selectedOrg === null ? "Personal" : selectedOrg.name}
          </span>
          <UserCircleIcon className="h-6 w-6" />{" "}
        </div>
      </PopoverButton>

      <Transition>
        <PopoverPanel className="bg-vsc-input-background xs:p-4 absolute right-0 mt-1 rounded-md border border-zinc-700 p-2 shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="font-medium">{session.account.label}</span>
              <span className="text-lightgray text-sm">
                {session.account.id}
              </span>
            </div>

            {organizations.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-vsc-foreground text-xs">
                  Organization
                </label>
                <ScopeSelect />
              </div>
            )}
            <SecondaryButton onClick={logout} className="w-full justify-center">
              退出登录
            </SecondaryButton>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
