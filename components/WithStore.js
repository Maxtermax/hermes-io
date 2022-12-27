import React from 'react';

export const withStore = (store, Component) => (props = {}) => <Component store={store} {...props}/>;
