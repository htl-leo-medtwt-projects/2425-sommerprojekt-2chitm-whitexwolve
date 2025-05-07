import { popSongs } from '../song_data/pop.js';
import { rapSongs } from '../song_data/rap.js';
import { rockSongs } from '../song_data/rock.js';
import { questions } from '../song_data/questions.js';
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

 // Hilfe von Chat-GPT ANFANG
function saveArtistProgress(artist, stage) {
  const progress = JSON.parse(localStorage.getItem('artistProgress') || '{}');
  progress[artist] = stage;
  localStorage.setItem('artistProgress', JSON.stringify(progress));
}

function getArtistProgress(artist) {
  const progress = JSON.parse(localStorage.getItem('artistProgress') || '{}');
  return progress[artist] || 0; 
}
// Hilfe von Chat-GPT ENDE 

const artistNameMapping = {
  "bad_meets_evil": "Bad Meets Evil",
  "eminem": "Eminem",
  "bon_jovi": "Bon Jovi",
  "coldplay": "Coldplay",
  "imagine_dragons": "Imagine Dragons",
  "queen": "Queen"
};

coverTiles.forEach(tile => {
  const match = /\/([^\/]+)\.jpg/.exec(tile.style.backgroundImage);
  if (!match) return;
  const extractedName = match[1];
  const artist = artistNameMapping[extractedName];

  if (!artist) return;

  const progress = getArtistProgress(artist);

  // Aktualisiere die Darstellung basierend auf dem Fortschritt
  if (progress > 0) {
    tile.classList.remove('locked');
    tile.style.filter = 'none'; // Entferne Graustufen
  }

  // Klick-Handler für das Tile
  tile.onclick = () => {
    if (progress === 0) {
      // Stufe 1: Freischaltung des Künstlers
      showQuiz(artist, 1, success => {
        if (success) {
          saveArtistProgress(artist, 1);
          tile.classList.remove('locked'); // Schloss-Symbol entfernen
          tile.style.filter = 'none'; // Entferne Graustufen
          renderSongsForArtist(artist);
        }
      });
    } else {
      // Zeige die Lieder des Künstlers
      renderSongsForArtist(artist);
    }
  };
});

// Logik für die Cover-Tiles
 // Hilfe von Chat-GPT ANFANG

coverTiles.forEach(tile => {
  const match = /\/([^\/]+)\.jpg/.exec(tile.style.backgroundImage);
  if (!match) return;
  const extractedName = match[1];
  const artist = artistNameMapping[extractedName];

// Hilfe von Chat-GPT ENDE

  if (!artist) return;

  const artistData = masterSongList.find(song => song.bandName === artist);
  if (artistData && artistData.locked) {
    tile.classList.add('locked');
  }

  // Aktualisiere die Darstellung basierend auf dem Fortschritt
  const progress = getArtistProgress(artist);
  if (progress > 0) {
    tile.classList.remove('locked');
    tile.style.filter = 'none'; // Entferne Graustufen
  }

  // Klick-Handler für das Tile
  tile.onclick = () => {
    if (progress === 0) {
      // Stufe 1: Freischaltung des Künstlers
      showQuiz(artist, 1, success => {
        if (success) {
          saveArtistProgress(artist, 1);
          tile.classList.remove('locked'); // Schloss-Symbol entfernen
          tile.style.filter = 'none'; // Entferne Graustufen
          renderSongsForArtist(artist);
        }
      });
    } else if (progress === 1) {
      // Stufe 2: Freischaltung der ersten Hälfte der Lieder
      showQuiz(artist, 2, success => {
        if (success) {
          saveArtistProgress(artist, 2);
          renderSongsForArtist(artist);
        }
      });
    } else if (progress === 2) {
      // Stufe 3: Freischaltung der zweiten Hälfte der Lieder
      showQuiz(artist, 3, success => {
        if (success) {
          saveArtistProgress(artist, 3);
          renderSongsForArtist(artist);
        }
      });
    }
  };
});

