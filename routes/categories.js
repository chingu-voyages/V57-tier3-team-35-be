const router = require("express").Router();
const Category = require("../models/Category");
const { verifyTokenAndAdmin } = require("./verifyToken");

// get all product
router.get("/getAllCategory", async (req, res) => {
    const category = await Category.find();
    try {
        if (category) {
            res.status(200).json({ success: true, data: category })
        }
        else {
            res.status(401).json({ success: true, message: "No category found" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

// add new product
router.post("/addCategory", verifyTokenAndAdmin, async (req, res) => {
    const name = req.body.name;
    const desc = req.body.desc;
    const category = new Category({
        name,
        desc,
    })
    try {
        const savedCategory = await category.save();
        res.status(200).json(savedCategory);
    } catch (error) {
        res.status(404).json(error);
    }
})

module.exports = router;