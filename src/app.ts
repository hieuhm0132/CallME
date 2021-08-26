import express from "express";

const app = express();
app.use(express.json());

const Agora = require("agora-access-token");
const appId = "68371bfc640d47a091b607b32dd6599f";
const appCertificate = "f354e072508440c2bf731b600e7f62ea";
const expirationTimeInSeconds = 3600;

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
  console.log(req.body)

  const uid = req.body.uid;
  const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  const channel = Math.floor(Math.random() * 100000).toString();
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;
  const token = Agora.RtcTokenBuilder.buildTokenWithAccount(appId, appCertificate, channel, uid, role, expirationTimestamp);

  const message = {
    notification: {
      title: 'A Call Incoming!',
      body: req.body.message
    },
    token: req.body.token,
    data: {
      channel: channel,
    }
  }

  admin.messaging().send(message).then(() => {
    console.log('Sent Notification')
    res.send({ appId, channel, token });
  }).catch(err => {
    console.log(err)
  })
})

app.listen(port, () => {
  return console.log(`Server is listening on http://localhost:${port}`);
});