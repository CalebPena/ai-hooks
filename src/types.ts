import type { z } from "zod";

export type Id = string;

export type Config = {
  name: string;
  description: string;
  isReadable?: boolean;
  schema: z.ZodType<unknown[]>;
  run: (...parameters: unknown[]) => Promise<unknown> | unknown;
  group: Id;
};
