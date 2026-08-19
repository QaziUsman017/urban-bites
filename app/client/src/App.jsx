import { useState } from 'react'
import Admin from './Admin'
import './App.css'

const API_URL = 'https://urban-bites-production.up.railway.app/api'

const menuItems = [
  {
    id: 1,
    name: 'Classic Burger',
    description: 'Juicy beef patty, melted cheese, lettuce & signature sauce',
    price: 599,
    category: 'Burgers',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    badge: 'BESTSELLER',
  },
  {
    id: 2,
    name: 'Cheese Pizza',
    description: 'Mozzarella, rich tomato sauce, herbs & crispy crust',
    price: 899,
    category: 'Pizza',
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85',
    badge: 'POPULAR',
  },
  {
    id: 3,
    name: 'Crispy Chicken',
    description: 'Golden crispy chicken with our signature special sauce',
    price: 699,
    category: 'Chicken',
    image:
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85',
    badge: 'HOT',
  },
  {
    id: 4,
    name: 'Loaded Fries',
    description: 'Crispy fries, creamy cheese sauce & special seasoning',
    price: 399,
    category: 'Fries',
    image:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
    badge: 'NEW',
  },
  {
    id: 5,
    name: 'Chicken Wrap',
    description: 'Grilled chicken, fresh vegetables & creamy garlic sauce',
    price: 549,
    category: 'Chicken',
    image:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85',
    badge: 'POPULAR',
  },
  {
    id: 6,
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemons, ice & refreshing citrus flavour',
    price: 249,
    category: 'Drinks',
    image:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=85',
    badge: 'FRESH',
  },
]

const categories = [
  { name: 'All', icon: 'ALL' },
  { name: 'Burgers', icon: 'BG' },
  { name: 'Pizza', icon: 'PZ' },
  { name: 'Chicken', icon: 'CK' },
  { name: 'Fries', icon: 'FR' },
  { name: 'Drinks', icon: 'DR' },
]