function renderSongsForArtist(artist) {
  const progress = getArtistProgress(artist); // Fortschritt abrufen
  mainSongArea.innerHTML = '';
  const ul = document.createElement('ul');

  masterSongList.forEach((song, index) => {
    if (song.bandName === artist) {
      const li = document.createElement('li');
      li.className = 'song-item';

      // Songdetails
      const songDetails = document.createElement('div');
      songDetails.className = 'song-details';
      songDetails.textContent = `${song.bandName} – ${song.songname} (${song.duration})`;

      // Abspielbutton
      const playButton = document.createElement('button');
      playButton.textContent = '▶️';
      playButton.className = 'play-btn';
      playButton.disabled = !(progress > 1 || (progress === 1 && index < masterSongList.length / 2));
      playButton.onclick = () => playAudio(song.path);

      // Dropdown-Menü
      const dropdown = document.createElement('select');
      dropdown.className = 'playlist-dropdown';
      savedPlaylists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist;
        option.textContent = playlist;
        dropdown.append(option);
      });

      // Bestätigungsbutton
      const addButton = document.createElement('button');
      addButton.textContent = '➕';
      addButton.className = 'add-btn';
      addButton.disabled = !(progress > 1 || (progress === 1 && index < masterSongList.length / 2));
      addButton.onclick = () => {
        const selectedPlaylist = dropdown.value;
        const playlistSongs = JSON.parse(localStorage.getItem('playlist-' + selectedPlaylist) || '[]');
        playlistSongs.push(song);
        localStorage.setItem('playlist-' + selectedPlaylist, JSON.stringify(playlistSongs));
        refreshSidebarPlaylists(); // Sidebar aktualisieren
      };

      // Aktionen nur erlauben, wenn der Fortschritt es zulässt
      if (progress > 1 || (progress === 1 && index < masterSongList.length / 2)) {
        li.classList.remove('locked');
      } else {
        li.classList.add('locked');
        playButton.disabled = true;
        addButton.disabled = true;

        // Klick-Handler für gesperrte Lieder
        li.onclick = () => {
          showQuiz(artist, progress + 1, success => {
            if (success) {
              saveArtistProgress(artist, progress + 1);
              renderSongsForArtist(artist);
            }
          });
        };
      }

      // Elemente zusammenfügen
      const actions = document.createElement('div');
      actions.className = 'song-actions';
      actions.append(playButton, dropdown, addButton);

      li.append(songDetails, actions);
      ul.append(li);
    }
  });

  mainSongArea.append(ul);
}

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



function showQuiz(artist, stage, callback) {
  const artistData = questions.find(q => q.artist === artist);
  if (!artistData) {
    console.error(`Keine Fragen für den Künstler "${artist}" gefunden.`);
    return;
  }

  const question = artistData.questions[stage - 1]; // Frage basierend auf der Stufe
  if (!question) {
    console.error(`Keine Frage für Stufe ${stage} des Künstlers "${artist}" gefunden.`);
    return;
  }

  const quizContainer = document.createElement('div');
  quizContainer.className = 'quiz-container';
  quizContainer.innerHTML = `
    <div class="quiz">
      <h2>Quiz für ${artist} - Stufe ${stage}</h2>
      <div class="quiz-question">
        <p>${question.question}</p>
      </div>
      <div class="quiz-options">
        ${question.options
          .sort(() => Math.random() - 0.5) // Zufällige Anordnung der Antworten
          .map(
            option =>
              `<button class="quiz-option" data-correct="${option === question.correct}">${option}</button>`
          )
          .join('')}
      </div>
    </div>
  `;
  document.body.append(quizContainer);

  quizContainer.querySelectorAll('.quiz-option').forEach(button => {
    button.onclick = () => {
      const isCorrect = button.getAttribute('data-correct') === 'true';
      if (isCorrect) {
        button.classList.add('correct');
        setTimeout(() => {
          quizContainer.remove();
          callback(true); // Quiz erfolgreich
        }, 1000);
      } else {
        button.classList.add('wrong');
        setTimeout(() => {
          quizContainer.remove();
          callback(false); // Quiz nicht erfolgreich
        }, 1000);
      }
    };
  });
}
// Hilfe von Chat-GPT ANFANG
window.onload = () => {
  coverTiles.forEach(tile => {
    const match = /\/([^\/]+)\.jpg/.exec(tile.style.backgroundImage);
    if (!match) return;
    const extractedName = match[1];
    const artist = artistNameMapping[extractedName];

    if (!artist) return;

    const progress = getArtistProgress(artist);
    if (progress > 0) {
      tile.classList.remove('locked');
      tile.style.filter = 'none';
    }
  });
};
// Hilfe von Chat-GPT ENDE