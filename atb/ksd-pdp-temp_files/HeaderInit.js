//This file contains the functions needed to initialize the headers in the site
//when it is loaded through Chameleon. It was developed in 2009FB2.

$(document).ready(function () {
    ////evar 31 & prop 31 for non landing pages when u search
    var keyword = getParameterByName('RedirectKeyword');
    var url = window.location.href;
    if (keyword.length > 0 && url.indexOf('DeptId=') < 0 && url.indexOf('deptid=') < 0) {
        setOmnitureValues(keyword)
    }
});




function setOmnitureValues(keyword) {
    var s = s_gi(s_account);
    s.linkTrackVars = 'eVar31,prop31';
    s.eVar31 = keyword.split(',').join(' ');
    s.prop31 = keyword.split(',').join(' ');
    s.tl(true, 'o', 'search-event');
    s.eVar31 = "";
    s.prop31 = "";
}




function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Main function in this file: InitHeader()

var parentCategoryForLeftNavHeader;
function InitHeader() {
    HighlightCurrentTab();

    if (typeof (_runningFromMicrosite) == "undefined") {
        ActivatePreviouslyViewProductsLink('PreviouslyViewProducts');
        InitUserLogin('SignIn', 'NotUser');
        SetShoppingBagCount('ShoppingBagCount');
        ShowCardLinks('YourCreditCard', 'PreApprovedOffer', 'SavingsId');
    }
    else {
        ActivatePreviouslyViewProductsLink('PreviouslyViewProducts', 'vendor');
        InitUserLogin('SignIn', 'NotUser', 'vendor');
        SetShoppingBagCount_Vendor('ShoppingBagCount', 'vendor');
        ShowCardLinks('YourCreditCard', 'PreApprovedOffer', 'SavingsId', 'vendor');
    }

    // set up the dropdown menus, not including affiliates, microsites or iOS devices
    if (!location.href.match(/AffiliateBrowsing|bags.kingsizedirect|art.kingsizedirect|pbj.kingsizedirect|stg.bags/) && !navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/)) { HeaderNav.SetUpMenus(); }

    ActivateWishList('MyWishList');
    PopulateSearchTerm();

    /* search suggestions and history */
    var searchInput = jQuery('#search_input'); // header search box; nothing else to config
    if (!location.href.match(/AffiliateBrowsing|bags.kingsizedirect|art.kingsizedirect|pbj.kingsizedirect|stg.bags/)) { SearchDeluxe.Init(jQuery('div.search-suggestions'), searchInput); }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    if ($('#search_input').val() != "" && $('#search_input').val().indexOf("enter keyword") < 0) {
            $('.search').append('<div class="e-ClearSearch">&times;</div>');
            $('.e-ClearSearch').on({ 'touchdown click': function () { $('#search_input').val(""); $('.e-ClearSearch').hide(); } });
        }
        $('#search_input').on('keyup', function () {
            if ($(this).val() != '' && $('.e-ClearSearch').length <= 0 && $('#search_input').val().indexOf("enter keyword") < 0) {
                //console.log("first time showing");
                $('.search').append('<div class="e-ClearSearch">&times;</div>')
                $('.e-ClearSearch').on({ 'touchdown click': function () { $('#search_input').val(""); $('.e-ClearSearch').hide(); } });
            }
            else if ($('.e-ClearSearch').length > 0 && $(this).val() != '' && $('#search_input').val().indexOf("enter keyword") < 0) {
                // console.log("already have content keep showing");
                $('.e-ClearSearch').show();
            }
            else {
                //console.log("no more content hide");
                $('.e-ClearSearch').hide();
            }
        });
    }
}

