require("@testing-library/jest-dom");

jest.setTimeout(6000 * 10);

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

window.SVGPathElement = jest.fn();

global.navigator = {
  userAgent: "node",
};

window.navigator = {
  userAgent: "node",
};

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };
