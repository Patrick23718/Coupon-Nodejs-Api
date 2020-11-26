const Coupon = require("../models/Coupon");
  
  exports.validity = (req, res, next) => {
    const id = req.params.couponId;
    // if(id.length != 24){
    //     return res.status(400).send("Invalid id");
    // }
    Coupon.findById(id)
    //.select("_id code isPercent amount expireDate remeningNumber isActive created_at updated_at users")
    .exec()
    .then(doc => {
        if(doc){
            const currentDate = new Date();

            const update = {};
            if(doc.remeningNumber <= 0 || Date.parse(doc.expireDate) < currentDate){
                update.isActive = false
            } else {
                update.isActive = true
            }

            Coupon.update({ _id: id }, { $set: update })
            .exec()
            .then(() => {
                res.status(200).json({
                    message: 'Coupon Validity',
                    isValid: update.isActive,
                    request: {
                        type: "GET",
                        url: "http://localhost:5000/coupon/" + id,
                    }
                });
                next();
            })
            .catch(err => {
                console.log(err);
                res.statut(500).json({ error: err });
            });
            
        } else {
            res.status(404).json({ message: "No coupon found for the provided ID" })
        }
    })
    .catch(err => {
        console.log(err);
        res.statut(500).json({ error: err });
    })
}