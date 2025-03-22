import { Popover, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

import { SecondaryButton } from "../../components";
import { useAuth } from "../../context/Auth";

export function AccountButton() {
  const { session, logout, login } = useAuth();

  if (!session) {
    return (
      <SecondaryButton>Kodemate AI</SecondaryButton>
    );
  }

  return (
    <Popover className="relative">
      <Popover.Button className="border-vsc-input-border bg-vsc-background hover:bg-vsc-input-background text-vsc-foreground mr-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-solid">
        <UserCircleIcon className="h-6 w-6" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="bg-vsc-input-background absolute right-0 z-10 mt-2 w-[250px] rounded-md border border-zinc-700 p-4 shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="font-medium">{session.account.label}</span>
              <span className="text-lightgray text-sm">
                {session.account.id}
              </span>
            </div>
            <SecondaryButton onClick={logout} className="w-full justify-center">
              退出登录
            </SecondaryButton>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
