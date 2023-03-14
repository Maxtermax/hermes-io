import React, { useEffect, useState, useRef } from "react";
import { useObserver } from './useObserver';

export const useProxy = (target, options) => {
  const proxyRef = useRef({ ...target });
  const [value, setValue] = useState(target);
  useObserver({
    observer: options?.observer,
    contexts: options?.contexts,
    listener: (payload) => value[payload.value],
  })
  useEffect(() => {
    function setup() {
      const handler = {
        get: function (_target, prop) {
          return value[prop];
        },
        set: function (target, prop, newValue) {
          target[prop] = newValue;
          setValue({ ...target });
          options?.contexts?.forEach?.((context) =>
            options?.observer?.notify?.({ value: proxyRef, context })
          );
          return true;
        },
      };
      proxyRef.current = new Proxy(target, handler);
    }
    setup();
  }, [target, setValue, proxyRef, value, options]);
  return proxyRef;
};
