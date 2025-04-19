var eInfo = document.getElementById("LoginStatus");
var NagCount = 0;

WL.Event.subscribe("auth.login", onLogin);
WL.Event.subscribe("auth.sessionChange", onSessionChange);

WL.init({
    client_id: APP_CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    scope: ["wl.signin", "wl.basic", "wl.emails"],
    response_type: "token"
});

WL.ui({
    name: "signin",
    element: "signin",
    type: "signin",
    brand: "windows",
    onloggedout: LogOut()
});

var session = WL.getSession();
if (!session) {
    eInfo.innerHTML = "Sign in with your Microsoft ID to get started!";
    document.getElementById('CreateRulesHeader').style.display = "none";
    document.getElementById('StartCreating').style.visibility = "hidden";
    document.getElementById('UserID').value = "";
    document.getElementById('UserID2').value = "";
    document.getElementById('UserID3').value = "";
}

onLogin(session);

function LogOut() {
    eInfo.innerHTML = "Sign in with your Microsoft ID to get started!";
    document.getElementById('CreateRulesHeader').style.display = "none";
    document.getElementById('StartCreating').style.visibility = "hidden";
    document.getElementById('UserID').value = "";
    document.getElementById('UserID2').value = "";
    document.getElementById('UserID3').value = "";
}

function onLogin(session) {
    if (session != null) {
        if (!session.error) {
            WL.api({
                path: "me",
                method: "GET"
            }).then(
                function (response) {
                    document.getElementById('UserID').value = response.id;
                    document.getElementById('UserID2').value = response.id;
                    document.getElementById('UserID3').value = response.id;
                    document.getElementById('UserFirstName').value = response.first_name;
                    document.getElementById('UserLastName').value = response.last_name;
                    document.getElementById('UserEmail').value = response.emails.account;
                    $("#CreateRules").slideDown("slow");
                    document.getElementById('CreateRulesHeader').style.display = "";
                    document.getElementById('StartCreating').style.visibility = "visible";

                    eInfo.innerHTML = "You are logged in as <a href='" + response.link + "'; style='color: white;' target='_blank'>" + response.emails.account + "</a>";

                    // Show nag screen if user hasn't donated and done more than 20 rulesets
                    var xmlhttp;
                    xmlhttp = new XMLHttpRequest();

                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                            var DonationCount = xmlhttp.responseText;
                            var DonationArray = DonationCount.split(",");

                            var UserClass = DonationArray[0].trim();
                            DonationCount = DonationArray[1];
                            var RuleCount = parseInt(DonationArray[2]); //strip out the carriage return
                            var DonationAmount = parseInt(DonationArray[3]); //strip out the carriage return

                            if (isNaN(DonationAmount)) { DonationAmount = "0"; }
                            if (isNaN(RuleCount)) { RuleCount = "0"; }

                            eInfo.innerHTML = "You are logged in as <a href='" + response.link + "'; style='color: white;' target='_blank'>" + response.emails.account + "</a>"
                                + "<br>You have generated " + RuleCount + " rulesets and have donated a total of $" + DonationAmount;

                            // A special note for Pat Richard
                            if (response.id == "d08e7a1fea6a8938") {
                                eInfo.innerHTML = "You are logged in as <a href='" + response.link + "'; style='color: white;' target='_blank'>" + response.emails.account + "</a>"
                                    + "<br>You have generated " + RuleCount + " rulesets and have donated a total of $" + DonationAmount + ". Why don't you dig around in that crusty beard of yours and pull out some more cash, you cheap bastard?";
                            }

                            // A special note for John Cook
                            if (response.id == "15afc3e7fae23c61") {
                                eInfo.innerHTML = "You are logged in as <a href='" + response.link + "'; style='color: white;' target='_blank'>" + response.emails.account + "</a>"
                                    + "<br>You have generated " + RuleCount + " rulesets and have donated a total of $" + DonationAmount + ". Not bad. If you could stop flying all over the world in search of Duran Duran concerts, maybe you'd have enough to help me keep this going, you bald-headed, inked-up motherfucker!";
                            }

                            // Do a pop-up if the user has never donated.
                            if ((DonationCount == "") && (RuleCount > 19) && (NagCount < 1)) {
                                $.magnificPopup.open({
                                    items: {
                                        src: "<div class='warning-popup'><H4><strong>WARNING</strong></H4><P>It appears that you've created " + RuleCount + " rulesets with UCDialPlans.com and have never donated.  Please consider donating by clicking the PayPal link at the bottom of the page.</P><P><form style='margin-left: 5.5em;' action='https://www.paypal.com/cgi-bin/webscr' method='post'><input type='hidden' name='cmd' value='_s-xclick'><input type='hidden' name='encrypted' value='-----BEGIN PKCS7-----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-----END PKCS7-----'><input type='image' style='width: 15em; height: auto;' src='https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif' border='none' name='PayPal' alt='PayPal - The safer, easier way to pay online!'><img alt='' border='none' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1'></form></p></div>",
                                        type: "inline"
                                    },
                                    closeOnContentClick: false
                                });
                                NagCount = 1;
                            }
                            
                            if (UserClass == "Admin") {
                                document.getElementById('ReportsButton').style.display = "";
                            }
                            else {
                                document.getElementById('ReportsButton').style.display = "none";
                            }
                        }
                    }
                    xmlhttp.open("GET", "QueryDB.cshtml?Query=DonationCount&ID=" + document.InputForm.UserID.value, true);
                    xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    xmlhttp.send();


                },
                function (responseFailed) {
                    eInfo.innerHTML = "Error calling API: " + responseFailed.error.message;
                    document.getElementById('ReportsButton').style.display = "none";
                    document.getElementById('UserID').value = "";
                    document.getElementById('UserID2').value = "";
                    document.getElementById('UserID3').value = "";
                    $("#CreateRules").slideUp("slow");
                    document.getElementById('CreateRulesHeader').style.display = "none";
                }
            );
        }
        else {
            eInfo.innerHTML = "Error signing in: " + session.error_description;
            document.getElementById('ReportsButton').style.display = "none";
            document.getElementById('UserID').value = "";
            document.getElementById('UserID2').value = "";
            document.getElementById('UserID3').value = "";
            $("#CreateRules").slideUp("slow");
            document.getElementById('CreateRulesHeader').style.display = "none";
            document.getElementById('StartCreating').style.visibility = "hidden";
        }
    }
    else {
        eInfo.innerHTML = "Sign in with your Microsoft ID to get started!";
        document.getElementById('ReportsButton').style.display = "none";
        document.getElementById('UserID').value = "";
        document.getElementById('UserID2').value = "";
        document.getElementById('UserID3').value = "";
        $("#CreateRules").slideUp("slow");
        document.getElementById('CreateRulesHeader').style.display = "none";
        document.getElementById('StartCreating').style.visibility = "hidden";
    }
}

function onSessionChange() {
    var session = WL.getSession();
    if (session) {
        eInfo.innerText = "Something about the session changed.";
    }
    else {
        eInfo.innerText = "Signed out or session error.";
        document.getElementById('ReportsButton').style.display = "none";
        document.getElementById('UserID').value = "";
        document.getElementById('UserID2').value = "";
        document.getElementById('UserID3').value = "";
        $("#CreateRules").slideUp("slow");
        document.getElementById('CreateRulesHeader').style.display = "none";
        document.getElementById('StartCreating').style.visibility = "hidden";
    }
}