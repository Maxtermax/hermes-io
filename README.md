# hermes-io
A lightweight React library that allows communication between components by using the observer pattern and the hook api.

## Usage
```javascript
import { MicroStore } from "hermes-io";

export const store = new MicroStore();
export const storeId = 'counter-id';
```

```javascript
const actions = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT"
};

export default function reducer(store, action) {
  switch (action.payload.type) {
    case actions.INCREMENT:
      store.state.count += 1;
      break;
    case actions.DECREMENT:
      store.state.count -= 1;
      break;
    default:
      throw new Error(`Unknown action type: ${action.payload.type}`);
  }
  return store.state;
}
```

```javascript
import { useObservableStore } from "hermes-io";
import { store, storeId } from "@/store";
import { reducer } from "@/reducer";

export default function App() {
  useObservableStore(storeId, { count: 0 }, reducer, store);

  const increment = () => store.mutate({ type: events.INCREMENT });

  const decrement = () => store.mutate({ type: events.DECREMENT });

  return (
    <div>
      <Counter />
      <RenderTracker />
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};
```

```javascript
import { useMutations } from "hermes-io";
import { store, storeId } from "@/store";
import { actions } from "@/reducer";

export function Counter() {
  const { state, onEvent } = useMutations({
    initialState: { count: 0 },
    id: storeId,
    store,
  });
  onEvent(actions.INCREMENT, () => ({ count: state.count });
  onEvent(actions.DECREMENT, () => ({ count: state.count });

  return <h1>Counter: {state.count}</h1>;
}
```
<img src="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*VhOkr1735qdrHHyuJszqvQ.gif" />

## Documentation
See: https://hermes-io-docs.vercel.app/


## Devtool

Install from chrome web store [here](https://chrome.google.com/webstore/detail/hermes-io/pjdkgcpikfmkncldipldmimanfkpeedm?hl=en)

![chrome extension](https://raw.githubusercontent.com/Maxtermax/hermes-io-devtools/master/demo.gif)
