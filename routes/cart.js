const router = require("express").Router();
const Cart = require("../models/Cart");
const { verifyToken, verifyTokenAuth } = require("./verifyToken");

// get all product
router.get("/getCartitem/:id", verifyTokenAuth, async (req, res) => {
    const id = req.params.id;
    try {
        const cartitems = await Cart.find({ userId: id });
        if (!cartitems) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        return res.status(200).json({ success: true, data: cartitems });
    } catch (error) {
        res.status(200).json(error);
    }
})

// add or update in cart
router.post("/addCartItem", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const [{ productId, quantity }] = req.body.products;
    try {
        const cartItem = await Cart.updateOne({ userId, "products.productId": productId },
            {
                $inc: { "products.$.quantity": quantity }
            })
        // STEP 1: Try to increment quantity if product already exists
        if (cartItem.modifiedCount === 0) {
            // STEP 2: If product not in cart, push it to array
            await Cart.updateOne({ userId },
                {
                    $push: {
                        products: { productId, quantity }
                    }
                },
                {
                    upsert: true // If user cart doesn't exist, create it
                }
            )
        }
        // STEP 3: Respond with updated cart
        const updatedCart = await Cart.findOne({ userId });
        res.status(200).json({ success: true, message: "item added in cart", data: updatedCart })
    } catch (error) {
        res.status(500).json(error);
    }
})

// delete cart item
router.delete("/deleteCartItem/:productId", verifyToken, async (req, res) => {
    const productId = req.params.productId;
    try {
        const item = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            {
                $pull: { products: { productId: productId } }
            },
            { new: true }
        )
        if (!item) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json(error);
    }
})

// delete full cart
router.delete("/deleteCart/:id", verifyTokenAuth, async (req, res) => {
    try {
        const deletedCart = await Cart.findOneAndDelete({ userId: req.user.id });
        if (!deletedCart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        res.status(200).json({ success: true, message: "Cart deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// get all cart item
router.get("/getAllCartItems", async (req, res) => {
    try {
        const getAllCart = await Cart.find();
        res.status(200).json({ success: true, data: getAllCart })
    } catch (error) {
        res.status(500).json(error);
    }

})

module.exports = router;