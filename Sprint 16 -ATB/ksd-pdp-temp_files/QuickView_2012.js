/**** QuickView 2012 ************************************************************************/

/**** Start: QuickView UI Behaviour *********************************************************/
function quickview_ui_behaviour(urlSelector) {
    var quickviewContainer = ".quickview-container";
    var quickviewIE = ".qv-ie";
    var shoppingBagCountSelector = "#ShoppingBagCount";
    var closeSelector = ".quickview-close";
    var quickviewLink = ".quickview-link";
    var quickviewCertonaLink = ".recommendation-quickview";
    var bigTallLinkSelector = "#also";
    var swatchSeclector = '.select-color';
    var sizeTypeSelector = '.sizeType';

    this.SetBehaviour = function () { SetEventsAndHandlers(); }
    this.LoadQuickView = function (val) { DisplayQuickView(val); }

    function SetEventsAndHandlers() {
        $(urlSelector).hover(function () {
            var productUrl = $(this).attr('href');
            if (!productUrl.match(/ProductTypeId=2|deptId=18630|deptId=18631|deptId=18370/i)) { // outfits/gift card dept. IDs
                // append and position QV button
                var quickPosition = $(this).position();
                var productImage = $(this).children('img:first');

                $(this).append('<a href="#" class="quickview-link"></a>');
                $(quickviewLink).css('left', quickPosition.left + (productImage.width() / 2 - 40));
                // KSD is behaving oddly; positioning differs from the baseline (WW) code...
                $(quickviewLink).css('top', quickPosition.top + (productImage.height() / 2) - 10);

                // add style no and image type to Quickview URL
                $(quickviewContainer).attr("styleno", $(this).find('.frontview').attr('styleno'));

                // add the QV button's behaviors and params
                var url = '/Product/Quickview.aspx?' + productUrl.split('?')[1] + '&isQuickView=true';
                $(quickviewLink).click(function (event) {
                    event.preventDefault();
                    QuickViewFlag = 1; // for \Controls\Product\AltImageStrip.ascx
                    $(quickviewContainer).attr("qvproducturl", productUrl);
                    DisplayQuickView(url);
                });
                $(quickviewLink).hover(function () { $(quickviewLink).show(); });

                $(quickviewLink).css('display', 'block');
            }
        },
        function () { $(quickviewLink).remove(); });

        $(quickviewContainer).click(function (event) { event.stopPropagation(); });
    }

    function DisplayQuickView(val) {
        // if on the pdp g_lastAvailabilityStatus may not be empty, so call onPDPUnload

        onPDPUnload();

        $(quickviewContainer).hide(); // in case previously open
        $(quickviewContainer).attr('url', val); // for add to basket
        $(quickviewLink).css('background-position', '0px -25px'); // 'loading' indicator
        $(quickviewContainer).attr("qvproducturl", '/Product.aspx?' + val.split('?')[1].replace("&isQuickView=true", ""));

        $.get(val, function (data) {
            var jsonData = parseJsonData(removeHtmlTagFromString(data));
            if (jsonData.HtmlData.match(/apologize for the inconvenience/i)) {
                $(quickviewLink, quickviewCertonaLink).css('background-position', '0px 0px');
                jsonData.HtmlData = '<div class="quickview-404"><h3>The item you are looking for was not found. </h3> We apologize for the inconvenience. The item is currently unavailable or no longer exists on our site. Please try searching for a similar item. <a class="quickview-close">Close this window</a>.</div>';
                if (!$.browser.msie) { $(quickviewContainer).html(jsonData.HtmlData); }
                else { $(quickviewIE).html(jsonData.HtmlData); }
                $(quickviewContainer).show();
            }

            setPageHistoryForKana('', val);

            if (!$.browser.msie) { $(quickviewContainer).html(jsonData.HtmlData); }
            else { $(quickviewIE).html(jsonData.HtmlData); }
            if (jsonData.OmnitureData != null && jsonData.OmnitureData != '') {
                OmnitureScript(jsonData.OmnitureData);
            }

            $('html').click(function () { CloseQuickView(); }); // clicking the page closes QV
            $(".m-popupWindow-trigger").on("click", createPopup);

            QuickViewTabs();
            HemCheckbox();
            $(closeSelector).click(function () { CloseQuickView(); });

            var pdp = new pdp_ui_behaviour("#quickview-wrapper", "#Main_Image_0", "select.size", "div.current_price", "span.swatch-2011", "a.swatch-2011-link", "div.selectionHolder span.item_status_msg", "div.quantity_container span.item_status_msg", "colorName", "div.swatch-tooltip", ".hidSizeValue", ".swatch-error-msg", "a.zoomLink", ".hdItemSelect", ".pricefrom", "salepricestyle", "strike-price",
            ".addToBasket", ".quantity", "div.buttons", "quickview");
            pdp.SetBehaviour();

            var atb = new quickview_atb_behaviour(".quickview-container", "select.size", ".hidSizeValue", "select.quantity", "#divHideOnAddOrError", ".imgContinue", ".msg", "#ShoppingBagCount", ".quickview-close", ".atb-old", true);
            atb.SetBehaviour();

            $(quickviewContainer).css('left', $(window).width() / 2 - $(quickviewContainer).width() / 2);
            $(quickviewContainer).css('top', $(window).scrollTop() + $(window).height() / 2 - 250); // uses estimated window height; actual causes problems...

            if ($.browser.msie) { // ie can's use css shadow, and ie shadow filter is crap, so... hacks!
                $(quickviewContainer).css('border', '0').css('background', 'none'); // remove standard styles
                $(quickviewIE).addClass('ie-quickview-background-top');
                if ($(quickviewContainer).children('.ie-quickview-background-bottom').length == 0) {
                    $(quickviewContainer).append('<div class="ie-quickview-background-bottom"></div>');
                }
            }

            $(quickviewContainer).show();
            $(quickviewLink).css('background-position', '0px 0px').hide();
            $(quickviewCertonaLink).css('background-position', '0px 0px');

            $(sizeTypeSelector).each(function () {
                $(this).click(function () { DisplaySizeAndColor($(this).attr('url')); });
            });
        });
        $(quickviewContainer).attr('bigtall', '');
        SetBasketCount();

        //Set Event52 for QuickView
        var name = 'SearchEvent';
        if (document.location.href.indexOf("/Search/SearchResults.aspx") > 0) {
            var event52 = GetQuickViewSearchCookie(name);
            if (event52 == "0") {
                SetPdpSearchEvent(name);
            }
        }

        ////event 52 for category landing pages
        if (document.location.href.indexOf("DeptId=") > 0 && document.location.href.indexOf("RedirectKeyword=") > 0) {
            var event52 = GetQuickViewSearchCookie(name);
            if (event52 == "0") {
                SetPdpSearchEvent(name);
            }
        }
    }

    function SetBasketCount() {
        $(shoppingBagCountSelector).text(GetSubCookieValue('Basket', 'Indy.Basket.BasketCount') != null ? '(' + GetSubCookieValue('Basket', 'Indy.Basket.BasketCount') + ')' : '(' + 0 + ')');
    }

    function CloseQuickView() {
        if ($(".quickview-container").css('display') == 'block')
        {
            onPDPUnload();

	        if (window.location.href.toLowerCase().indexOf("emptyshoppingbag.aspx") > -1) {
	            //Need to see if we added something to the bag
	            if ($('.msg').find('#ImageButtonContinue').length != 0) {
	                window.location.href = "/Shopping_bag/ShoppingBag.aspx";
	            }
	        }
	        else if (window.location.href.toLowerCase().indexOf("shoppingbag.aspx") > -1) {
	            //Need to see if we added something to the bag
	            if ($('.msg').find('#ImageButtonContinue').length != 0) {
	                window.location.href = window.location;
	            }
	        }
	
	        //Fix : Alternate images not clickable after close the QV
	        if (typeof pdp_product_images != 'undefined')
	        { product_images = pdp_product_images; }
	        product_alts.init(hfIndexValue, 271, 390, 4, 53, 8);
	
	        //Fix : QV open issue in PDP 
	        $(quickviewContainer).find('.product-image-wrapper').remove();
	        $(quickviewContainer).find('.hidSizeValue').remove();
	        $(quickviewContainer).find('.quantity').remove();
	        $(quickviewContainer).hide();
		}
    }

    function DisplaySizeAndColor(val) {
        val = val + '&isQuickView=true';
        QuickViewFlag = 1; // for \Controls\Product\AltImageStrip.ascx
        var quickview = new quickview_ui_behaviour('.productlink');
        quickview.LoadQuickView(val);
        $(quickviewContainer).attr('bigtall', 'true');


        $(sizeTypeSelector).each(function () {
            $(this).click(function () { DisplaySizeAndColor($(this).attr('url')); });
        });
    }
}
/**** End: QuickView UI Behaviour ***********************************************************/


