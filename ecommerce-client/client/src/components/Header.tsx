import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    
    // Lyssna på localStorage ändringar för att uppdatera räknaren
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Lyssna på anpassade events för kundvagnsändringar
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalItems = cart.reduce((total: number, item: any) => total + item.quantity, 0);
    setCartItemCount(totalItems);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>E-Shop</h1>
        </Link>

        <nav className="nav">
          <Link to="/">Hem</Link>
          <Link to="/products">Produkter</Link>
          <Link to="/cart" className="cart-link">
            Kundvagn
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
