export type ReplaceDateWithString<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? ReplaceDateWithString<U>[]
    : T extends object
      ? { [K in keyof T]: ReplaceDateWithString<T[K]> }
      : T;
