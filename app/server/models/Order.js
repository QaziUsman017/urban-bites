const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    items: [
      {
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        category: String,
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      default: 150,
    },

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.model('Order', orderSchema)

module.exports = Order