function saveRegisterData() {
    const usernameInput = document.getElementById("accountUsername");
    const passwordInput = document.getElementById("accountPassword");
    const repeatPasswordInput = document.getElementById("accountRepeatPassword");
    const ageInput = document.getElementById("accountAge");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const repeatPassword = repeatPasswordInput.value;
    const age = parseInt(ageInput.value);

    removeErrorMessage();

    if (password !== repeatPassword) {
        showErrorMessage("⚠️ Passwords do not match.");
        return;
    }

    if (username.length < 5) {
        showErrorMessage("⚠️ Username must be at least 5 characters.");
        return;
    }

    if (isUsernameTaken(username)) {
        showErrorMessage("⚠️ This username is already taken.");
        return;
    }

    if (!validatePassword(password)) {
        showErrorMessage("⚠️ Password must be at least 8 characters, include a number, a lowercase letter, and an uppercase letter.");
        return;
    }

    if (age < 16) {
        showErrorMessage("⚠️ You must be at least 16 years old to register.");
        return;
    }

    const userData = {
        username: username,
        password: password,
        age: age
    };

    localStorage.setItem("userData", JSON.stringify(userData));

    const areaButtons = document.getElementById("areaButtons");
    areaButtons.innerHTML = `
        <div style="font-size: 3rem; text-align: center; padding: 2rem;">
            <h2 style="color: #4CAF50; animation: fadeIn 0.3s ease;">✅ Registration was successful!</h2>
        </div>
    `;
}

function isUsernameTaken(username) {
    const existingUserData = JSON.parse(localStorage.getItem("userData"));
    if (existingUserData && existingUserData.username === username) {
        return true;
    }
    return false;
}

function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber;
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
