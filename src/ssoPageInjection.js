if (document.readyState === "complete") {
    initialize();
} else {
    document.addEventListener("DOMContentLoaded", initialize);
}

function initialize() {
    chrome.storage.local.set({ "autologin": false });
    var loginButton = document.querySelector('button[value="Login"]');
    loginButton.parentNode.insertAdjacentHTML('beforebegin', '<div class="submit d-flex justify-content-end align-items-end"><button style="margin-bottom: 5px;" class="btn btn-dark px-5 rounded-0" value="autologin">Auto Log in</button></div>');

    document.querySelector('button[value="autologin"]').addEventListener("click", (e) => {
        e.preventDefault();
        chrome.storage.local.set({ "autologin": true });
        chrome.storage.sync.get(["username", "password", "hotp_counter", "hotp_secret"], (result) => {
            if (!result.hotp_secret || !result.hotp_counter) {
                alert("Please proceed to the settings page to complete the auto-login setup before continuing.");
            } else {
                if (result.username && result.password) {
                    document.getElementById("username").value = result.username;
                    document.getElementById("password").value = result.password;
                }
                loginButton.click();
            }
        });
        return false;
    });
}
