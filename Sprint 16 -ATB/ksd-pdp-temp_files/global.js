/** DOM-READY ****************************************************************************/
$(document).ready(function () {
    fields();
    tooltip();
    defaultfields();
    ShoppingBag();
    GetSelectedImageStyle();
    closeBagNow();
    removelink();

    /**** Disable copy and paste *****/
    $('input.disablecopypaste').bind('copy paste', function (e) {
        e.preventDefault();
    });
    $('#clicktochat_header a,#clicktochat_footer a').click(function (e) {
        TrackOmnitureForLiveChat();
    });

    //Fix for clicking on the left nav
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    { isTouchDevice = true; $('body').addClass("m-iPad"); }
    else
    { isTouchDevice = false; }

    if (isTouchDevice && typeof OverrideRefinementLinkBehavior != 'function') {

        var draggingScroller = false;

        $('body').on('touchmove', function (event) {
            dragging = true;
        });
        $('body').on('touchstart', function (event) {
            dragging = false;
});
        $('body').on('touchend', function (event) {
            if (dragging) {
                return;
            }
            var target = $(event.target);
            if (target.parents('.nav-level-2').length > 0 || target.parents('#department-nav').length) {
                if (target.closest('a').length > 0) {
                    event.preventDefault();
                    var link = target.closest('a').attr('href');
                    window.location = link;
                }
            }
        });
    }

    //record url for kana
    (function () {
        var key = 'pageHistoryForKana';
        window.setPageHistoryForKana = function (message, url) {
            if (!url) {
                url = window.location.pathname + window.location.search;
            }
            var historyDataRaw = GetCookie(key), historyData = [];
            if (historyDataRaw) {
                historyData = historyDataRaw.split('\n');
            }
            historyData.unshift(new Date().getTime() + '\t' + url + '\t' + (message || ''));
            if (historyData.length > 10) {
                historyData.pop();
            }
            document.cookie = key + "=" + encodeURIComponent(historyData.join('\n')) + '; path=/;';
        };

        window.getPageHistoryForKana = function () {
            var historyDataRaw = GetCookie(key), historyData = [];
            if (historyDataRaw) {
                historyData = historyDataRaw.split('\n');
            }

            var hist = [];
            for (var i = 0, j = historyData.length; i < j; i++) {
                var data = historyData[i].split('\t');
                if (data.length == 3) {
                    var date = new Date();
                    date.setTime(+data[0]);
                    hist[i] = date.toGMTString() + '\t' + data[1] + '\t' + data[2];
                }
            }
            return hist.join('\n');

        };

        setPageHistoryForKana();
    })();

    if ($('.hdnPageHistory') != 'undefined') {
        $('.hdnPageHistory').val(window.getPageHistoryForKana());
    }
});

var IE6 = ($.browser.msie && $.browser.version == 6);
var IE7 = ($.browser.msie && $.browser.version == 7);
/** [END] DOM-READY **********************************************************************/

