export type ToolAgent = {
  readonly env: Env;
  readonly services: readonly string[];
};

export function assertKnownService(
  service: string,
  services: readonly string[]
) {
  if (!services.includes(service)) {
    throw new Error(
      `Unknown service "${service}". Use one of: ${services.join(", ")}`
    );
  }
}
