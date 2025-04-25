// mainpage.js

import { popSongs, rapSongs, rockSongs } from './songs.js'; // falls du Songs ausgelagert hast

const allSongs = [...popSongs, ...rapSongs, ...rockSongs];
const playlists = [];
const maxPlaylists = 3;

const playlistListEl = document.querySelector('.playlist-list');
const songListEl = document.getElementById('song-list');
const addPlaylistInput = document.getElementById('new-playlist-name');
const addPlaylistBtn = document.getElementById('add-playlist-btn');

function renderPlaylists() {
  playlistListEl.innerHTML = '';
  playlists.forEach((name, index) => {
    const li = document.createElement('li');
    li.className = 'playlist';
    li.innerHTML = `
      <img src="/project/mainpage/asstets/icons/notes.png" alt="Icon">
      <div>
        <strong>${name}</strong><br>
        <span>${getPlaylistSongCount(name)} SONGS</span>
      </div>
      <button class="toggle-button" onclick="showPlaylist('${name}')">▼</button>
    `;
    playlistListEl.appendChild(li);
  });
}

function getPlaylistSongCount(name) {
  const songs = JSON.parse(localStorage.getItem(`playlist-${name}`) || '[]');
  return songs.length;
}

function updateAllDropdowns() {
  const selects = document.querySelectorAll('.song-playlist-select');
  selects.forEach(select => {
    select.innerHTML = playlists.map(p => `<option value="${p}">${p}</option>`).join('');
  });
}

window.playSong = function (path) {
  let player = document.getElementById('audio-player');
  if (!player) {
    player = document.createElement('audio');
    player.id = 'audio-player';
    player.controls = true;
    document.body.appendChild(player);
  }
  player.src = path;
  player.play();
};

window.addToPlaylist = function (song, playlistName) {
  const stored = JSON.parse(localStorage.getItem(`playlist-${playlistName}`) || '[]');
  stored.push(song);
  localStorage.setItem(`playlist-${playlistName}`, JSON.stringify(stored));
  renderPlaylists();
};

window.showPlaylist = function (playlistName) {
  const songs = JSON.parse(localStorage.getItem(`playlist-${playlistName}`) || '[]');
  renderSongs(songs);
};

function renderSongs(songArray) {
  songListEl.innerHTML = '<ul>' + songArray.map(song => `
    <li>
      <div>
        <strong>${song.bandName} – ${song.songname}</strong><br>
        <span>${song.duration} (${song.genre})</span>
      </div>
      <div class="song-actions">
        <button onclick="playSong('${song.path}')">▶️</button>
        <select class="song-playlist-select">
          ${playlists.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <button onclick='addToPlaylist(${JSON.stringify(song)}, this.previousElementSibling.value)'>➕</button>
      </div>
    </li>`).join('') + '</ul>';
  updateAllDropdowns();
}

// Künstler-Tiles → Songs anzeigen
document.querySelectorAll('.tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const artistName = getArtistFromImage(tile.style.backgroundImage);
    const songsByArtist = allSongs.filter(song => song.bandName === artistName);
    renderSongs(songsByArtist);
  });
});

function getArtistFromImage(bgImage) {
  const filename = bgImage.match(/\/([^\/]+)\.jpg/)[1];
  const words = filename.split('_');
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Playlist hinzufügen
addPlaylistBtn.addEventListener('click', () => {
  const name = addPlaylistInput.value.trim();
  if (!name || playlists.includes(name) || playlists.length >= maxPlaylists) return;

  playlists.push(name);
  localStorage.setItem('playlists', JSON.stringify(playlists));
  renderPlaylists();
  updateAllDropdowns();
  addPlaylistInput.value = '';
});

// Beim Laden gespeicherte Playlists laden
const saved = JSON.parse(localStorage.getItem('playlists') || '[]');
if (Array.isArray(saved)) {
  playlists.push(...saved);
  renderPlaylists();
}
