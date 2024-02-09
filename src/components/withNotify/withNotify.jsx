import React from 'react';

export function withNotify(Component, { context, observer }) {
  const notify = (value) => observer.notify({ context, value });
  return (props) => <Component notify={notify} {...props} />;
}
