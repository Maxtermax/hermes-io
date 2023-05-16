# hermes-io ⚡ 
A lightweight javascript library that allows communication between components by using the observer pattern and the hook api. 

## Usage: 
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
## Chrome extension
Install from chrome web store [here](https://chrome.google.com/webstore/detail/hermes-io/pjdkgcpikfmkncldipldmimanfkpeedm?hl=en)

![chrome extension](https://raw.githubusercontent.com/Maxtermax/hermes-io-devtools/master/demo.gif) 
 
## Documentation: 
https://github.com/Maxtermax/hermes-io#readme

## Contributing: 
Feel free to open a PR explaining your changes, this library is open to suggestions and improvements.

https://github.com/Maxtermax/hermes-io
