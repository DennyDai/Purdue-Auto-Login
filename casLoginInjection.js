window.onload=function(){
    document.getElementById("boilerKeyLogo").innerHTML = "<button>Bypass BoilerKey, Login NOW</button>";
    function processForm(e) {
        e.preventDefault();
        chrome.storage.sync.get(["counter", "alias", "pin", "key"], function(result) {
            if(result.key && result.counter && result.alias && result.pin){
                otp = hotp(result.key, result.counter);
                document.getElementById("username").value = result.alias;
                document.getElementById("password").value = result.pin + "," + otp;
                chrome.storage.sync.set({"counter": parseInt(result.counter) + 1});
                document.getElementsByName("submit")[0].click();
            }else{
                alert("Please complete auto login setup before continuing.");
            }
        });
        return false;
    }

    var form = document.getElementById('boilerKeyLogo');
    form.addEventListener("click", processForm);
}