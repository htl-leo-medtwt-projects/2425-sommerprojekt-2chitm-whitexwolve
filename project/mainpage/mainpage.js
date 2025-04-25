// mainpage.js (ES6 Module)

import { popSongs } from '../song_data/pop.js';
import { rapSongs } from '../song_data/rap.js';
import { rockSongs } from '../song_data/rock.js';

// Alle Songs zusammenführen
const masterSongList = [...popSongs, ...rapSongs, ...rockSongs];

// Konfiguration
const MAX_PLAYLIST_COUNT = 3;
let savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
let currentPlaylistName = null;
let removeMode = false; // Entfernen-Modus

// DOM-Elemente
const sidebarPlaylistContainer = document.querySelector('.playlist-list');
const coverTiles = document.querySelectorAll('.tile');
const mainSongArea = document.getElementById('song-list');
const addPlaylistToggle = document.getElementById('open-add-playlist');
const addPlaylistForm = document.querySelector('.playlist-add-form');
const playlistNameInput = document.getElementById('new-playlist-name');
const confirmAddPlaylistButton = document.getElementById('add-playlist-btn');
const removePlaylistButton = document.getElementById('remove-playlist-btn');

// Formular verstecken
addPlaylistForm.style.display = 'none';

// Formular ein-/ausblenden
addPlaylistToggle.onclick = () => {
  addPlaylistForm.style.display =
    addPlaylistForm.style.display === 'none' ? 'flex' : 'none';
};

// Entfernen-Modus umschalten
removePlaylistButton.onclick = () => {
  removeMode = !removeMode;
  removePlaylistButton.classList.toggle('active', removeMode);
};

// Playlists speichern
function persistPlaylists() {
  localStorage.setItem('playlists', JSON.stringify(savedPlaylists));
}

// Anzahl Songs in Playlist ermitteln
function getPlaylistSongCount(name) {
  return JSON.parse(localStorage.getItem('playlist-' + name) || '[]').length;
}

// Sidebar Playlists rendern
function refreshSidebarPlaylists() {
  sidebarPlaylistContainer.innerHTML = '';

  savedPlaylists.forEach(name => {
    const li = document.createElement('li');
    li.className = 'playlist';

    const entry = document.createElement('div');
    entry.className = 'playlist-entry';
    entry.setAttribute('data-playlist', name);
    entry.innerHTML =
      `<img src="assets/icons/notes.png" alt="">` +
      `<div class="playlist-info">${name}<br>${getPlaylistSongCount(name)} SONGS</div>` +
      `<button class="toggle-button">▼</button>`;
    li.append(entry);

    const songListEl = document.createElement('ul');
    songListEl.className = 'playlist-songs';
    songListEl.style.display = 'none';
    li.append(songListEl);

    // Klick auf Playlist-Entry
    entry.onclick = (e) => {
      if (removeMode) {
        // Playlist löschen
        savedPlaylists = savedPlaylists.filter(x => x !== name);
        persistPlaylists();
        localStorage.removeItem('playlist-' + name);
        removeMode = false;
        removePlaylistButton.classList.remove('active');
        refreshSidebarPlaylists();
        mainSongArea.innerHTML = '';
        return;
      }
      // Toggle Songs anzeigen
      // Ignoriere Klick auf Toggle-Button selbst
      if (e.target.classList.contains('toggle-button')) return;
    };

    // Toggle-Button Klick
    entry.querySelector('.toggle-button').onclick = () => {
      currentPlaylistName = name;
      if (songListEl.style.display === 'none') {
        songListEl.innerHTML = '';
        // Hilfe von Chat-GPT ANFANG
        const songs = JSON.parse(localStorage.getItem('playlist-' + name) || '[]');
        // Hilfe von Chat-GPT ENDE
        songs.forEach(s => {
          const item = document.createElement('li');
          item.className = 'playlist-song-item';
          item.textContent = `${s.bandName} – ${s.songname}`;
          // Song-Klick
          item.onclick = () => {
            if (removeMode) {
              // Song aus Playlist löschen
              // Hilfe von Chat-GPT ANFANG
              const arr = JSON.parse(localStorage.getItem('playlist-' + name) || '[]');
              const filtered = arr.filter(x => x.path !== s.path);
              localStorage.setItem('playlist-' + name, JSON.stringify(filtered));
              // Hilfe von Chat-GPT ENDE
              removeMode = false;
              removePlaylistButton.classList.remove('active');
              refreshSidebarPlaylists();
              songListEl.innerHTML = '';
            }
          };
          songListEl.append(item);
        });
        songListEl.style.display = 'block';
      } else {
        songListEl.style.display = 'none';
      }
    };

    sidebarPlaylistContainer.append(li);
  });
}

// Neue Playlist hinzufügen
confirmAddPlaylistButton.onclick = () => {

  // Hilfe von Chat-GPT ANFANG
    const newName = playlistNameInput.value.trim();
  // Hilfe von Chat-GPT ENDE
  if (!newName) return;
  if (savedPlaylists.includes(newName)) return;
  if (savedPlaylists.length >= MAX_PLAYLIST_COUNT) return;

  savedPlaylists.push(newName);
  persistPlaylists();
  // Hilfe von Chat-GPT ANFANG
  localStorage.setItem('playlist-' + newName, JSON.stringify([]));
  // Hilfe von Chat-GPT ENDE
  playlistNameInput.value = '';
  refreshSidebarPlaylists();
};

// Cover-Tile Klick: Songs anzeigen
coverTiles.forEach(tile => {
  tile.onclick = () => {
    coverTiles.forEach(t => t.classList.remove('selected'));
    tile.classList.add('selected');

    // Hilfe von Chat-GPT ANFANG
      const match = /\/([^\/]+)\.jpg/.exec(tile.style.backgroundImage);
      if (!match) return;
      const raw = match[1].replace(/_/g, ' ');
      const artist = raw
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    // Hilfe von Chat-GPT ENDE

    mainSongArea.innerHTML = '';
    const ul = document.createElement('ul');

    masterSongList.forEach(song => {
      if (song.bandName === artist) {
        const li = document.createElement('li');
        li.innerHTML =
          `<div class="song-details">${song.bandName} – ${song.songname} (${song.duration})</div>` +
          `<div class="song-actions">` +
            `<button class="play-btn">▶️</button>` +
            `<select class="song-playlist-select"></select>` +
            `<button class="add-btn">➕</button>` +
          `</div>`;

        li.querySelector('.play-btn').onclick = () => playAudio(song.path);

        const sel = li.querySelector('.song-playlist-select');
        savedPlaylists.forEach(pl => {
          const opt = document.createElement('option');
          opt.value = pl;
          opt.textContent = pl;
          sel.append(opt);
        });

        // Hilfe von Chat-GPT ANFANG
        li.querySelector('.add-btn').onclick = () => {
          const chosen = sel.value;
          if (!chosen) return;
          const arr = JSON.parse(localStorage.getItem('playlist-' + chosen) || '[]');
          if (!arr.some(x => x.path === song.path)) {
            arr.push(song);
            localStorage.setItem('playlist-' + chosen, JSON.stringify(arr));
            refreshSidebarPlaylists();
          }
        };
        // Hilfe von Chat-GPT ENDE

        ul.append(li);
      }
    });

    mainSongArea.append(ul);
  };
});

// Audio abspielen
function playAudio(path) {
  let audioEl = document.getElementById('audio-player');
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.id = 'audio-player';
    audioEl.controls = true;
    document.querySelector('.main-content').append(audioEl);
  }
  audioEl.src = path;
  audioEl.play();
}

// Initial Sidebar rendern
refreshSidebarPlaylists();