/** ALL FIELDS IN SITE *******************************************************************/
function fields() {
    $('input[type="text"], textarea, input[type="password"]').addClass("field");
    $('input[type="text"], textarea, input[type="password"]').focus(function () {
        $(this).removeClass("field").addClass("focusfield");
    });
    $('input[type="text"], textarea, input[type="password"]').blur(function () {
        $(this).removeClass("focusfield").addClass("field");
    });
}
/** [END] ALL FIELDS IN SITE *************************************************************/
/** FIELDS WITH DEFAULT VALUE ************************************************************/
function defaultfields() {
    $(".cleardefault").focus(function () {
        if (this.value == this.defaultValue) {
            this.value = '';
        } 
    });
    $(".cleardefault").blur(function () {
        if ($.trim(this.value) == '') {
            this.value = (this.defaultValue ? this.defaultValue : '');
        } 
    });
}
/** [END] FIELDS WITH DEFAULT VALUE ******************************************************/
/** ToolTip ******************************************************************************/
function tooltip() {
    link_title("a.tip", "tooltip");
}
function link_title(target_items, name) {
    if (typeof (_runningFromMicrosite) != "undefined") {
        $(target_items).each(function (i) {
            $("body").append("<div class='mainSiteContent'><div class='" + name + "' id='" + name + i + "'><p>" + $(this).attr('title') + "</p></div></div>");
            var title = $("#" + name + i);
            $(this).removeAttr("title").mouseover(function () {
                title.css({ opacity: 0.8, display: "none" }).fadeIn(400);
            }).mousemove(function (kmouse) {
                title.css({ left: kmouse.pageX + 15, top: kmouse.pageY - 35 });
            }).mouseout(function () {
                title.fadeOut(400);
            });
        });
    } else {
        $(target_items).each(function (i) {
            $("body").append("<div class='" + name + "' id='" + name + i + "'><p>" + $(this).attr('title') + "</p></div>");
            var title = $("#" + name + i);
            $(this).removeAttr("title").mouseover(function () {
                title.css({ opacity: 0.8, display: "none" }).fadeIn(400);
            }).mousemove(function (kmouse) {
                title.css({ left: kmouse.pageX + 15, top: kmouse.pageY - 35 });
            }).mouseout(function () {
                title.fadeOut(400);
            });
        });
    } 
}
/** [END] ToolTip ************************************************************************/
/** Ajax Get *****************************************************************************/
function populateElement(source, open, target, close, div) {
    var url = source;
    $(div).html('<div class="bg_load"><p class="loadPop"><span class="display">Loading...</span></p></div>');
    $.get(url, function (data) {
        var startIndex = data.indexOf(open + target);
        var endIndex = data.lastIndexOf(close);
        cache: true;
        $(div).html(data.substring(startIndex, endIndex + close.length));
    });
}

var basketOldCount = 0;
function GetSingleElement(source, element, target) {
    var basketNewCount = GetSubCookieValue('Basket', 'Indy.Basket.BasketCount');
    if (basketOldCount != basketNewCount) {
        $(target).html('<div class="bg_load"><p class="loadPop"><span class="display">Loading...</span></p></div>');
        $(target).load(source + ' ' + element);
        basketOldCount = basketNewCount;
    }
}
/** [END] Ajax Get ***********************************************************************/
/** Scroll text  *************************************************************************/
function scrollWindow() {
    if ($.browser.opera) { $('html').animate({ scrollTop: $(scrollTo).offset().top }, speedscroll); }
    else $('html,body').animate({ scrollTop: $(scrollTo).offset().top }, speedscroll);
}
/** [END] Scroll text  *******************************************************************/
/** Open Bag   ***************************************************************************/
function ShoppingBag() {
    $(".openBag").bind('mouseover',
   function () {
       $(".placeholderDropdown").css('display', 'block');
   });
    $(".openBag").bind('mouseout',
   function () {
       closeBagNow();
   });
} function closeNow() { $(".placeholderDropdown").css('display', 'none'); }
function closeBagNow() {
    if (IE6) { $('.placeholderDropdown').css('display', 'block'); }
    else {
        $('.placeholderDropdown').mouseout(function () {
            $('.placeholderDropdown').fadeTo(duration, 1).fadeOut('slow');
        });
    } 
}
/** [END] Open Bag   *********************************************************************/
/** Remove Shopping Bag Call   ***********************************************************/
function removelink() {
    // if the current page is Microsite
    if (typeof (_runningFromMicrosite) != "undefined") {
        $('.removeIf.openBag').removeClass('openBag').addClass('bagLink');
        $(".removeIf").attr("href", BaseURL + "/shopping_bag/ShoppingBag.aspx");
    } 
}
/** [END] Remove Shopping Bag Call   *****************************************************/
/** Open Pop-up   ************************************************************************/
function popup(url) {
    newwindow = window.open(url, 'name', 'height=485,width=556');
    if (window.focus) { newwindow.focus() }
    return false;
}
/** [END] Open Pop-up   ******************************************************************/



