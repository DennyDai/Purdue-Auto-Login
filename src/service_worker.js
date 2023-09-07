chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage();
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        // Migration
        chrome.storage.sync.get(["key", "counter", "hotp_secret", "hotp_counter"], function (result) {
            // If the user has a key and a counter, migrate to hotp_secret and hotp_counter
            if (result.key && result.counter && !result.hotp_secret && !result.hotp_counter) {
                chrome.storage.sync.set({
                    "hotp_secret": result.key,
                    "hotp_counter": result.counter
                });
            }
        });
    }
});
