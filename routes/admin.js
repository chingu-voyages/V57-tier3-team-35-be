const router = require("express").Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyTokenAndAdmin } = require("./verifyToken");

// Get dashboard statistics
router.get("/dashboard", verifyTokenAndAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'username email');

        // Get total revenue
        const orders = await Order.find({ status: 'completed' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

        // Get monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                recentOrders,
                monthlyRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users (admin only)
router.get("/users", verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single user by ID
router.get("/users/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user (admin only)
router.put("/users/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const { username, email, isAdmin } = req.body;
        const updateData = {};

        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: updatedUser, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user (admin only)
router.delete("/users/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders (admin only)
router.get("/orders", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'username email')
            .populate('products.productId', 'title price img')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single order by ID
router.get("/orders/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'username email')
            .populate('products.productId', 'title price img');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (admin only)
router.put("/orders/:id/status", verifyTokenAndAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: " + validStatuses.join(', ')
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            data: updatedOrder,
            message: "Order status updated successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get product statistics
router.get("/products/stats", verifyTokenAndAdmin, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const productsByCategory = await Product.aggregate([
            {
                $unwind: "$categories"
            },
            {
                $group: {
                    _id: "$categories",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const lowStockProducts = await Product.find({
            $expr: { $lt: ["$stock", 10] }
        }).select('title stock price');

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                productsByCategory,
                lowStockProducts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router; 