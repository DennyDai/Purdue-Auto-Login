window.onload=function(){
    chrome.storage.local.set({"autologin": false});
    var loginButton = document.querySelector('button[value="Login"]');
    loginButton.parentNode.insertAdjacentHTML('beforebegin', '<div class="submit d-flex justify-content-end align-items-end"><button style="margin-bottom: 5px;" class="btn btn-dark px-5 rounded-0" value="autologin">Auto Log in</button></div>');
    var autologinButton = document.querySelector('button[value="autologin"]');
    function processForm(e) {
        e.preventDefault();
        chrome.storage.local.set({"autologin": true});
        chrome.storage.sync.get(["username", "password", "counter", "key"], function(result) {
            if(result.key && result.counter && result.username && result.password){
                document.getElementById("username").value = result.username;
                document.getElementById("password").value = result.password;
                loginButton.click();
            }else{
                alert("Please complete auto login setup before continuing.");
            }
        });
        return false;
    }

    autologinButton.addEventListener("click", processForm);
}