/* START - Liveclicker video */
function LiveclickerVideoTab(isQV) {
    var imageContainer = $(".tab").find(".image");
    var videoContainer = $(".tab").find(".video");
    var palyerBoxContainer = $("div.playerbox");

    if (isQV) {
        imageContainer = $(".quickview-container").find(".tab").find(".image");
        videoContainer = $(".quickview-container").find(".tab").find(".video");
        palyerBoxContainer = $(".quickview-container").find("div.playerbox");
    }

    imageContainer.click(function () {
        SelectAndDeselectTab(this, true, imageContainer, videoContainer);
    });

    $(videoContainer).click(function () {
        SelectAndDeselectTab(this, false, imageContainer, videoContainer);
    });

    palyerBoxContainer.each(function () {
        if ($(this).find('div.Liveclicker_video').length > 0 || $(this).find('iframe').length > 0) {
            $(this).show();
                }
    });
                }

function SelectAndDeselectTab(container, isImage, imageContainer, videoContainer) {
    var prodid = $(container).attr('class').split(' ')[2];
    var ProductImageClass = ".productimage_" + prodid;
    var PlayerboxClass = ".playerbox_" + prodid;
    if (isImage) {
        $(ProductImageClass).show();
        $(PlayerboxClass).hide();
        DeselectTab(prodid, videoContainer);
            }
    else {
        $(ProductImageClass).hide();
        $(PlayerboxClass).show();
        DeselectTab(prodid, imageContainer);
        }

    $(container).removeClass("tabdeselected");
    $(container).addClass("tabselected");
}

function DeselectTab(prodid, container) {
    container.each(function () {
        if (prodid == $(this).attr('class').split(' ')[2]) {
            $(this).removeClass("tabselected");
            $(this).addClass("tabdeselected");
        }
    });
}

function DisplayLiveClickerVideo(isQV) {
    LiveclickerVideoTab(isQV);

    var imageContainer = $(".tab").find(".image");
    var videoContainer = $(".tab").find(".video");

    if (isQV) {
        imageContainer = $(".quickview-container").find(".tab").find(".image");
        videoContainer = $(".quickview-container").find(".tab").find(".video");
}

    $(".tabscontainer").each(function () {
        var prodId = $(this).attr('class').split(' ')[1].split('_')[1];
        var liveclickerclass = ".playerbox_" + prodId;
        var productImageClass = ".productimage_" + prodId;
        var tabcontainerclass = ".tabscontainer_" + prodId;

        if ($(liveclickerclass).find(".Liveclicker_video").length > 0) {
            $(tabcontainerclass).show();
            if (typeof (showVideoTabFirst) == "undefined" || !showVideoTabFirst) { imageContainer.trigger('click'); }
        }
        else {
            $(productImageClass).show();
    }
    });
}
/* END - Liveclicker video */

/* START - Liveclicker-Omniture v0.2 */

var OMTRcustomEventTag = 'Customer/Liveclicker Player';
var currentPlayer;

var timer_set = 0;
var sentMessageStarted = 0;
var sentMessage10PercentCompletion = 0;
var sentMessage90PercentCompletion = 0;
var sentMessageFullCompletion = 0;
var whatsupcounter = 1;
var lengthInSeconds = 30; // default. this value is changed on player loaded 

function onLCPlayerLoaded(player) {
    currentPlayer = player;
    lengthInSeconds = currentPlayer.getSettings().totalTime; // resets the proper play time 
}

function openMovie(productID, videoName, lengthInSeconds) {
    // alert('Sending "video open" message to Omniture, video name: ' + videoName + ' - length: ' + lengthInSeconds + ' - Event tag: ' + OMTRcustomEventTag);
    s.products = ";" + productID;
    s.Media.open(videoName, lengthInSeconds, OMTRcustomEventTag);
    s.Media.play(videoName, 0);
}

