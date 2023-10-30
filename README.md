# hermes-io ⚡
A lightweight javascript library that allows communication between components by using the observer pattern and the hook api.

# Summary
- [Installation](#installation)
- [Get started](#get-started)
- [Observer](#observer)
- [Context](#context)
- [useObserver](#useobserver-hook)
- [notify](#notify)
- [CLI](#hermes-io-cli)
- [Devtools](https://github.com/Maxtermax/hermes-io-devtools)
![DevTools](https://raw.githubusercontent.com/Maxtermax/hermes-io-devtools/master/demo.gif)

# Installation
```
npm i hermes-io --save
```

# Get started
`hermes-io` is a set of toolkits that combined allows communication between components let's explore every tool by following the [sneaker store example ](https://sneaker-store-1.vercel.app/) ⭐
[source code](https://github.com/Maxtermax/sneaker-store)

# Observer
`hermes-io` provide an `Observer` class to create instances that can be `subscribable` that means many subscribers can listen for notifications on the instance by using the method `subscribe`, check the following example:

We are exporting an `object` with two instances of the class `Observer` each key of the object has invidual propuses one for handle notifications about `add` a product and the other for `remove` a product.

```javascript
// observers/products.js
import { Observer } from "hermes-io";

export default {
  add: new Observer(),
  remove: new Observer(),
};
```

# Context
`NOTICE` this concept has nothing to do with the `react context api`.

`hermes-io` provide a `Context` class to create instances that can be used to create `notification context` that means that only notification 
submited on on specific context will be listened otherwise will be ignored, you can think on this like a `whitelist` let's analyze the following example:

In our sneaker store we have a `product list` and a `shopping car` the user can `add` a `product` to the `shopping car`
and also can `remove` a `product`, in both cases the one component can talk to the other by using `notifications` 
on one specific observer and update the `ui`, this leads us to any part of the code with access to the observers can trigger `unexpected behaviors`,
there is when the concept of a `context` comes in, the context constrains the observer by telling which `notifications` must listen.

```javascript
import { Context } from 'hermes-io';

export const products = new Context('Product');
export const shoppingCar = new Context('ShoppingCar');
```
 

```javascript
const sneakerList = [
  {
    id: '1',
    name: 'Jordan',
    image: '/assets/images/jordan_3.webp',
    description: 'Air Jordan 3 Retro OG',
    price: '250'
  },
  {
    id: '2',
    image: '/assets/images/addidas.webp',
    description: 'Bad Bunny Forum Buckle Low sneakers',
    name: 'Adidas Forum',
    price: '200'
  }
]

const productsStore = new Map();
productsStore.set('collection', sneakerList); 
```

# useObserver (hook)
`hermes-io` provide a `react custom hook` to integrate `Observer` with `Context`, this hook can be used to subscribe listeners and receive `notifications` under cetains contrains provided by the `notification context`, let's analize this in detail.

| key      | value             | required | description                                                                                                                                                     |
|----------|-------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| observer | Observer instance | true     | An instance of the class Observer                                                                                                                               |
| listener | Function          | true     | A standar javascript function                                                                                                                                   |
| contexts | Context[]    | true     | An array of instances of the class Context, when a notification comes and is not signed with any of the contexts in the array the listener never will be called |


```javascript
 import { useObserver } from "hermes-io";
  
 useObserver({
   observer: ProductsObservers.add,
   listener: handleAddProduct,
   contexts: [contexts.products],
 });
```

```javascript
import React, { useState } from "react";
import Products from "./components/Products/Products"
import ShoppingCar from "./components/ShoppingCar/ShoppingCar";
import { useObserver } from "hermes-io";
import ProductsObservers from './observers/products';
import theme from '@theme';
import * as contexts from './contexts';

const filterSelectes = (collection) => collection.filter((item) => item.selected); //filter selectes products

function App() {
  const [products, setProducts] = useState(ProductsStore.get('collection'));
  
  const handleRemoveProduct = ({ value: product = {} }) => {
    product.selected = false;
    setProducts([...ProductsStore.get('collection')]);
  };
  
  const handleAddProduct = ({ value: product = {} }) => {
    product.selected = true;
    setProducts([...ProductsStore.get('collection')]);
  };
  
  useObserver({
    observer: ProductsObservers.add,
    listener: handleAddProduct,
    contexts: [contexts.products],
  });
  
  useObserver({
    observer: ProductsObservers.remove,
    listener: handleRemoveProduct,
    contexts: [contexts.shoppingCar, contexts.products],
  });

  return (
    <>
      <ShoppingCar data={filterSelectes(products)} />
      <Products data={products} />
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
// ShoppingCar.js
import ProductsObservers from './observers/products';
import * as contexts from '../contexts';

export const ShoppingCar = (props = {}) => {
  const handleRemoveProduct = (product = {}) => {
    ProductsObservers.remove.notify({ value: product, context: contexts.shoppingCar });
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
import ProductsObservers from './observers/products';
import * as contexts from '../contexts';

export const Products = (props = {}) => {
  const { data = [] } = props; 
  
  const handleAddProduct = (product = {}) => {
    ProductsObservers.add.notify({ value: product, context: contexts.products });
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
Check the documentation: [here](https://www.npmjs.com/package/hermes-io-cli)

If you find me work helpful please consider support me at https://www.buymeacoffee.com/maxtermax, that encourage me to continue working on cool open source projects.
