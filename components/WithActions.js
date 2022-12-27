import React from 'react';

export const withActions = (actions, Component) => (props = {}) => <Component actions={actions} {...props}/>;
