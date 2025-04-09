function saveLoginData() {
    const usernameInput = document.getElementById("accountUsername");
    const passwordInput = document.getElementById("accountPassword");
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    removeErrorMessage();

    // Überprüfen, ob Benutzer im LocalStorage existiert
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData) {
        // Wenn der Benutzer nicht existiert, Fehler anzeigen
        usernameInput.value = "";
        passwordInput.value = "";
        showErrorMessage("⚠️ No user found! Please register first.");
        return;
    }

    // Überprüfen, ob die Anmeldedaten korrekt sind
    if (userData.username !== username || userData.password !== password) {
        // Wenn die Anmeldedaten falsch sind, Fehler anzeigen
        usernameInput.value = "";
        passwordInput.value = "";
        showErrorMessage("⚠️ Invalid login! Check your username or password.");
        return;
    }

    // Wenn alles passt, Erfolg anzeigen
    const areaButtons = document.getElementById("areaButtons");
    areaButtons.innerHTML = `
        <div style="font-size: 3rem; text-align: center; padding: 2rem;">
            <h2 style="color: #4CAF50; animation: fadeIn 0.3s ease;">✅ Log-In was a success!</h2>
        </div>
    `;
}

function showErrorMessage(message) {
    const areaButtons = document.getElementById("areaButtons");
    const errorBox = `
        <div id="errorBox">
            ${message}
        </div>
    `;
    areaButtons.insertAdjacentHTML('afterbegin', errorBox);
    setTimeout(removeErrorMessage, 4000);
}

function removeErrorMessage() {
    const oldError = document.getElementById("errorBox");
    if (oldError) {
        oldError.remove();
    }
}

function redirect(path) {
    window.location.href = path;
}
