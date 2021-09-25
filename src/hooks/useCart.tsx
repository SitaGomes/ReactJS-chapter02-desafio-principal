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

      const {data: product} = await api.get<Product>(`products/${productId}`) 
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)
      
      const isProductAlreadyInCart = cart.find(product => product.id === productId)

      if (stock.amount === 0) toast.error('Quantidade solicitada fora de estoque');

      if (stock.amount !== 0) {

        if (isProductAlreadyInCart) {
          const updateProductAmount: Product[] = cart.map(product => {
            if (product.id === productId) {
              product.amount += 1
            }
  
            return product
          })
  
          setCart(updateProductAmount)
        }

        //! Section Separator
        
        if (!isProductAlreadyInCart) {
  
          const setNewProduct: Product = {
            amount: stock.amount,
            id: product.id,
            image: product.image,
            price: product.price,
            title: product.title,
          }
    
          setCart([...cart, setNewProduct])
        }  

      }

     

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      // TODO
    } catch {
      toast.error('Erro na adição do produto');
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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
