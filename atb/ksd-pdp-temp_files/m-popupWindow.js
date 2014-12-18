/* modules / popupWindow
*
* Displays content in a container overlaying a portion of the current page.
*
*/

// object definition

var popupSet = [];

function Popup(targetWindow) {

    this.targetWindow = targetWindow;

    this.targetBG = targetWindow.next('.m-popupWindow-bg');

    //@todo: possibly use isOKtoLoad flag to make popup conditional on success, instead of re-calling togglePopup in every script. It's an issue of scope.
    this.isOKtoLoad = false;

    this.isEnabled = false;

    this.togglePopup = function () {

        if (this.isEnabled) {

            this.targetWindow.hide();
            this.targetBG.hide();
            this.isEnabled = false;
        }

        else {

            // set centering in window first

            var windowWidth = document.documentElement.clientWidth;
            var windowHeight = document.documentElement.clientHeight;
            var popupHeight = this.targetWindow.height();
            var popupWidth = this.targetWindow.width();
            this.targetWindow.css({
                "top": function (index, value) {
                    var calculatedTopPos = windowHeight / 2 - popupHeight / 2 + $(window).scrollTop();
                    // check if it's a negative number - don't want the popup to appear off screen
                    if (calculatedTopPos >= 0) {
                        return calculatedTopPos + "px"
                    }
                    else {
                        // default value set in CSS will be used
                    }
                },
                "left": windowWidth / 2 - popupWidth / 2 + $(window).scrollLeft() + "px"
            });

            // then show

            this.targetWindow.fadeIn("fast");
            this.targetBG.show();
            this.isEnabled = true;
        }
    }
}

$(document).ready(function () {

    // event handlers
    $(".m-popupWindow-trigger").on("click", createPopup);

});

function createPopup(event) {

    event.preventDefault();

    // get data attr that tells us which popup to create
    var targetWindowSelector = $(this).attr('data-popupWindowTarget');

    // see if the popup object for it has already been created
    if (popupSet[targetWindowSelector] == null || popupSet[targetWindowSelector] == undefined) {

        // creates new popup object, turns data attr string into jQ object. Note how the selector must be a class selector
        popupSet[targetWindowSelector] = new Popup($('.' + targetWindowSelector));

        // set closing functionality - make sure it will only close this particular popup
        popupSet[targetWindowSelector].targetWindow.find('.m-closeButton').on('click', function (event) {

            event.preventDefault();
            popupSet[targetWindowSelector].togglePopup();

        });

        popupSet[targetWindowSelector].targetBG.on('click', function () {

            popupSet[targetWindowSelector].togglePopup();

        });

        /* note that since we don't always want to immediately show the popup, certain conditions may have to be met first, togglePopup isn't being called right now
        Add a line like this in your m-myParticularModule.js, at whichever point you want to toggle on, that looks like this:

        popupSet['m-myParticularModule'].togglePopup();

        */
    }
}
