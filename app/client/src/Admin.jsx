import { useEffect, useMemo, useState } from 'react'
import './Admin.css'

const API_URL = 'https://urban-bites-production.up.railway.app/api/orders'

const STATUS_OPTIONS = [
  'Pending',
  'Preparing',
  'Delivered',
  'Cancelled',
]

function Admin() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [deletingOrder, setDeletingOrder] = useState(null)
  const [copiedOrder, setCopiedOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()

      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Orders fetch error:', err)

      setError(
        'Unable to load orders. Make sure the Urban Bites server is running.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // =========================
  // BACK TO WEBSITE
  // =========================

  const goBackToWebsite = () => {
    window.location.href = '/'
  }

  // =========================
  // COPY ORDER ID
  // =========================

  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId)

      setCopiedOrder(orderId)

      setTimeout(() => {
        setCopiedOrder(null)
      }, 1500)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId)

      const response = await fetch(
        `${API_URL}/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update order status.'
        )
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status:
                  data.order?.status || newStatus,
              }
            : order
        )
      )

      setSelectedOrder((current) => {
        if (!current || current._id !== orderId) {
          return current
        }

        return {
          ...current,
          status:
            data.order?.status || newStatus,
        }
      })
    } catch (err) {
      console.error('Status update error:', err)

      alert(`Status update failed: ${err.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  // =========================
  // DELETE ORDER
  // =========================

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      'Delete this order?\n\nThis action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingOrder(orderId)

      const response = await fetch(
        `${API_URL}/${orderId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete order.'
        )
      }

      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => order._id !== orderId
        )
      )

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null)
      }
    } catch (err) {
      console.error('Delete order error:', err)

      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeletingOrder(null)
    }
  }

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {
    const totalSales = orders.reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    )

    return {
      totalOrders: orders.length,

      pending: orders.filter(
        (order) => order.status === 'Pending'
      ).length,

      preparing: orders.filter(
        (order) => order.status === 'Preparing'
      ).length,

      delivered: orders.filter(
        (order) => order.status === 'Delivered'
      ).length,

      cancelled: orders.filter(
        (order) => order.status === 'Cancelled'
      ).length,

      totalSales,
    }
  }, [orders])

  // =========================
  // HELPERS
  // =========================

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-PK')
  }

  const formatDate = (date) => {
    if (!date) {
      return 'Unknown date'
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date'
    }

    return parsedDate.toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getStatusClass = (status) => {
    return String(status || 'Pending')
      .toLowerCase()
      .replace(/\s+/g, '-')
  }

  const getItemCount = (order) => {
    return (
      order.items?.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      ) || 0
    )
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="admin-page">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="brand-mark">
            UB
          </div>

          <div className="brand-text">
            <strong>
              Urban<span>Bites</span>
            </strong>

            <small>
              ADMIN PANEL
            </small>
          </div>

        </div>

        <nav className="admin-nav">

          <a
            href="#dashboard"
            className="admin-nav-item active"
          >
            <span className="nav-icon">
              ◈
            </span>

            Dashboard
          </a>

          <a
            href="#orders"
            className="admin-nav-item"
          >
            <span className="nav-icon">
              ▤
            </span>

            Orders

            {stats.pending > 0 && (
              <b className="nav-count">
                {stats.pending}
              </b>
            )}
          </a>

        </nav>

        <div className="sidebar-bottom">

          <div className="store-status">

            <span className="status-dot"></span>

            <div>
              <strong>
                Store Online
              </strong>

              <small>
                Accepting orders
              </small>
            </div>

          </div>

          <button
            className="sidebar-back"
            onClick={goBackToWebsite}
            type="button"
          >
            ← Back to Website
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <div className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div className="topbar-copy">

            <p className="eyebrow">
              URBAN BITES / ADMIN
            </p>

            <h1>
              Restaurant Dashboard
            </h1>

            <p className="header-subtitle">
              Manage orders, monitor sales and
              keep your kitchen moving.
            </p>

          </div>

          <div className="topbar-actions">

            <button
              type="button"
              className="mobile-back-btn"
              onClick={goBackToWebsite}
            >
              ← Website
            </button>

            <button
              className="top-refresh"
              onClick={() => fetchOrders(false)}
              type="button"
              disabled={refreshing}
            >
              <span
                className={
                  refreshing
                    ? 'refresh-spinning'
                    : ''
                }
              >
                ↻
              </span>

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

          </div>

        </header>

        <main
          className="admin-content"
          id="dashboard"
        >

          {/* STATS */}

          <section className="stats-grid">

            <div className="stat-card stat-card-main">

              <div className="stat-icon">
                ◈
              </div>

              <div className="stat-content">

                <span>
                  Total Orders
                </span>

                <strong>
                  {stats.totalOrders}
                </strong>

                <small>
                  All orders
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon pending-icon">
                ◷
              </div>

              <div className="stat-content">

                <span>
                  Pending
                </span>

                <strong>
                  {stats.pending}
                </strong>

                <small>
                  Waiting for action
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon preparing-icon">
                ◉
              </div>

              <div className="stat-content">

                <span>
                  Preparing
                </span>

                <strong>
                  {stats.preparing}
                </strong>

                <small>
                  Kitchen working
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon delivered-icon">
                ✓
              </div>

              <div className="stat-content">

                <span>
                  Delivered
                </span>

                <strong>
                  {stats.delivered}
                </strong>

                <small>
                  Completed orders
                </small>

              </div>

            </div>

            <div className="stat-card sales-card">

              <div className="stat-icon sales-icon">
                ₨
              </div>

              <div className="stat-content">

                <span>
                  Total Sales
                </span>

                <strong>
                  Rs. {formatMoney(stats.totalSales)}
                </strong>

                <small>
                  Revenue from orders
                </small>

              </div>

            </div>

          </section>

          {/* ORDERS */}

          <section
            className="orders-section"
            id="orders"
          >

            <div className="orders-heading">

              <div>

                <p className="eyebrow">
                  ORDER MANAGEMENT
                </p>

                <h2>
                  Recent Orders
                </h2>

                <p className="orders-description">
                  View customer details,
                  manage order status and
                  track your restaurant activity.
                </p>

              </div>

              <div className="order-summary">

                <span className="live-indicator">
                  <i></i>
                  Live
                </span>

                <strong>
                  {orders.length}
                </strong>

                <span>
                  total orders
                </span>

              </div>

            </div>

            {/* LOADING */}

            {loading && (

              <div className="admin-message">

                <div className="loading-spinner"></div>

                <strong>
                  Loading orders
                </strong>

                <span>
                  Fetching the latest orders...
                </span>

              </div>

            )}

            {/* ERROR */}

            {!loading && error && (

              <div className="admin-message error-message">

                <div className="message-icon">
                  !
                </div>

                <strong>
                  Something went wrong
                </strong>

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => fetchOrders()}
                >
                  Try Again
                </button>

              </div>

            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              orders.length === 0 && (

                <div className="admin-message">

                  <div className="empty-icon">
                    —
                  </div>

                  <strong>
                    No orders yet
                  </strong>

                  <span>
                    New customer orders will appear
                    here automatically.
                  </span>

                </div>

              )}

            {/* ORDERS LIST */}

            {!loading &&
              !error &&
              orders.length > 0 && (

                <div className="orders-list">

                  {orders.map((order) => (

                    <article
                      className="order-card"
                      key={order._id}
                    >

                      {/* ORDER HEADER */}

                      <div className="order-card-header">

                        <div className="order-identity">

                          <div className="order-avatar">
                            UB
                          </div>

                          <div className="order-heading-info">

                            <span className="order-number">
                              ORDER #{order._id}
                            </span>

                            <span className="order-date">
                              {formatDate(
                                order.createdAt
                              )}
                            </span>

                            <button
                              type="button"
                              className="copy-order-id"
                              onClick={() =>
                                copyOrderId(
                                  order._id
                                )
                              }
                            >
                              {copiedOrder ===
                              order._id
                                ? '✓ Copied'
                                : 'Copy Order ID'}
                            </button>

                          </div>

                        </div>

                        <div className="order-actions">

                          <span
                            className={`status-badge ${getStatusClass(
                              order.status
                            )}`}
                          >
                            <i></i>

                            {order.status}
                          </span>

                          <button
                            className="view-order-btn"
                            type="button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="delete-order-btn"
                            type="button"
                            onClick={() =>
                              deleteOrder(
                                order._id
                              )
                            }
                            disabled={
                              deletingOrder ===
                              order._id
                            }
                            title="Delete order"
                          >
                            {deletingOrder ===
                            order._id
                              ? '...'
                              : '×'}
                          </button>

                        </div>

                      </div>

                      {/* ORDER BODY */}

                      <div className="order-card-body">

                        {/* CUSTOMER */}

                        <div className="info-column customer-column">

                          <div className="column-title">
                            <span>
                              Customer
                            </span>
                          </div>

                          <div className="customer-name">
                            {order.customer?.name ||
                              'N/A'}
                          </div>

                          <div className="customer-detail">
                            <span>
                              Tel
                            </span>

                            {order.customer?.phone ||
                              'N/A'}
                          </div>

                          <div className="customer-detail address">
                            <span>
                              Address
                            </span>

                            {order.customer?.address ||
                              'N/A'}
                          </div>

                        </div>

                        {/* ITEMS */}

                        <div className="info-column items-column">

                          <div className="column-title">

                            <span>
                              Order Items
                            </span>

                            <em>
                              {getItemCount(order)}{' '}
                              items
                            </em>

                          </div>

                          <div className="items-list">

                            {order.items?.map(
                              (item, index) => (

                                <div
                                  className="order-item"
                                  key={
                                    item._id ||
                                    index
                                  }
                                >

                                  <div className="item-left">

                                    <span className="item-qty">
                                      {item.quantity}×
                                    </span>

                                    <span className="item-name">
                                      {item.name}
                                    </span>

                                  </div>

                                  <strong>
                                    Rs.{' '}
                                    {formatMoney(
                                      Number(
                                        item.price ||
                                          0
                                      ) *
                                        Number(
                                          item.quantity ||
                                            0
                                        )
                                    )}
                                  </strong>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                        {/* STATUS */}

                        <div className="info-column action-column">

                          <div className="column-title">
                            <span>
                              Update Status
                            </span>
                          </div>

                          <select
                            className={`status-select ${getStatusClass(
                              order.status
                            )}`}
                            value={
                              order.status ||
                              'Pending'
                            }
                            disabled={
                              updatingOrder ===
                              order._id
                            }
                            onChange={(event) =>
                              updateStatus(
                                order._id,
                                event.target.value
                              )
                            }
                          >

                            {STATUS_OPTIONS.map(
                              (status) => (

                                <option
                                  value={status}
                                  key={status}
                                >
                                  {status}
                                </option>

                              )
                            )}

                          </select>

                          {updatingOrder ===
                            order._id && (

                            <small className="updating">
                              Saving change...
                            </small>

                          )}

                        </div>

                      </div>

                      {/* TOTAL */}

                      <div className="order-card-footer">

                        <div className="price-breakdown">

                          <div>

                            <span>
                              Subtotal
                            </span>

                            <strong>
                              Rs.{' '}
                              {formatMoney(
                                order.subtotal
                              )}
                            </strong>

                          </div>

                          <div>

                            <span>
                              Delivery
                            </span>

                            <strong>
                              Rs.{' '}
                              {formatMoney(
                                order.deliveryFee
                              )}
                            </strong>

                          </div>

                        </div>

                        <div className="grand-total">

                          <span>
                            Order Total
                          </span>

                          <strong>
                            Rs.{' '}
                            {formatMoney(
                              order.total
                            )}
                          </strong>

                        </div>

                      </div>

                    </article>

                  ))}

                </div>

              )}

          </section>

          {/* FOOTER */}

          <footer className="admin-footer">

            <span>
              © 2026 Urban Bites
            </span>

            <span>
              Restaurant Management Dashboard
            </span>

          </footer>

        </main>

      </div>

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="order-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  ORDER DETAILS
                </p>

                <h2>
                  #{selectedOrder._id}
                </h2>

                <span>
                  {formatDate(
                    selectedOrder.createdAt
                  )}
                </span>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-status-row">

              <span
                className={`status-badge ${getStatusClass(
                  selectedOrder.status
                )}`}
              >
                <i></i>

                {selectedOrder.status}
              </span>

              <select
                className="status-select"
                value={
                  selectedOrder.status ||
                  'Pending'
                }
                disabled={
                  updatingOrder ===
                  selectedOrder._id
                }
                onChange={(event) =>
                  updateStatus(
                    selectedOrder._id,
                    event.target.value
                  )
                }
              >

                {STATUS_OPTIONS.map(
                  (status) => (

                    <option
                      value={status}
                      key={status}
                    >
                      {status}
                    </option>

                  )
                )}

              </select>

            </div>

            <div className="detail-grid">

              <div className="detail-box">

                <span>
                  CUSTOMER
                </span>

                <strong>
                  {selectedOrder.customer?.name ||
                    'N/A'}
                </strong>

                <p>
                  {selectedOrder.customer?.phone ||
                    'N/A'}
                </p>

                <p>
                  {selectedOrder.customer?.address ||
                    'N/A'}
                </p>

              </div>

              <div className="detail-box">

                <span>
                  ORDER SUMMARY
                </span>

                <strong>
                  {getItemCount(
                    selectedOrder
                  )}{' '}
                  Items
                </strong>

                <p>
                  Subtotal: Rs.{' '}
                  {formatMoney(
                    selectedOrder.subtotal
                  )}
                </p>

                <p>
                  Delivery: Rs.{' '}
                  {formatMoney(
                    selectedOrder.deliveryFee
                  )}
                </p>

              </div>

            </div>

            <div className="modal-items">

              <div className="modal-section-title">

                <span>
                  ORDER ITEMS
                </span>

                <strong>
                  Rs.{' '}
                  {formatMoney(
                    selectedOrder.total
                  )}
                </strong>

              </div>

              {selectedOrder.items?.map(
                (item, index) => (

                  <div
                    className="modal-item"
                    key={
                      item._id ||
                      index
                    }
                  >

                    <div>

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.quantity} × Rs.{' '}
                        {formatMoney(
                          item.price
                        )}
                      </span>

                    </div>

                    <strong>
                      Rs.{' '}
                      {formatMoney(
                        Number(
                          item.price || 0
                        ) *
                          Number(
                            item.quantity || 0
                          )
                      )}
                    </strong>

                  </div>

                )
              )}

            </div>

            <div className="modal-total">

              <span>
                TOTAL
              </span>

              <strong>
                Rs.{' '}
                {formatMoney(
                  selectedOrder.total
                )}
              </strong>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="copy-modal-btn"
                onClick={() =>
                  copyOrderId(
                    selectedOrder._id
                  )
                }
              >
                {copiedOrder ===
                selectedOrder._id
                  ? '✓ Copied'
                  : 'Copy Order ID'}
              </button>

              <button
                type="button"
                className="delete-modal-btn"
                onClick={() =>
                  deleteOrder(
                    selectedOrder._id
                  )
                }
                disabled={
                  deletingOrder ===
                  selectedOrder._id
                }
              >
                {deletingOrder ===
                selectedOrder._id
                  ? 'Deleting...'
                  : 'Delete Order'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Admin