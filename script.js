
let currentPage = 1;
let isDark = false;

document.getElementById('search').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchMovies();
});

document.getElementById('trending').onclick = () => loadTrending();
document.getElementById('dark-toggle').onclick = toggleDarkMode;

loadTrending(); 

async function searchMovies() {
  const query = document.getElementById('search').value.trim();
  if (!query) return loadTrending();
  
  showLoading();
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=${encodeURIComponent(query)}&page=1`
    );
    const data = await res.json();
    showMovies(data.results);
  } catch (error) {
    document.getElementById('movies-grid').innerHTML = '<div class="loading">Error loading movies!</div>';
  }
}

async function loadTrending() {
  showLoading();
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=3fd2be6f0c70a2a598f084ddfb75487c`
    );
    const data = await res.json();
    showMovies(data.results);
    document.getElementById('search').value = '';
  } catch (error) {
    document.getElementById('movies-grid').innerHTML = '<div class="loading">Error loading movies!</div>';
  }
}

function showMovies(movies) {
  const grid = document.getElementById('movies-grid');
  grid.innerHTML = movies.map(movie => `
    <div class="movie-card" onclick="showMovieDetails('${movie.id}', '${movie.media_type}')">
      <img class="movie-poster" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
           onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'" alt="${movie.title || movie.name}">
      <h3 class="movie-title">${movie.title || movie.name}</h3>
      <div class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
      <p>${movie.release_date || movie.first_air_date || 'Coming Soon'}</p>
    </div>
  `).join('');
}

function showMovieDetails(id, type) {
  window.open(`https://www.themoviedb.org/${type}/movie/${id}`, '_blank');
}

function showLoading() {
  document.getElementById('movies-grid').innerHTML = '<div class="loading">🔄 Loading movies...</div>';
}

function toggleDarkMode() {
  isDark = !isDark;
  document.body.classList.toggle('dark-mode', isDark);
  document.getElementById('dark-toggle').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('movie-theme', isDark);
}


if (localStorage.getItem('movie-theme') === 'true') {
  toggleDarkMode();
}
