const express = require("express");

const upload = require("../DAL/multer")

const router = express.Router();

const {getUserEstimates, creatEstimate, getEstimateById, setStateStimate} = require("../controller/estimateController")

router.post("/rooms", getUserEstimates);

router.post("/create-estimate", upload.single("img"), creatEstimate);

router.post("/estimate-by-id", getEstimateById);

router.post("/set-estimate-state", setStateStimate); 

module.exports = router;