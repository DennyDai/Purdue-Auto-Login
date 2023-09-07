window.onload = () => {
    var $ = (name) => { return document.getElementsByName(name)[0]; };
    var activationCode;
    chrome.storage.sync.get(["username", "password", "activationCode", "hotp_secret", "hotp_counter", "privkey", "pubkey"], (result) => {
        if (result.username) $("username").value = result.username;
        if (result.password) $("password").value = result.password;
        if (result.activationCode) $("activationCode").value = activationCode = result.activationCode;
        if (result.hotp_secret) $("hotp_secret").value = result.hotp_secret;
        if (result.hotp_counter) $("hotp_counter").value = result.hotp_counter;
        if (result.privkey) $("privkey").value = result.privkey;
        if (result.pubkey) $("pubkey").value = result.pubkey;
    });

    document.getElementById('settings').addEventListener("submit", async (e) => {
        e.preventDefault();
        chrome.storage.sync.set({
            "username": $("username").value,
            "password": $("password").value,
            "hotp_secret": $("hotp_secret").value,
            "hotp_counter": $("hotp_counter").value,
            "privkey": $("privkey").value,
            "pubkey": $("pubkey").value
        });

        // If the activation code has changed, generate a new keypair and activate Duo Mobile
        if (activationCode != $("activationCode").value) {
            const keyPair = await generateRSAKeyPair();
            activateDuoMobile($("activationCode").value, await exporKeyToBase64(keyPair.publicKey)).then(async (response) => {
                const duoResult = await response.json();
                if (duoResult["stat"] == "OK") {
                    chrome.storage.sync.set({
                        "activationCode": $("activationCode").value,
                        "hotp_secret": duoResult["response"]["hotp_secret"],
                        "hotp_counter": 10,
                        "privkey": await exporKeyToBase64(keyPair.privateKey),
                        "pubkey": await exporKeyToBase64(keyPair.publicKey)
                    });
                    prompt("Success!", JSON.stringify(duoResult));
                } else {
                    alert(JSON.stringify(duoResult));
                }
            }).catch((error) => { alert(error); });
        } else {
            alert("SAVED!");
        }
        return true;
    });

    async function generateRSAKeyPair() {
        return await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
    }

    async function exporKeyToBase64(key) {
        return window.btoa(String.fromCharCode(...new Uint8Array(await window.crypto.subtle.exportKey(key.type === "private" ? "pkcs8" : "spki", key))));
    }

    // Save for later use
    // async function importKeyFromBase64(base64, type) {
    //     return await window.crypto.subtle.importKey(type === "private" ? "pkcs8" : "spki", new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0))), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, type === "private" ? ["sign"] : ["verify"]);
    // }

    async function activateDuoMobile(activationCode, pubkey) {
        const myHeaders = new Headers({ "User-Agent": "okhttp/5.0.0", "Content-Type": "application/x-www-form-urlencoded" });
        const urlencoded = new URLSearchParams({
            jailbroken: "false",
            architecture: "arch64",
            region: "US",
            app_id: "com.duosecurity.duomobile",
            full_disk_encryption: "true",
            passcode_status: "true",
            platform: "Android",
            app_version: "4.48.0",
            app_build_number: "448010",
            version: "13.0.0",
            manufacturer: "Purdue Auto Login",
            language: "en",
            model: "Extension",
            security_patch_level: "2023-08-05",
            pkpush: "rsa-sha512",
            pubkey: pubkey
        });

        return fetch("https://api-1b9bef70.duosecurity.com/push/v2/activation/" + activationCode, { method: 'POST', headers: myHeaders, body: urlencoded, redirect: 'follow' });
    }
}
