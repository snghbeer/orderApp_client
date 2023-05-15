import { createContext } from "react";
import CartController from '../interfaces/controllers/CartController'

interface CartContextProps{
    updated: boolean,
    cart?: CartController,
    setUpdated?: () => void
}

const CartContext = createContext<CartContextProps>({
    updated: false,
});

export default CartContext;