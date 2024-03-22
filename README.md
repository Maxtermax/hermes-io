# hermes-io
A lightweight React library that allows communication between components by using the observer pattern and the hook api.

## Usage
```javascript
function App({ notify }) {
  const increment = () => {
    notify({
      value: {
        type: INCREMENT,
      },
    });
  };

  const decrement = () => {
    notify({
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
};
export default withNotify(App, {
	context: CounterContext,
	observer: CounterObserver
});
```

```javascript
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
<img src="https://raw.githubusercontent.com/Maxtermax/hermes-io-counter-demo/master/src/assets/optimized.gif" />

## Documentation
See: https://hermes-io-docs.vercel.app/


## Devtool

Install from chrome web store [here](https://chrome.google.com/webstore/detail/hermes-io/pjdkgcpikfmkncldipldmimanfkpeedm?hl=en)

![chrome extension](https://raw.githubusercontent.com/Maxtermax/hermes-io-devtools/master/demo.gif)