function endMovie(productID, videoName, lengthInSeconds) {
    // alert('Sending "video ended" message to Omniture');
    s.products = ";" + productID;
    s.Media.stop(videoName, lengthInSeconds);
    s.Media.close(videoName);
}

function update_timer() {
    var time;
    var timeinvideo;
    var videoLength = lengthInSeconds;
    try {
        time = Number(currentPlayer.getSettings().playTime);
    }
    catch (e) {
    }

    if ((time != undefined) && (time > 0) && (videoLength > 0)) {
        var percentComplete = time / videoLength;
        if (sentMessageStarted == 0) {
            sentMessageStarted = 1;
            openMovie(productID, videoName, videoLength);
        }
        if ((sentMessageFullCompletion == 0) && ((percentComplete) > 0.98)) {
            endMovie(productID, videoName, videoLength);
            sentMessageFullCompletion = 1;
        }
    }
}

setTimeout(function () { window.setInterval('update_timer()', 500); }, 1000);

/* END - Liveclicker-Omniture v0.2 */


/* Certona QuickView button behaviors */
function CertonaQuickView(element, url) {
    $(element).css('background-position', '0px -25px'); // 'loading' indicator
    QuickViewFlag = 1; // for \Controls\Product\AltImageStrip.ascx
    var quickview = new quickview_ui_behaviour('.productlink');
    quickview.LoadQuickView(url);
}
/* end Certona QuickView button behaviors */

/* START - PLP image display in PDP and Checkout pages  */

function GetSelectedImageStyle() {
    $(".frontview").load(function () {
        GetImageStyle(this);
    });

    $(".frontview").each(function () {
        GetImageStyle(this);
    });
}

function GetImageStyle(val) {
    var productSelector = $(val).parent();
    var imageSelector = $(val);
    var oldstyleNo = imageSelector.attr("styleno");
    var productUrl = productSelector.attr("href");
    var imageUrl = imageSelector.attr("src");
    var imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.indexOf('?'));
    var productDetailTitle = $(val).parent().parent().find(".product-details > .product-link > a");

    var imageSlice = imageName.split(".")[0].split("_");
    if (imageSlice[2] != "mm" && imageSlice[2] != "mo") {
        var styleNo = imageSlice[3];
        if (styleNo != undefined) {
            if (oldstyleNo == undefined) {
                productUrl = productUrl + "&StyleNo=" + styleNo;
                productSelector.attr("href", productUrl);
                imageSelector.attr("styleno", styleNo);
                productDetailTitle.attr("href", productUrl);
            }
            else if (styleNo != oldstyleNo) {
                productSelector.attr("href", productUrl.replace(oldstyleNo, styleNo));
                imageSelector.attr("styleno", styleNo);
                productDetailTitle.attr("href", productUrl.replace(oldstyleNo, styleNo));
            }
        }
    }
}


function getQuerystring(key, url) {
    key = key.toLowerCase().replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key.toLowerCase() + "=([^&#]*)");
    var qs = url != undefined ? regex.exec(url.toLowerCase()) : null;
    if (qs == null)
        return undefined;
    else
        return qs[1];
}

function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.toLowerCase().split('?');
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter.toLowerCase()) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        url = urlparts[0] + '?' + pars.join('&');
        return url;
    } else {
        return url;
    }
}

function OmnitureForAJAX(obj) {
    var s = s_gi(s_account);
    if (obj && obj.length > 0) {
        //reset old values
        if (typeof obj[0].IsReset != 'undefined' && obj[0].IsReset) {
            $(obj[0].ResetOmnitureViewModel).each(function (index, data) {
                s[data.Name] = "";
            });
        }
        $(obj).each(function (index, data) {
            if (data.Name != "") {
                s[data.Name] = data.Value;
            }
        });
    }

    //s.tl(true, 'o', 'spc-checkout');
    var s_code = s.t(); if (s_code) document.write(s_code);
}

