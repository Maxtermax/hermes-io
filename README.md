# hermes-io
A lightweight javascript library that allows communication between components by using the observer pattern and the hook api.

# Summary
- [Installation](#installation)
- [Introduction](#introduction)
- [Observer](#observer)
- [Context](#context)
- [useObserver](#useobserver)
- [notify](#notify)
- [demos](#demos)
- [Hermes-io CLI](#hermes-io-cli)
- [Tooling](#tooling)
  
https://github.com/Maxtermax/hermes-io-counter-demo/assets/4247989/4b0200ba-4d29-4b2f-9861-47faa0b9639a


# Installation
```
npm i hermes-io --save
```

# Introduction
`hermes-io` is a set of toolkits that combined allows communication between components let's explore every tool by following the demo:
[counter](https://stackblitz.com/~/github.com/Maxtermax/hermes-io-counter-demo)


# Observer
`hermes-io` provides an `Observer` class to create instances that can be `subscribable` that means many subscribers can listen for notifications on the instance by using the method `subscribe`, check the following example:

We are exporting an instance of the class `Observer` called `CounterObserver` the propuses of this observer is handle notifications for `add` a product and `remove` a product.

```javascript
// ./src/observers/counter.js
import { Observer } from "hermes-io";
export const CounterObserver = new Observer();

```

### generate observer (optional)
To simply things you can generate the observer file using [hermes-io-cli](https://www.npmjs.com/package/hermes-io-cli#observer)
```
hermes-io-cli --root="./src" --observer="CounterObserver"
```

# Context
`hermes-io` provides a `Context` class to create instances that can be used to create `notification context` that means that only notification 
submited on a specific context will be listened otherwise will be ignored, you can think on this like a `whitelist` let's analyze the following example:

The context constrains the observer by telling which `notifications` must listen to.

`NOTE:` this concept has nothing to do with the `react context api`.

```javascript
// ./src/contexts/counter.js
import { Context } from "hermes-io";
export const CounterContext = new Context('CounterContext');
```

### generate context (optional)
To simply things you can generate the observer file using [hermes-io-cli](https://www.npmjs.com/package/hermes-io-cli#context)
```
hermes-io-cli --root="./src" --context="CounterContext"
```

# useObserver
`hermes-io` provides a `react custom hook` to integrate `Observer` with `Context`, this hook can be used to subscribe listeners and receive `notifications` under cetains contrains provided by the `notification context`, let's analize this in detail.

| key      | value             | required | description                                                                                                                                                     |
|----------|-------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| observer | Observer instance | true     | An instance of the class Observer                                                                                                                               |
| listener | Function          | true     | A standar javascript function                                                                                                                                   |
| contexts | Context[]    | true     | An array of instances of the class Context, when a notification comes and is not signed with any of the contexts in the array the listener never will be called |


```javascript
// ./src/Counter.jsx
export function Counter() {
  const [count, setCount] = useState(0);
  const handleCounterNotification = (event) => {
   // handle notification
  };

  useObserver({
    contexts: [CounterContext],
    observer: CounterObserver,
    listener: handleCounterNotification,
  });

  return <h1>Counter: {count}</h1>;
}
```

### generate hook (optional)
To simply things you can generate the observer file using [hermes-io-cli](https://www.npmjs.com/package/hermes-io-cli#use-observer)
```
hermes-io-cli --root="./src" --hook="useCounter"
```

## Fine grained updates
`hermes-io` allows smart and details updates by taking the responsibility of component's communication, using an observable architecture is an interesting alternative to: `prop drilling`, `Flux Pattern`, `useContext`.

Let's explore this concept by the following example:

```javascript
// ./src/RenderTracker.jsx
function RenderTracker() {
  // track re-renders using the `renderCount` 
  const renderCount = useRef(0);
  renderCount.current++;
  return <h2>Re render tracker: {renderCount.current}</h2>;
}
```

In the following structure when the parent re-renders all the children will re-render as well, if this behaviour is not the desired typically react provides techniques like [memo](https://react.dev/reference/react/memo) to avoid it, let's explore way to achieve the same result:

```javascript
// ./src/App.jsx

function Counter({ count }) {
  return <h1>Count: {count}</h1>;
}

function App() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prevValue) => prevValue + 1);// increment value and update state
  const decrement = () => setCount((prevValue) => prevValue - 1);// decrement value and update state

  return (
    <div>
      <Counter count={count} />
      <RenderTracker />
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```

![unoptimized](https://raw.githubusercontent.com/Maxtermax/hermes-io-counter-demo/master/src/assets/unoptimized.gif)

an alternative could be move the state inside `Counter` and manage it on events changes:

```javascript
// ./src/Counter.jsx
export function Counter() {
  const [count, setCount] = useState(0);
  const handleCounterNotification = (event) => {
    const { value = {} } = event;
    const { type } = value;
    if (type === INCREMENT) setCount((prevValue) => prevValue + 1);
    if (type === DECREMENT) setCount((prevValue) => prevValue - 1);
  };

  useObserver({
    contexts: [CounterContext],
    observer: CounterObserver,
    listener: handleCounterNotification,
  });

  return <h1>Counter: {count}</h1>;
}

```
![optimized](https://raw.githubusercontent.com/Maxtermax/hermes-io-counter-demo/master/src/assets/optimized.gif)

## Notify
Method that sends notifications to the `subscribers` of a specific `observer` signed with a `context` that way we create a `notification context`, let's see this in details:
  
  | key     | value   | required | description                       |
|---------|---------|----------|-----------------------------------|
| value   | any     | true     | Payload with business information |
| context | context | true     | A context instance                |
  

```javascript
// ./src/App.jsx

function App() {
  const increment = () => {
    // notify increment passing the event type: `INCREMENT`
    CounterObserver.notify({
      context: CounterContext, 
      value: {
        type: INCREMENT,
      },
    });
  };

  const decrement = () => {
    CounterObserver.notify({
      context: CounterContext, 
      value: {
        type: DECREMENT,
      },
    });
  };

  return (
    <div>
      <Counter />
      <RenderTracker />
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```
# Demos
- [Counter](https://stackblitz.com/~/github.com/Maxtermax/hermes-io-counter-demo)
 - [Sneaker store](https://sneaker-store-1.vercel.app)

# Tooling

## Hermes-io CLI
This CLI is the official scaffolding generator for [hermes-io](https://www.npmjs.com/package/hermes-io#get-started), its generates a simple folder structure that guaranty separation of concerns encompassing pivotal elements such as: [contexts](https://github.com/Maxtermax/hermes-io#context), [hooks](https://github.com/Maxtermax/hermes-io#useobserver-hook) and [observers](https://github.com/Maxtermax/hermes-io#observer).

```
npm i hermes-io-cli -g
```
[learnmore](https://www.npmjs.com/package/hermes-io-cli)


## Hermes-io Inspector 🔍
Chrome extension that allows inspect and debug in detail events emitted by [hermes-io.js](https://www.npmjs.com/package/hermes-io#get-started) in a friendly UI.
![Demo](https://raw.githubusercontent.com/Maxtermax/hermes-io-devtools/master/demo.gif)

[learnmore](https://chromewebstore.google.com/detail/hermes-io/pjdkgcpikfmkncldipldmimanfkpeedm?hl=en)


If you find me work helpful please consider support me at https://www.buymeacoffee.com/maxtermax, that encourage me to continue working on cool open source projects.
