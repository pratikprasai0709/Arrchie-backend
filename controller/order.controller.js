import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

export async function createOrder(req, res) {
  try {
    const { customerName, customerEmail, items, totalAmount, shippingAddress } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    // Fetch user details from database to guarantee customerName and customerEmail are populated
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const finalCustomerName = customerName || user.name;
    const finalCustomerEmail = customerEmail || user.email;

    // Double check inventory stock and update quantities
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
    }

    const order = new Order({
      userId,
      customerName: finalCustomerName,
      customerEmail: finalCustomerEmail,
      items,
      totalAmount,
      shippingAddress,
      orderStatus: 'Pending'
    });

    await order.save();

    // Deduct stock levels
    for (const item of items) {
      const product = await Product.findById(item.productId);
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      product.availabilityStatus = product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
      await product.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
}

export async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving your orders', error: error.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all orders', error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
}