function updateQuerystring(key, val, url) {
    if (typeof url == 'undefined') {
        url = document.URL
    }
    //Remove hash tag from url
    if (url.indexOf('#') > 0) {
        url = url.substring(0, url.indexOf('#'));
    }
    newAdditionalURL = "";
    tempArray = url.split("?");
    baseURL = tempArray[0];
    aditionalURL = tempArray[1];
    temp = "";
    if (aditionalURL) {
        var tempArray = aditionalURL.split("&");
        for (var i in tempArray) {
            if (tempArray[i].indexOf(key) == -1) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }
    var rows_txt = temp + key + "=" + val;
    var finalURL = baseURL + "?" + newAdditionalURL + rows_txt;
    return finalURL;
}

/* END - PLP image display in PDP and Checkout pages */

/** Account + Help Menu Setup ************************************************************/
function SelectCurrentMenuItem(id) {
    // Set Selected Menu Item's Class Name
    $(id).addClass('selected');
}

function GetCookieCustomerID() {
    if (GetSubCookieValue('User', 'Indy.CustomerId') != null)
        return decode(GetSubCookieValue('User', 'Indy.CustomerId'));
}

function removeHtmlTagFromString(data) {
    return data == null || typeof (data) == "undefined" ? "" : data.toString().replace(/(<html.*?>|<\/html.*?>)/ig, "");
}

function removeScriptTagFromString(data) {
    return data.replace(/(<script.*?>|<\/script.*?>)/ig, "");
}

function removeNoScriptTagFromString(data) {
    return data.replace("<noscript><img", "").replace('src = \"//redcatsusabrylanedev.122.2O7.net/b/ss/redcatsusabrylanedev/1/H.1--NS/0"', "").replace('height=\"1\" width=\"1\" border=\"0\" alt="" /></noscript>', "");
}

function replceString(data) {
    return data.replace(/<!--/g, "/*").replace(/-->/g, "*/");
}

//Omniture implementation
function OmnitureScript(res) {
    var omnitureObjScript = document.createElement("script");
    omnitureObjScript.type = "text/javascript";
    omnitureObjScript.text = replceString(removeScriptTagFromString(removeNoScriptTagFromString(removeHtmlTagFromString(res))));
    ClearProductTrackInfo();
    document.body.appendChild(omnitureObjScript);

}

function ClearProductTrackInfo() {
    var s = s_gi(s_account);
    s.products = '';
}


//Omniture implementation
function QVAddToBasketOmnitureScript(res) {
    var omnitureObjScript = document.createElement("script");
    omnitureObjScript.type = "text/javascript";
    omnitureObjScript.text = replceString(removeScriptTagFromString(removeNoScriptTagFromString(removeHtmlTagFromString(res))));
    ClearSplitOmnitureInfo();
    document.body.appendChild(omnitureObjScript);

}

// To Clear SplitOmniture Information variables for QV AddtoBasket and QA Big and tall Links
function ClearSplitOmnitureInfo() {
    var s = s_gi(s_account);
    s.eVar69 = '';
    s.prop69 = '';    
}

function TrackOmnitureForLiveChat() {
    var s = s_gi(s_account);
    s.linkTrackVars = 'events';
    s.events = 'event27';
    s.linkTrackEvents = s.events;

    s.tl(true, 'o', 'live-chat');
    s.events = "";
}

function getQueryValue(strSource, strParam) {
    var urlVar = strSource.split('&');
    for (var i = 0; i < urlVar.length; i++) {
        var paramName = urlVar[i].split('=');
        if (paramName[0] == strParam) {
            return paramName[1];
        }
    }
}

function decode64(s) {
    var e = {}, i, k, v = [], r = '', w = String.fromCharCode;
    var n = [[65, 91], [97, 123], [48, 58], [43, 44], [47, 48]];

    for (z in n) { for (i = n[z][0]; i < n[z][1]; i++) { v.push(w(i)); } }
    for (i = 0; i < 64; i++) { e[v[i]] = i; }

    for (i = 0; i < s.length; i += 72) {
        var b = 0, c, x, l = 0, o = s.substring(i, i + 72);
        for (x = 0; x < o.length; x++) {
            c = e[o.charAt(x)]; b = (b << 6) + c; l += 6;
            while (l >= 8) { r += w((b >>> (l -= 8)) % 256); }
        }
    }
    return r;
}

// For Certona.
function getQueryValue(strSource, strParam) {
    var urlVar = strSource.split('&');
    for (var i = 0; i < urlVar.length; i++) {
        var paramName = urlVar[i].split('=');
        if (paramName[0] == strParam) {
            return paramName[1];
        }
    }
}

function decode64(s) {
    var r = '';
    if (typeof (s) != "undefined") {
        var e = {}, i, k, v = [], w = String.fromCharCode;
        var n = [[65, 91], [97, 123], [48, 58], [43, 44], [47, 48]];

        for (z in n) { for (i = n[z][0]; i < n[z][1]; i++) { v.push(w(i)); } }
        for (i = 0; i < 64; i++) { e[v[i]] = i; }

        for (i = 0; i < s.length; i += 72) {
            var b = 0, c, x, l = 0, o = s.substring(i, i + 72);
            for (x = 0; x < o.length; x++) {
                c = e[o.charAt(x)]; b = (b << 6) + c; l += 6;
                while (l >= 8) { r += w((b >>> (l -= 8)) % 256); }
            }
        }
    }
    return r;
}

function getCookieMasterId() {
    var userCookie = readCookie("User");
    var masterId = '';
    if (userCookie != null)
        masterId = decode64(getQueryValue(userCookie, "Indy.MasterId")).replace(/\D/g, '');
    return masterId;
}

// utility function to get a querystring value by name

function getQueryStringValue(paramName) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == paramName) {
            return decodeURIComponent(pair[1]);
        }
    }
}

