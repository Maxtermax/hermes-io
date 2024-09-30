export const getStackTrace = () => {
  const error = new Error();
  return error.stack;
};

export const randomId = () => Math.random().toString(36).substring(2, 16);