function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [lastOrder, setLastOrder] = useState(null)

  const [trackingOpen, setTrackingOpen] = useState(false)
  const [trackingId, setTrackingId] = useState('')
  const [trackedOrder, setTrackedOrder] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState('')

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  })

  const isAdmin = window.location.pathname === '/admin'

  if (isAdmin) {
    return <Admin />
  }

  const filteredItems = menuItems.filter((item) => {
    const text = search.trim().toLowerCase()

    const matchesSearch =
      !text ||
      item.name.toLowerCase().includes(text) ||
      item.description.toLowerCase().includes(text) ||
      item.category.toLowerCase().includes(text)

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const addToCart = (item) => {
    setCart((current) => {
      const exists = current.find((x) => x.id === item.id)

      if (exists) {
        return current.map((x) =>
          x.id === item.id
            ? { ...x, quantity: x.quantity + 1 }
            : x
        )
      }

      return [...current, { ...item, quantity: 1 }]
    })
  }

  const increaseQuantity = (id) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQuantity = (id) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const deliveryFee = cart.length ? (cartTotal >= 2000 ? 0 : 150) : 0
  const grandTotal = cartTotal + deliveryFee

  const handleCustomerChange = (event) => {
    const { name, value } = event.target

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCheckout = async (event) => {
    event.preventDefault()

    if (placingOrder) return

    const name = customer.name.trim()
    const phone = customer.phone.trim()
    const address = customer.address.trim()

    if (!name || !phone || !address) {
      alert('Please fill in all fields.')
      return
    }

    if (phone.length < 10) {
      alert('Please enter a valid phone number.')
      return
    }

    if (!cart.length) {
      alert('Your cart is empty.')
      return
    }

    setPlacingOrder(true)

    try {
      const orderData = {
        customer: {
          name,
          phone,
          address,
        },
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        })),
        subtotal: cartTotal,
        deliveryFee,
        total: grandTotal,
        status: 'Pending',
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to place order.'
        )
      }

      if (!data.order) {
        throw new Error('Order was not returned by server.')
      }

      setLastOrder(data.order)
      setCheckoutOpen(false)
      setOrderPlaced(true)
    } catch (error) {
      console.error(error)
      alert(`Order failed: ${error.message}`)
    } finally {
      setPlacingOrder(false)
    }
  }

  const openTracking = () => {
    setTrackingOpen(true)
    setTrackingError('')
    setTrackedOrder(null)
    setOrderPlaced(false)
  }

  const closeTracking = () => {
    setTrackingOpen(false)
    setTrackingError('')
    setTrackedOrder(null)
    setTrackingId('')
  }

  const trackOrder = async (event) => {
    event.preventDefault()

    const id = trackingId.trim()

    if (!id) {
      setTrackingError('Please enter your Order ID.')
      return
    }

    setTrackingLoading(true)
    setTrackingError('')
    setTrackedOrder(null)

    try {
      const response = await fetch(
        `${API_URL}/orders/${encodeURIComponent(id)}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Order not found.'
        )
      }

      if (!data.order) {
        throw new Error('Order not found.')
      }

      setTrackedOrder(data.order)
    } catch (error) {
      console.error(error)

      setTrackingError(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to Urban Bites server.'
          : error.message
      )
    } finally {
      setTrackingLoading(false)
    }
  }

  const finishOrder = () => {
    setOrderPlaced(false)
    setCart([])
    setCustomer({
      name: '',
      phone: '',
      address: '',
    })
  }

  const scrollToMenu = () => {
    document
      .getElementById('menu')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">

      <div className="announcement">
        <span>FREE DELIVERY</span>
        <p>On orders above Rs. 2,000</p>
        <i></i>
        <p>Freshly prepared. Always.</p>
      </div>

      <nav className="navbar">
        <a href="#home" className="logo">
          URBAN<span>BITES</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#about">About</a>

          <button
            type="button"
            onClick={openTracking}
            className="nav-track"
          >
            Track Order
          </button>
        </div>

        <button
          type="button"
          className="cart-btn"
          onClick={() => setCartOpen(true)}
        >
          <span className="cart-icon">CART</span>
          <b>{cartCount}</b>
        </button>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">

          <div className="hero-rating">
            <span>★★★★★</span>
            <strong>4.9</strong>
            <small>1,200+ happy customers</small>
          </div>

          <p className="hero-kicker">
            FRESH • FAST • UNFORGETTABLE
          </p>

          <h1>
            Food that makes
            <span>you hungry.</span>
          </h1>

          <p className="hero-description">
            Big flavours, fresh ingredients and seriously
            good food — delivered straight to your door
            in Karachi.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={scrollToMenu}
            >
              Order Now
              <span>→</span>
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={openTracking}
            >
              Track My Order
            </button>
          </div>

          <div className="hero-features">
            <div>
              <strong>30 min</strong>
              <span>Fast delivery</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Fresh ingredients</span>
            </div>

            <div>
              <strong>4.9/5</strong>
              <span>Customer rating</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-ring"></div>

          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1100&q=90"
            alt="Urban Bites Burger"
          />

          <div className="floating-card order-card-float">
            <strong>BEST SELLER</strong>
            <span>Classic Burger</span>
          </div>

          <div className="floating-card delivery-card-float">
            <strong>FAST DELIVERY</strong>
            <span>30–40 minutes</span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <span>01</span>
          <div>
            <strong>Fresh Ingredients</strong>
            <small>Quality you can taste</small>
          </div>
        </div>

        <div>
          <span>02</span>
          <div>
            <strong>Made Fresh</strong>
            <small>Prepared after you order</small>
          </div>
        </div>

        <div>
          <span>03</span>
          <div>
            <strong>Quick Delivery</strong>
            <small>Hot food at your door</small>
          </div>
        </div>

        <div>
          <span>04</span>
          <div>
            <strong>Loved by Karachi</strong>
            <small>1,200+ happy customers</small>
          </div>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div>
            <p className="section-label">
              CRAVE. ORDER. ENJOY.
            </p>

            <h2>
              What are you
              <span> craving?</span>
            </h2>
          </div>

          <p>
            Everything is cooked fresh,
            packed with flavour and ready
            for your next bite.
          </p>
        </div>

        <div className="category-bar">
          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              className={
                selectedCategory === category.name
                  ? 'category-btn active'
                  : 'category-btn'
              }
              onClick={() => {
                setSelectedCategory(category.name)
                setSearch('')
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="menu-search">
          <span>SEARCH</span>

          <input
            type="text"
            placeholder="Search burgers, pizza, chicken..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setSelectedCategory('All')
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
            >
              CLEAR
            </button>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="food-grid">
            {filteredItems.map((item) => (
              <article
                className="food-card"
                key={item.id}
              >
                <div className="food-image-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="food-image"
                  />

                  <span className="food-badge">
                    {item.badge}
                  </span>

                  <button
                    type="button"
                    className="quick-add"
                    onClick={() => addToCart(item)}
                  >
                    +
                  </button>
                </div>

                <div className="food-info">
                  <div className="food-meta">
                    <span>{item.category}</span>
                    <span>★ 4.9</span>
                  </div>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="food-bottom">
                    <strong>
                      Rs. {item.price.toLocaleString()}
                    </strong>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                      <span>+</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-mark">?</div>
            <h3>No food found</h3>
            <p>Try another search or category.</p>

            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setSearch('')
                setSelectedCategory('All')
              }}
            >
              Show All Food
            </button>
          </div>
        )}
      </section>

      <section className="promo-section">
        <div className="promo-image">
          <img
            src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1100&q=90"
            alt="Fresh pizza"
          />
        </div>

        <div className="promo-content">
          <span className="promo-tag">
            TODAY'S SPECIAL
          </span>

          <h2>
            Good food.
            <br />
            <span>Better mood.</span>
          </h2>

          <p>
            Treat yourself to something delicious.
            Fresh pizza, juicy burgers and crispy
            favourites — all made to order.
          </p>

          <button
            type="button"
            className="primary-btn"
            onClick={scrollToMenu}
          >
            Explore Menu →
          </button>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-copy">
          <p className="section-label">
            WHY URBAN BITES?
          </p>

          <h2>
            We don't just
            <span> make food.</span>
            <br />
            We make moments.
          </h2>

          <p className="about-text">
            From the first crunch to the last bite,
            Urban Bites is all about food that feels
            worth ordering again.
          </p>

          <div className="about-stats">
            <div>
              <strong>1.2K+</strong>
              <span>Customers</span>
            </div>

            <div>
              <strong>4.9</strong>
              <span>Average rating</span>
            </div>

            <div>
              <strong>30m</strong>
              <span>Avg. delivery</span>
            </div>
          </div>
        </div>

        <div className="about-visual">
          <img
            src="https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1000&q=90"
            alt="Delicious burger"
          />

          <div className="about-sticker">
            <strong>100%</strong>
            <span>Fresh<br />Every Day</span>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <p>HUNGRY YET?</p>

        <h2>
          Your next favourite meal
          <span> is one click away.</span>
        </h2>

        <button
          type="button"
          className="primary-btn"
          onClick={scrollToMenu}
        >
          Start Your Order →
        </button>
      </section>

      <footer className="footer">
        <div className="footer-main">
          <div>
            <a href="#home" className="logo">
              URBAN<span>BITES</span>
            </a>

            <p>
              Fresh food. Great taste.
              <br />
              Every single time.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <strong>Explore</strong>
              <a href="#home">Home</a>
              <a href="#menu">Menu</a>
              <a href="#about">About</a>
            </div>

            <div>
              <strong>Order</strong>
              <button
                type="button"
                onClick={openTracking}
              >
                Track Order
              </button>
              <a href="#menu">Order Food</a>
            </div>

            <div>
              <strong>Contact</strong>
              <span>Karachi, Pakistan</span>
              <span>0317 2818814</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Urban Bites</span>
          <span>Fresh food. Great taste. Every time.</span>
        </div>
      </footer>

      {cartOpen && (
        <div
          className="modal-overlay"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <div>
                <small>YOUR ORDER</small>
                <h2>Your Cart</h2>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">CART</div>
                <h3>Your cart is empty</h3>
                <p>Add something delicious to get started.</p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setCartOpen(false)}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <div className="cart-item-info">
                        <h3>{item.name}</h3>

                        <strong>
                          Rs.{' '}
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString()}
                        </strong>

                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                          >
                            +
                          </button>

                          <button
                            type="button"
                            className="remove-item"
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      Rs. {cartTotal.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>
                      {deliveryFee === 0
                        ? 'FREE'
                        : `Rs. ${deliveryFee.toLocaleString()}`}
                    </strong>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>
                      Rs. {grandTotal.toLocaleString()}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={() => {
                      setCartOpen(false)
                      setCheckoutOpen(true)
                    }}
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div
          className="modal-overlay"
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="cart-panel checkout-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="panel-header">
              <div>
                <small>ALMOST THERE</small>
                <h2>Checkout</h2>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setCheckoutOpen(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="checkout-form"
              onSubmit={handleCheckout}
            >
              <label>
                Full Name
                <input
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  placeholder="Your full name"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  placeholder="03XX XXXXXXX"
                  required
                />
              </label>

              <label>
                Delivery Address
                <textarea
                  name="address"
                  value={customer.address}
                  onChange={handleCustomerChange}
                  placeholder="Complete delivery address"
                  rows="4"
                  required
                />
              </label>

              <div className="checkout-total">
                <span>You'll pay</span>
                <strong>
                  Rs. {grandTotal.toLocaleString()}
                </strong>
              </div>

              <button
                type="submit"
                className="checkout-btn"
                disabled={placingOrder}
              >
                {placingOrder
                  ? 'Placing Your Order...'
                  : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {orderPlaced && (
        <div className="modal-overlay">
          <div className="success-card">
            <div className="success-check">✓</div>

            <p className="success-label">
              ORDER CONFIRMED
            </p>

            <h2>
              You're going to
              <span> love this.</span>
            </h2>

            <p className="success-text">
              Thanks,{' '}
              {lastOrder?.customer?.name ||
                customer.name}
              ! Your order has been received
              and sent to our kitchen.
            </p>

            {lastOrder?._id && (
              <div className="success-info">
                <span>ORDER ID</span>
                <strong>
                  #{lastOrder._id}
                </strong>
              </div>
            )}

            <div className="success-info">
              <span>TOTAL</span>
              <strong>
                Rs.{' '}
                {(
                  lastOrder?.total ||
                  grandTotal
                ).toLocaleString()}
              </strong>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={openTracking}
            >
              Track My Order →
            </button>

            <button
              type="button"
              className="done-btn"
              onClick={finishOrder}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {trackingOpen && (
        <div
          className="modal-overlay"
          onClick={closeTracking}
        >
          <div
            className="tracking-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="panel-header">
              <div>
                <small>LIVE ORDER TRACKING</small>
                <h2>Where's my order?</h2>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeTracking}
              >
                ×
              </button>
            </div>

            <form
              className="tracking-form"
              onSubmit={trackOrder}
            >
              <input
                type="text"
                value={trackingId}
                onChange={(event) =>
                  setTrackingId(event.target.value)
                }
                placeholder="Paste your Order ID"
                autoComplete="off"
              />

              <button
                type="submit"
                className="checkout-btn"
                disabled={trackingLoading}
              >
                {trackingLoading
                  ? 'Finding Order...'
                  : 'Track Order →'}
              </button>
            </form>

            {trackingError && (
              <div className="tracking-error">
                <strong>Order not found</strong>
                <p>{trackingError}</p>
              </div>
            )}

            {trackedOrder && (
              <div className="tracking-result">
                <div className="tracked-top">
                  <div>
                    <small>ORDER ID</small>
                    <strong>
                      #{trackedOrder._id}
                    </strong>
                  </div>

                  <span className="live-status">
                    {trackedOrder.status}
                  </span>
                </div>

                <div className="tracked-customer">
                  <strong>
                    {trackedOrder.customer?.name}
                  </strong>
                  <span>
                    {trackedOrder.customer?.phone}
                  </span>
                </div>

                <div className="timeline">
                  <div
                    className={
                      trackedOrder.status === 'Pending' ||
                      trackedOrder.status === 'Preparing' ||
                      trackedOrder.status === 'Delivered'
                        ? 'timeline-step done'
                        : 'timeline-step'
                    }
                  >
                    <div className="timeline-dot">1</div>
                    <div>
                      <strong>Order Received</strong>
                      <span>We've received your order</span>
                    </div>
                  </div>

                  <div
                    className={
                      trackedOrder.status === 'Preparing' ||
                      trackedOrder.status === 'Delivered'
                        ? 'timeline-line done'
                        : 'timeline-line'
                    }
                  />

                  <div
                    className={
                      trackedOrder.status === 'Preparing' ||
                      trackedOrder.status === 'Delivered'
                        ? 'timeline-step done'
                        : 'timeline-step'
                    }
                  >
                    <div className="timeline-dot">2</div>
                    <div>
                      <strong>Preparing</strong>
                      <span>Kitchen is preparing your food</span>
                    </div>
                  </div>

                  <div
                    className={
                      trackedOrder.status === 'Delivered'
                        ? 'timeline-line done'
                        : 'timeline-line'
                    }
                  />

                  <div
                    className={
                      trackedOrder.status === 'Delivered'
                        ? 'timeline-step done'
                        : 'timeline-step'
                    }
                  >
                    <div className="timeline-dot">3</div>
                    <div>
                      <strong>Delivered</strong>
                      <span>Enjoy your meal</span>
                    </div>
                  </div>
                </div>

                {trackedOrder.status === 'Cancelled' && (
                  <div className="cancelled-order">
                    This order has been cancelled.
                  </div>
                )}

                <div className="tracked-total">
                  <span>Order Total</span>
                  <strong>
                    Rs.{' '}
                    {Number(
                      trackedOrder.total || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <button
                  type="button"
                  className="refresh-track-btn"
                  onClick={() =>
                    trackOrder({
                      preventDefault: () => {},
                    })
                  }
                >
                  Refresh Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App