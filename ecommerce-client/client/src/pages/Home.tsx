import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Välkommen till E-Shop</h1>
          <Link to="/products" className="cta-button">
            Se alla produkter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
