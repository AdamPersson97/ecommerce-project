import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductDetail.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/products/${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setError("Produkt hittades inte");
      }
    } catch (err) {
      setError("Fel vid anslutning till API");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${quantity} st ${product.name} tillagd i kundvagnen!`);
  };

  if (loading) return <div className="loading">Laddar produkt...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Produkt hittades inte</div>;

  return (
    <div className="product-detail">
      <div className="container">
        <Link to="/products" className="back-link">
          ← Tillbaka till produkter
        </Link>

        <div className="product-detail-content">
          <div className="product-image">
            <img
              src={
                product.image ||
                "https://via.placeholder.com/500x400?text=Ingen+Bild"
              }
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/500x400?text=Ingen+Bild";
              }}
            />
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="category">{product.category}</p>
            <p className="description">{product.description}</p>

            <div className="price-stock">
              <span className="price">{product.price.toLocaleString()} kr</span>
              <span className="stock">
                {product.stock > 0
                  ? `${product.stock} st i lager`
                  : "Slut i lager"}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Antal:</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from(
                      { length: Math.min(product.stock, 10) },
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <button onClick={addToCart} className="add-to-cart-btn">
                  Lägg i kundvagn
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
