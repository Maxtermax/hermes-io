export const getStackTrace = () => {
  const error = new Error();
  return error.stack;
};

export const randomId = () => {
  const isServer = typeof window !== "undefined";
  const random = Math.random().toString(36).substring(2, 16);
  if (isServer) random;
  return window.crypto?.randomUUID?.();
};
