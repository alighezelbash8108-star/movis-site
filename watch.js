const movie = JSON.parse(localStorage.getItem("currentMovie"));
const player = document.getElementById("player");

const categoryNames = {
  action: "🎬 اکشن",
  comedy: "😂 کمدی",
  drama: "🎭 درام",
  horror: "👻 ترسناک",
  scifi: "🚀 علمی-تخیلی",
  animation: "🎨 انیمیشن"
};

if (movie) {
  document.getElementById("movieTitle").innerText = movie.title;
  document.getElementById("movieYear").innerText = "📅 " + (movie.year || "۲۰۲۴");
  document.getElementById("movieDuration").innerText = "⏱ " + (movie.duration || "۹۰ دقیقه");
  document.getElementById("movieRating").innerText = "⭐ " + (movie.rating || "8.0");
  document.getElementById("movieCategory").innerText = categoryNames[movie.category] || "🎬 فیلم";
  
  player.src = movie.src;
  player.load();
} else {
  document.getElementById("movieTitle").innerText = "فیلمی انتخاب نشده";
}

document.getElementById("backBtn").onclick = () => {
  window.location.href = "index.html";
};

document.getElementById("favoriteBtn").onclick = () => {
  if (!movie) return;
  
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const exists = favorites.find(f => f.id === movie.id);
  
  if (exists) {
    favorites = favorites.filter(f => f.id !== movie.id);
    alert("❌ از علاقه‌مندی‌ها حذف شد");
  } else {
    favorites.push(movie);
    alert("❤️ به علاقه‌مندی‌ها اضافه شد");
  }
  
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

document.getElementById("shareBtn").onclick = async () => {
  if (!movie) return;
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: movie.title,
        text: "این فیلم رو ببین: " + movie.title
      });
    } else {
      await navigator.clipboard.writeText(movie.title + "\n" + movie.src);
      alert("📋 لینک کپی شد!");
    }
  } catch (err) {}
};

document.getElementById("createRoom").onclick = () => {
  window.location.href = "room.html";
};

const allMovies = [
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

function renderSimilar() {
  const container = document.getElementById("similarMovies");
  container.innerHTML = "";
  
  allMovies
    .filter(m => !movie || m.id !== movie.id)
    .forEach(m => {
      const card = document.createElement("div");
      card.className = "similar-card";
      card.innerHTML = `
        <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/300x450/1DB954/000?text=No+Image'">
        <p class="similar-title">${m.title}</p>
        <p class="similar-rating">⭐ ${m.rating}</p>
      `;
      card.onclick = () => {
        localStorage.setItem("currentMovie", JSON.stringify(m));
        window.location.reload();
      };
      container.appendChild(card);
    });
}

if (movie) renderSimilar();