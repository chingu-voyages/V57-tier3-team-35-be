const router = require("express").Router();
const Order = require("../models/Order");
const { verifyToken, verifyTokenAuth } = require("./verifyToken");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const { Resend } = require('resend');
const mongoose = require("mongoose");
// const sendEmail = require("../utils/sendEmail.js");

// get a all order of a user
router.get("/getOrder/:id", verifyTokenAuth, async (req, res) => {
    const id = req.params.id;
    try {
        const orderItems = await Order.find({ userId: id });
        if (!orderItems) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, data: orderItems });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
})

// get all users ordrs
router.get("/getAllOrders", async (req, res) => {
    try {
        const allOrders = await Order.find();
        res.status(200).json({ success: true, data: allOrders })
    } catch (error) {
        res.status(500).json(error);
    }
})

// create a new order
// router.post("/createOrder", verifyToken, async (req, res) => {
//     const { userId, products, amount, address, status } = req.body;
//     try {
//         const newOrder = new Order({
//             userId,
//             products,
//             amount,
//             address,
//             status: status || "pending"
//         })
//         const savedOrder = await newOrder.save();
//         res.status(201).json({ success: true, message: "Order created successfully", data: savedOrder })
//     }
//     catch (error) {
//         res.status(500).json(error);
//     }
// })

// router.post("/createOrder", verifyToken, async (req, res) => {
//     const { userId, products, amount, address, status } = req.body;

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         // Step 1: Check and reduce stock
//         for (const item of products) {
//             const { productId, quantity } = item;

//             const product = await Product.findById(productId).session(session);
//             if (!product) throw new Error(`Product with ID ${productId} not found`);
//             if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.title}`);

//             product.stock -= quantity;
//             await product.save({ session });
//         }

//         // Step 2: Save the order
//         const newOrder = new Order({
//             userId,
//             products,
//             amount,
//             address,
//             status: status || "pending"
//         });

//         const savedOrder = await newOrder.save({ session });

//         // Step 3: Clear the cart
//         await Cart.findOneAndDelete({ userId }, { session });

//         // Step 4: Commit the transaction
//         await session.commitTransaction();
//         session.endSession();

//         // Step 5: Send confirmation email (outside transaction)
//         const user = await User.findById(userId);
//         if (user?.email) {
//             await sendEmail({
//                 to: 'shivam24161@gmail.com',
//                 subject: "Order Confirmation",
//                 html: `<h2>Hi ${user.username},</h2><p>Your order has been placed successfully!</p><p><strong>Order ID:</strong> ${savedOrder._id}</p><p>Thank you for shopping with us.</p>`
//             });
//         }

//         res.status(201).json({
//             success: true,
//             message: "Order placed successfully",
//             data: savedOrder
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();

//         res.status(500).json({ success: false, message: error.message });
//     }
// });

router.post("/createOrder", verifyToken, async (req, res) => {
    const { userId, products, amount, address, status } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    // const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        // 1. Deduct stock for each product
        for (const item of products) {
            const { productId, quantity } = item;
            const product = await Product.findById(productId).session(session);

            if (!product) throw new Error(`Product not found: ${productId}`);
            if (product.stock < quantity)
                throw new Error(`Insufficient stock for ${product.title}`);

            product.stock -= quantity;
            await product.save({ session });
        }

        // 2. Save order
        const newOrder = new Order({
            userId,
            products,
            amount,
            address,
            status: status || "pending",
        });

        const savedOrder = await newOrder.save({ session });

        // 3. Clear cart
        // await Cart.findOneAndDelete({ userId }, { session });

        // 4. Commit transaction
        await session.commitTransaction();
        session.endSession();

        // 5. Send confirmation email (after transaction)
        const user = await User.findById(userId);

        if (user?.email) {
            // const { data, error } = await resend.emails.send({
            //     from: 'Acme <onboarding@resend.dev>',
            //     to: [''],
            //     subject: 'Hello World',
            //     html: '<strong>It works!</strong>',
            // });

            res.status(201).json({
                success: true,
                message: "Order placed and email sent",
                data: savedOrder,
            });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
});


// update order status
router.put("/updateOrderStatus/:id", verifyToken, async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            { _id: orderId },
            { status },
            { new: true, runValidators: true }
        )
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }
        return res.status(200).json({ success: true, message: "Order status updated successfully", data: updatedOrder })
    } catch (error) {
        res.status(500).json(error);
    }
})


module.exports = router;