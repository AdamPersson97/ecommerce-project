import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Products.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError("Kunde inte hämta produkter");
      }
    } catch (err) {
      setError("Fel vid anslutning till API");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    // Enkel localStorage implementation för kundvagn
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Skicka event för att uppdatera header
    window.dispatchEvent(new Event('cartUpdated'));
    
    alert(`${product.name} tillagd i kundvagnen!`);
  };

  if (loading) return <div className="loading">Laddar produkter...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-page">
      <h1>Alla Produkter</h1>
      <div className="container">
        {products.length === 0 ? (
          <div className="no-products">
            <p>Inga produkter hittades</p>
            <p>Testa att köra test-scriptet för att lägga till produkter!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.image || "/api/placeholder/300/200"}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x200?text=Ingen+Bild";
                    }}
                  />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <p className="description">{product.description}</p>
                  <div className="product-bottom">
                    <span className="price">
                      {product.price.toLocaleString()} kr
                    </span>
                    <span className="stock">Lager: {product.stock}</span>
                  </div>

                  <div className="product-actions">
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-secondary"
                    >
                      Visa detaljer
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary"
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Slut i lager" : "Lägg i kundvagn"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
