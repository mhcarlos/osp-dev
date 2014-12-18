/* modules / addToBagConfirmation
*
* Displays confirmation and info about the item you just added to your shopping cart/basket/bag. Works in conjuction with modules / popupWindow.
*
*/

var confirmationSelector = $('.m-addToBagConfirmation');

$(document).ready(function () {

    $('.m-closeButton, p-cta--affirmative, .m-popupWindow-bg').on('click', function (event) {
            eRefreshOnBagPage();
    });

    // this button also acts as a close button
    $('.p-cta', confirmationSelector).on('click', function (event) {

        event.preventDefault();
        eRefreshOnBagPage();
        popupSet['m-addToBagConfirmation'].togglePopup();
    });

    function eRefreshOnBagPage() {
        //If we are on the shopping bag page we want to reload when adding a product
        if (window.location.href.toLowerCase().indexOf("emptyshoppingbag.aspx") > -1) { 
            window.location.href = "/Shopping_bag/ShoppingBag.aspx";
        }
        else if (window.location.href.toLowerCase().indexOf("shoppingbag.aspx") > -1) {
            window.location.href = window.location;
        }

    }

});
