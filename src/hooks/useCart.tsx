import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);


export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
       return JSON.parse(storagedCart);
    }

    return [];
  });


  const addProduct = async (productId: number) => {
    try {
      const isProductInCart = (cart.find(product => product.id === productId))
      const {data: product} = await api.get<Product>(`products/${productId}`) 
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)
      

      if (!isProductInCart) {

        if (stock.amount <= 0) {
          toast.error('Quantidade solicitada fora de estoque')
        }

        if (stock.amount > 0) {
          setCart([...cart, {...product, amount: 1}])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, {...product, amount: 1}]))
        }

        //TODO: verify the amount in stock, and add a new product
      }



      if (isProductInCart) {
        
        if (stock.amount <= 0) {
          toast.error('Quantidade solicitada fora de estoque')
        }

        if (stock.amount > 0) {
          const updatedCart = cart.map(product => {
            if (product.id === productId) {
              product.amount += 1
            }

            return product
          })

          setCart(updatedCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        }

        //TODO: if there is more than 1 in stock, increment the product's amount
      }
     

    } catch {
      toast.error('Erro na adição do produto');
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.filter(product => product.id !== productId)

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    

      // TODO: Grab the productId and remove it from the cart
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)

      

      //?Adding the product's amount
      if (amount > 0) {


        const newCart = cart.map(product => {

          if(product.amount >= stock.amount || stock.amount === 0) {
            toast.error('Erro na remoção do produto');
            return product
          }

          if (product.amount < stock.amount) {
            if (product.id === productId) {
  
              product.amount = product.amount + 1
  
            }
          }

          return product
        })
       
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))

      }

      //?Reducing the product's amount
      if (amount < 0) {
        const newCart = cart.map(product => {
          if (product.amount > 0) {
            if (product.id === productId) {
  
              product.amount = product.amount - 1
  
            }
          }
  
          return product
        })

        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))

      }


      // TODO: update the internal product's amount, and exit if not enough in stock
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
