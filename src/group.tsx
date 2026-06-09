import {
  createContext,
  useContext,
  useEffect,
  useId,
  type ComponentPropsWithoutRef,
} from "react";
import type { Config, Id } from "./types";
import { useAi } from "./wrapper";
import z from "zod";

const GroupContext = createContext<Id | null>(null);

type AiGroupProps = Omit<ComponentPropsWithoutRef<"div">, "id"> & {
  config: Pick<Config, "name" | "description">;
};

export function AiGroup({
  children,
  config,
  ...divProps
}: AiGroupProps) {
  const { addHook, removeHook } = useAi();
  const group = useAiGroup();
  const id = useId();
  const { name, description } = config;

  useEffect(() => {
    const finalConfig = {
      name,
      description,
      isReadable: true,
      schema: z.tuple([]),
      run: () => {
        return document.getElementById(id)?.innerText;
      },
      group: group,
    };

    addHook(id, finalConfig);

    return () => {
      removeHook(id);
    };
  }, [addHook, removeHook, id, name, description, group]);

  return (
    <GroupContext.Provider value={id}>
      <div {...divProps} id={id}>{children}</div>
    </GroupContext.Provider>
  );
}

export const ROOT_GROUP = "__root__";

export function useAiGroup() {
  const context = useContext(GroupContext);

  if (!context) {
    return ROOT_GROUP;
  }

  return context;
}
