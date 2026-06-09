import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Config, Id } from "./types";
import { AiGroup } from "./group";
import { useBridge } from "./bridge";

const AiContext = createContext<{
  addHook: (id: Id, config: Config) => void;
  removeHook: (id: Id) => void;
} | null>(null);

export function AiProvider({
  children,
  config,
  disabled = false,
}: {
  children: ReactNode;
  config: Pick<Config, "name" | "description">;
  disabled?: boolean;
}) {
  if (disabled) {
    return children;
  }

  return <EnabledAiProvider config={config}>{children}</EnabledAiProvider>;
}

function EnabledAiProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: Pick<Config, "name" | "description">;
}) {
  const [hooks, setHooks] = useState<{ [key: Id]: Config }>({});

  const addHook = useCallback((id: Id, config: Config) => {
    setHooks((hooks) => ({ ...hooks, [id]: config }));
  }, []);

  const removeHook = useCallback((id: Id) => {
    setHooks((hooks) => {
      const { [id]: _removed, ...rest } = hooks;
      return rest;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ addHook, removeHook }),
    [addHook, removeHook],
  );

  useBridge(hooks);

  return (
    <AiContext.Provider value={contextValue}>
      <AiGroup config={config}>{children}</AiGroup>
    </AiContext.Provider>
  );
}

export const useAi = () => {
  const context = useContext(AiContext);

  if (!context) {
    throw new Error("'useAi' must be used within an 'AiProvider'");
  }

  return context;
};