/**** Start: QuickView ATB ******************************************************************/
function quickview_atb_behaviour(quickviewContainer, sizeSelector, sizeColorSelector, quantitySelector, productSelector, continueSelector, messageSelector, shoppingBagCountSelector, closeSelector, addToBasketSelector, enableAtb) {
    this.SetBehaviour = function () {
        if ($(sizeSelector).prop('selectedIndex') != 0 && $(quantitySelector).prop('selectedIndex') != 0 && $('#select_color_value').html() != '') {
            $(addToBasketSelector).removeClass('disabled');
        } else { $(addToBasketSelector).addClass('disabled'); }

        SetEventsAndHandlers();
    }

    function SetEventsAndHandlers() {
        $(addToBasketSelector).click(function (event) {
            event.preventDefault();
            if (!$(this).hasClass('disabled')) {
                if (enableAtb) { AddToBasket(); } 
            }
        }).hover(function () {
            if ($(this).hasClass('disabled')) { InfoTooltip('span.quickview-add'); }
        }, function () { jQuery('div.info-tooltip').remove(); });

        $(sizeSelector).change(function () { AddToBasketButton(); });
        $(quantitySelector).change(function () { AddToBasketButton(); });
        $('a.swatch-2011-link').mouseup(function () { AddToBasketButton($(this)); });

        $(continueSelector).bind('click', CloseQuickView);
    }

    function AddToBasket() {
        // call onPDPUnload in order that the add to basket operation will be tracked based on the current product status
        onPDPUnload();

        var size = $(quickviewContainer).find(sizeSelector).prop("selectedIndex");
        var color = $(quickviewContainer).find(sizeColorSelector).val();
        var qty = $(quickviewContainer).find(quantitySelector).val();
        var isHem = $(quickviewContainer).find('.Hemit').find('.checkbox').attr('checked') != undefined ? true : false;
        var hemVal = $(quickviewContainer).find('.Hemit').find('select').val();
        var isMonogram = $(quickviewContainer).find('.checkboxMono').attr('checked') != undefined ? true : false;
        var monoColor = $(quickviewContainer).find('.Color').find('select').val();
        var monoFont = $(quickviewContainer).find('.Font').find('select').val();
        var monoAt = $(quickviewContainer).find('.At').find('select').val();
        var monoLine = $(quickviewContainer).find('.text').val();

        var atbUrl = $(quickviewContainer).attr('url') + '&qty=' + qty + '&color=' + color + '&size=' + size + '&isHem=' + isHem + '&hemVal=' + hemVal
        + '&isMonogram=' + isMonogram + '&monoColor=' + monoColor + '&monoFont=' + monoFont + '&monoAt=' + monoAt + '&monoLine=' + monoLine;
        if ($(quickviewContainer).attr('bigtall') != '') {
            atbUrl += '&bigtall=' + $(quickviewContainer).attr('bigtall');
        }
        $.ajax({
            contentType: "text/html; charset=utf-8",
            url: atbUrl,
            dataType: "html",
            success: function (data) {
                var jsonData = parseJsonData(removeHtmlTagFromString(data));
                if ('success' == jsonData.Status || 'exceedmaxitem' == jsonData.Status || 'backorder' == jsonData.Status) {
                    $(productSelector).hide();
                    $(continueSelector).show();
                }
                $(messageSelector).html(jsonData.HtmlData);
                if (jsonData.OmnitureData != null && jsonData.OmnitureData != '') {
                    QVAddToBasketOmnitureScript(jsonData.OmnitureData);                    
                }
                //GA implementation
                if ('success' == jsonData.Status || 'backorder' == jsonData.Status) {
                    isaddtobasket = true;
                    try {
                        SetQuickViewATB();
                    } catch (e) { }

                    try { // For new Certona JS 2014.                       
                        AddToCartCertona();
                    } catch (e) { }

                    if (location.pathname.toLowerCase() == "/shopping_bag/emptyshoppingbag.aspx") {
                        $("#ImageButtonContinue").attr("onclick", "window.location.href = '/shopping_bag/ShoppingBag.aspx'; $('#quickview-container').hide(); return false;");
                    }
                }
                SetBasketCount();
            }
        });
    }

    function SetBasketCount() {
        $(shoppingBagCountSelector).text('(' + GetSubCookieValue('Basket', 'Indy.Basket.BasketCount') + ')');
    }

    function CloseQuickView() {
        if ($(".quickview-container").css('display') == 'block')
        {
            onPDPUnload();
 
	        if (window.location.href.indexOf("ShoppingBag.aspx") > -1) {
	            //Need to see if we added something to the bag
	            if ($('.msg').find('#ImageButtonContinue').length != 0) {
	                window.location.href = window.location;
	            }
	        }
	
	        //Fix : Alternate images not clickable after close the QV
	        if (typeof pdp_product_images != 'undefined')
	        { product_images = pdp_product_images; }
	        product_alts.init(hfIndexValue, 271, 390, 4, 53, 8);
	
	        //Fix : QV open issue in PDP 
	        $(quickviewContainer).find('.product-image-wrapper').remove();
	        $(quickviewContainer).find('.hidSizeValue').remove();
	        $(quickviewContainer).find('.quantity').remove();
	        $(quickviewContainer).hide();
		}
    }

    function AddToBasketButton(swatch) {
        if ($(sizeSelector).prop('selectedIndex') != 0 && $(quantitySelector).prop('selectedIndex') != 0 && $('#select_color_value').html() != '') {
            if (swatch && $(swatch).children('img').css('visibility') == 'visible') {
                return false; // in case user clicks on an unavailable swatch
            } else { $(addToBasketSelector).removeClass('disabled'); }
        } else { $(addToBasketSelector).addClass('disabled'); }
    }
}
/**** End: QuickView ATB ********************************************************************/


