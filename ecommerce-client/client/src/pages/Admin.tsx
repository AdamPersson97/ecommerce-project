import { useState, useEffect } from "react";
import "./Admin.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Fel vid hämtning av produkter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      const url = editingProduct
        ? `http://localhost:3000/products/${editingProduct.id}`
        : "http://localhost:3000/products";

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert(editingProduct ? "Produkt uppdaterad!" : "Produkt skapad!");
        setEditingProduct(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          image: "",
        });
        fetchProducts();
      } else {
        alert("Fel vid sparande av produkt");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image,
    });
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna produkt?")) return;

    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Produkt borttagen!");
        fetchProducts();
      } else {
        alert("Fel vid borttagning av produkt");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  if (loading) return <div className="loading">Laddar...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="product-form">
          <h2>{editingProduct ? "Redigera produkt" : "Skapa ny produkt"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Produktnamn:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Beskrivning:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pris (kr):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lager:</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Kategori:</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Bild-URL:</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingProduct ? "Uppdatera" : "Skapa"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    description: "",
                    price: "",
                    stock: "",
                    category: "",
                    image: "",
                  });
                }}
                className="btn btn-secondary"
              >
                Rensa formulär
              </button>
            </div>
          </form>
        </div>

        <div className="products-table">
          <h2>Alla produkter ({products.length})</h2>
          {products.length === 0 ? (
            <p>Inga produkter hittades</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Namn</th>
                  <th>Kategori</th>
                  <th>Pris</th>
                  <th>Lager</th>
                  <th>Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.price.toLocaleString()} kr</td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        onClick={() => editProduct(product)}
                        className="btn btn-small btn-secondary"
                      >
                        Redigera
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="btn btn-small btn-danger"
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
