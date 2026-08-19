const express = require('express')
const Order = require('../models/Order')

const router = express.Router()

// =========================
// GET ALL ORDERS
// =========================

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    })

    res.json(orders)
  } catch (error) {
    console.error('Fetch orders error:', error)

    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message,
    })
  }
})

// =========================
// GET SINGLE ORDER
// =========================

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      })
    }

    res.json({
      order,
    })
  } catch (error) {
    console.error('Fetch single order error:', error)

    res.status(400).json({
      message: 'Invalid order ID',
    })
  }
})

// =========================
// CREATE NEW ORDER
// =========================

router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body)

    const savedOrder = await order.save()

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder,
    })
  } catch (error) {
    console.error('Order error:', error)

    res.status(500).json({
      message: 'Failed to place order',
      error: error.message,
    })
  }
})

// =========================
// UPDATE ORDER STATUS
// =========================

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatuses = [
      'Pending',
      'Preparing',
      'Delivered',
      'Cancelled',
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status',
      })
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Order not found',
      })
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Status update error:', error)

    res.status(500).json({
      message: 'Failed to update order status',
      error: error.message,
    })
  }
})

// =========================
// DELETE ORDER
// =========================

router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(
      req.params.id
    )

    if (!deletedOrder) {
      return res.status(404).json({
        message: 'Order not found',
      })
    }

    res.json({
      message: 'Order deleted successfully',
      order: deletedOrder,
    })
  } catch (error) {
    console.error('Delete order error:', error)

    res.status(500).json({
      message: 'Failed to delete order',
      error: error.message,
    })
  }
})

module.exports = router