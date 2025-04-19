const cCanadaProv = "AB,BC,MB,NB,NL,NT,NS,NU,ON,PE,QC,SK,YT";
const cUSStates = "AL,AK,AS,AZ,AR,CA,CO,CT,DE,DC,FM,FL,GA,GU,HI,ID,IL,IN,IA,KS,KY,LA,ME,MH,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,MP,OH,OK,OR,PW,PA,PR,RI,SC,SD,TN,TX,UT,VT,VI,VA,WA,WV,WI,WY";

var strSelectedRegion, strOriginalRegion, strNational, strRuleSuffix, InputValid, Message, strLangID

// Define all listeners
window.addEventListener('load', ResetForm);
document.getElementById('signin').addEventListener('change', function() { CheckLogin(eInfo); });
document.getElementById('UserHistoryForm').addEventListener('submit', function() { history_popup(document.getElementById('UserHistoryForm')); });
document.getElementById('ReportsForm').addEventListener('submit', function() { report_popup(document.getElementById('ReportsForm')); });
document.getElementById('InputForm').addEventListener('submit', function() { return ValidateForm(); });

document.querySelectorAll('.update-form-data').forEach(FormElement => {
    FormElement.addEventListener('change', UpdateFormData);
});

document.querySelectorAll('.check-npa-nxx').forEach(NPANXXElement => {
    NPANXXElement.addEventListener('change', function() { CheckNPANXX(NPANXXElement); });
});

document.querySelectorAll('.update-sample-rule').forEach(UpdateSampleRuleElement => {
    UpdateSampleRuleElement.addEventListener('change', UpdateSampleRule);
});

document.querySelectorAll('.reset-options').forEach(ResetOptionsElement => {
    ResetOptionsElement.addEventListener('change', ResetOptions);
});

document.getElementById('NPAType').addEventListener('blur', AreaCodeEntry);
document.getElementById('RuleBase').addEventListener('change', UpdateSampleRule);
document.getElementById('RuleBase').addEventListener('blur', UpdateSampleRule);
document.getElementById('CarrierCode').addEventListener('change', function() { CheckAccessCode(document.InputForm.CarrierCode); });
document.getElementById('SevenDigit').addEventListener('change', Verify7Digit);
document.getElementById('Email').addEventListener('change', CheckEmail);
document.getElementById('ExtAccessNum').addEventListener('change', function() { CheckExtNum(document.InputForm.ExtAccessNum); });
document.getElementById('BlockCallIDCode').addEventListener('change', function() { CheckCallID(document.InputForm.BlockCallIDCode); });
document.getElementById('BlockCallIDRepl').addEventListener('change', function() { CheckE164(document.InputForm.BlockCallIDRepl); });

document.querySelectorAll('.change-font-normal').forEach(ChangeFontElement => {
    ChangeFontElement.addEventListener('focus', function() { ChangeFontNormal(ChangeFontElement); });
});

// Detect changes in iFrame to disable/enable submit button
iframeURLChange(document.getElementById("StatusArea"), function (newURL) {});

document.getElementById('CallParkStart').addEventListener('change', function() { CheckCallPark(document.InputForm.CallParkStart, document.InputForm.CallParkEnd); });
document.getElementById('CallParkEnd').addEventListener('change', function() { CheckCallPark(document.InputForm.CallParkEnd, document.InputForm.CallParkStart); });
document.getElementById('ExtensionsButton').addEventListener('click', function() { popUp('extensionentry.htm'); });
document.getElementById('RNLButton').addEventListener('click', function() { return RNLookup(); });
document.getElementById('RNLUpdateButton').addEventListener('click', function() { return RNLUpdate(); });
document.getElementById('RegexRange_Button').addEventListener('click', function() { return CalcRegexRange(); });
document.getElementById('hoff').addEventListener('click', function() { document.getElementById('oldsite').style.display = ''; });


// Supporting functions

