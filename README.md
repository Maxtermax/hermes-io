# hermes-io
A lightweight javascript library that allows communication between Reactjs components by using the observer pattern and the hook api.

# Installation
```
npm i hermes-io --save
```

# Get started
In order to use `hermes-io` you need to create a react project by using something like [Create-react-app](https://create-react-app.dev/), hermes-io is Reactjs hook that communication between components,
let's see it in action, follow the next example:

```javascript
// observers.js
export const AddProductObserver = new Observer();
export const RemoveProductObserver = new Observer();


// App.js
import { useState } from 'react';
import { useObserver, Observer } from 'hermes-io';
import { RemoveProductObserver, AddProductObserver } from './observers';
import { Products } from './components/Products';
import { ShoppingCar } from './components/ShoppingCar';

export const App = (props = {}) => {
  const [productsToBy, setProductsToBy] = useState([]);
  const productsStore = useProductStore(); // get products from some store
  const products = productsStore.get();
  
  const handleRemoveProduct = (product = {}) => {
    const newProducts = [...productsToBy].filter(({ id = '' }) => id !== product.id);
    setProductsToBy(newProducts);
     productsStore.remove(product);
  };
  
  const handleAddProduct = (product = {}) => {
    setProductsToBy([...productsToBy, product]);
    productsStore.update(product, { selected: true });  
  };
  
  useObserver({
    observer: AddProductObserver,
    listener: handleAddProduct,
    from: ['products-list'],
  });
  
  useObserver({
    observer: RemoveProductObserver,
    listener: handleRemoveProduct,
    from: ['shopping-car'],
  });
  
  return <div>
    <Products data={products} />
    <ShoppingCar data={productsToBy}/>
  </div>
};


// ShoppingCar.js
import { RemoveProductObserver } from '../observers';

export const ShoppingCar = (props = {}) => {
  const handleRemoveProduct = (product = {}) => {
    RemoveProductObserver.notify({ value: product, from 'shopping-car' });
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

// Products.js
import { AddProductObserver } from '../observers';

export const Products = (props = {}) => {
  const { data = [] } = props; 
  
  const handleAddProduct = (product = {}) => {
    AddProductObserver.notify({ value: product, from 'products-list' });
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




