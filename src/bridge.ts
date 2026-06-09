import { useEffect, useMemo } from "react";
import { ROOT_GROUP } from "./group";
import type { Config, Id } from "./types";
import { z } from "zod";

const BRIDGE_REQUEST_SOURCE = "ai-hooks-extension" as const;
const BRIDGE_RESPONSE_SOURCE = "ai-hooks-page" as const;
const PING_REQUEST = "ping" as const;
const GET_SNAPSHOT_REQUEST = "getSnapshot" as const;
const INVOKE_ACTION_REQUEST = "invokeAction" as const;
const AI_HOOKS_VERSION = "0.0.0" as const;

type Group = {
  id: Id;
  name: string;
  description: string;
  isReadable: boolean;
  schema: string;
  children: Group[];
};

type BridgeRequestBase = {
  source: typeof BRIDGE_REQUEST_SOURCE;
  requestId: string;
  type: unknown;
};

type BridgeRequest =
  | {
      source: typeof BRIDGE_REQUEST_SOURCE;
      requestId: string;
      type: typeof PING_REQUEST;
    }
  | {
      source: typeof BRIDGE_REQUEST_SOURCE;
      requestId: string;
      type: typeof GET_SNAPSHOT_REQUEST;
    }
  | {
      source: typeof BRIDGE_REQUEST_SOURCE;
      requestId: string;
      type: typeof INVOKE_ACTION_REQUEST;
      id: Id;
      parameters?: unknown[];
    };

export function useBridge(hooks: { [key: Id]: Config }) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window || !isBridgeRequest(event.data)) {
        return;
      }

      handleBridgeRequest(event.data, hooks, createSnapshot(hooks));
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [hooks]);
}

async function handleBridgeRequest(
  request: BridgeRequestBase,
  hooks: { [key: Id]: Config },
  snapshot: Group,
) {
  try {
    if (request.type === PING_REQUEST) {
      postBridgeResponse(request.requestId, {
        installed: true,
        version: AI_HOOKS_VERSION,
      });
      return;
    }

    if (request.type === GET_SNAPSHOT_REQUEST) {
      postBridgeResponse(request.requestId, { snapshot });
      return;
    }

    if (request.type === INVOKE_ACTION_REQUEST) {
      const actionRequest = request as Extract<
        BridgeRequest,
        { type: typeof INVOKE_ACTION_REQUEST }
      >;
      const config = hooks[actionRequest.id];

      if (!config) {
        throw new Error(`Action not found: ${actionRequest.id}`);
      }

      const parsedParameters = config.schema.parse(actionRequest.parameters ?? []);
      const result = await config.run(...parsedParameters);

      postBridgeResponse(request.requestId, { result });
      return;
    }

    throw new Error(
      `Invalid request type: ${String(request.type)}`,
    );
  } catch (error) {
    postBridgeResponse(request.requestId, error instanceof Error ? error.message : String(error), false);
  }
}

function postBridgeResponse(requestId: string, data: unknown, ok = true) {
  window.postMessage(
    {
      source: BRIDGE_RESPONSE_SOURCE,
      requestId,
      ok,
      data,
    },
    window.location.origin,
  );
}

function isBridgeRequest(data: unknown): data is BridgeRequestBase {
  if (!data || typeof data !== "object") {
    return false;
  }

  const request = data as Partial<BridgeRequestBase>;

  return (
    request.source === BRIDGE_REQUEST_SOURCE &&
    typeof request.requestId === "string"
  );
}

function createSnapshot(hooks: { [key: Id]: Config }, id?: Id) {
  if (id === undefined) {
    for (const [key, config] of Object.entries(hooks)) {
      if (config.group === ROOT_GROUP) {
        id = key;
        break;
      }
    }
  }

  if (id === undefined) {
    throw new Error("No base config found for group");
  }

  const baseConfig = hooks[id];

  if (baseConfig === undefined) {
    throw new Error(`Base config not found with id: ${id}`);
  }

  const childConfigs = Object.entries(hooks).filter(
    ([, config]) => config.group === id,
  );

  const baseGroup: Group = {
    id: id,
    name: baseConfig.name,
    description: baseConfig.description,
    isReadable: baseConfig.isReadable ?? false,
    schema: JSON.stringify(z.toJSONSchema(baseConfig.schema)),
    children: childConfigs.map(([childId]) => {
      return createSnapshot(hooks, childId);
    }),
  };

  return baseGroup;
}
