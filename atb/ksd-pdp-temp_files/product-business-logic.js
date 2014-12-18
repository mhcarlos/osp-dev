
var Product = Product || {};
Product.Helpers = {};
Product.ViewModel = ''; //Holds the current state of the Single Checkout.
Product.debug = false;

// data to pass to server
//var productInfo = {
//    ProductId: "431306",
//    CategoryId: "26528",
//    ProductTypeId: "1",
//    SKU: [{
//        ProductId: "182359",
//        CategoryId: "19820",
//        ProductTypeId: "1",
//        QuickOrderNumber: "",
//        BlueBoxNumber: "",
//        Token: "",
//        Color: "dark wine",
//        Size: "1X",
//        Quantity: 1,
//        SizeValue: "05060877|1X||1005|1X|DARK WINE|$39.99|B|A||$39.99"
//    },
//    {
//        ProductId: "237906",
//        CategoryId: "26511",
//        ProductTypeId: "1",
//        QuickOrderNumber: "",
//        BlueBoxNumber: "",
//        Token: "",
//        Color: "sky blue",
//        Size: "M",
//        Quantity: 1,
//        SizeValue: "05260665|M||1154|M|SKY BLUE|$14.99|B|B|2|$19.99"
//    }]
//}


// -----------------------------------------------------------------------
// Add to basket
Product.AddToBasket = function (productInfo, completeCallback) {
    //Prepare input data
    var ajaxInput = {
        InputData: JSON.stringify(productInfo)
    };

    //prepare beforesend callback
    var beforeSendCallback = function (xhr) {
        if (Product.debug) Product.Helpers.WriteToLog(ajaxInput);
    };

    Product.DoAjaxPost("ATB", ajaxInput, beforeSendCallback, completeCallback);
}



// -----------------------------------------------------------------------
// AJAX FUNCTIONS

Product.ErrorInAjaxCall = function (ajaxResponse) {

    if (Product.debug) {
        Product.Helpers.WriteToLog("Error in Ajax Callback");
        Product.Helpers.WriteToLog($.parseJSON(ajaxResponse.responseText));
    }
    var model = Product.ViewModel();
    var error = new Product.Error();
    error.ErrorMessage("Error in Ajax Callback");
    error.ErrorCode(-99999);
    model.Errors.push(error);

    return model;
}

Product.DoAjaxPost = function (action, ajaxdata, beforeSendCallback, completeCallback) {
    $.ajax({
        type: 'POST',
        url: '/product/processproduct.ashx?Action=' + action,
        async: false, //Make synchronous calls
        data: ajaxdata,
        beforeSend: function (xhr) {
            $('#msg-summary').empty();
            //Start showing Ajax Call is in progress.
            $('.ajaxprogress').show();

            //Check if beforesendCallback is defined.
            if (beforeSendCallback)
                return beforeSendCallback(xhr);
        },
        complete: function (xhr, textStatus) {

            //Hide Ajax Call in progress
            $('.ajaxprogress').hide();

            //Check if completeCallback is defined
            if (completeCallback) {
                var model;
                if (xhr.status == 200 && xhr.statusText == 'OK') {
                    if (xhr.responseText.toLowerCase() == "session expired") {
                        window.location.href = window.location.href;
                    }
                    else {
                        Product.ViewModel = $.parseJSON(xhr.responseText);
                    }
                }
                else
                    Product.ViewModel = Product.ErrorInAjaxCall(xhr);

                if (Product.debug) Product.Helpers.WriteToLog(Product.ViewModel);

                completeCallback(Product.ViewModel);
            }
        }
    });
}

// -----------------------------------------------------------------------
// HELPER: LOG FUNCTION
// -----------------------------------------------------------------------
Product.Helpers.WriteToLog = function (message) {
    if (!(navigator.appName == 'Microsoft Internet Explorer')) {
        if (SPC.debug) console.log(message);
    }
}