/************************************************* START :: Certona Recommendation ******************************************/

// Get restful serviceURL to get product info from service.
function getProductRestUrl() {
    var productRestfulURL = 'http';

    productRestfulURL += "://";
    productRestfulURL += location.hostname;
    productRestfulURL += (location.port == "" ? "" : ':' + location.port);
    productRestfulURL += productRestUrl;
    return productRestfulURL;
}

// Ajax call back method to call restful service.
function ajaxCall(url, dataRequest, callBack) {
    $.ajax({
        url: url,
        async: true,
        dataType: 'json',
        type: "POST",
        data: dataRequest,
        contentType: 'application/json; charset=utf-8',
        cache: false,
        success: function (data, status, xhr) {
            return callBack(data);
        },
        error: function (xhr, status, errorThrown) {
            return;
        }
    });
}

// To process the certona response and call the restful service.
function processCertonaResponse(response) {
    var scheme = response.resonance.schemes[0].scheme;
    var display = response.resonance.schemes[0].display;
    var items = response.resonance.schemes[0].items;

    if (display == "yes") {
        var prodRequestObj = [];

        var pType, catHierarchy;
        if (typeof pagetype != "undefined" && pagetype != null && pagetype != '') {
            pType = pagetype;
        }

        if (typeof categoryhierarchy != "undefined" && categoryhierarchy != null && categoryhierarchy != '') {
            catHierarchy = categoryhierarchy;
        }

        var recommendationRequest;

        // Crosssell products
        if (typeof crosssellproducts != "undefined" && crosssellproducts != null && crosssellproducts != '') {
            var crossSellProdObj = crosssellproducts.split("|");

            $.each(crossSellProdObj, function (key, value) {
                var prodObj = value.split("~");
                prodRequestObj.push({ productid: prodObj[0], producttype: prodObj[1], deptid: prodObj[2], rec: 'crosssell' });
            });
        }

        // Certona response products
        $.each(items, function (key, val) {
            prodRequestObj.push({ productid: val.id, producttype: val.producttypeid, deptid: val.deptid, rec: 'certona' });
        });

        recommendationRequest = { requestedproductinfo: prodRequestObj };
        recommendationRequest.pagetype = pType;
        recommendationRequest.categoryhierarchy = catHierarchy;

        ajaxCall(getProductRestUrl(), JSON.stringify(recommendationRequest), productCallBack);
    }
}


