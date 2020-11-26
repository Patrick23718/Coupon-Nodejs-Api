const Coupon = require("../models/Coupon");

exports.coupons_create_coupon = (req, res, next) => {
    const couponCode = coupongenerator()
    const newCoupon = new Coupon({
        code: couponCode,
        isPercent: req.body.isPercent,
        amount: req.body.amount,
        expireDate: req.body.expireDate,
        remeningNumber: req.body.remeningNumber,
        isActive: req.body.isActive,
        companyId: req.body.companyId
    });

    if(newCoupon.isPercent == true && newCoupon.amount>100){
        return res.status(400).send("Value must be less than 100");
    } 

    newCoupon
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Coupon created successfully',
            createdCoupon: {
                code: result.code,
                isPercent: result.isPercent,
                amount: result.amount,
                expireDate: result.expireDate,
                remeningNumber: result.remeningNumber,
                isActive: result.isActive,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: "http://localhost:5000/coupon/" + result._id,
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); 
}

exports.coupons_get_all_coupons = (req, res) => {
    Coupon.find()
    .select("_id code isPercent amount expireDate remeningNumber isActive created_at updated_at users")
    //.populate()
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            coupons: docs.map(doc => {
                return {
                    coupon: doc,
                    request: {
                        type: 'GET',
                        url: "http://localhost:5000/coupon/" + doc._id,
                    }
                }
            })
        })
    });
}

exports.coupons_get_coupon = (req, res, next) => {
    const id = req.params.couponId;
    if(id.length != 24){
        return res.status(400).send("Invalid id");
    }
    Coupon.findById(id)
    .select("_id code isPercent amount expireDate remeningNumber isActive created_at updated_at users")
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                coupon: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:5000/coupon'
                }
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

exports.coupons_delete_coupon = (req, res, next) => {
    const id = req.params.couponId;
    if(id.length != 24){
        return res.status(400).send("Invalid id");
    }
    Coupon.remove({ _id: id })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Coupon deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:5000/coupon',
                body: {
                    isPercent: 'Boolean',
                    amount: 'Number',
                    expireDate: 'Date',
                    remeningNumber: 'Number',
                    isActive: 'Boolean'
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}

exports.coupons_update_coupon = (req, res, next) => {
    const id = req.params.couponId;
    const updateCoupon = {};
    if (req.body.isPercent) updateCoupon.isPercent = req.body.isPercent;
    if (req.body.amount) updateCoupon.amount = req.body.amount;
    if (req.body.expireDate) updateCoupon.expireDate = req.body.expireDate;
    if (req.body.remeningNumber) updateCoupon.remeningNumber = req.body.remeningNumber;
    if (req.body.updated_at) updateCoupon.updated_at = req.body.updated_at;
    Coupon.update({ _id: id }, { $set: updateCoupon })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Coupon updated',
            request: {
                type: "GET",
                url: "http://localhost:5000/coupon/" + id,
            }
        });
    })
}

exports.coupons_use_coupon = (req, res, next) => {
    const id = req.params.couponId;
    if(id.length != 24){
        return res.status(400).send("Invalid id");
    }

    Coupon.findById(id)
    //.select("_id code isPercent amount expireDate remeningNumber isActive created_at updated_at users")
    .exec()
    .then(coupon => {
        if(coupon){
            const currentDate = new Date();

            const update = {};
            if(coupon.remeningNumber <= 0 || Date.parse(coupon.expireDate) < currentDate){
                update.isActive = false;         
            }else{
                update.isActive = true;
            }

            Coupon.update({ _id: id }, { $set: update })
                .exec()
                .then(() => {
                    if(update.isActive){
                        if(!req.body.userId) return res.status(400).send("UserId is required");
                        if(!req.body.amount) return res.status(400).send("amount is required");
                        coupon.remeningNumber = coupon.remeningNumber - 1;
                        coupon.users.push({
                            userId: req.body.userId, 
                            amount: req.body.amount, 
                            created_at: currentDate
                        });
                        Coupon.updateOne({ _id: id }, { $set: coupon })
                        .exec()
                        .then(() => {
                            res.status(200).json({
                                message: 'Coupon successful use',
                                request: {
                                    type: 'GET',
                                    url: 'http://localhost:5000/coupon/' + id
                                }
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    } else {
                        res.status(200).json({
                            message: 'Coupon is Invalid',
                            request: {
                                type: 'GET',
                                url: 'http://localhost:5000/coupon/' + id
                            }
                        });
                    }
                   
                })
                .catch(err => {
                    console.log(err);
                    res.statut(500).json({ error: err });
                });
        } else {
            res.status(404).json({ message: "No coupon found for the provided ID" })
        }
    })
}

exports.coupons_validity_coupon = (req, res, next) => {
    const id = req.params.couponId;
    if(id.length != 24){
        return res.status(400).send("Invalid id");
    }
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
            })
            .catch(err => {
                console.log(err);
                res.statut(500).json({ error: err });
            });
            next();
            
        } else {
            res.status(404).json({ message: "No coupon found for the provided ID" })
        }
    })
    .catch(err => {
        console.log(err);
        res.statut(500).json({ error: err });
    })
}

function coupongenerator(){
    var coupon = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 6; i++) {
        coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  
    for(var i = 0; test(coupon); i++)
  
    return coupon;
}

function test(coupon){
    return Coupon.findOne({ code: coupon });
}