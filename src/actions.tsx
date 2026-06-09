import { useEffect, useId } from "react";
import { useAi } from "./wrapper";
import { useAiGroup } from "./group";
import type { Config } from "./types";

export function useAiAction(config: Omit<Config, "group">) {
  const { addHook, removeHook } = useAi();
  const group = useAiGroup();
  const id = useId();

  useEffect(() => {
    const finalConfig = {
      ...config,
      group: group,
    };

    addHook(id, finalConfig);

    return () => {
      removeHook(id);
    };
  }, [addHook, removeHook, id, config, group]);
}
