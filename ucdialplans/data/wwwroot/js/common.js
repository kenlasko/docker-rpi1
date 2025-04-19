// Define all listeners
window.addEventListener('DOMContentLoaded', VerifyParent);



function VerifyParent() {
	// If someone attempts to open the page independently of the main UCDialplans webpage, redirect to the main page
	if (!(window.opener && window.opener.open && !window.opener.closed)) {
		window.location = "https://www.ucdialplans.com/";
	}
}



function GetHistory(UserID) {
    document.HistoryList.UserID3.value = UserID;
    document.HistoryList.submit();
}



function popUp(URL) {
    var day = new Date();
    var id = day.getTime();
    var pageid = "page" + id;

    pageid = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,directories=0,statusbar=0,menubar=0,dependent=0,resizable=1,width=950,height=900,left=200,top=20');
}



function QueryDB(querytype, ID, async) {
    //Queries the SQL database for single values used in the page
    //Dynamically updates via JSON

    var xmlhttp;
    var strResponse;

    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            strResponse = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "QueryDB.cshtml?Query=" + querytype + "&ID=" + ID, async);
    xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlhttp.setRequestHeader("charset", "utf-8");

    xmlhttp.send();
    return strResponse;
}
