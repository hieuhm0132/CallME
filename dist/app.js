"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const agora_access_token_1 = __importDefault(require("agora-access-token"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const dbConnect = "mongodb+srv://admin:admin@cluster0.gfyr4.mongodb.net/tinder?retryWrites=true&w=majority";
const options = {
    autoIndex: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
};
mongoose_1.default.connect(dbConnect, options);
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function () {
    console.log("connected");
});
const quote = new mongoose_1.default.Schema({
    quote: String,
    author: String,
});
const appId = "68371bfc640d47a091b607b32dd6599f";
const appCertificate = "f354e072508440c2bf731b600e7f62ea";
const expirationTimeInSeconds = 3600;
const serviceAccount = require("../appcall-95336-firebase-adminsdk-gldkk-2bdb0b1707.json");
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    databaseURL: "https://appcall-95336-default-rtdb.firebaseio.com",
});
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Working!");
});
app.get("/quote/random", (req, res) => {
    const baseJson = {
        errorCode: undefined,
        errorMessage: undefined,
        data: undefined,
    };
    db.model("quotes", quote).find({}, (err, listquote) => {
        if (err) {
            baseJson.errorCode = 403;
            baseJson.errorMessage = "403 Forbidden";
            baseJson.data = [];
        }
        else {
            const randomquote = listquote[Math.floor(Math.random() * listquote.length)];
            console.log(randomquote);
            baseJson.errorCode = 200;
            baseJson.errorMessage = "OK";
            baseJson.data = randomquote;
        }
        res.send(baseJson);
    });
});
app.post("/sendNotification", (req, res) => {
    console.log(req.body);
    const uidCaller = Math.floor(Math.random() * 100000);
    const uidReceiver = Math.floor(Math.random() * 100000);
    const role = req.body.isPublisher
        ? agora_access_token_1.default.RtcRole.PUBLISHER
        : agora_access_token_1.default.RtcRole.SUBSCRIBER;
    const channel = Math.floor(Math.random() * 100000).toString();
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;
    const tokenCaller = agora_access_token_1.default.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channel, uidCaller, role, expirationTimestamp);
    const tokenReceiver = agora_access_token_1.default.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channel, uidReceiver, role, expirationTimestamp);
    const data = {
        channel: channel,
        rtctoken: tokenReceiver,
        uid: uidReceiver,
        appId: appId,
        callerFCMToken: req.body.callerFCMToken,
    };
    const message = {
        notification: {
            title: "A Call Incoming!",
            body: req.body.message,
        },
        token: req.body.receiverFCMToken,
        data: {
            json: JSON.stringify(data),
        },
    };
    firebase_admin_1.default
        .messaging()
        .send(message)
        .then(() => {
        console.log("Sent Call Notification");
        res.send({ uidCaller, appId, channel, tokenCaller });
    })
        .catch((err) => {
        console.log(err);
    });
});
app.post("/rejectCall", (req, res) => {
    const message = {
        notification: {
            title: "Call Rejected!",
            body: req.body.message,
        },
        token: req.body.token,
    };
    firebase_admin_1.default
        .messaging()
        .send(message)
        .then(() => {
        console.log("Sent Reject Notification");
        res.send("Done");
    })
        .catch((err) => {
        console.log(err);
    });
    // res.send({ uid, appId, channel, token });
});
app.listen(port, () => {
    return console.log(`Server is listening on http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map