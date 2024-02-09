import { useObserver } from "../../hooks/useObserver";
import React, { useState } from "react";

export function withReactive({ context, observer, values = {} }) {
  return function Reactive(props) {
    const [_, rerender] = useState(false);
    const handleNotification = (event) => {
      const { type, value } = event.value;
      if (props.id === type) {
        values = { ...values, ...value };
        rerender((prevVal) => !prevVal);
      }
    };

    useObserver({
      listener: handleNotification,
      contexts: [context],
      observer,
    });

    return <>{props.render(values)}</>;
  };
}
