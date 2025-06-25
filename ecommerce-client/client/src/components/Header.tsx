import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>E-Shop</h1>
        </Link>

        <nav className="nav">
          <Link to="/">Hem</Link>
          <Link to="/products">Produkter</Link>
          <Link to="/cart">Kundvagn</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
