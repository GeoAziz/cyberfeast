'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.name); 
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.name
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, id: action.payload.name, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };
    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
      };
    case 'CLEAR_CART':
        return {
            ...state,
            items: [],
            isCartOpen: false,
        }
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const initialState: CartState = {
    items: [],
    isCartOpen: false,
  };
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  const { state, dispatch } = context;
  const { toast } = useToast();

  const addItem = (item: Omit<CartItem, 'quantity' | 'id'> & {name: string}) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id: item.name } });
    toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart.`,
    });
  };
  
  const clearCart = () => {
      dispatch({ type: 'CLEAR_CART' });
  }

  return { 
    ...state, 
    dispatch, 
    addItem,
    clearCart,
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' })
  };
};
