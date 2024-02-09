import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
  },
});

global.render = render;
