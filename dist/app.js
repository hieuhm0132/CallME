"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
app.use(express_1.default.json());
const admin = require('firebase-admin');
const serviceAccount = require("../appcall-95336-firebase-adminsdk-gldkk-030fd64d39.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://appcall-95336-default-rtdb.firebaseio.com"
});
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Working!");
});
app.post("/sendNotification", (req, res) => {
    const message = {
        notification: {
            title: 'Call Incoming!',
            body: 'An User calling you'
        },
        token: req.body.token,
    };
    admin.messaging().send(message).then((res) => {
        console.log('Sended Noti', res);
        res.send("Working!");
    }).catch((err) => {
        console.log(err);
        res.send("Error:" + err);
    });
});
app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map