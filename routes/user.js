const router = require("express").Router();
const cryptoJs = require("crypto-js");
const { verifyTokenAuth, verifyTokenAndAdmin } = require("./verifyToken");
const User = require("../models/User");

// update
router.put("/:id", verifyTokenAuth, async (req, res) => {
    if (req.body.password) {
        req.body.password = cryptoJs.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json(error)
    }
})

// delete
router.delete("/:id", verifyTokenAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("user has been deleted");
    } catch (error) {

    }
})

// get single user
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (error) {
        res.status(500).json(error);
    }
})

// get all users
// router.get("/getAllUser", verifyTokenAndAdmin, async (req, res) => {
router.get("/getAllUser", async (req, res) => {
    try {
        const user = await User.find();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;