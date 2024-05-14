const express = require("express");
const {getMessages, createMessage, inserImages, setView, notifications} = require("../controller/MessageController");
const router = express.Router();

router.get("/messages/:roomId", getMessages);

router.post('/messages', createMessage);

router.post('/photo', inserImages);

router.post("/viewMessage", setView);

router.post("/notificatios-user", notifications)

module.exports = router;