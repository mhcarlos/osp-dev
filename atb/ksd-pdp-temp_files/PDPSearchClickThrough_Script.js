//Setting Event52 for PDP Search Click Through
$(document).ready(function () {
    var name = 'SearchEvent';
    if (document.referrer.indexOf("/Search/SearchResults.aspx") > 0) {
        var event52 = GetPDPCookie(name);
        if (event52 == "0") {
            SetPdpSearchEvent(name);
        }
    }

    ////event 52 for category landing pages
    if (document.referrer.indexOf("DeptId=") > 0 && document.referrer.indexOf("RedirectKeyword=") > 0) {
        var event52 = GetPDPCookie(name);
        if (event52 == "0") {
            SetPdpSearchEvent(name);
        }
    }
});



function GetPDPCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg)
            return getPDPCookieVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break;
    }
    return null;
}

function getPDPCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1)
        endstr = document.cookie.length;
    var str = unescape(document.cookie.substring(offset, endstr));
    var x = str.split(",", 2);
    return x[1];
}

function SetPdpSearchEvent(name) {
    var cookie = readCookie('SearchEvent');
    var cookieValues = cookie.split(",", 2);
    cookieValues[1] = "1";
    // Build the set-cookie string:
    cookie_string = "SearchEvent=" + cookieValues + "; path=/;";
    // Create/update the cookie:
    document.cookie = cookie_string;
    var s = s_gi(s_account);
    s.linkTrackVars = 'events';
    s.events = 'event52';
    s.linkTrackEvents = s.events;
    s.tl(true, 'o', 'pdpsearch-event');
    s.events = "";

}