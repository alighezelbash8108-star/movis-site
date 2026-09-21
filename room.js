// آدرس پارامترها رو می‌خونیم
const params = new URLSearchParams(window.location.search);
const roomId = params.get("room"); // اگه از لینک اومده باشه

// اگه اتاق نداشت، خودش می‌سازه
let myRoomId = roomId;

// اگه تو با دکمه ساخت اتاق اومدی، یه کد بساز
if (!myRoomId) {
  myRoomId = Math.random().toString(36).substring(2, 8);
  // آدرس رو آپدیت کن
  window.history.replaceState(null, "", "?room=" + myRoomId);
}

// نمایش لینک دعوت
const inviteLink = window.location.origin + window.location.pathname + "?room=" + myRoomId;
document.getElementById("linkBox").innerText = inviteLink;

// فیلم رو از localStorage لود کن
const movie = JSON.parse(localStorage.getItem("currentMovie"));
const player = document.getElementById("player");
const statusEl = document.getElementById("status");

if (movie) {
  player.src = movie.src;
  player.load();
  document.getElementById("roomTitle").innerText = "🎬 " + movie.title;
} else {
  statusEl.innerText = "⚠️ فیلمی انتخاب نشده، از صفحه اصلی انتخاب کن";
}

// --- PeerJS ---
const peer = new Peer("room-" + myRoomId, {
  debug: 2
});

let conn = null; // اتصال به دوست
let isHost = !roomId; // اگه از لینک اومده، مهمان. اگه خودش ساخت، میزبان

peer.on("open", (id) => {
  if (isHost) {
    statusEl.innerText = "✅ اتاق ساخته شد. منتظر دوستت هستی...";
  } else {
    statusEl.innerText = "🔄 در حال اتصال به میزبان...";
    // به میزبان وصل شو
    connectToHost();
  }
});

peer.on("error", (err) => {
  statusEl.innerText = "❌ خطا: " + err.message;
});

// میزبان: منتظر اتصال مهمان
peer.on("connection", (c) => {
  conn = c;
  statusEl.innerText = "✅ دوستت اومد تو اتاق!";
  setupConnection();
});

// مهمان: به میزبان وصل شو
function connectToHost() {
  conn = peer.connect("room-" + roomId);
  conn.on("open", () => {
    statusEl.innerText = "✅ به اتاق وصل شدی!";
    setupConnection();
  });
}

// توابع ارسال و دریافت پیام‌های سینک
function setupConnection() {
  // وقتی تو پلی/توقف/جلو زدی، به دوستت بفرست
  player.addEventListener("play", () => send("play", player.currentTime));
  player.addEventListener("pause", () => send("pause", player.currentTime));
  player.addEventListener("seeked", () => send("seek", player.currentTime));

  // پیام‌های دریافتی
  conn.on("data", (data) => {
    if (data.type === "play") {
      player.currentTime = data.time;
      player.play();
    } else if (data.type === "pause") {
      player.currentTime = data.time;
      player.pause();
    } else if (data.type === "seek") {
      player.currentTime = data.time;
    }
  });
}

function send(type, time) {
  if (conn && conn.open) {
    conn.send({ type, time });
  }
}

// دکمه کپی لینک
document.getElementById("copyLink").onclick = () => {
  const box = document.getElementById("linkBox");
  box.style.display = "block";
  navigator.clipboard.writeText(inviteLink).then(() => {
    alert("لینک کپی شد! برای دوستت بفرست:\n" + inviteLink);
  }).catch(() => {
    alert("لینک:\n" + inviteLink);
  });
};