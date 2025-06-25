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

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  street_address: string;
  postal_code: string;
  city: string;
  country: string;
  created_at: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

interface Order {
  id: number;
  customer_id: number;
  total_price: number;
  payment_status: string;
  payment_id: string;
  order_status: string;
  created_at: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  customer_street_address: string;
  customer_postal_code: string;
  customer_city: string;
  customer_country: string;
  customers_created_at: string;
  order_items: OrderItem[];
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });
  const [customerFormData, setCustomerFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    street_address: "",
    postal_code: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
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

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:3000/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Fel vid hämtning av kunder:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3000/orders");
      if (response.ok) {
        const data = await response.json();
        console.log("Orders data:", data); // Debug log
        setOrders(data);
      }
    } catch (error) {
      console.error("Fel vid hämtning av ordrar:", error);
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

  const handleCustomerInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomerFormData({
      ...customerFormData,
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

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCustomer
        ? `http://localhost:3000/customers/${editingCustomer.id}`
        : "http://localhost:3000/customers";

      const method = editingCustomer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerFormData),
      });

      if (response.ok) {
        alert(editingCustomer ? "Kund uppdaterad!" : "Kund skapad!");
        setEditingCustomer(null);
        setCustomerFormData({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          street_address: "",
          postal_code: "",
          city: "",
          country: "",
        });
        fetchCustomers();
      } else {
        alert("Fel vid sparande av kund");
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

    // Scrolla till produktformulär
    setTimeout(() => {
      const productForm = document.querySelector(".product-form");
      if (productForm) {
        productForm.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const editCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerFormData({
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phone: customer.phone,
      street_address: customer.street_address,
      postal_code: customer.postal_code,
      city: customer.city,
      country: customer.country,
    });

    // Scrolla till kundformulär
    setTimeout(() => {
      const customerForm = document.querySelector(".customer-form");
      if (customerForm) {
        customerForm.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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

  const deleteCustomer = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna kund?")) return;

    try {
      const response = await fetch(`http://localhost:3000/customers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Kund borttagen!");
        fetchCustomers();
      } else {
        alert("Fel vid borttagning av kund");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (response.ok) {
        alert("Orderstatus uppdaterad!");
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          const updatedOrder = { ...selectedOrder, order_status: newStatus };
          setSelectedOrder(updatedOrder);
        }
      } else {
        alert("Fel vid uppdatering av orderstatus");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna order?")) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Order borttagen!");
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(null);
        }
      } else {
        alert("Fel vid borttagning av order");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  const updateOrderItemQuantity = async (
    orderItemId: number,
    newQuantity: number
  ) => {
    if (newQuantity === 0) {
      deleteOrderItem(orderItemId);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/order-items/${orderItemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (response.ok) {
        alert("Orderitem uppdaterad!");
        fetchOrders();
        if (selectedOrder) {
          const response = await fetch(
            `http://localhost:3000/orders/${selectedOrder.id}`
          );
          if (response.ok) {
            const updatedOrder = await response.json();
            setSelectedOrder(updatedOrder);
          }
        }
      } else {
        alert("Fel vid uppdatering av orderitem");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  const deleteOrderItem = async (orderItemId: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna orderitem?")) return;

    try {
      const response = await fetch(
        `http://localhost:3000/order-items/${orderItemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Orderitem borttagen!");
        fetchOrders();
        if (selectedOrder) {
          const response = await fetch(
            `http://localhost:3000/orders/${selectedOrder.id}`
          );
          if (response.ok) {
            const updatedOrder = await response.json();
            setSelectedOrder(updatedOrder);
          }
        }
      } else {
        alert("Fel vid borttagning av orderitem");
      }
    } catch (error) {
      alert("Fel vid anslutning till API");
    }
  };

  const viewOrderDetails = async (order: Order) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${order.id}`);
      if (response.ok) {
        const orderWithItems = await response.json();
        setSelectedOrder(orderWithItems);
      }
    } catch (error) {
      console.error("Fel vid hämtning av orderdetaljer:", error);
    }
  };

  if (loading) return <div className="loading">Laddar...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Admin Panel</h1>

        {/* Kundhantering Sektion */}
        <div className="admin-section">
          <h2>Kundhantering</h2>

          {/* Kundformulär */}
          <div className="customer-form">
            <h3>{editingCustomer ? "Redigera kund" : "Skapa ny kund"}</h3>
            <form onSubmit={handleCustomerSubmit}>
              <div className="form-group">
                <label>Förnamn:</label>
                <input
                  type="text"
                  name="firstname"
                  value={customerFormData.firstname}
                  onChange={handleCustomerInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Efternamn:</label>
                <input
                  type="text"
                  name="lastname"
                  value={customerFormData.lastname}
                  onChange={handleCustomerInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={customerFormData.email}
                  onChange={handleCustomerInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefon:</label>
                <input
                  type="text"
                  name="phone"
                  value={customerFormData.phone}
                  onChange={handleCustomerInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gatuadress:</label>
                <input
                  type="text"
                  name="street_address"
                  value={customerFormData.street_address}
                  onChange={handleCustomerInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postnummer:</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={customerFormData.postal_code}
                    onChange={handleCustomerInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stad:</label>
                  <input
                    type="text"
                    name="city"
                    value={customerFormData.city}
                    onChange={handleCustomerInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Land:</label>
                <input
                  type="text"
                  name="country"
                  value={customerFormData.country}
                  onChange={handleCustomerInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? "Uppdatera" : "Skapa"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomer(null);
                    setCustomerFormData({
                      firstname: "",
                      lastname: "",
                      email: "",
                      phone: "",
                      street_address: "",
                      postal_code: "",
                      city: "",
                      country: "",
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Rensa formulär
                </button>
              </div>
            </form>
          </div>

          {/* Kundtabell */}
          <div className="customers-table">
            <h2>Alla kunder ({customers.length})</h2>
            {customers.length === 0 ? (
              <p>Inga kunder hittades</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Förnamn</th>
                    <th>Efternamn</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.firstname}</td>
                      <td>{customer.lastname}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <button
                          onClick={() => editCustomer(customer)}
                          className="btn btn-small btn-secondary"
                        >
                          Redigera
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
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

        {/* Produkthantering Sektion */}
        <div className="admin-section">
          <h2>Produkthantering</h2>
        </div>

        <div className="product-form">
          <h3>{editingProduct ? "Redigera produkt" : "Skapa ny produkt"}</h3>
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

        {/* Orderhantering Sektion */}
        <div className="admin-section">
          <h2>Orderhantering</h2>

          {/* Ordertabell */}
          <div className="orders-table">
            <h3>Alla ordrar ({orders.length})</h3>
            {orders.length === 0 ? (
              <p>Inga ordrar hittades</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Kund</th>
                    <th>Email</th>
                    <th>Totalt</th>
                    <th>Betalstatus</th>
                    <th>Orderstatus</th>
                    <th>Datum</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.customer_firstname && order.customer_lastname
                          ? `${order.customer_firstname} ${order.customer_lastname}`
                          : "Kunddata saknas"}
                      </td>
                      <td>{order.customer_email || "Email saknas"}</td>
                      <td>{order.total_price.toLocaleString()} kr</td>
                      <td>
                        <span
                          className={`status ${order.payment_status.toLowerCase()}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.order_status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString("sv-SE")}
                      </td>
                      <td>
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="btn btn-small btn-primary"
                        >
                          Detaljer
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
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

          {/* Orderdetaljer */}
          {selectedOrder && (
            <div className="order-details">
              <h3>Orderdetaljer - Order #{selectedOrder.id}</h3>

              <div className="order-info-grid">
                <div className="customer-info">
                  <h4>Kundinformation</h4>
                  <p>
                    <strong>Namn:</strong> {selectedOrder.customer_firstname}{" "}
                    {selectedOrder.customer_lastname}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.customer_email}
                  </p>
                  <p>
                    <strong>Telefon:</strong> {selectedOrder.customer_phone}
                  </p>
                  <p>
                    <strong>Adress:</strong>{" "}
                    {selectedOrder.customer_street_address}
                  </p>
                  <p>
                    <strong>Ort:</strong> {selectedOrder.customer_postal_code}{" "}
                    {selectedOrder.customer_city}
                  </p>
                  <p>
                    <strong>Land:</strong> {selectedOrder.customer_country}
                  </p>
                </div>

                <div className="order-summary">
                  <h4>Ordersammanfattning</h4>
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder.id}
                  </p>
                  <p>
                    <strong>Totalt:</strong>{" "}
                    {selectedOrder.total_price.toLocaleString()} kr
                  </p>
                  <p>
                    <strong>Betalstatus:</strong>{" "}
                    <span
                      className={`status ${selectedOrder.payment_status.toLowerCase()}`}
                    >
                      {selectedOrder.payment_status}
                    </span>
                  </p>
                  <p>
                    <strong>Orderstatus:</strong>{" "}
                    <span
                      className={`status ${selectedOrder.order_status.toLowerCase()}`}
                    >
                      {selectedOrder.order_status}
                    </span>
                  </p>
                  <p>
                    <strong>Datum:</strong>{" "}
                    {new Date(selectedOrder.created_at).toLocaleDateString(
                      "sv-SE"
                    )}
                  </p>
                  <p>
                    <strong>Betalnings ID:</strong> {selectedOrder.payment_id}
                  </p>
                </div>
              </div>

              <div className="order-items">
                <h4>Orderrader</h4>
                {selectedOrder.order_items &&
                selectedOrder.order_items.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Produkt</th>
                        <th>Enhetspris</th>
                        <th>Antal</th>
                        <th>Totalt</th>
                        <th>Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.unit_price.toLocaleString()} kr</td>
                          <td>
                            <div className="quantity-controls">
                              <button
                                onClick={() =>
                                  updateOrderItemQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="quantity-btn"
                              >
                                -
                              </button>
                              <span className="quantity">{item.quantity}</span>
                              <button
                                onClick={() =>
                                  updateOrderItemQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="quantity-btn"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            {(item.unit_price * item.quantity).toLocaleString()}{" "}
                            kr
                          </td>
                          <td>
                            <button
                              onClick={() => deleteOrderItem(item.id)}
                              className="btn btn-small btn-danger"
                            >
                              Ta bort
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Inga orderrader hittades</p>
                )}
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-secondary"
              >
                Stäng detaljer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
