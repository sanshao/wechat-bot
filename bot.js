import { WechatyBuilder } from "wechaty";
import qrcodeTerminal from "qrcode-terminal";
import { handleSolanaMessage } from "./sol.js";
// import { db } from './db.js'

const ScanStatus = {
  Unknown: 0,
  Cancel: 1,
  Waiting: 2,
  Scanned: 3,
  Confirmed: 4,
  Timeout: 5,
};

function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");
    console.info(
      "StarterBot",
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );

    qrcodeTerminal.generate(qrcode, { small: true }); // show qrcode on console
  } else {
    console.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
  }
}

function onLogin(user) {
  console.info("StarterBot", "%s login", user);
}

function onLogout(user) {
  console.info("StarterBot", "%s logout", user);
}

async function onMessage(msg) {
  console.info("StarterBot", msg.toString());

  if (msg.text() === "ding") {
    await msg.say("dong");
  }
  let text = msg.text();
  try {
    let replyText = await handleSolanaMessage(text);
    if (replyText) {
      await msg.say(replyText);
      // db.addQueryCount(text);
    }
  } catch (error) {
    console.log(error);
  }
}

const wechaty = WechatyBuilder.build(); // get a Wechaty instance
wechaty.on("scan", onScan).on("login", onLogin).on("message", onMessage);

wechaty
  .start()
  .then(() => console.info("StarterBot", "Starter Bot Started."))
  .catch((e) => console.error("StarterBot", e));
