/** Compile-time exhaustiveness helper; intended to sit on unreachable `default` branches. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminant: ${String(value)}`);
}
