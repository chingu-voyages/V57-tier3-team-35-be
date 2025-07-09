const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cateRoute = require("./routes/categories");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const adminRoute = require("./routes/admin");
const cors = require("cors");

dotEnv.config();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("db connected")
}).catch((err) => console.log(err))

app.use(cors());
app.use(express.json())
// middleware start
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/category", cateRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/admin", adminRoute);

// middleware end

app.listen(process.env.PORT || 5000, () => {
    console.log(`listing on port ${process.env.PORT || 5000}`);
})