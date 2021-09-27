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

  
  //! addProduct
  const addProduct = async (productId: number) => {
    try {
      const productInCart = (cart.find(cartProduct => cartProduct.id === productId))
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)

      if (stock.amount === 0) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      if (!productInCart) {
        const {data: product} = await api.get<Product>(`products/${productId}`) 

        if (stock.amount > 0) {
          setCart([...cart, {...product, amount: 1}])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, {...product, amount: 1}]))
          toast.success('Adicionado')
          return
        }
      }

      if (productInCart) {

        if (stock.amount === productInCart.amount) {
          toast.error('Quantidade solicitada fora de estoque');
        }

        if (stock.amount > productInCart.amount) {
          const updatedCart = cart.map(cartProduct => {
            if (cartProduct.id === productId) {
              cartProduct.amount += 1
            }

            return cartProduct
          })

          setCart(updatedCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
          toast.success('Adicionado')
          return
        }
      }
     

    } catch {
      toast.error('Erro na adição do produto');
    }
  };


  //!removeProduct
  const removeProduct = (productId: number) => {
    try {
      const doesProductExist = cart.some(cartProduct => cartProduct.id === productId)
      const updatedCart = cart.filter(cartProduct => cartProduct.id !== productId)

      if (!doesProductExist) {
        toast.error('Erro na remoção do produto')
        return
      }

      if (doesProductExist) {
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }
    

      // TODO: Grab the productId and remove it from the cart
    } catch {
      toast.error('Erro na remoção do produto')
    }
  };


  //!updateProductAmount
  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {






      
      //TODO: Know if it's an incrementation or a decrementation
      //TODO: Check if the product exists in general
      //TODO: Increment only when the product's amount is lower than the stock
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
