const router = require("express").Router();
const Product = require("../models/Product");
const { verifyTokenAndAdmin } = require("./verifyToken");

// get all product
router.get("/getAllProducts", async (req, res) => {
    const qnew = req.query.new;
    const qcategory = req.query.category;
    const qlimit = req.query.limit;
    try {
        let products;
        if (qnew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(qlimit);
            return res.status(200).json({ success: true, data: products });
        }
        else if (qcategory) {
            products = await Product.find({
                categories: {
                    $in: [qcategory]
                }
            });
            return res.status(200).json({ success: true, data: products });
        }
        else {
            products = await Product.find();
            return res.status(200).json({ success: true, data: products });
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

// get single product by id
router.get("/getProduct/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching product", error: error.message });
    }
})

// add new product
router.post("/addProducts", verifyTokenAndAdmin, async (req, res) => {
    const title = req.body.title;
    const desc = req.body.desc;
    const img = req.body.img;
    const categories = req.body.categories;
    const size = req.body.size;
    const color = req.body.color;
    const price = req.body.price;
    const stock = req.body.stock || 0;
    const products = new Product({
        title,
        desc,
        img,
        categories,
        size,
        color,
        price,
        stock
    })
    try {
        const savedProducts = await products.save();
        res.status(200).json(savedProducts);
    } catch (error) {
        res.status(404).json(error);
    }
})

// update product
router.put("/editProduct/:id", verifyTokenAndAdmin, async (req, res) => {
    const id = req.params.id;
    // Validate required fields
    const { title, desc, img, price } = req.body;
    if (!title || !desc || !img || !price) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: title, desc, img, and price are required"
        });
    }
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: updatedProduct, message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
})

// update product status
router.put("/updateProductStatus/:id", verifyTokenAndAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: { active: req.body.active } },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: product, message: "Product status updated successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
})

// delete product
router.delete("/deleteProduct/:id", verifyTokenAndAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        const deleteProduct = await Product.findByIdAndDelete(id);
        if (!deleteProduct) {
            return res.status(200).json({ success: true, message: "product not found" });
        }
        return res.status(200).json({ success: true, message: "product deleted successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
})

module.exports = router;