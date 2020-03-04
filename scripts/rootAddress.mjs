import path from "path";

export const projectRoot = path.dirname(
  path.dirname(new URL(import.meta.url).pathname)
);
