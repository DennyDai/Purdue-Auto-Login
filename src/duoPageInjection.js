window.onload=function(){
    chrome.storage.local.get(["autologin"], function(result) {
        if(result.autologin){
            var passcodeInput = document.querySelector('.passcode-input');
            if (!passcodeInput) {
                let url = new URL(window.location.href);
                if (url.pathname === '/frame/v4/auth/prompt') {
                    let newUrl = new URL('https://api-1b9bef70.duosecurity.com/frame/v4/auth/all_methods');
                    newUrl.searchParams.set('sid', url.searchParams.get('sid'));
                    window.location.href = newUrl.href;
                }

                setTimeout(function() {
                    document.querySelector('li[data-testid="test-id-mobile-otp"] a').click();
                    passcodeInput = document.querySelector('.passcode-input');
                }, 500);
            }

            setTimeout(function() {                
            chrome.storage.sync.get(["counter", "key"], function(result) {
                if(result.key && result.counter){
                    otp = hotp(result.key, result.counter);
                    passcodeInput.value = otp;
                    passcodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    chrome.storage.sync.set({"counter": parseInt(result.counter) + 1});
                    document.querySelector('button[type="submit"]').click();
                }else{
                    alert("Please proceed to the settings page to complete the auto-login setup before continuing.");
                }
            });
            }, 500);
        }
    });
}
