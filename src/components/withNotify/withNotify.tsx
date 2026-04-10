import React, { ComponentType } from "react";
import type { Context } from "../../context/context";
import type { Observer } from "../../observer/observer";

interface WithNotifyConfig {
  context: Context;
  observer: Observer;
}

export function withNotify<P extends Record<string, unknown>>(
  Component: ComponentType<P & { notify: (value: unknown) => Promise<unknown> }>,
  { context, observer }: WithNotifyConfig
) {
  const notify = (value: unknown) => observer.notify({ context, value });
  return (props: P) => <Component notify={notify} {...props} />;
}
