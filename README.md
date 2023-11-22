# hermes-io ⚡
A lightweight javascript library that allows communication between components by using the observer pattern and the hook api.

# Summary
- [Installation](#installation)
- [Get started](#get-started)
- [Observer](#observer)
- [Context](#context)
- [useObserver](#useobserver-hook)
- [notify](#notify)
- [Hermes-io CLI](#hermes-io-cli)
- [Hermes-io inspector - Chrome extension](https://github.com/Maxtermax/hermes-io-devtools)
  
![DevTools](https://raw.githubusercontent.com/Maxtermax/hermes-io-devtools/master/demo.gif)

# Installation
```
npm i hermes-io --save
```

# Get started
`hermes-io` is a set of toolkits that combined allows communication between components let's explore every tool by following the [sneaker store demo](https://sneaker-store-1.vercel.app/) - 

# Observer
`hermes-io` provides an `Observer` class to create instances that can be `subscribable` that means many subscribers can listen for notifications on the instance by using the method `subscribe`, check the following example:

We are exporting an instance of the class `Observer` called `ProductsObserver` the propuses of this observer is handle notifications for `add` a product and `remove` a product.

```javascript
// observers/products.js
import { Observer } from "hermes-io";
 
export const ProductsObserver = new Observer();
```

# Context
`NOTICE` this concept has nothing to do with the `react context api`.

`hermes-io` provides a `Context` class to create instances that can be used to create `notification context` that means that only notification 
submited on a specific context will be listened otherwise will be ignored, you can think on this like a `whitelist` let's analyze the following example:

In our sneaker store we have a `product list` and a `shopping cart` the user can `add` a `product` to the `shopping cart`
and also can `remove` a `product`, in both cases one component can talk to the other by using `notifications` 
on one specific observer and update the `ui`, this leads us to any part of the code with access to the observers can trigger `unexpected behaviors`,
there is when the concept of a `context` comes in, the context constrains the observer by telling which `notifications` must listen.

```javascript
import { Context } from 'hermes-io';
export const ProductsContext = new Context('ProductsContext');
```

# useObserver
`hermes-io` provides a `react custom hook` to integrate `Observer` with `Context`, this hook can be used to subscribe listeners and receive `notifications` under cetains contrains provided by the `notification context`, let's analize this in detail.

| key      | value             | required | description                                                                                                                                                     |
|----------|-------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| observer | Observer instance | true     | An instance of the class Observer                                                                                                                               |
| listener | Function          | true     | A standar javascript function                                                                                                                                   |
| contexts | Context[]    | true     | An array of instances of the class Context, when a notification comes and is not signed with any of the contexts in the array the listener never will be called |


```javascript
import { useObserver } from 'hermes-io'
 
export const useProducts = () => {
  const [products, setProducts] = useState([]);

  const addProduct = (newProduct) => setProducts((prevValue) => [...prevValue, newProduct]);
  const removeProduct = (product) => setProducts((prevValue) => prevValue.filter(({ id }) => id !== product.id));

  const handleProductsNotification = (event) => {
    const { value = {} } = event;
    const { type, payload } = value;
    if (type === ADD_PRODUCT) addProduct(payload); // update state and add a product
    if (type === REMOVE_PRODUCT) removeProduct(payload); // update state and remove a product
  };
  
  useObserver({
    contexts: [ProductsContext],
    observer: ProductsObserver,
    listener: handleProductsNotification,
  });

  return products;
}
```

```javascript
function App() {
  const products = useProducts();
  return (
    <>
      <ShoppingCart data={products} />
      <Products />
    </>
  );
}

export default App;

```
# Notify
Is a method that allows sending notifications to the `subscribers` of a specific `observer` signed with a `context` that way we create a `notification context`, let's see this in details:
  
  | key     | value   | required | description                       |
|---------|---------|----------|-----------------------------------|
| value   | any     | true     | Payload with business information |
| context | context | true     | A context instance                |
  

```javascript
// ShoppingCart.js

export const ShoppingCar = (props) => {
  const { data = [] } = props;

  const handleRemoveProduct = (product) => {
    ProductsObservers.notify({ value: { type: REMOVE_PRODUCT, payload: product }, context: ProductsContext });
  };

  return <div>
    <ul>
       {
         data.map((product = {}) =>
           <li key={product.id}>
              <span>{product.name}</<span>
              <p>{product.description}</p>
              <small>${product.price}</<small>
              <button onClick={() => handleRemoveProduct(product)}>Remove</<button>
           </li>
         ))
       }
    </ul>
  </div>
};
```
```javascript
// Products.js
export const Products = () => {
  const { data = [] } = useStore(); 
  
  const handleAddProduct = (product) => {
    ProductsObservers.notify({ value: { type: ADD_PRODUCT, payload: product }, context: ProductsContext });
  };
  
  return <ul>
     {
       data.map((product = {}) =>
         <li key={product.id}>
            <span>{product.name}</<span>
            <p>{product.description}</p>
            <small>${product.price}</<small>
            <button disabled={product.selected} onClick={() => handleAddProduct(product)}>Add to car</<button>
         </li>
       ))
     }
  </ul>
};
```

# Hermes-io CLI
This CLI is the official scaffolding generator for [hermes-io](https://www.npmjs.com/package/hermes-io#get-started), its generates a simple folder structure that guaranty separation of concerns encompassing pivotal elements such as: [contexts](https://github.com/Maxtermax/hermes-io#context), [hooks](https://github.com/Maxtermax/hermes-io#useobserver-hook) and [observers](https://github.com/Maxtermax/hermes-io#observer).

```
npm i hermes-io-cli -g
```
[learnmore](https://www.npmjs.com/package/hermes-io-cli)

If you find me work helpful please consider support me at https://www.buymeacoffee.com/maxtermax, that encourage me to continue working on cool open source projects.
