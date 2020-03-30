window.onload=function(){
    var activationCode;
    var form = document.getElementById('settings');
    form.addEventListener("submit", processForm);
    chrome.storage.sync.get(["alias", "pin", "activationCode", "key", "counter"], function(result) {
        if(result.alias) document.getElementsByName("alias")[0].value = result.alias;
        if(result.pin) document.getElementsByName("pin")[0].value = result.pin;
        if(result.activationCode) document.getElementsByName("activationCode")[0].value = activationCode = result.activationCode;
        if(result.key) document.getElementsByName("key")[0].value = result.key;
        if(result.counter) document.getElementsByName("counter")[0].value = result.counter;
    });

    function processForm(e) {
        e.preventDefault();
        chrome.storage.sync.set({   "alias": document.getElementsByName("alias")[0].value, 
                                    "pin": document.getElementsByName("pin")[0].value, 
                                    "activationCode": document.getElementsByName("activationCode")[0].value, 
                                    "key": document.getElementsByName("key")[0].value, 
                                    "counter": document.getElementsByName("counter")[0].value
                                }, function() {
                                    if(activationCode != document.getElementsByName("activationCode")[0].value){
                                        activateDuoMobile(document.getElementsByName("activationCode")[0].value);
                                    }else{
                                        alert("SAVED!");
                                    }
                                });
        return true;
    }

    function activateDuoMobile(activationCode){
        var data = "jailbroken=false&architecture=armv7&region=US&app_id=com.duosecurity.duomobile&full_disk_encryption=true&passcode_status=true&platform=Android&app_version=3.23.0&app_build_number=323001&version=8.1&manufacturer=unknown&language=en&model=Pixel C&security_patch_level=2018-12-01";
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                result = JSON.parse(this.responseText);
                if(result["stat"] == "OK"){
                    chrome.storage.sync.set({ "key": result["response"]["hotp_secret"], "counter": 10 });
                    prompt("Success!", this.responseText);
                }else{
                    alert(this.responseText);
                }
            }
        });
        xhr.open("POST", "https://api-1b9bef70.duosecurity.com/push/v2/activation/" + activationCode);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("User-Agent'", "okhttp/2.7.5");
        xhr.send(data);
    }
}