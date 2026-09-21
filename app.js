const defaultMovies = [
  {
    id: 1,
    title: "فیلم اول من",
    poster: "https://picsum.photos/300/450?random=1",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "action",
    rating: 8.5,
    year: 2024,
    duration: "۱۲۰ دقیقه"
  },
  {
    id: 2,
    title: "فیلم دوم من",
    poster: "https://picsum.photos/300/450?random=2",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    category: "comedy",
    rating: 7.8,
    year: 2023,
    duration: "۹۵ دقیقه"
  },
  {
    id: 3,
    title: "فیلم سوم من",
    poster: "https://picsum.photos/300/450?random=3",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "drama",
    rating: 9.1,
    year: 2025,
    duration: "۱۴۰ دقیقه"
  }
];

let uploadedMovies = JSON.parse(localStorage.getItem("uploadedMovies") || "[]");

const list = document.getElementById("movieList");
const search = document.getElementById("search");
const fileInput = document.getElementById("fileInput");
const uploadInput = document.getElementById("uploadInput");
const addBtn = document.getElementById("addFromGallery");
const uploadBtn = document.getElementById("uploadToServer");
const statusBox = document.getElementById("uploadStatus");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

let currentCategory = "all";

function getAllMovies() {
  return [...uploadedMovies, ...defaultMovies];
}

function renderMovies(filter = "") {
  list.innerHTML = "";
  getAllMovies()
    .filter(m => {
      const matchSearch = m.title.includes(filter);
      const matchCat = currentCategory === "all" || m.category === currentCategory;
      return matchSearch && matchCat;
    })
    .forEach(m => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <div class="badge">⭐ ${m.rating || "?"}</div>
        <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/300x450/1DB954/000?text=No+Image'">
        <div class="info">
          <div class="title">${m.title}</div>
          <div class="meta">
            <span>${m.year || ""}</span>
            <span class="rating">⭐ ${m.rating || "?"}</span>
          </div>
        </div>
      `;
      card.onclick = () => {
        localStorage.setItem("currentMovie", JSON.stringify(m));
        window.location.href = "watch.html";
      };
      list.appendChild(card);
    });
}

// منو
menuBtn.onclick = () => menu.classList.toggle("hidden");

// جستجو
search.addEventListener("input", e => renderMovies(e.target.value));

// دسته‌بندی
document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    renderMovies(search.value);
  };
});

// افزودن از گالری (پخش فوری)
addBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:9999;display:flex;flex-direction:column;";
  
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕ بستن";
  closeBtn.style.cssText = "background:#1DB954;color:#000;border:none;padding:12px;font-size:14px;cursor:pointer;font-weight:bold;";
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    URL.revokeObjectURL(url);
  };

  const video = document.createElement("video");
  video.src = url;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.style.cssText = "width:100%;flex:1;background:#000;object-fit:contain;";

  overlay.appendChild(closeBtn);
  overlay.appendChild(video);
  document.body.appendChild(overlay);

  fileInput.value = "";
};

// آپلود به uguu.se
uploadBtn.onclick = () => uploadInput.click();

uploadInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 128 * 1024 * 1024) {
    alert("⚠️ فایل بزرگ‌تر از ۱۲۸ مگابایته!");
    uploadInput.value = "";
    return;
  }

  statusBox.classList.remove("hidden");
  statusBox.innerText = "⏳ در حال آپلود...";

  try {
    const formData = new FormData();
    formData.append("files[]", file);

    const response = await fetch("https://uguu.se/upload.php", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("خطا");

    const data = await response.json();
    const url = data.files[0].url;

    const title = file.name.replace(/\.[^/.]+$/, "");
    const poster = "https://via.placeholder.com/300x450/1DB954/000?text=" + encodeURIComponent(title);

    const newMovie = {
      id: "uploaded-" + Date.now(),
      title: title,
      poster: poster,
      src: url,
      category: "action",
      rating: 8.0,
      year: 2025
    };

    uploadedMovies.unshift(newMovie);
    localStorage.setItem("uploadedMovies", JSON.stringify(uploadedMovies));
    renderMovies(search.value);

    statusBox.innerText = "✅ آپلود شد!";
    alert("✅ آپلود شد: " + title);

  } catch (err) {
    statusBox.innerText = "❌ خطا: " + err.message;
  }

  uploadInput.value = "";
};

renderMovies();