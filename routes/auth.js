const router = require("express").Router();
const User = require("../models/User");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
    try {
        // Validate required fields
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: username, email, password"
            });
        }

        // Validate email format
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(email)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Please provide a valid email address"
        //     });
        // }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.username === username 
                    ? "Username already exists" 
                    : "Email already exists"
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC).toString(),
            isAdmin: req.body.isAdmin || false
        });

        const savedUser = await newUser.save();
        
        // Remove password from response
        const { password: userPassword, ...userWithoutPassword } = savedUser.toObject();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: userWithoutPassword
        });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error during registration",
            error: err.message
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        // Validate required fields
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Verify password
        const hashedPassword = cryptoJs.AES.decrypt(user.password, process.env.PASS_SEC);
        const originalPassword = hashedPassword.toString(cryptoJs.enc.Utf8);
        
        if (originalPassword !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Generate JWT token
        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        }, process.env.JWT_SEC, { expiresIn: "3d" });

        // Remove password from response
        const { password: userPassword, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                ...userWithoutPassword,
                accessToken
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during login",
            error: error.message
        });
    }
});

module.exports = router;