// Call back method for product restful service call.
function productCallBack(productJsonResponse) {
    productJsonResponse = { "products": productJsonResponse };

    (function ($) {
        /*
         * Use jQuery document ready to ensure DOM is ready before rendering, because cross-sell 
         * and Handlebars template DOM elements could be anywhere on the page.
         *
         * Use typeof check to make sure OSPGROUP global object exists before trying to execute.
         * Use typeof check to make sure configureProductRecommendations() function is defined before trying to render
         * in cases where there is no Certona content zone in CHM.
         */
        $(document).ready(function () {
            $.getScript("/Scripts/jQuery/jquery.TemplateRenderer.min.js", function () {
                if ((typeof OSPGROUP != "undefined") && (typeof OSPGROUP.productRecommendations != "undefined")) {
                    OSPGROUP.productRecommendations.setData(productJsonResponse);

                    /* 
                     * There are two parts to executing the Handlebars template renderer.
                     * 
                     * 1) configureProductRecommendations() is a function set by the Chameleon user in Chameleon.
                     * 
                     * In that function, the Chameleon user tells the template renderer plugin where the Handlebars template is
                     * and where on the page to attach the compiled HTML.  Because this is a function declaration in a Chameleon zone,
                     * even if OSPGROUP.productRecommendations is not defined as an object yet, the browser will not throw an error at this point.
                     * JavaScript only checks for errors when the function is executed.
                     * 
                     * 2) render() is the function to call to render the Handlebars template into HTML.
                     * 
                     * Because render() will not work without a valid configuration, configureProductRecommendations() is checked
                     * to make sure it exists as a function before trying to run it.  It is still possible for configureProductRecommendations()
                     * to contain junk or bad code, but at least this block of code ensures that render() is not run before its configuration function
                     * is run.
                     */
                    if (typeof configureProductRecommendations === "function") {
                        configureProductRecommendations();
                        OSPGROUP.productRecommendations.render();
                    }
                } else {
                    console.log("OSPGROUP global object is not defined or configureProductRecommendations() is not defined.");
                }
            });
        });
    })(jQuery);
}

/************************************************* END   :: Certona Recommendation ******************************************/

//Begin: Tracking of last selected sku status
var g_lastAvailabilityStatus = "";

function onPDPUnload() {
    var action = s.pageName;

    if (action.toLowerCase().indexOf("edit item") == -1) {
        if (typeof g_lastAvailabilityStatus != 'undefined') {
            if (g_lastAvailabilityStatus.length > 0) {
                TrackOmnitureForLastSkuSelection("event20", g_lastAvailabilityStatus);
                //console.log('tracking' + g_lastAvailabilityStatus);
                g_lastAvailabilityStatus = "";
            }
        }
    }
}

function TrackOmnitureForLastSkuSelection(events, eVar28) {
    var s = s_gi(s_account);
    s.linkTrackVars = 'channel,server,events,eVar28';
    s.eVar28 = eVar28;
    s.events = events;
    s.linkTrackEvents = s.events;

    s.tl(true, 'o', 'item-message-status');

    s.linkTrackVars = "";
    s.linkTrackEvents = "";
    s.events = "";
}
//End: Tracking of last selected sku status