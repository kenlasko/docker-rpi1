// Define all listeners
window.addEventListener('DOMContentLoaded', VerifyParent);

document.getElementById('RefreshButton').addEventListener('click', (event) => {
	history.go(0);
});


document.querySelectorAll('#UsersTable tr').forEach(UserTableRow => {
		UserTableRow.addEventListener('click', (event) => {
		popUp('GetHistory.cshtml?UserID3=' + event.target.parentElement.id);
		event.stopPropagation();
	});
});


document.querySelectorAll('#CountriesTable tr').forEach(CountryTableRow => {
		CountryTableRow.addEventListener('click', (event) => {
			popUp('GetCountryHistory.cshtml?CountryID=' + event.target.parentElement.id + '&CountryName=' + event.target.parentElement.getAttribute("data-countryName"));
		event.stopPropagation();
	});
});


function VerifyParent() {
	// If someone attempts to open the page independently of the main UCDialplans webpage, redirect to the main page
	if (!(window.opener && window.opener.open && !window.opener.closed)) {
		window.location = "https://www.ucdialplans.com/";
	}
}


function popUp(URL) {
	var day = new Date();
	var id = day.getTime();
	var pageid = "page" + id;

	pageid = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,directories=0,statusbar=0,menubar=0,dependent=0,resizable=1,width=950,height=900,left=200,top=20');
}


function GetUserDayRange(DayRange) {
	document.UserDayRange.Days.value = DayRange;
	document.UserDayRange.submit();
}

function GetRuleDayRange(DayRange) {
	document.RuleDayRange.Days.value = DayRange;
	document.RuleDayRange.submit();
}

function GetHistory(CountryID, CountryName) {
	document.HistoryList.CountryID.value = CountryID;
	document.HistoryList.CountryName.value = CountryName;
	document.HistoryList.submit();
}

function GetUserHistory(UserID) {
	document.UserHistoryList.UserID3.value = UserID;
	document.UserHistoryList.submit();
}