const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Import Routes
const couponRoute = require("./api/routers/coupon");

// Dotenv config
dotenv.config();

// Connect to mongongoose
mongoose.connect(
  process.env.DB_CONNECT,
  { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
  () => console.log("connected to DB")
);

// Middleware
app.use(express.json());
app.use("/coupon/", couponRoute);

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My node server is running at ${PORT}`);
});
