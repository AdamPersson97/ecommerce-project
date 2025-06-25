import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Din Kundvagn</h1>
          <div className="empty-cart">
            <p>Din kundvagn är tom</p>
            <Link to="/products" className="btn btn-primary">
              Börja handla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Din Kundvagn ({getTotalItems()} varor)</h1>
      <div className="container">
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/100x100?text=Ingen+Bild"
                    }
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/100x100?text=Ingen+Bild";
                    }}
                  />
                </div>

                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price.toLocaleString()} kr</p>
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} kr
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="remove-btn"
                >
                  Ta bort
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Ordersammanfattning</h2>
            <div className="summary-line">
              <span>Varor ({getTotalItems()} st):</span>
              <span>{getTotalPrice().toLocaleString()} kr</span>
            </div>
            <div className="summary-line">
              <span>Frakt:</span>
              <span>Gratis</span>
            </div>
            <div className="summary-line total">
              <span>Totalt:</span>
              <span>{getTotalPrice().toLocaleString()} kr</span>
            </div>

            <div className="cart-actions">
              <button onClick={clearCart} className="btn btn-secondary">
                Töm kundvagn
              </button>
              <button className="btn btn-primary checkout-btn">
                Gå till kassan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
