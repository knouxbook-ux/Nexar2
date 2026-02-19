// Copyright © Knoux. All rights reserved.
declare module "cookie" {
  export function parse(str: string, options?: Record<string, unknown>): Record<string, string>;
}