/**** Start: Intercept old QuickView functions **********************************************/
var jsPopup = { // intercept old-style QuickView calls from Certona
    open: function (url) {
        QuickViewFlag = 1;
        url += '&isQuickView=true';
        var quickview = new quickview_ui_behaviour('.productlink');
        quickview.LoadQuickView(url);
        return false;
    }
}

function OpenQuickView() { }
function onQuickViewLoad() { }
/**** End: Intercept old QuickView functions ************************************************/


/**** Start: QuickView Misc *****************************************************************/
function InfoTooltip(button) {
    $(button).append('<div class="info-tooltip"><div></div></div>');
    var toolTip = jQuery('div.info-tooltip');
    toolTip.css('visibility', 'hidden');
    var toolTipPosition = $('span.quickview-add').position();
    toolTip.css('left', toolTipPosition.left + 9);
    toolTip.css('top', toolTipPosition.top - 57);
    toolTip.html('Please select a size, color and quantity.');
    toolTip.css('visibility', 'visible');
}

function QuickViewTabs() {
    var tabContainers = $('#quickview-wrapper div.tabs > div');
    tabContainers.hide().filter(':first').show();

    $('div.tabs ul.tab-nav a').click(function () {
        tabContainers.hide();
        tabContainers.filter(this.hash).show();
        $('div.tabs ul.tab-nav a').removeClass('selected');
        $(this).addClass('selected');
        return false;
    }).filter(':first').click();
}

function HemCheckbox() {
    // 'hem my pants' checkbox enables/disables hem size dropdown (tt #23856)
    $('input.hem-check').on('change', function () {
        $select = $(this).siblings('select');
        if ($(this).attr('checked')) { $select.removeAttr('disabled'); }
        else { $select.attr('disabled', 'disabled'); }
    });
}

function displayMonogramDetail(addmonigramid, monogramdDetailID) {
    var checkbox = document.getElementById(addmonigramid);
    var monogramDetail = document.getElementById(monogramdDetailID);
    monogramDetail.style.display = checkbox.checked ? "inline" : "none";
}
/**** End: QuickView Misc *******************************************************************/


//Helper Method
function parseJsonData(strData) {
    return $.browser.msie && parseInt($.browser.version, 10) == 7 ? $.parseJSON(strData) : JSON.parse(strData);
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

function GetQuickViewSearchCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg)
            return getQuickViewSearchVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break;
    }
    return null;
}

function getQuickViewSearchVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1)
        endstr = document.cookie.length;
    var str = unescape(document.cookie.substring(offset, endstr));
    var x = str.split(",", 2);
    return x[1];
}


