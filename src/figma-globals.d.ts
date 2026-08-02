import type { PluginAPI } from "@figma/plugin-typings/plugin-api-standalone";

declare global {
  const __html__: string;
  const figma: PluginAPI;

  interface Console {
    error(message?: unknown, ...optionalParameters: readonly unknown[]): void;
  }

  const console: Console;
}

export {};
