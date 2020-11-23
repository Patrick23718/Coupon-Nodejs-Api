const router = require("express").Router();
const Coupon = require("../models/Coupon");

const CouponsController = require("../controllers/coupon");

// Create Coupon
router.post("/", CouponsController.coupons_create_coupon);

// Get all coupons
router.get("/", CouponsController.coupons_get_all_coupons);

// Get coupon
router.get('/:couponId', CouponsController.coupons_get_coupon);

// Delete coupon
router.delete("/:couponId", CouponsController.coupons_delete_coupon);

// Update coupon
router.put("/:couponId", CouponsController.coupons_update_coupon)

// check validity
router.get('/validity/:couponId', CouponsController.coupons_validity_coupon);


// Use coupon
router.patch('/:couponId', CouponsController.coupons_use_coupon);




module.exports = router;