// These two functions help with showing the popup window for the user ruleset list and admin reports
function report_popup(form) {
    window.open('', 'formpopup', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,dependent=0,resizable=1,width=1200,height=1200,left=200,top=10');
    form.target = 'formpopup';
}

function history_popup(form) {
    window.open('', 'formpopup', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,dependent=0,resizable=1,width=1100,height=900,left=200,top=50');
    form.target = 'formpopup';
}



// Updates the screen based on what area code is entered
function AreaCodeEntry() {
    var NPADrop = document.getElementById("NPADrop");
    var NPAType = document.getElementById("NPAType");

    //Clear the dropdown box of all entries
    while (NPADrop.options.length > 0) {
        NPADrop.remove(0);
    }

    // Clear the custom rule name
    document.getElementById('RuleBase').value = "";
    strOriginalRegion = "";
    strSelectedRegion = "";

    // Get the list of area codes to display in drop-down list
    var xmlhttpACL;
    var ACLineItem;
    xmlhttpACL = new XMLHttpRequest();

    xmlhttpACL.onreadystatechange = function () {
        if (xmlhttpACL.readyState == 4 && xmlhttpACL.status == 200) {
            var AreaCodeList = xmlhttpACL.responseText;
            AreaCodeList = AreaCodeList.replace(/^\s+|\s+$/g, '');

            if (AreaCodeList.length > 0) {
                //Create an array on line breaks
                var ACArray = AreaCodeList.split("\n");

                //Capture the first line for the sample rule
                var SampleDefault = ACArray[0].split(",");

                strSelectedRegion = SampleDefault[2].replace(/[ \r\n]/gi, "");
                strOriginalRegion = strSelectedRegion;

                for (i = 0; i < ACArray.length; i++) {
                    ACLineItem = ACArray[i].split(",");
                    strRegionID = ACLineItem[0];
                    strAreaCode = ACLineItem[1];
                    strRegion = ACLineItem[2];
                    NPADrop.options[NPADrop.options.length] = new Option(strAreaCode + " - " + strRegion, strRegionID);
                }
                UpdateRuleBase();
                UpdateSampleRule();
            }
            else {
                NPADrop.options[NPADrop.options.length] = new Option("No Area Code Found");
                document.getElementById('SampleRule').innerHTML = document.InputForm.CountryID.value + "-NoAreaCodeFound";
            }
        }
    }
    xmlhttpACL.open("GET", "QueryDB.cshtml?Query=AreaCodeDrop&ID=" + document.InputForm.Country.value + "&Condition1=" + document.InputForm.NPAType.value, true);
    xmlhttpACL.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlhttpACL.send();
}



// Calculate the regex from a range of numbers
function CalcRegexRange() {
    var first = document.getElementById("Regex_FirstNum").value;
    var last = document.getElementById("Regex_LastNum").value;
    var requestURL = "https://www.ucdialplans.com/regexrangeapi/?first=" + first + "&last=" + last;
    var request = new XMLHttpRequest();
    request.open("GET", requestURL);
    request.responseType = "json";
    request.send();
    request.onload = function () {
        var jsonObj = request.response;
        if (request.status == 200) {
            document.getElementById("RegexResults").innerHTML = jsonObj.data.regex;
        }
        else {
            document.getElementById("RegexResults").innerHTML = jsonObj.error.detail;
        }
    }
}



// Verify the access code 
function CheckAccessCode(Entry) {
    if (Entry.value != "") {
        var Pattern = /^\d{1,6}$/;
        if (Entry.value.match(Pattern) != null) {
            Entry.value = Entry.value.match(Pattern);
            Entry.style.border = "1px solid #ccc";
        }
        else {
            Entry.style.border = "2px solid red";
            ErrorPopup("Value must be numeric and between 1 and 6 digits");
            Entry.value = "";
            Entry.focus();
        }
    }
}



// Validate the caller ID
function CheckCallID(InputField) {
    var Value = InputField.value;

    if (Value != "") {
        var Pattern = /^(\#|\*)?\d{1,4}$/;
        if ((Value.match(Pattern) != null) || (Value == "") || (Value == "Block ID code")) {
            Value = Value.match(Pattern);
            InputField.style.border = "1px solid #ccc";
            document.InputForm.BlockCallID.checked = true;
            return true;
        }
        else {
            InputField.style.border = "2px solid red";
            ErrorPopup("Caller ID Block code must be between 1 and 4 digits long");
            InputField.value = "";
            InputField.focus();
            document.InputForm.BlockCallID.checked = false;
            return false;
        }
    }
}



// Validate call park data entry
function CheckCallPark(InputNum1, InputNum2) {
    var Num1 = InputNum1.value;
    var Num2 = InputNum2.value;

    if ((Num1 != "") && (Num1 != "Start") && (Num1 != "End")) {
        var Pattern = /^(([\*|#]?[1-9]\d{0,7})|([1-9]\d{0,8}))$/;

        document.InputForm.CallPark.checked = true;

        if (Num1.match(Pattern) != null) {
            if ((Num1 != "") && (Num2 != "")) {
                if (InputNum1.name == "CallParkEnd") {
                    var Hold = Num1
                    Num1 = Num2;
                    Num2 = Hold;
                }

                if (Num2 < Num1) {
                    $.magnificPopup.open({
                        items: {
                            src: "<div class='error-popup'><H4><strong>ERROR</strong></H4><P>Call Park Start must be less than Call Park End</p></div>",
                            type: "inline"
                        },
                        closeOnContentClick: true
                    });
                    InputNum1.value = "";
                    InputNum1.focus();
                    document.InputForm.CallPark.checked = false;
                }

                if ((Num1.length != Num2.length) && (Num2 != "Start") && (Num2 != "End")) {
                    $.magnificPopup.open({
                        items: {
                            src: "<div class='error-popup'><H4><strong>ERROR</strong></H4><P>Both numbers must be the same length</p></div>",
                            type: "inline"
                        },
                        closeOnContentClick: true
                    });
                    InputNum1.value = "";
                    InputNum1.focus();
                    document.InputForm.CallPark.checked = false;
                }
            }
        }
        else {
            ErrorPopup("Call park values must be numeric beginning with either * or # or 1 through 9.  Total length must be 9 characters or less.");
            InputNum1.value = "";
            InputNum1.focus();
            document.InputForm.CallPark.checked = false;
        }
    }
}



// Validate E164 format
function CheckE164(InputField) {
    var Value = InputField.value;
    var Pattern = /^\+?\d{4,15}$/;

    if ((Value.match(Pattern) != null) || (Value == "") || (Value == null) || (Value == "Number to show")) {
        Value = Value.match(Pattern);
        InputField.style.border = "1px solid #ccc";
        document.InputForm.BlockCallID.checked = true;
        return true;
    }
    else {
        InputField.style.border = "2px solid red";
        $.magnificPopup.open({
            items: {
                src: "<div class='error-popup'><H4><strong>ERROR</strong></H4><P>Value can only contain digits and can be between 4 and 15 digits in length. May start with +.\n</p></div>",
                type: "inline"
            },
            closeOnContentClick: true
        });
        InputField.value = "";
        InputField.focus();
        document.InputForm.BlockCallID.checked = false;
        return false;
    }
}



// Validate external access number format
function CheckExtNum(InputField) {
    var Value = InputField.value;

    if (Value != "") {
        var Pattern = /^[*#]?\d{1,4}$/;
        if (Value.match(Pattern) != null) {
            Value = Value.match(Pattern);
            InputField.style.border = "1px solid #ccc";
            return true;
        }
        else {
            InputField.style.border = "2px solid red";
            ErrorPopup("Value must be between 1 and 4 digits long, and may start with either a * or #");
            InputField.value = "";
            InputField.focus();
            return false;
        }
    }
    else {
        InputField.style.border = "1px solid #ccc";
    }
}



// Changes the font from light-grey to normal when user starts entering data in call park or call ID block boxes
function ChangeFontNormal(Entry) {
    var Pattern = /^\D+$/;
    if (Entry.value.match(Pattern) != null) {
        Entry.style.color = "black";
        Entry.style.fontStyle = "normal";
        Entry.focus();
        Entry.select();
    }
}



// Validates entered email addresses
function CheckEmail() {
    var Email = document.InputForm.Email;
    var EmailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;

    if ((Email.value != "") && (Email.value.toUpperCase().match(EmailPattern) == null)) {
        Email.style.border = "2px solid red";
        ErrorPopup("Email address invalid.");
        Email.value = "";
        return false;
    }
    else {
        Email.style.border = "1px solid #ccc"
        return true;
    }
}



// Validate the login information
function CheckLogin(eInfo) {
    var session = WL.getSession();
    if (!session) {
        eInfo.innerHTML = "Sign in with your Microsoft ID to get started!";
        document.getElementById('UserFirstName').value = "";
        document.getElementById('UserLastName').value = "";
        document.getElementById('UserEmail').value = "";
        document.getElementById('ReportsButton').style.display = "none";
        document.getElementById('UserID').value = "";
        document.getElementById('UserID2').value = "";
        $("#CreateRules").slideUp("slow");
        document.getElementById('CreateRulesHeader').style.display = "none";
        document.getElementById('StartCreating').style.visibility = "hidden";
    }
    else {
        $("#CreateRules").slideDown("slow");
        document.getElementById('CreateRulesHeader').style.display = "";
        document.getElementById('StartCreating').style.visibility = "visible";
    }
}



// Validate that NPA/NXX are formatted correctly
function CheckNPANXX(Num) {
    var Value = Num.value;

    if (Value != "") {
        var Pattern = /^[2-9]\d{2}$/;

        if (Value.match(Pattern) != null) {
            Value = Value.match(Pattern);
            Num.style.border = "1px solid #ccc";
            UpdateRuleBase();
            UpdateSampleRule();
        }
        else {
            Num.style.border = "2px solid red";
            ErrorPopup("Number must be between 200-999");
            Num.value = "";
            Num.focus();
        }
    }
}



// Validate and show the rule name based on user input
function CheckRuleName() {
    var Value = document.InputForm.RuleBase.value;
    var strCountryID = document.getElementById('CountryID').value;
    var CountryIndex = Value.indexOf(strCountryID);
    var SuffixIndex = Value.indexOf(strRuleSuffix);

    if (Value != "") {
        var Pattern = /^[A-Za-z0-9\u00C0-\u017F\-\_]*$/;
        if (Value.match(Pattern) != null) {
            Value = Value.match(Pattern);
            //document.getElementById('SampleRule').innerHTML = strCountryID + "-" + Value.replace(/[ \r\n]/gi,"") + "-" + strRuleSuffix;
        }
        else {
            ErrorPopup("Custom rule can only include letters, numbers, dashes or underscore characters.");
            document.InputForm.RuleBase.value = "";
            document.InputForm.RuleBase.focus();
            document.getElementById('SampleRule').innerHTML = strCountryID + "-" + strSelectedRegion.replace(/[ \r\n]/gi, "") + "-" + strRuleSuffix;
        }

        if ((CountryIndex == 0) || (SuffixIndex != -1)) {
            $.magnificPopup.open({
                items: {
                    src: "<div class='warning-popup'><H4><strong>WARNING</strong></H4><P>Your custom rule name may not appear as intended. By design, the country prefix (" + strCountryID + "-) is hard-coded into all rules, as is the appropriate rule suffix (ie. '-National'). This custom rule will appear as '" + document.InputForm.Country.value + "-" + Value + "-" + strRuleSuffix + "'.</p></div>",
                    type: "inline"
                },
                closeOnContentClick: true
            });
        }
    }
    else {
        document.getElementById('SampleRule').innerHTML = strCountryID + "-" + strSelectedRegion.replace(/[ \r\n]/gi, "") + "-" + strRuleSuffix;
    }
}



// Forms a popup message for any errors
function ErrorPopup(text) {
    $.magnificPopup.open({
        items: {
            src: "<div class='error-popup'><H4><strong>ERROR</strong></H4><P>" + text + "</p></div>",
            type: "inline"
        },
        closeOnContentClick: true
    });
}



// Detect changes in iFrame and disable SUBMIT button until processing is complete
function iframeURLChange(iframe, callback) {
    const SubmitButton = document.getElementById("SubmitButton");
    var lastDispatched = null;

    var dispatchChange = function () {
        var newHref = iframe.contentWindow.location.href;

        if (newHref !== lastDispatched) {
            callback(newHref);
            lastDispatched = newHref;

            if (newHref == "https://www.ucdialplans.com/") {
                SubmitButton.disabled = true;
                SubmitButton.value = "Generating...";
            } else if (newHref == "https://www.ucdialplans.com/process.aspx") {
                SubmitButton.value = "Generate Rules";
                SubmitButton.disabled = false;
            }
        }
    };

    var unloadHandler = function () {
        // Timeout needed because the URL changes immediately after
        // the `unload` event is dispatched.
        setTimeout(dispatchChange, 0);
    };

    function attachUnload() {
        // Remove the unloadHandler in case it was already attached.
        // Otherwise, there will be two handlers, which is unnecessary.
        iframe.contentWindow.removeEventListener("unload", unloadHandler);
        iframe.contentWindow.addEventListener("unload", unloadHandler);
    }

    iframe.addEventListener("load", function () {
        attachUnload();

        // Just in case the change wasn't dispatched during the unload event...
        dispatchChange();
    });

    attachUnload();
}



// Creates a nice looking popup when triggered
function popUp(URL) {
    var day = new Date();
    var id = day.getTime();
    var pageid = "page" + id;

    pageid = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,directories=0,statusbar=0,menubar=0,dependent=0,resizable=1,width=950,height=900,left=200,top=20');
}



// Function for querying the Maria database for selected info
function QueryDB(querytype, ID, async) {
    //Queries the SQL database for single values used in the page
    var xmlhttp;
    var strResponse;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "QueryDB.cshtml?Query=" + querytype + "&ID=" + ID, async);
    xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //xmlhttp.setRequestHeader("Accept-Charset", "utf-8");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            strResponse = xmlhttp.responseText;
            // Strip out any rogue trailing/leading spaces or linebreaks
            strResponse = strResponse.replace(/^\s+|\s+$/g, '');
            return strResponse;
        }
    }
    xmlhttp.send();

    // Strip out any rogue trailing/leading spaces or linebreaks
    strResponse = strResponse.replace(/^\s+|\s+$/g, '');
    return strResponse;
}



// Removes accented characters from ruleset name when 'English Rules' option selected
function RemoveAccent(str) {
    var rExps = [
        { re: /[\xC0-\xC6]/g, ch: 'A' },
        { re: /[\xE0-\xE6]/g, ch: 'a' },
        { re: /[\xC8-\xCB]/g, ch: 'E' },
        { re: /[\xE8-\xEB]/g, ch: 'e' },
        { re: /[\xCC-\xCF]/g, ch: 'I' },
        { re: /[\xEC-\xEF]/g, ch: 'i' },
        { re: /[\xD2-\xD6]/g, ch: 'O' },
        { re: /[\xF2-\xF6]/g, ch: 'o' },
        { re: /[\xD9-\xDC]/g, ch: 'U' },
        { re: /[\xF9-\xFC]/g, ch: 'u' },
        { re: /[\xD1]/g, ch: 'N' },
        { re: /[\xF1]/g, ch: 'n' },
        { re: /[\u0100]/g, ch: 'A' },
        { re: /[\u0101]/g, ch: 'a' },
        { re: /[\u00C7]/g, ch: 'C' },
        { re: /[\u00E7]/g, ch: 'c' },
        { re: /[\u0112]/g, ch: 'E' },
        { re: /[\u0113]/g, ch: 'e' },
        { re: /[\u013B]/g, ch: 'L' },
        { re: /[\u013C]/g, ch: 'l' },
        { re: /[\u00D8]/g, ch: 'O' },
        { re: /[\u00F8]/g, ch: 'o' },
        { re: /[\u014C]/g, ch: 'O' },
        { re: /[\u014D]/g, ch: 'o' },
        { re: /[\u016A]/g, ch: 'U' },
        { re: /[\u016B]/g, ch: 'u' },
        { re: /[\u014E]/g, ch: 'O' },
        { re: /[\u014F]/g, ch: 'o' },
        { re: /[\u0160]/g, ch: 'S' },
        { re: /[\u0161]/g, ch: 's' },
        { re: /[\u00DD]/g, ch: 'Y' },
        { re: /[\u00FD]/g, ch: 'y' },
        { re: /[\u017D]/g, ch: 'Z' },
        { re: /[\u017E]/g, ch: 'z' },
        { re: /[\xDF]/g, ch: 'ss' }];

    for (var i = 0, len = rExps.length; i < len; i++)
        str = str.replace(rExps[i].re, rExps[i].ch);

    return str;
}



// Resets the form to default 
function ResetForm() {
    CheckLogin(eInfo);

    // Start by hiding all elements then show the elements for Teams
    $(".CL_All").hide();
    $(".CL_NANPA_Teams").show();

    // Set element values to defaults
    document.getElementById('Country').value = "NN";
    document.getElementById('CountryID').value = "US";
    document.getElementById('NANPA').value = "";
    document.getElementById('NANXX').value = "";
    document.getElementById('NANPADialing').value = "National";
    document.getElementById('NANPADialing').disabled = false;
    document.getElementById('NANPADialing').options[1].disabled = false;
    document.getElementById('RuleBase').value = "CA-BeverlyHills";
    document.getElementById('SampleRule').innerHTML = "US-CA-BeverlyHills-National";
    document.getElementById('GWType').value = "MSTeams";
    document.getElementById('ExtAccessNum').value = "";
    document.getElementById('SimpleRules').value = "No";
    document.getElementById('EnglishRules').value = "No";
    document.getElementById('EnglishRules_Text').style.display = "none";
    document.getElementById('SIPTrunk').value = "Yes";
    document.getElementById('BlockPrem').value = "No";
    document.getElementById('SevenDigit').value = "No";
    document.getElementById('Email').value = "";
    $("#RulesetOutputFrame").slideUp("slow");

    strNational = "National";
    strAllCalls = "AllCalls";
    strSelectedRegion = "CA-BeverlyHills";

    var i = 0;
    for (i = 0; i <= 49; i++) {
        document.getElementById("ExtName" + i).value = "";
        document.getElementById("Base" + i).value = "";
        document.getElementById("Start" + i).value = "";
        document.getElementById("End" + i).value = "";
        document.getElementById("DID" + i).checked = false;
    }
}



// Resets form options when certain fields triggered
function ResetOptions() {
    document.getElementById('RuleBase').value = "";
    document.getElementById('ExtAccessNum').value = "";
    document.getElementById('NANPADialing').value = "National";
    document.getElementById('NANPADialing').options[1].disabled = false;
    document.getElementById('SimpleRules').value = "No";
    document.getElementById('SIPTrunk').value = "Yes";
    document.getElementById('BlockPrem').value = "No";
    document.getElementById('CallParkStart').value = "Start";
    document.getElementById('CallParkEnd').value = "End";
    document.getElementById('CallParkStart').style.border = "1px solid #ccc";
    document.getElementById('CallParkEnd').style.border = "1px solid #ccc";
    document.getElementById('BlockCallIDCode').value = "Block ID code";
    document.getElementById('BlockCallIDRepl').value = "Number to show";
    document.getElementById('BlockCallIDCode').style.border = "1px solid #ccc";
    document.getElementById('BlockCallIDRepl').style.border = "1px solid #ccc";
    document.getElementById('SevenDigit').value = "No";
    document.getElementById('Email').value = "";
    $("#RulesetOutputFrame").slideUp("slow");


    // Get the area code and region name for the selected option and update the sample rule
    var xmlhttpACL;
    xmlhttpACL = new XMLHttpRequest();

    xmlhttpACL.onreadystatechange = function () {
        if (xmlhttpACL.readyState == 4 && xmlhttpACL.status == 200) {
            var strRegionAreaCode = xmlhttpACL.responseText;
            var arrRegionAreaCode = strRegionAreaCode.split(",");
            strSelectedRegion = arrRegionAreaCode[1];
            strOriginalRegion = strSelectedRegion;

            if (document.getElementById('EnglishRules').value == "Yes") {
                strRuleSuffix = "National";
                strSelectedRegion = RemoveAccent(strSelectedRegion);
            }

            // Remove any stray carriage returns/linefeeds
            strSelectedRegion = strSelectedRegion.replace(/[ \r\n]/gi, "");
            document.getElementById('RuleBase').value = strSelectedRegion;
            document.getElementById('SampleRule').innerHTML = document.InputForm.CountryID.value + "-" + strSelectedRegion + "-" + strRuleSuffix;
        }
    }
    xmlhttpACL.open("GET", "QueryDB.cshtml?Query=AreaCodeSelect&ID=" + document.InputForm.NPADrop.value, true);
    xmlhttpACL.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //xmlhttpACL.setRequestHeader("Accept-Charset", "utf-8");
    xmlhttpACL.send();
}



// Looks up the geographic details about a phone number
function RNLookup() {
    var phoneNumber = this.PhoneNum.value;
    var requestURL = "https://www.ucdialplans.com/rnlapi/?phonenumber=" + phoneNumber;
    var request = new XMLHttpRequest();
    request.open("GET", requestURL);
    request.responseType = "json";
    request.send();
    request.onload = function () {
        if (request.status == 200) {
            var jsonObj = request.response;

            var html = "Country: " + jsonObj.data.countryname + "<BR>"
                + "Country Code: " + jsonObj.data.countrycode;

            if (jsonObj.data.city != '') { html = html + "<BR>City: " + jsonObj.data.city; }
            if (jsonObj.data.stateprov != '') { html = html + ", " + jsonObj.data.stateprov; }
            if (jsonObj.data.areacode != '') { html = html + "<BR>Area Code: " + jsonObj.data.areacode; }
            html = html + "<BR>Number Type: " + jsonObj.data.type;
            if (jsonObj.data.provider != '') { html = html + "<BR>Provider: " + jsonObj.data.provider; }
            document.getElementById("RNLResults").innerHTML = html;
        }
        else {
            document.getElementById("RNLResults").innerHTML = "Invalid phone number";
        }
    }
}



// Updates form data on change of specific fields
function UpdateFormData() {
    var strCountry = document.InputForm.Country.value;
    var CarrierCodeText = document.getElementById("CarrierCode_Text");
    var CarrierCodeInput = document.InputForm.CarrierCode;
    var EnglishRulesText = document.getElementById("EnglishRules_Text");
    var EnglishRulesInput = document.InputForm.EnglishRules;
    var BlockPremText = document.getElementById("BlockPrem_Text");
    var BlockPremInput = document.InputForm.BlockPrem;
    var BlockCallIDCode = document.InputForm.BlockCallIDCode;
    var BlockCallIDRepl = document.InputForm.BlockCallIDRepl;
    var CallParkStartInput = document.InputForm.CallParkStart;
    var CallParkEndInput = document.InputForm.CallParkEnd;
    var Email = document.InputForm.Email;
    var NPAText = document.getElementById("NPA_Text");
    var NPADrop = document.getElementById("NPADrop");
    var NPAType = document.getElementById("NPAType");

    $("#RulesetOutputFrame").slideUp("slow");

    NPADrop.options.length = 0;

    document.InputForm.CountryID.value = document.InputForm.Country.value;  //update hidden field

    // Get information about the selected country
    var CountryInfo = QueryDB('CountryInfo', strCountry, false);

    var CIArray = CountryInfo.split(",");

    var strCountryCode = CIArray[0];
    var strPrefixRequired = CIArray[1];
    var DropList = CIArray[2];
    var PremNumCount = CIArray[3]
    strNational = CIArray[4];
    strAllCalls = CIArray[5];
    strLangID = CIArray[6].substr(0, 3); //strip out the carriage return

    strRuleSuffix = strNational;

    //Populate hidden country code field for Extension entry page
    document.InputForm.CountryCode.value = strCountryCode;

    // Start by hiding all elements
    $(".CL_All").hide();

    switch (document.InputForm.GWType.value) {
        case "Skype4B":
            document.getElementById('Country').disabled = false;

            if (document.InputForm.Country.value == "NN") {
                $(".CL_NANPA_Lync").show();
            }
            else {
                $(".CL_NotNANPA_Lync").show();
            }
            break;

        case "MSTeams":
            document.getElementById('Country').disabled = false;

            if (document.InputForm.Country.value == "NN") {
                $(".CL_NANPA_Teams").show();
            }
            else {
                $(".CL_NotNANPA_Teams").show();
            }
            break;

        case "AudioCodes":
        case "Cisco":
            $(".CL_AudioCodes").show();
            document.getElementById('Country').value = "NN";
            document.getElementById('CountryID').value = "US";
            document.getElementById('Country').disabled = true;
            break;

        case "RawRegEx":
            $(".CL_Raw").show();
            document.getElementById('Country').value = "NN";
            document.getElementById('CountryID').value = "US";
            document.getElementById('Country').disabled = true;
            break;
    }

    // Show English rules only checkbox if country language other than English
    if ((strLangID == 'eng') || (document.InputForm.GWType.value == "AudioCodes") || (document.InputForm.GWType.value == "Cisco")) {
        EnglishRulesText.style.display = "none";
    }
    else {
        EnglishRulesText.style.display = "block";
        EnglishRulesInput.value = "No";
    }

    //Show Premium Numbers checkbox only if there are premium numbers available
    if (document.InputForm.GWType.value == 'Skype4B') {
        if (PremNumCount > 0) {
            BlockPremText.style.display = "";
            BlockPremInput.style.display = "";
        }
        else {
            BlockPremText.style.display = "none";
            BlockPremInput.style.display = "none";
            BlockPremInput.value = "No";
        }
    }

    if (document.InputForm.Country.value == "NN") {// NN is for North America (NA is for Namibia)
        document.getElementById('GWType').options[2].disabled = false;
        document.getElementById('GWType').options[3].disabled = false;
        document.getElementById('CountryID').value = "US";
        strSelectedRegion = "CA-BeverlyHills";
        strOriginalRegion = "CA-BeverlyHills";
        document.getElementById('SampleRule').innerHTML = "US-CA-BeverlyHills-" + strRuleSuffix;
        document.getElementById('RuleBase').value = "";
        document.getElementById('ExtAccessNum').value = "";
        document.getElementById('NANPADialing').value = "National";
        document.getElementById('NANPADialing').disabled = false;
        document.getElementById('NANPADialing').options[1].disabled = false;
        document.getElementById('SimpleRules').value = "No";
        document.getElementById('SIPTrunk').value = "Yes";
        document.getElementById('BlockPrem').value = "No";
        document.getElementById('SevenDigit').value = "No";
        Email.style.border = "1px solid #ccc";
        document.getElementById('NANPA').style.border = "1px solid #ccc";
        document.getElementById('NANXX').style.border = "1px solid #ccc";
    }
    else {
        var strRegionID, strRegion, strAreaCode

        document.getElementById('GWType').options[2].disabled = true;
        document.getElementById('GWType').options[3].disabled = true;
        if (DropList == 0) {
            // Set area code defaults
            if (document.InputForm.Country.value == "DE") { document.InputForm.NPAType.value = "30"; }

            if (document.InputForm.Country.value == "IN") { document.InputForm.NPAType.value = "11"; }

            if (document.InputForm.Country.value == "MX") { document.InputForm.NPAType.value = "33"; }

            if (document.InputForm.Country.value == "NZ") { document.InputForm.NPAType.value = "92"; }

            NPADrop.style.display = "";
            NPAType.style.display = "";
            AreaCodeEntry();
        }
        else {
            NPADrop.style.display = "block";
            NPAType.style.display = "none";

            // Get the list of area codes to display in drop-down list
            var ACLineItem;
            var xmlhttpAC;
            xmlhttpAC = new XMLHttpRequest();

            xmlhttpAC.onreadystatechange = function () {
                if (xmlhttpAC.readyState == 4 && xmlhttpAC.status == 200) {
                    AreaCodeList = xmlhttpAC.responseText;

                    //Clean up trailing empty lines from beginning and/or end
                    AreaCodeList = AreaCodeList.replace(/^\s+|\s+$/g, '');
                    var ACArray = AreaCodeList.split("\n");

                    for (i = 0; i < ACArray.length; i++) {
                        ACLineItem = ACArray[i].split(",");
                        strRegionID = ACLineItem[0];
                        strAreaCode = ACLineItem[1];
                        strRegion = ACLineItem[2];
                        if (strAreaCode == "0")  // If no area codes in selected country like Hong Kong, set the option and hide it from view
                        {
                            NPADrop.options[NPADrop.options.length] = new Option(strRegion, strRegionID);
                            NPADrop.style.display = "none";
                            NPAText.style.display = "none";
                        }
                        else {
                            NPADrop.options[NPADrop.options.length] = new Option(strAreaCode + " - " + strRegion, strRegionID);
                        }

                        //Use first area code in list to populate sample rule
                        if (i == 0) {   
                            strSelectedRegion = strRegion.replace(/[ \r\n]/gi, "");
                            strOriginalRegion = strSelectedRegion;
                            document.getElementById('SampleRule').innerHTML = document.InputForm.CountryID.value + "-" + strSelectedRegion + "-" + strRuleSuffix;
                            document.getElementById('RuleBase').value = strSelectedRegion.replace(/[ \r\n]/gi, "");
                        }
                    }
                }
            }
            xmlhttpAC.open("GET", "QueryDB.cshtml?Query=AreaCodes&ID=" + strCountry, true);
            xmlhttpAC.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            //xmlhttpAC.setRequestHeader("Accept-Charset", "utf-8");
            xmlhttpAC.send();
        }

        document.getElementById('NANPA').value = "";
        document.getElementById('NANXX').value = "";
        document.getElementById('NANPADialing').value = "";
        document.getElementById('RuleBase').value = "";
        document.getElementById('ExtAccessNum').value = "";
        document.getElementById('SimpleRules').value = "No";
        document.getElementById('SIPTrunk').value = "Yes";
        document.getElementById('BlockPrem').value = "No";
        document.getElementById('SevenDigit').value = "No";
        document.getElementById('Email').value = "";
    }

    CallParkStartInput.style.display = "Start";
    CallParkEndInput.style.display = "End";
    CallParkStartInput.style.border = "1px solid #ccc";
    CallParkEndInput.style.border = "1px solid #ccc";
    BlockCallIDCode.value = "Block ID code";
    BlockCallIDRepl.value = "Number to show";
    BlockCallIDCode.style.border = "1px solid #ccc";
    BlockCallIDRepl.style.border = "1px solid #ccc";

    if ((strPrefixRequired == "PreNatInt") || (strPrefixRequired == "PostNat") || (strPrefixRequired == "PostNatInt") || (strPrefixRequired == "PostNatMob") || (strPrefixRequired == "Int") || (strPrefixRequired == "PreInt") || (strPrefixRequired == "PostInt")) {
        CarrierCodeText.style.display = "block";
        CarrierCodeInput.style.display = "block";
        CarrierCodeInput.value = "";
    }
    else {
        CarrierCodeText.style.display = "none";
        CarrierCodeInput.style.display = "none";
        CarrierCodeInput.value = "";
    }

    if (strPrefixRequired == "Int") {
        document.getElementById("CarrierCode_Header").innerHTML = "International Prefix";
    }
    else {
        document.getElementById("CarrierCode_Header").innerHTML = "Carrier Code";
    }

    if (document.InputForm.GWType.value == "RawRegEx") {
        // Hide last 2 columns and resize column 1 to center
        document.getElementById("RulesetCol2").style.display = "none";
        document.getElementById("RulesetCol3").style.display = "none";
        document.getElementById("RulesetCol1").className = "col-md-4 col-md-offset-4";
    }
    else {
        // Set classes back to default
        document.getElementById("RulesetCol2").style.display = "";
        document.getElementById("RulesetCol3").style.display = "";
        document.getElementById("RulesetCol1").className = "col-md-4";
    }
    UpdateRuleBase();
    UpdateSampleRule();
}



// Updates the sample rule based on inputs
function UpdateRuleBase() {
    // Change sample rule name based on whether or not Simple Rules and/or Force English Rules was checked
    var NANPADropDown = document.getElementById('NANPADialing');

    if (document.getElementById('Country').value == "NN") {
        var NANPA = document.InputForm.NANPA.value;
        var NANXX = document.InputForm.NANXX.value;

        if (NANPA > 200 && NANXX > 199) {
            var CityStateProv = QueryDB('NANPAPrefix', NANPA + NANXX, false);

            if (CityStateProv != '') {
                var CSPArray = CityStateProv.split(",");
                var strCity = CSPArray[0];
                var strStateProv = CSPArray[1].substr(0, 2); //strip out the carriage return

                strCity = strCity.replace(/[:']/, "-");
                strSelectedRegion = strStateProv + "-" + strCity;

                if (cCanadaProv.indexOf(strStateProv) > -1) {
                    document.getElementById('CountryID').value = "CA";
                    NANPADropDown.options[1].disabled = false;
                }
                else if (cUSStates.indexOf(strStateProv) > -1) {
                    document.getElementById('CountryID').value = "US";
                    NANPADropDown.options[1].disabled = false;
                }
                else {
                    // Selected country is Caribbean
                    // localdialingrules.com uses incorrect country abbrev for some countries. Corrected here
                    if (strStateProv == "SA") { strStateProv = "LC"; }  //SA is for Saudi Arabia not St Lucia
                    if (strStateProv == "TR") { strStateProv = "TT"; }  //TR is for Turkey not Trinidad/Tobago
                    if (strStateProv == "BD") { strStateProv = "BB"; }  //BD is for Bangladesh not Barbados
                    if (strStateProv == "BA") { strStateProv = "BS"; }  //BA is for Bosnia-Herzegovina not Bahamas
                    if (strStateProv == "GN") { strStateProv = "GD"; }  //GN is for Guinea not Grenada
                    if (strStateProv == "SM") { strStateProv = "SX"; }  //SM is for San Marino not Sint Maarten
                    document.getElementById('CountryID').value = strStateProv;
                    strSelectedRegion = strCity;

                    NANPADropDown.options[1].disabled = true;

                    if (NANPADropDown.value == "USCan") {
                        NANPADropDown.value = "National";
                    }
                }
            }
            else {
                strSelectedRegion = "UNKNOWN";
            }
        }
        else {
            strSelectedRegion = "UNKNOWN";
        }
    }

    if (document.getElementById('EnglishRules').value == "Yes") {
        strSelectedRegion = RemoveAccent(strSelectedRegion);
    }

    document.getElementById('RuleBase').value = strSelectedRegion.replace(/[ \r\n]/gi, "");
}



// Update the sample rule to match user selections
function UpdateSampleRule() {
    if (document.getElementById('SimpleRules').value == "No") {
        document.getElementById('NANPADialing').disabled = false;

        if (document.getElementById('EnglishRules').value == "No") {
            strRuleSuffix = strNational;
        }
        else {
            strRuleSuffix = "National";
            document.getElementById('RuleBase').value = RemoveAccent(document.getElementById('RuleBase').value);
        }
    }
    else {
        document.getElementById('NANPADialing').value = "All";
        document.getElementById('NANPADialing').disabled = true;

        if (document.getElementById('EnglishRules').value == "No") {
            strRuleSuffix = strAllCalls;
        }
        else {
            strRuleSuffix = "AllCalls";
        }
    }

    var ExtendedCharRegex = /^[\p{L}\d\-]{1,50}$/gu;
    if (document.getElementById('RuleBase').value.match(ExtendedCharRegex)) {
        document.getElementById('SampleRule').innerHTML = document.getElementById('CountryID').value + "-" + document.getElementById('RuleBase').value.replace(/[ \r\n]/gi, "") + "-" + strRuleSuffix;
    }
    else {
        ErrorPopup("Rulename base can only contain letters, numbers and dashes");
        document.getElementById('RuleBase').focus();
    }
}



// Validate the form data before submitting
function ValidateForm() {
    var Country = document.InputForm.Country.value;
    var NANPA = document.InputForm.NANPA;
    var NPADrop = document.InputForm.NPADrop.value;
    var NANXX = document.InputForm.NANXX
    var AccessNum = document.InputForm.ExtAccessNum.value;
    var InputValid = true;
    var Message = "<ul>";
    var session = WL.getSession();

    //$("#RulesetOutputFrame").slideUp("slow");

    if (!session) {
        Message = Message + "<li>You must be signed in with a Microsoft Account before generating the script. Please sign in using the button on the top of the page. </li>";
        InputValid = false;
    }

    // Show nag screen if user hasn't donated and done more than 40 rulesets
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var DonationCount = xmlhttp.responseText;
            var DonationArray = DonationCount.split(",");

            DonationCount = DonationArray[1];
            var RuleCount = parseInt(DonationArray[2]); //strip out the carriage return

            if ((DonationCount == "") && (RuleCount > 39)) {
                $.magnificPopup.open({
                    items: {
                        src: "<div class='warning-popup'><H4><strong>WARNING</strong></H4><P>It appears that you've created " + RuleCount + " rulesets with UCDialPlans.com and have never donated. It takes a lot of effort to make this site and to keep improving it. Please consider donating by clicking the PayPal link at the bottom of the page.</P><P><form style='margin-left: 5.5em;' action='https://www.paypal.com/cgi-bin/webscr' method='post'><input type='hidden' name='cmd' value='_s-xclick'><input type='hidden' name='encrypted' value='-----BEGIN PKCS7-----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-----END PKCS7-----'><input type='image' style='width: 15em; height: auto;' src='https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif' border='none' name='PayPal' alt='PayPal - The safer, easier way to pay online!'><img alt='' border='none' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1'></form></p></div>",
                        type: "inline"
                    },
                    closeOnContentClick: false
                });
            }
        }
    }

    xmlhttp.open("GET", "QueryDB.cshtml?Query=DonationCount&ID=" + document.InputForm.UserID.value, true);
    xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlhttp.send();

    switch (Country) {
        case "NN":
            if (NANPA.value == null || NANPA.value == "") {
                NANPA.style.border = "2px solid red";
                Message = Message + "<li>NPA must be a numeric value between 201-999.</li>";
                InputValid = false;
            }

            if (NANXX.value == null || NANXX.value == "") {
                NANXX.style.border = "2px solid red";
                Message = Message + "<li>NXX must be a numeric value between 200-999.</li>";
                InputValid = false;
            }
            break;
    }

    var CallParkStart = document.InputForm.CallParkStart.value;
    var CallParkEnd = document.InputForm.CallParkEnd.value;

    if (((CallParkStart != "") && (CallParkStart != "Start")) || ((CallParkEnd != "") && (CallParkEnd != "End"))) {
        var Pattern = /^(([\*|#]?[1-9]\d{0,7})|([1-9]\d{0,8}))$/;

        if ((CallParkStart.match(Pattern) == null) || (CallParkEnd.match(Pattern) == null)) {
            Message = Message + "<li>Call park values must be numeric beginning with either * or # or 1 through 9.  Total length must be 9 characters or less.</li>";
            document.InputForm.CallPark.checked = false;
            InputValid = false;
        }
        else {
            Pattern = /\d+/;
            var CPStartDigits = CallParkStart.match(Pattern);
            var CPEndDigits = CallParkEnd.match(Pattern);

            if ((CallParkStart.length != CallParkEnd.length) || (CPStartDigits.toString().length != CPEndDigits.toString().length) || (CPEndDigits - CPStartDigits <= 0)) {
                Message = Message + "<li>Both Call Park start and end values must be the same length and the beginning of the range must be less than the end of the range.</li>";
                document.InputForm.CallParkStart.style.border = "2px solid red";
                document.InputForm.CallParkEnd.style.border = "2px solid red";
                document.InputForm.CallPark.checked = false;
                InputValid = false;
            }
            else {
                Pattern = /[\*|#]/;
                if ((CallParkStart.match(Pattern) != null) && (CallParkEnd.match(Pattern) != null)) {
                    if (CallParkStart.match(Pattern).toString() != CallParkEnd.match(Pattern).toString()) {
                        Message = Message + "<li>Both Call Park start and end values must start with the same character (either # or *).</li>";
                        document.InputForm.CallParkStart.style.border = "2px solid red";
                        document.InputForm.CallParkEnd.style.border = "2px solid red";
                        document.InputForm.CallPark.checked = false;
                        InputValid = false;
                    }
                    else {
                        if (CPStartDigits < 100) {
                            Message = Message + "<li>If Call Park range starts with * or #, range must start at 100 or higher.</li>";
                            document.InputForm.CallParkStart.style.border = "2px solid red";
                            document.InputForm.CallParkEnd.style.border = "2px solid red";
                            document.InputForm.CallPark.checked = false;
                            InputValid = false;
                        }
                    }
                }
            }
        }
    }

    if (NPADrop == "No Area Code Found") {
        Message = Message + "<li>No area code found. Program cannot continue without a valid area code.</li>";
        InputValid = false;
    }

    var BlockCallIDCode = document.InputForm.BlockCallIDCode.value;
    var BlockCallIDRepl = document.InputForm.BlockCallIDRepl.value;

    if (((BlockCallIDCode != "") && (BlockCallIDCode != "Block ID code")) || ((BlockCallIDRepl != "") && (BlockCallIDRepl != "Number to show"))) {
        if ((document.InputForm.BlockCallIDCode.value == "") ||
            (document.InputForm.BlockCallIDRepl.value == "") ||
            (document.InputForm.BlockCallIDCode.value == "Block ID code") ||
            (document.InputForm.BlockCallIDRepl.value == "Number to show")) {
            Message = Message + "<li>Block Caller ID input fields must both contain valid values.</li>";
            document.InputForm.BlockCallIDCode.style.border = "2px solid red";
            document.InputForm.BlockCallIDRepl.style.border = "2px solid red";
            document.InputForm.BlockCallID.checked = false;
            InputValid = false;
        }
    }
    else {
        document.InputForm.BlockCallID.checked = false;
    }

    if (CheckEmail == false) {
        InputValid = false;
    }

    if (InputValid == false) {
        ErrorPopup(Message);
        return false;
    }
    else {
        // Slide the iFrame output window down to show the progress of the ruleset build
        const iframe = document.getElementById("StatusArea");
        const html = "<head><style>h3{color:#12A5F4;text-align:center; font-size: 12pt; font-family: Arial, Helvetica, Geneva, SunSans-Regular, sans-serif;}</style></head><body><h3><p>Processing. Please wait...</p></h3></body>";
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
        $("#RulesetOutputFrame").slideDown("slow");


    }
}



// Shows a pop-up when someone selects the Seven Digit option
function Verify7Digit() {
    if (document.InputForm.SevenDigit.value == "Yes") {
        $.magnificPopup.open({
            items: {
                src: '<div class="warning-popup"><H4><strong>WARNING</strong></H4><P>If you select this option and the selected NPA/NXX does not allow 7-digit dialing, this program will produce normalization rules that will function incorrectly.</P></div>', // can be a HTML string, jQuery object, or CSS selector
                type: 'inline'
            },
            closeOnContentClick: true
        });
    }
}



// Help text popover
$(document).ready(function () {
    $('[data-toggle="popover"]').popover({
        placement: 'top',
        container: 'body',
        html: true
    });
});