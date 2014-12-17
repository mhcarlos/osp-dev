$(document).ready(function () {
    var likecount = 0;
    var pfid = getQuerystring('PfId', window.location.href);
    var typeid = getQuerystring('ProductTypeId', window.location.href);

    var ajaxurl = "/Product/FacebookLikeCount.aspx?PfId=" + pfid + "&ProductTypeId=" + typeid + "&CatalogItemNumber=" + productid;

    var handleCreateResponse = function () {
        handleResponse('true');
        try { SetGAForFacebookLike(); }
        catch (e) { }
    }
    var handleRemoveResponse = function () {
        handleResponse('false');
    }

    var handleResponse = function (isFBLike) {
        var pdpurl = $("meta[property='og:url']").attr("content");
        var query = 'http://api.facebook.com/restserver.php?method=links.getStats&urls=' + encodeURIComponent(pdpurl);

        jQuery.ajax({
            url: query,
            type: 'GET',
            timeout: 5000,
            //crossDomain: true,
            dataType: 'xml',
            success: function (res) {
                if (typeof (res) == "object") {
                    $(res).each(function () {
                        likecount = $(this).find('total_count').text()
                        SetLikeCount(ajaxurl + '&LikeCount=' + likecount + '&IsFBLike=' + isFBLike);
                    });
                }
                else { return; }
            },
            error: function (jqXHR, textStatus, errorThrown) { return; }
        });
    }

    if (typeof (FB) != "undefined") {
        FB.Event.subscribe('edge.create', handleCreateResponse);
        FB.Event.subscribe('edge.remove', handleRemoveResponse);
    }
});

function SetLikeCount(query) {
    jQuery.ajax({
        url: query,
        type: 'GET',
        timeout: 5000,
        //crossDomain: true,
        dataType: 'html',
        success: function (res) {
            var omnitureObjScript = document.createElement("script");
            omnitureObjScript.type = "text/javascript";
            omnitureObjScript.text = replceString(removeScriptTagFromString(removeNoScriptTagFromString(removeHtmlTagFromString(res))));
            document.body.appendChild(omnitureObjScript);
        },
        error: function (jqXHR, textStatus, errorThrown) { return; }
    });
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
    return data.replace(/\<!--/g, "/*").replace(/--\>/g, "*/");
}