var SearchDeluxe = { // InteractiveSearch? SearchWithSuggestionsAndHistory?
    cookieLifespan: 5, cookieDelimiter: '--',

    Init: function (container, searchInput) {
        if (typeof autoCompleteDelay == 'undefined') { var autoCompleteDelay = 300; } // don't trust Chameleon...
        searchInput.keyup(function (event) { // auto-complete
            if (searchInput.val().length > 2) {
                if (event.keyCode != 38 && event.keyCode != 40) { // if input is not arrow keys, get suggestions
                    clearTimeout(SearchDeluxe.delayedSuggest);
                    SearchDeluxe.delayedSuggest = setTimeout(function () {
                        SearchDeluxe.Suggest(container, searchInput, jQuery.trim(searchInput.val()));
                    }, autoCompleteDelay);
                } else { SearchDeluxe.ArrowKeys(container, searchInput, event.keyCode); }
            } else if (searchInput.val().length < 1) { // show history
                if (!(jQuery.browser.msie && jQuery.browser.version < 8)) { // IE7 crashes if showing history after deleting text
                    SearchDeluxe.ShowHistory(container, searchInput, jQuery.trim(searchInput.val()));
                }
                if (event.keyCode == 38 || event.keyCode == 40) {
                    SearchDeluxe.ArrowKeys(container, searchInput, event.keyCode);
                }
            } else { container.fadeOut('fast'); }
        }).focus(function () { // show history
            if (searchInput.val().length < 1) {
                SearchDeluxe.ShowHistory(container, searchInput, jQuery.trim(searchInput.val()));
            }
        }).blur(function () { container.fadeOut('fast'); });
    },

    Suggest: function (container, searchInput, searchTerms) {
        if (searchInput.val().length < 3) { return false; } // did user delete search terms during the timeout delay?
        searchInput.attr('user', searchTerms); // save user's input
        var sugValue = getParameterByName('sug')
        if (sugValue.length > 0) {
            var autoCompleteUrl = '/Search/AutoComplete.aspx?Kwd=' + $.trim(searchTerms) + '&sug=' + sugValue;
        }
        else { var autoCompleteUrl = '/Search/AutoComplete.aspx?Kwd=' + $.trim(searchTerms); }
        $.ajax({
            url: autoCompleteUrl,
            dataType: 'json',
            success: function (data) {
                var suggestionsHTML = 'Suggestions:';
                if (data.KwdRes.length > 0) {
                    jQuery.each(data.KwdRes, function (i, KwdRes) {
                        var suggestion = KwdRes.kwd.toLowerCase().split(' ');
                        var formattedSuggestion = ' ';
                        for (var i = 0; i < suggestion.length; i++) {
                            jQuery.each(searchTerms.toLowerCase().split(' '), function (j, text) {
                                if (suggestion[i].match(text)) {
                                    if (!suggestion[i].match('<')) {
                                        suggestion[i] = suggestion[i].replace(text, '<strong>' + text + '</strong>');
                                    }
                                }
                            });
                            formattedSuggestion += suggestion[i] + ' ';
                        }
                        suggestionsHTML += '<a href="/Search/SearchResults.aspx?SearchHeader=' + jQuery.trim(formattedSuggestion.replace(/<[^>]+>/ig, "")) + '">' + formattedSuggestion + '</a>';
                    });
                    container.html(suggestionsHTML);
                    SearchDeluxe.LinkBehaviors(container, searchInput, searchTerms);
                    container.fadeIn('fast');
                } else { container.fadeOut('fast'); }
            }
        });
    },

    ArrowKeys: function (container, searchInput, key) {
        if (!container.is(':visible')) { container.fadeIn('fast'); }
        var containerLinks = container.children('a');
        if (containerLinks.length == 0) { return false; } // no current suggestions/history 
        var highlighted = container.children('a').index(jQuery('.selected'));
        containerLinks.removeClass('selected');
        highlighted += key - 39; // keycodes: up = 38; down = 40
        if (highlighted == -2) { highlighted = containerLinks.length - 1; } // up key from search box
        if (highlighted == -1 || highlighted == containerLinks.length) { // selection is in the box; restore search terms
            searchInput.val(jQuery.trim(searchInput.attr('user')));
        } else { // highlight and replace search terms with suggestion
            var selectedTerms = containerLinks.eq(highlighted);
            searchInput.val(jQuery.trim(selectedTerms.html().replace(/<[^>]+>/ig, '').replace(/&amp;/g, '&'))); // strong tags and ampersands
            selectedTerms.addClass('selected');
        }
    },

    LinkBehaviors: function (container, searchInput, searchTerms) {
        container.children('a').bind('click mouseover', function () { // replace the search text
            searchInput.val(jQuery.trim(jQuery(this).html().replace(/<[^>]+>/ig, '').replace(/&amp;/g, '&'))); // strong tags and ampersands
            container.children('a').removeClass('selected');
            jQuery(this).addClass('selected');
        });
        container.mouseout(function () {
            if (container.is(':visible')) {
                searchInput.val(searchTerms); // restore user input
                container.children('a').removeClass('selected');
            }
        });
        container.children('span').click(function () { SearchDeluxe.RemoveHistory(searchInput, this); });
    },

    ShowHistory: function (container, searchInput, searchTerms) {
        searchInput.attr('user', ' '); // kill any old user input
        var cookie = readCookie('SearchHistory');
        if (cookie) { // if no cookie, UpdateHistory() will create it when necessary
            var historyHTML = 'Previous Searches:';
            var cookieValues = cookie.split(SearchDeluxe.cookieDelimiter);
            for (var i = 0; i < cookieValues.length; i++) {
                historyHTML += '<a class="history" href="/Search/SearchResults.aspx?SearchHeader=' + encodeURI(cookieValues[i]) + '">' + cookieValues[i] + '</a>';
                historyHTML += '<span class="remove-history" href="#"></span>';
            }
            container.html(historyHTML);
            SearchDeluxe.LinkBehaviors(container, searchInput, searchTerms);
            container.fadeIn('fast');
        }
    },

    UpdateHistory: function () { // called by Search/SearchResults.aspx
        if (document.URL.indexOf("dims") < 0) {
            var searchTerms = decodeURIComponent((RegExp('SearchHeader=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]).replace('+', ' '); // get search terms from URL (thanks, SO)
            searchTerms = searchTerms.replace(SearchDeluxe.cookieDelimiter, '???'); // don't confuse things if search involves the delimiter
            var cookie = readCookie('SearchHistory');
            if (!cookie) { createCookie('SearchHistory', searchTerms, SearchDeluxe.cookieLifespan); }
            else { // check the history for duplicate searches
                var cookieValues = cookie.split(SearchDeluxe.cookieDelimiter); var duplicate = false;
                for (var i = 0; i < cookieValues.length; i++) {
                    if (searchTerms == cookieValues[i]) { duplicate = true; }
                }
                if (!duplicate) { // append the latest search to history, trimming old searches if necessary
                    if (cookieValues.length < 5) { cookie += SearchDeluxe.cookieDelimiter + searchTerms; }
                    else { cookie = cookie.substr(cookie.indexOf(SearchDeluxe.cookieDelimiter) + 2) + SearchDeluxe.cookieDelimiter + searchTerms; }
                    createCookie('SearchHistory', cookie, SearchDeluxe.cookieLifespan);
                }
            }
        }
    },

    RemoveHistory: function (searchInput, entry) {
        var cookie = readCookie('SearchHistory');
        var cookieValues = cookie.split(SearchDeluxe.cookieDelimiter);
        for (var i = 0; i < cookieValues.length; i++) { // remove the entry from the cookie
            if (cookieValues[i] == jQuery(entry).prev().html()) { cookieValues.splice(i, 1); }
        }
        cookie = cookieValues.join('--');
        createCookie('SearchHistory', cookie, SearchDeluxe.cookieLifespan);
        searchInput.focus(); // brings history back up
    }
};  // end SearchDeluxe

function ChangeCardLinkToPreApproved(BrandCardId) {
    htmlElement = document.getElementById('BrandCardId');
    if (htmlElement != null)
    { htmlElement.href = BaseURL + "Account/Acct_PreQualifiedOffer_common.aspx"; }
}

function ChangeCardLinkToBrandCard(BrandCardId) {
    htmlElement = document.getElementById('BrandCardId');
    if (htmlElement != null)
    { htmlElement.href = BaseURL + "Account/Acct_CreditCards.aspx"; }
}

function ShowCardLinks(YourCreditCardId, PreApprovedOfferId, SavingsId, vendorName) {
    var hasPreApprovedOffer = false;
    var hasPreApprovedOfferDeclined = false;
    var hasAdsCards = false;
    var cookieValue;
    var htmlElement;
    var cookieName = GetUserCookieName(vendorName);
    var subCookiePrefix = GetSubCookiePrefix(vendorName);

    cookieValue = GetDecodedSubCookieValue(cookieName, subCookiePrefix + '.HasPreApprovedOffer');
    if ((cookieValue != null) && (cookieValue.toLowerCase() == 'true'))
    { hasPreApprovedOffer = true; }

    cookieValue = GetDecodedSubCookieValue(cookieName, subCookiePrefix + '.PreApprovedOfferDeclined');
    if ((cookieValue != null) && (cookieValue.toLowerCase() == 'true'))
    { hasPreApprovedOfferDeclined = true; }

    cookieValue = GetDecodedSubCookieValue(cookieName, subCookiePrefix + '.HasAdsCard');
    if ((cookieValue != null) && (cookieValue.toLowerCase() == 'true'))
    { hasAdsCards = true; }

    cookieValue = GetDecodedSubCookieValue(cookieName, subCookiePrefix + '.CreditInfoString');
    if ((cookieValue != null) && (cookieValue.indexOf('A') == 0))
    { hasAdsCards = true; }

    if ((hasPreApprovedOffer == true) && (hasPreApprovedOfferDeclined == false)) {
        htmlElement = document.getElementById('SavingsId');
        if (htmlElement != null)
        { htmlElement.style.display = 'none'; }

        htmlElement = document.getElementById('PreApprovedOffer');
        if (htmlElement != null)
        { htmlElement.style.display = ''; }

        ChangeCardLinkToPreApproved('BrandCardId')
    }
    else if (hasAdsCards == true) {
        htmlElement = document.getElementById('SavingsId');
        if (htmlElement != null)
        { htmlElement.style.display = 'none'; }

        htmlElement = document.getElementById('YourCreditCard');
        if (htmlElement != null)
        { htmlElement.style.display = ''; }

        ChangeCardLinkToBrandCard('BrandCardId')
    }

    return true;
}

function RedirectToPreApprovedOffer()
{ window.location = BaseURL + 'Account/Acct_PreQualifiedOffer_plcc.aspx'; }

function InitUserLogin(SignInId, NotSignedInId, vendorName) {
    var cookieName = GetUserCookieName(vendorName);
    var subCookiePrefix = GetSubCookiePrefix(vendorName);

    if (GetLoginStatus(vendorName)) {
        var FirstName = toTitleCase(GetDecodedSubCookieValue(cookieName, subCookiePrefix + '.FirstName'));
        document.getElementById(SignInId).innerHTML = 'Welcome ' + FirstName + '.';
        $('#logOut').css('margin-left', '0');
        $('.or').css('display', 'none');
        $('#SignIn').css('text-decoration', 'none');
        document.getElementById(NotSignedInId).innerHTML = 'Not you? ';
        document.getElementById(SignInId).style.cursor = 'text';
        $('#NotUser').attr('href', '/Account/Acct_Login.aspx?Action=LogOff');

    }
}

function HighlightCurrentTab() {
    if (GetTopLevelDepartment() > 0) {
        var eleId = 'dept_' + GetTopLevelDepartment();
        var deptElement = document.getElementById(eleId);
        if (deptElement == null)
            return;
        var linkElement = deptElement.getElementsByTagName('a')[0];
        if (linkElement == null)
            return;
        linkElement.setAttribute('id', 'on');
        if (deptElement.innerText == undefined || deptElement.innerText == "" || deptElement.innerText == null) {
            parentCategoryForLeftNavHeader = deptElement.textContent;
        }
        else {
            parentCategoryForLeftNavHeader = deptElement.innerText;
        }
    }
}


function SetShoppingBagCount(ShoppingBagId) {
    if (document.getElementById(ShoppingBagId) != null) {
        if (GetSubCookieValue('Basket', 'Indy.Basket.BasketCount') != null)
        { document.getElementById(ShoppingBagId).innerHTML = '(' + GetSubCookieValue('Basket', 'Indy.Basket.BasketCount') + ')'; }

        else
        { document.getElementById(ShoppingBagId).innerHTML = '(0)'; }
    }
}

function SetShoppingBagCount_Vendor(ShoppingBagId, vendorName) {
    if (typeof (vendorName) != "undefined") {
        if (document.getElementById(ShoppingBagId) != null) {
            var basketCount = GetCookie(vendorName + '.Basket.BasketCount');
            if (basketCount != null)
            { document.getElementById(ShoppingBagId).innerHTML = '(' + basketCount + ')'; }

            else {
                document.getElementById(ShoppingBagId).innerHTML = '(0)';
            }
        }
    }
}

function LogoutUser() {
    setSubCookieAndCookie('User', 'Indy.FirstName', '');
    setSubCookieAndCookie('User', 'Indy.MasterId', '');
}

//This function returns a bool to indicate the login status.
function GetLoginStatus(vendorName) {
    var cookieName = GetUserCookieName(vendorName);
    var subCookiePrefix = GetSubCookiePrefix(vendorName);

    if (
        (GetSubCookieValue(cookieName, subCookiePrefix + '.MasterId') != null) &&
        (GetSubCookieValue(cookieName, subCookiePrefix + '.FirstName') != null) &&
        (GetSubCookieValue(cookieName, subCookiePrefix + '.MasterId') != '') &&
        (GetSubCookieValue(cookieName, subCookiePrefix + '.FirstName') != '')
      )
    { return true; }

    else
    { return false; }
}

//This function shows the previously view products 
//link if the user has visited any product.
function ActivatePreviouslyViewProductsLink(PVPId, vendorName) {
    var prevProducts;
    if (typeof (vendorName) == "undefined")
    { prevProducts = GetCookie('LastViewedProducts'); }

    else
    { prevProducts = GetCookie(vendorName + '.LastViewedProducts'); }

    var RegEX = /(([0-9]+)#([0-9]+)\*([0-9]+)){1,}/;

    if (RegEX.test(prevProducts)) {
        if (document.getElementById(PVPId) != null) {
            document.getElementById(PVPId).style.display = '';
            $('#customernum').css('float', 'none');
        }
    }

    else {
        if (document.getElementById(PVPId) != null)
        { document.getElementById(PVPId).style.display = 'none'; }
    }
}

//This function shows wishlist link if the user has added any
//items to the wishlist.
function ActivateWishList(WishListId) {
    if (IsUserHavingWishList()) {
        if (document.getElementById(WishListId) != null)
        { document.getElementById(WishListId).style.display = ''; }
    }

    else {
        if (document.getElementById(WishListId) != null)
        { document.getElementById(WishListId).style.display = 'none'; }
    }
}

/*************************** Search Func. ***************************/
function SearchOnEnter(myfield, e, search_input) {
    var keycode;
    if (window.event) { keycode = window.event.keyCode; }
    else if (e) { keycode = e.which; }
    else { return true; }

    if (keycode == 13) {
        var searchVal = $('.search input').val();
        var CQOSearch = trim1(searchVal);
        CQOSearch = CQOSearch.replace(/\s+/g, '-');
        if (searchVal != '') { // only search if there are terms
            jQuery('div.search-suggestions').fadeOut('fast', function () { jQuery('div.search-suggestions').remove(); });
            var qo_regex = /^(\d{1,4})(\-|\s)*(\d{5})(\-|\s)*(\d{3,4})$/; // cat numbers vary. hyphens are optional.
            var affiliate = ''; var perPage = '';
            if (location.href.toLowerCase().match('affiliatebrowsing')) { affiliate = 'affiliateBrowsing/'; perPage = '&nop=12'; }
            if (qo_regex.test(CQOSearch)) { // QuickOrder numbers go to product pages
                location.href = BaseURL + affiliate + "Catalog/CatalogQuickOrder.aspx?Quick=" + CQOSearch + perPage;
            } else {
                location.href = BaseURL + affiliate + "Search/SearchResults.aspx?SearchHeader=" + searchVal + perPage;
            }
        }
        return false;
    } else { return true; }
}

function trim1(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

function GoSearch(SearchInputId) {
    if (document.getElementById(SearchInputId).value != '' && document.getElementById(SearchInputId).value != product_search_default_text) {
        var searchVal = $('.search input').val();
        while (searchVal.substring(0, 3) == '%20') { // trim any initial spaces
            searchVal = searchVal.substring(3, searchVal.length);
        }

        var CQOSearch = trim1(searchVal);
        CQOSearch = CQOSearch.replace(/\s+/g, '-');
        var qo_regex = /^(\d{1,4})(\-|\s)*(\d{5})(\-|\s)*(\d{3,4})$/; // cat numbers vary. hyphens are optional.
        if (qo_regex.test(CQOSearch)) {
            location.href = BaseURL + "Catalog/CatalogQuickOrder.aspx?Quick=" + CQOSearch;
        } else if (searchVal != '' && searchVal != 'Enter%20Keyword%20or%20Catalog%20item%20%23%201165-12345-123') {
            location.href = BaseURL + "Search/SearchResults.aspx?SearchHeader=" + searchVal;
        }
    }
}

function GoAffiliateSearch(SearchInputId) {
    var searchVal = encodeURIComponent($('#' + SearchInputId).val());
    var qo_regex = /^\d{1,4}\-?\d{5}\-?\d{3,4}$/; // cat numbers vary. hyphens are optional.
    while (searchVal.substring(0, 3) == '%20') {
        searchVal = searchVal.substring(3, searchVal.length); // trim any initial spaces
    }
    if (searchVal != '' && searchVal.indexOf('keyword') < 0) { // only search if there are terms
        location.href = BaseURL + "AffiliateBrowsing/Search/SearchResults.aspx?SearchHeader=" + searchVal + "&nop=12";
    }
}

function TrimSearch(searchVal) {
    while (searchVal.substring(0, 3) == '%20') {
        searchVal = searchVal.substring(3, searchVal.length); // trim any initial spaces
    }
    return searchVal;
}

function PopulateSearchTerm() {
    if ($('#search_input').length) { $('#search_input').val(product_search_default_text); }
    $('#search_input').blur(function () {
        if ($('#search_input').val() == '') { $('#search_input').val(product_search_default_text).addClass('default-text'); }
    }).focus(function () {
        if ($('#search_input').val() == product_search_default_text) { $('#search_input').val('').removeClass('default-text'); }
    });

    var searchControl = document.getElementById('search_input');
    if (searchControl != null) {
        var queryStringCollection = window.location.search.replace('?', '').split('&')
        for (cnt = 0; cnt < queryStringCollection.length; cnt++) {
            var qs = queryStringCollection[cnt];
            var nameValueCollection = qs.split('=');
            if (nameValueCollection.length >= 2) {
                if (nameValueCollection[0] == 'SearchHeader') {
                    searchControl.value = decodeURIComponent(nameValueCollection[1]).split('+').join(' ');
                    break;
                }
            }
        }
    }
}
/*************************** END ***************************/

function toTitleCase(strToConvert) {

    var mx_replace = new Array('to', 'it', 'on', 'the', 'a', 'and', 'or', 'nor', 'of', 'in');
    var mx_ignore = new RegExp('[-\\s]');
    var mx_newS = strToConvert;
    var mx_prevC = '';
    var mx_thisC = null;
    var mx_match = null;
    var mx_iR = '';

    mx_newS = mx_newS.replace(/\s+|\r|\n/g, ' ').toLowerCase();
    mx_newS = mx_newS.replace(/^\s*/, '');
    mx_newS = mx_newS.replace(/\s*$/, '');

    for (var i = 1; i < mx_newS.length + 1; i++) {

        mx_iR = new RegExp('^' + (i != 1 ? '(.{' + eval(i - 1) + '})' : '') + '(.)' + (i != mx_newS.length ? '(.{' + eval(mx_newS.length - i) + '})' : '') + '$');
        mx_match = mx_newS.match(mx_iR);
        mx_thisC = ((mx_match.length == 3 && i == 1) ? mx_match[1] : mx_match[2]);

        if (mx_prevC.match(mx_ignore) != null || mx_prevC == '') {

            mx_newS = ((mx_newS.length == 1) ? mx_newS.toUpperCase() :

   (mx_match.length == 3 && i == 1) ? mx_newS.replace(mx_iR, mx_match[1].toUpperCase() + mx_match[2]) :
   (mx_match.length == 3 && i == mx_newS.length) ? mx_newS.replace(mx_iR, mx_match[1] + mx_match[2].toUpperCase()) :

   mx_newS.replace(mx_iR, mx_match[1] + mx_match[2].toUpperCase() + mx_match[3]));
        }

        mx_prevC = (mx_thisC ? mx_thisC.toLowerCase() : '');
    }

    for (var n = 0; n < mx_replace.length; n++) {

        mx_iR = new RegExp(' ' + mx_replace[n] + ' ', 'gi');
        mx_newS = mx_newS.replace(mx_iR, ' ' + mx_replace[n] + ' ')

    }
    return (mx_newS);
}

//This function returns the First Name of the logged in user.
function GetFirstName() {
    if (GetLoginStatus()) {
        var FirstName = toTitleCase(GetDecodedSubCookieValue('User', 'Indy.FirstName'));
        return FirstName;
    }
    else
    { return ''; }
}

//This function returns a bool to indicate the login status.
function IsUserLoggedIn() {
    if (
        (GetSubCookieValue('User', 'Indy.MasterId') != null) &&
        (GetSubCookieValue('User', 'Indy.FirstName') != null) &&
        (GetSubCookieValue('User', 'Indy.MasterId') != '') &&
        (GetSubCookieValue('User', 'Indy.FirstName') != '')
      )
    { return true; }

    else
    { return false; }
}

//This function indicates if the user has by brand credit cards.
function IsUserHavingWishList() {
    if (GetDecodedSubCookieValue('User', 'Indy.WishListCount') != null) {
        if (GetDecodedSubCookieValue('User', 'Indy.WishListCount') == 'true')
        { return true; }
    }
    return false;
}

function GetTopLevelDepartment() {
    if ((document.getElementById('hdnTopDeptId') != null) &&
       (document.getElementById('hdnTopDeptId').value != '-2147483648'))
    { return document.getElementById('hdnTopDeptId').value; }

    else
    { return -1; }
}

function GetShoppingBagCount() {
    if (GetSubCookieValue('Basket', 'Indy.Basket.BasketCount') != null)
    { return GetSubCookieValue('Basket', 'Indy.Basket.BasketCount'); }
}

function GetUserCookieName(vendorName) {
    if (typeof (vendorName) == "undefined")
    { return "User"; }

    else
    { return vendorName + ".User"; }
}

function GetSubCookiePrefix(vendorName) {
    if (typeof (vendorName) == "undefined")
    { return "Indy"; }

    else
    { return vendorName; }
}

/** delete cookie **/

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function OpenPopup(sURL, sName, sFeatures, bReplace) {
    var url = "about:blank";
    if (typeof (sURL) != 'undefined' && sURL != null)
    { url = BaseURL + sURL; }

    return window.open(url, sName, sFeatures, bReplace);
}

/** [Start] ADS Header offer  **********************************************************************/

var userinfo = readCookie('User');
$(document).ready(function () {
    function checkBrand(card) {
        //show image for brand card based on the flag in cookie
        //NOTE: cards associated with a logged in user's account have Site Id in the Indy.BrandCreditCard cookie (i.e.: '00' instead of 'W')

        if (card == 'W' || card == 'V' || card == '00') {
            $('.prea-card-offer > img').attr('src', '//secureimages.plussizetech.com/images/site_images/womanwithin/1024_WW_cc_control.jpg');
        }
        else if (card == 'R' || card == 'S' || card == '05') {
            $('.prea-card-offer > img').attr('src', '//secureimages.plussizetech.com/images/site_images/roamans/1024_RM_cc_control.jpg');
        }
        else if (card == 'J' || card == 'I' || card == '23') {
            $('.prea-card-offer > img').attr('src', '//secureimages.plussizetech.com/images/site_images/jessicalondon/1024_JL_cc_control.jpg');
        }
        else if (card == 'K' || card == 'N' || card == '11') {
            $('.prea-card-offer > img').attr('src', '//secureimages.plussizetech.com/images/site_images/KSD/1024_KSD_cc_control.jpg');
        }
        else if (card == 'O' || card == 'P' || card == '77') {
            $('.prea-card-offer > img').attr('src', '//secureimages.plussizetech.com/images/site_images/mastersite/1024_OSP_cc_control.jpg');
        }
        else if (card == 'H' || card == 'G' || card == '15') {
            $('.prea-card-offer > img').attr('src', '//secureimages.plussizetech.com/images/site_images/brylanehome/1024_BH_cc_control.jpg');
        }
    }

    function checkForOffers() {
        if (userinfo != null && userinfo != '') {
            var brandcard = GetSubCookieValue('User', 'Indy.BrandCreditCard');
            var preapprvd = GetSubCookieValue('User', 'Indy.PreApproval');
            var availcrdt = GetSubCookieValue('User', 'Indy.AvailableCredit');
            if (preapprvd == 'D' || preapprvd == null) {
                //alert('Declined');
                $('div.credit-card').replaceWith('<div class="prea-card-offer"><img src="#" /><span class="greeting"></span><span class="availcred"></span></div>');
                $('div.prea-card-offer > span.greeting').append("Great News! ");
                $('.prea-card-offer > span.availcred').append("Your Available Credit: <strong>$" + availcrdt + "</strong>");
                checkBrand(brandcard);
            } else if (preapprvd == 'A') {
                //if you have accepted the offer show the image and the amount
                $('div.credit-card').replaceWith('<div class="prea-card-offer"><img src="#" /><span class="greeting"></span><span class="availcred"></span></div>');
                $('div.prea-card-offer > span.greeting').append("Great News! ");
                $('.prea-card-offer > span.availcred').append("Your Available Credit: <strong>$" + availcrdt + "</strong>");
                checkBrand(brandcard);
            }
            else if (preapprvd == 'True') {
                $('div.credit-card').replaceWith('<div class="prea-card-offer"><img src="#" /><span class="greeting"></span><span class="availcred"></span></div>');
                $('div.prea-card-offer > span.greeting').append("Great News! ");
                $('.prea-card-offer > span.availcred').append("Your Available Credit: <strong>$" + availcrdt + "</strong>");
                checkBrand(brandcard);
            } else if (preapprvd == 'P') {
                //if you are preapproved show the 
                $('div.credit-card').replaceWith('<div class="prea-card-offer"><img src="#" /><span class="greeting"></span><span class="availcred"></span></div>');
                $('div.prea-card-offer > span.greeting').append("Pre-approved? ");
                $('.prea-card-offer > span.availcred').append('<a href="/Account/Acct_PreQualifiedOffer_plcc.aspx">Learn more</a>');
                checkBrand(brandcard);
            }
        }
        else {
            //alert('no cookie');
            //$('.prea-card-offer').replaceWith('<a id="offer-left" href="/Account/Apply_CreditCard.aspx"><img src="//secureimages.plussizetech.com/images/site_images/womanwithin/100710_email_hp1.jpg" width="461" height="55" border="0" alt="" title="" /></a>');
        }
    }
    checkForOffers();
})
/** [END] ADS Header Offer  **********************************************************************/


var HeaderNav = {
    menuWidth: new Array(),                             // stores each menu's width
    menuFirstColWidth: 170, menuSecondColWidth: 150,    // menus can be single or double width; see main site CSS for these values
    tabHeight: 27, siteWidth: 980, shadowWidth: 5,      // measurements used for positioning menus; see main site CSS for these values
    oldIds: '',                                         // prevents any redundant AJAX calls
    liSelector: '#dept_',                               // text before id in menu list items (ex: <li id="dept_9474">)

    SetUpMenus: function () {
        // find all the header nav tabs
        var navTabs = $('div.menu > ul > li');
        var menuOpenState = false;

        $.each(navTabs, function () {
            var id = $(this).attr('id').replace('dept_', '');        	// tab id is the dept. number
            var twoColumns = ($(this).attr('menu') == 'two-columns');   // example: <li class="dept-12345" menu="two-columns">
            var twoColStyle = (twoColumns) ? ' menu-two-cols' : '';     // see main site CSS for two-column styles
            HeaderNav.menuWidth[id] = (twoColumns) ? HeaderNav.menuFirstColWidth + HeaderNav.menuSecondColWidth : HeaderNav.menuFirstColWidth;

            // generate HTML for the menu and drop shadows
            var menuHTML = '<div id="menu-' + id + '" class="menu-2011">';                                                  // menu wrapper + id related to parent list item
            menuHTML += '<div class="menu-top-2011"><div class="tab-top-left-2011">';                                       // menu structure
            menuHTML += '<a id="menu-link-' + id + '" href="' + $(HeaderNav.liSelector + id + '> a').attr('href') + '">';   // tab nav id + link
            menuHTML += $(HeaderNav.liSelector + id + ' a span').html() + '</a>';                                           // tab nav id + link (continued)
            menuHTML += '</div><div class="tab-right-2011"></div></div>';                                                   // menu structure
            menuHTML += '<div id="' + id + '" class="menu-main-2011' + twoColStyle + '"></div></div>';                      // finish menu structure, style two-column menus

            // populate and style the menu
            if (HeaderNav.oldIds.indexOf(id) == -1) {
                $.ajax({ type: 'GET', url: '../MainMenu.aspx?DeptId=' + id,
                    success: function (data) {
                        if (data != '') { // empty menus should not be added to the dom
                            $(HeaderNav.liSelector + id).append(menuHTML);  // add the menu to the nav tab
                            $('#' + id).html(data);             			// add the menu items to the menu

                            // position the menu based on the parent list item
                            var parentPosition = $(HeaderNav.liSelector + id + '> a').position();

                            if (parentPosition.left < HeaderNav.siteWidth - 2 * HeaderNav.menuFirstColWidth) {
                                // menu opens to the right
                                $('#menu-' + id).css('left', parentPosition.left - HeaderNav.shadowWidth);
                            } else {
                                // menu opens to the left
                                $('#menu-' + id).addClass('menu-opens-left');
                                $('#menu-' + id).css('left', parentPosition.left + HeaderNav.shadowWidth - HeaderNav.menuWidth[id] + $(HeaderNav.liSelector + id + '> a').width());
                            }
                            $('#menu-' + id).css('top', parentPosition.top - HeaderNav.shadowWidth);

                            // style the menu's top tab based on the parent anchor
                            $('#menu-' + id + ' div.menu-top-2011').css('width', HeaderNav.menuWidth[id] + 'px');
                            $('#menu-link-' + id).css('width', $(HeaderNav.liSelector + id + '> a').css('width'));
                            $('#menu-link-' + id).css('background-image', $(HeaderNav.liSelector + id + '> a').css('background-image'));
                            if (!$.browser.msie) {
                                $('#menu-link-' + id).css('background-position', $(HeaderNav.liSelector + id + '> a').css('background-position').replace('100%', 'bottom').replace('0%', 'bottom'));
                            } else { // <3 IE
                                $('#menu-link-' + id).css('background-position-x', $(HeaderNav.liSelector + id + '> a').css('background-position-x'));
                                $('#menu-link-' + id).css('background-position-y', 'bottom');
                                if ($.browser.version == 7 && $('#menu-' + id).hasClass('menu-opens-left')) {
                                    $('#menu-link-' + id).parent().css('width', $(HeaderNav.liSelector + id + '> a').css('width'));
                                    $('#menu-link-' + id).css('margin-left', '-' + HeaderNav.shadowWidth + 'px');
                                }
                            }

                            $(HeaderNav.liSelector + id + ' a').hover(function () { HeaderNav.ShowMenu(id); menuOpenState = true; }, function () { HeaderNav.HideMenu(); menuOpenState = false; });
                            $(HeaderNav.liSelector + id + ' div#' + id).hover(function () { HeaderNav.ShowMenu(id); menuOpenState = true; }, function () { HeaderNav.HideMenu(); menuOpenState = false; });
                            $(HeaderNav.liSelector + id + ' div#' + id + ' a').unbind('hover');

                        }
                    }
                });
                HeaderNav.oldIds = HeaderNav.oldIds + "," + id;
            }
        });
    },

    ShowMenu: function (id) {
        var tabOffset = $(HeaderNav.liSelector + id + ' a').offset();
        $('#menu-' + id).show();
    },

    HideMenu: function () { $('.menu-2011').hide(); }
}
