window.onload = () => {
    chrome.storage.local.get(["autologin"], (result) => {
        if (!result.autologin) {
            return;
        }

        let passcodeInput = document.querySelector('.passcode-input');
        if (!passcodeInput) {
            const url = new URL(window.location.href);

            if (url.pathname === '/frame/v4/auth/prompt') {
                const newUrl = new URL('https://api-1b9bef70.duosecurity.com/frame/v4/auth/all_methods');
                newUrl.searchParams.set('sid', url.searchParams.get('sid'));
                window.location.href = newUrl.href;
            }

            waitForElement('li[data-testid="test-id-mobile-otp"] a', (element) => {
                element.click();
            });
        }

        setTimeout(() => { }, 500);
        waitForElement('.passcode-input', (passcodeInput) => {
            chrome.storage.sync.get(["hotp_counter", "hotp_secret"], (result) => {
                if (result.hotp_secret && result.hotp_counter) {
                    hotp(result.hotp_secret, result.hotp_counter).then(otp => {
                        passcodeInput.value = otp;
                        passcodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                        chrome.storage.sync.set({ "hotp_counter": parseInt(result.hotp_counter) + 1 });
                        document.querySelector('button[type="submit"]').click();
                    });
                } else {
                    alert("Please proceed to the settings page to complete the auto-login setup before continuing.");
                }
            });
        });
    });

    async function hotp(secret, counter) {
        const buffer = new DataView(new ArrayBuffer(8));
        buffer.setUint32(4, counter);
        const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]), buffer.buffer));
        const offset = signature[signature.length - 1] & 0xf;
        return (((signature[offset] & 0x7f) << 24 | signature[offset + 1] << 16 | signature[offset + 2] << 8 | signature[offset + 3]) % 1e6).toString().padStart(6, "0");
    }

    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => {
                waitForElement(selector, callback);
            }, 500);
        }
    }
}
