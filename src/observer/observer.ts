export type Subscriber = {
  (args: Record<string, unknown>, resolve: (value?: unknown) => void): void;
  id?: string;
};

export interface NotifyOptions {
  timeout?: number;
}

export class Observer {
  subscriptors: Subscriber[] = [];

  subscribe(callback: Subscriber): void {
    this.subscriptors.push(callback);
  }

  unsubscribe(callback: Subscriber): void {
    const index = this.subscriptors.findIndex((cb) => cb === callback);
    if (index > -1) this.subscriptors.splice(index, 1);
  }

  has = (id: string): boolean =>
    this.subscriptors.some((subscriber) => id === subscriber.id);

  notify(args: Record<string, unknown> = {}, { timeout = 30000 }: NotifyOptions = {}): Promise<unknown> {
    return new Promise((resolve) => {
      const timer =
        timeout > 0 ? setTimeout(() => resolve(null), timeout) : null;
      const wrappedResolve = (value?: unknown) => {
        if (timer) clearTimeout(timer);
        resolve(value);
      };
      this.subscriptors.forEach((callback) => callback(args, wrappedResolve));
    });
  }
}
