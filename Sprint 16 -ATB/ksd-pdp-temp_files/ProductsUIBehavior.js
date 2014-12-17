/**** Start: PDP UI Behaviour *********************************************************/
// Please note that all jQuery selectors in the construcor should be relative to the parentContainerSelector


function pdp_ui_behaviour(parentContainerSelector, mainImageSelector, sizedropdownSelector, priceLabelSelector, selectedIndicator, swatchSelector, colorNameSelector,
                                    availabilityLabelSelector, swatchAttributeKeyName, swatchToolTip, hidSizevalue, swatchErrorMessage, imageUnavailability, itemSelect,
                                    pricefromSelector, priceSelector, wasPriceSelector, atbSelector, quantitySelector, toolTipSelector, pageType) {

    var initialValueHash = new Object();
    var selectedValueHash = new Object();
    var sizeSpecificPricingStory = new Object();
    var colorName;
    var size;
    var price;
    var weekStart;
    var weekEnd;
    var availabilityPeriodSelector = "availabilityPeriod";
    var errorSelector = ".wrapErrorB";
    var isClearance = false;
    // override global setting for testing
    //isTouchDevice = true;

    window.onbeforeunload = function () {
        onPDPUnload();
        //return false;
    };

    this.SetBehaviour = function () {
        StoreInitialValuesNeededForReset();
        SetEventsAndHandlers();
        preSelectSkuIfNeeded();
        setSwatchByDefault();
    }

    function StoreInitialValuesNeededForReset() {
        jQuery(parentContainerSelector).find(mainImageSelector).each(function (index, element) {
            initialValueHash[mainImageSelector + index] = jQuery(element).attr("src");
        });
        jQuery(priceLabelSelector).each(function (index, element) {
            initialValueHash[priceLabelSelector + index] = jQuery(element).html();
            if (initialValueHash[priceLabelSelector + index].toLowerCase().indexOf('clearance') != -1) { isClearance = true; }
        });
    }

    function SetEventsAndHandlers() {
        jQuery(parentContainerSelector).find(sizedropdownSelector).bind('change', sizeChange);
        jQuery(parentContainerSelector).find(sizedropdownSelector).bind('keyup', sizeChange);
        jQuery(parentContainerSelector).find(quantitySelector).change(function () { AddToBasketButton(this); ShowPriceOnATBButton(this); });
        jQuery(parentContainerSelector).find(quantitySelector).bind('keyup', function () { AddToBasketButton(this); ShowPriceOnATBButton(this); });
        jQuery(parentContainerSelector).find(swatchSelector).mouseup(function () { AddToBasketButton(this); });

        var atbButtonSelector = pageType == "Product detail" || pageType == "quickview" ? $(parentContainerSelector).find(atbSelector) : $(atbSelector);
        atbButtonSelector.click(function (event) {
            event.preventDefault();
            if (!$(this).hasClass('disabled') && !$(this).hasClass('atb-old') && !$(this).hasClass('atb-old-pdp')) {
                AddToBasket(this);
            }
        }).hover(function () {
            if ($(this).hasClass('disabled')) { InfoTooltip(this); }
        }, function () {
            jQuery('div.info-tooltip').remove();
        });

        if (jQuery('span.subtotal-amount').length) { jQuery('select.quantity').bind('change', showOutfitSubTotal); }
        if (jQuery('span.subtotal-amount').length) { jQuery('select.quantity').bind('keyup', showOutfitSubTotal); }

        $('a.zoomLink').mouseover(function () {
            var parentContainer = getParentContainer(this);
            setImageUnavailableMsg(parentContainer);
        });
        $('a.zoomLink').mouseout(function () {
            var parentContainer = getParentContainer(this);
            var index = getParentContainerIndex(parentContainer);
            setImageUnavailableMsg(parentContainer, index);
        });
    }

    function preSelectSkuIfNeeded() {
        if (jQuery(sizedropdownSelector + ' option').length == 2) {
            jQuery(sizedropdownSelector).prop("selectedIndex", 1);
        }
        jQuery(parentContainerSelector).find(sizedropdownSelector).change();
        var parentContainer = jQuery(parentContainerSelector);
        parentContainer.find(hidSizevalue).each(function (index, element) {
            if (jQuery(element).val() != "0" && jQuery(element).val() != "") {
                var skuDetail = parseSkuDetails(jQuery(element).val());
                if (skuDetail != null && skuDetail.length > 0) {
                    var swatchKey = skuDetail[0][swatchAttributeKeyName];
                    parentContainer.find(swatchSelector + "[" + swatchAttributeKeyName + "='" + swatchKey + "']").trigger('click');
                }
            }
        });
    }

    function HideErrorMessageOnQuickView() {
        $('div.description-column div.error_out').hide();
    }

    function sizeChange(eventData) {
        var currentSizeControl = jQuery(this);
        var parentContainer = currentSizeControl.parents(parentContainerSelector);
        var index = getParentContainerIndex(parentContainer);
        var currentColor = "";
        var currentAvailability = "";
        var currentSku = "";

        parentContainer.find(swatchErrorMessage).html("");

        //Hack: To distinguish the caller. It can be either from preSelectSkuIfNeeded() or the real size change event.
        //      Below condition will be true for the real size change event.
        if (eventData != undefined && eventData.hasOwnProperty('originalEvent')) {
            parentContainer.find(hidSizevalue).val('0');
        }

        // remove any active swatch tooltip if the user is using a touch device
        if (isTouchDevice) {
            $('.e-swatchTooltip').remove();
        }

        // populate swatches with custom attributes such as price, availability, availabilityperiod and also show unavailable swatch images.
        // Also bind events to swatch of whether to show backorder/unavailable tooltip or to change the main image on mouseover/mouseout/click.
        if (jQuery(currentSizeControl).prop('selectedIndex') == 0) {
            resetSwatchAttributesAndPricing(parentContainer, index);
            if (selectedValueHash != null && typeof (selectedValueHash[colorNameSelector + index]) != 'undefined') {
                currentColor = selectedValueHash[colorNameSelector + index];
                findAndClickSwatchByColorName(parentContainer, currentColor);
            }
			sizeSpecificPricingStory = null;
        }
        else {
            var currentSelectedSku = parseSkuDetails(currentSizeControl.val())
            attachSwatchCustomEventsAndClass(parentContainer, currentSelectedSku);
            parentContainer.find(itemSelect).val('true');

            if (selectedValueHash != null && typeof (selectedValueHash[colorNameSelector + index]) != 'undefined') {
                if (currentSelectedSku.length > 0) {
                    currentColor = selectedValueHash[colorNameSelector + index];
                    currentAvailability = selectedValueHash[availabilityLabelSelector + index];

                    var bDisplayOutOfStockMessage = true;

                    for (var i = 0; i < currentSelectedSku.length; i++) {
                        if (currentColor.toLowerCase() == currentSelectedSku[i].colorName.toLowerCase()) {
                            currentSku = currentSelectedSku[i];
                            currentAvailability = currentSku.availability;
                            bDisplayOutOfStockMessage = currentAvailability != "U" ? false : true;
                            weekStart = parseInt(currentSku.availabilityPeriod);
                            weekEnd = weekStart + 1;
                        }
                    }

                    // update availability message

                    if (bDisplayOutOfStockMessage) {
                        // update selected value has to reflect that the product is out of stock
                        selectedValueHash[availabilityLabelSelector + index] = 'U';
                        // TODO: uncomment the following line if we decide to show the error message
                        //parentContainer.find(swatchErrorMessage).html(currentColor + ' is <b>Out of Stock</b> in ' + currentSelectedSku[0].displaySize + ' ' + 'Select another color or try another size.');
                        parentContainer.find(hidSizevalue).val('0');
                        parentContainer.find(availabilityLabelSelector).html("");
                        parentContainer.find(selectedIndicator).css('border-color', '#fff');
                        updatePricingLabels(parentContainer, index, '', '');
                        parentContainer.find(colorNameSelector).html('');
                        //parentContainer.find(availabilityLabelSelector).html(getAvailabilityText('U', '', ''));
                        // tooltip fading stuff

                        var currentSwatchControl = $(parentContainer.find(swatchSelector + "[colorName='" + currentColor + "']"));
                        displayTooltipAndFade(currentSwatchControl);
                    }
                    else {
                        findAndClickSwatchByColorName(parentContainer, currentColor);
                    }
                }
            }
            else {
	            setSwatchByDefault();
	            sizeSpecificPricingStory = getSizeSpecificPricingStory(parentContainer, parseSkuDetails(currentSizeControl.val()));
	
	            if (parentContainer.find(hidSizevalue).val() == "" || parentContainer.find(hidSizevalue).val() == "0") {
	                showSizeSpecificPricingStory(parentContainer);
	
	            }
			}
        }

        setZoomImage(parentContainer);
        showOutfitSubTotal();
        ShowPriceOnATBButton(this);
        AddToBasketButton(this);
        HideErrorMessageOnQuickView();
    }

    function displayTooltipAndFade(currentSwatchControl) {
        colorName = currentSwatchControl.attr('colorName');
        size = currentSwatchControl.attr('size');
        showToolTip(currentSwatchControl, 'large', '<span class="e-swatchTooltip-unavailable">OUT OF STOCK</span><span class="e-swatchTooltip-size">' + size + ' in ' + colorName + '</span>');
        $('.e-swatchTooltip').delay(2000).animate({
            opacity: 0
        }, 1000, function () {
            $(this).remove();
        });
    }

    function setSwatchByDefault() {
        if (jQuery(parentContainerSelector).find(swatchSelector).length == 1) {
            //jQuery(parentContainerSelector).find(swatchSelector).trigger('mouseover');
            jQuery(parentContainerSelector).find(swatchSelector).trigger('click');
        }
        var styleNo = getQuerystring('StyleNo', window.location.href) != undefined ? getQuerystring('StyleNo', window.location.href) : getQuerystring('StyleNo', $('.quickview-container').attr('url'));
        if (styleNo != undefined) {
            jQuery(parentContainerSelector).find(swatchSelector).each(function (index, element) {
                var imageUrl = jQuery(this).attr('mainImageUrl');
                var mcStyleNo = imageUrl.substring(imageUrl.lastIndexOf('.') - 4, imageUrl.lastIndexOf('.'));
                if (mcStyleNo === styleNo) {
                    // do not trigger mouseover for a default selection
                    //$(this).trigger('mouseover');
                    $(this).bind('click', swatchOnClick);
                    $(this).trigger('click');
                }
            });
        }
    }

    function attachSwatchCustomEventsAndClass(parentContainer, lstSkuDetails) {
        parentContainer.find(swatchSelector).each(function (index, element) {
            element = jQuery(element);
            swatchAttributeKey = element.attr(swatchAttributeKeyName);

            var skuDetail = getSkuDetailBySwatchAttributeKey(swatchAttributeKey, lstSkuDetails);
            if (skuDetail != null && skuDetail.availability != 'U' && skuDetail.availability != '') {
                if (skuDetail.availability == 'A' || skuDetail.availability == 'B') {
                    element.unbind('click');
                    element.removeClass('unavailable');
                    element.attr('availability', skuDetail.availability);
                    element.attr('availabilityPeriod', skuDetail.availabilityPeriod);
                    element.attr('price', skuDetail.price);
                    element.attr('wasprice', skuDetail.wasPrice);
                    element.attr('colorname', skuDetail.colorName);
                    element.attr('size', skuDetail.displaySize);
                    element.bind('click', swatchOnClick);
                    if (!isTouchDevice) {
                        element.unbind('mouseover');
                        element.unbind('mouseout');
                        element.bind('mouseover', swatchMouseOverWhenAvailable);
                        element.bind('mouseout', swatchMouseOutWhenAvailable);
                    }
                }
            }
            else if (skuDetail == null || skuDetail.availability == 'U' || skuDetail.availability == '') {
                element.attr('availability', 'U');
                element.attr('size', $(".size option::selected", parentContainer).text());
                element.attr('availabilityPeriod', '');
                element.attr('price', '');
                element.attr('wasprice', '');
                element.addClass('unavailable');
                element.unbind('click');
                element.bind('click', swatchOnClick);
                if (!isTouchDevice) {
                    element.unbind('mouseover');
                    element.unbind('mouseout');
                    element.bind('mouseover', swatchMouseOverWhenUnavailable);
                    element.bind('mouseout', swatchMouseOutWhenUnavailable);
                }
            }
        });
    }

    // determine min "wasprice" max "wasprice" min price, maxprice as well as the maximum percentage savings for a specific size
    // to be used when a size is selected but a specific sku is not selected
    function getSizeSpecificPricingStory(parentContainer, lstSkuDetails) {
        var sizeSpecificPricingStory = new Object();

        var minWas = 100000;
        var maxWas = 0;
        var minNow = 100000;
        var maxNow = 0;
        var maxPercent = 0;
        var minPercent = 100;
        var bHasAvailableOrBackOrderedSku = false;

        parentContainer.find(swatchSelector).each(function (index, element) {
            element = jQuery(element);
            swatchAttributeKey = element.attr(swatchAttributeKeyName);
            var skuDetail = getSkuDetailBySwatchAttributeKey(swatchAttributeKey, lstSkuDetails);
            if (skuDetail != null) {                
				if (skuDetail.availability == "A" || skuDetail.availability == "B") {
                    var floatWas = parseFloat(skuDetail.wasPrice.replace("$", ""));
                    var floatNow = parseFloat(skuDetail.price.replace("$", ""));
                    var percentage = Math.floor((((floatWas - floatNow)) / floatWas) * 100);

                    if (floatWas < minWas) {
                        minWas = floatWas;
                    }

                    if (floatWas >= maxWas) {
                        maxWas = floatWas;
                    }

                    if (floatNow < minNow) {
                        minNow = floatNow;
                    }

                    if (floatNow >= maxNow) {
                        maxNow = floatNow;
                    }

                    if (percentage >= maxPercent) {
                        maxPercent = percentage;
                    }

                    if (percentage <= minPercent) {
                        minPercent = percentage;
                    }

                    bHasAvailableOrBackOrderedSku = true;                
				}
            }
        });

        if (bHasAvailableOrBackOrderedSku) {
            sizeSpecificPricingStory.minWas = minWas;
            sizeSpecificPricingStory.maxWas = maxWas;
            sizeSpecificPricingStory.minNow = minNow;
            sizeSpecificPricingStory.maxNow = maxNow;
            sizeSpecificPricingStory.maxPercent = maxPercent;
            sizeSpecificPricingStory.minPercent = minPercent;
        }
        else {
            sizeSpecificPricingStory = null;
        }

        return sizeSpecificPricingStory;
    }

    // similar to formWasPrice, this uses the current sizeSpecificPricingStory object, if there is one, to display the savings story to the customer
    function showSizeSpecificPricingStory(parentContainer) {
        if (sizeSpecificPricingStory != null) {
            var minWas = sizeSpecificPricingStory.minWas;
            var maxWas = sizeSpecificPricingStory.maxWas;
            var minNow = sizeSpecificPricingStory.minNow;
            var maxNow = sizeSpecificPricingStory.maxNow;
            var maxPercent = sizeSpecificPricingStory.maxPercent;
            var minPercent = sizeSpecificPricingStory.minPercent;
            var priceHtml = "";
            var percentOff = 0;
            var wasPrice = "";
            var nowPrice = "";

            // format wasPrice
            wasPrice = "$" + minWas;

            if (minWas != maxWas) {
                wasPrice += " - $" + maxWas;
            }

            // format nowPrice
            nowPrice = "$" + minNow;

            if (minNow != maxNow) {
                nowPrice += " - $" + maxNow;

            }

            if (wasPrice != nowPrice) {
                priceHtml += "<span class=\"" + wasPriceSelector + "\"> Was: " + wasPrice + "<br></span>";
            }

            priceHtml += "<div class=\"" + priceSelector + "\"><font size=\"3\">Now: " + nowPrice + "</font></div>";

            //Adding saving story
            if (maxPercent > 0) {
                var upToText = maxPercent != minPercent ? "up to " : "";
                var percentText = isClearance ? "Clearance: " + upToText + maxPercent + "% off" : "Save " + upToText + maxPercent + "%";
                priceHtml += "<div class=\"" + priceSelector + "\"><font size=\"3\">" + percentText + "</font></div>";
            }

            parentContainer.find(priceLabelSelector).find(pricefromSelector).html(priceHtml);

        }
    }

    function resetControls(parentContainer) {
        //Reset MainImage, Price, Unselect swatches, Clear available text, Clear color name
        parentContainer.find(mainImageSelector).attr('src', getInitialValue(parentContainer, mainImageSelector));
        parentContainer.find(priceLabelSelector).html(getInitialValue(parentContainer, priceLabelSelector));
        parentContainer.find(swatchSelector).removeClass('unavailable');
        parentContainer.find(availabilityLabelSelector).text('');
        parentContainer.find(swatchSelector).unbind('mouseover');
        parentContainer.find(colorNameSelector).text('');
        parentContainer.find(selectedIndicator).css('border-color', '#fff');
        parentContainer.find(swatchErrorMessage).html('');
        parentContainer.find(imageUnavailability + ' span.image-not-available').remove();
        setImageUnavailableMsg(parentContainer);
        clearSelectedValues(parentContainer);
        // reset last availability status
        g_lastAvailabilityStatus = "";

        // old ATB, do not clear out message on load
        if (!$(".atb-old-pdp").is(":visible")) {
            parentContainer.find(errorSelector).hide();
        }

        parentContainer.find(".atb-display-price").find(".e-atb-Price").text("");
    }

    function SetSimpleSwatchEvents(parentContainer) {
        // for initial page load and setting size dropdown to 'select a size'
        parentContainer.find(hidSizevalue).each(function (index, element) {
            if (jQuery(element).val() != "0" && jQuery(element).val() != "") { return; }
            parentContainer.find(swatchSelector).each(function (index, element) {
                var currentSwatchControl = jQuery(element);
                var parentContainer = getParentContainer(currentSwatchControl);
                currentSwatchControl.unbind('click');
                currentSwatchControl.unbind('mouseover');
                currentSwatchControl.bind('mouseout');
                currentSwatchControl.removeClass('unavailable');
                currentSwatchControl.bind('click', swatchOnClick);
                //currentSwatchControl.bind('click', function () {
                //    parentContainer.find(swatchErrorMessage).html('Please select a size first.');
                //});

                if (!isTouchDevice) {
                    currentSwatchControl.bind('mouseover', swatchMouseOverSimple);
                    currentSwatchControl.bind('mouseout', swatchMouseOutSimple);
                }
            });
        });
    }

    function swatchMouseOverSimple() {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        var index = getParentContainerIndex(parentContainer);
        parentContainer.find(colorNameSelector).text(currentSwatchControl.attr('colorname'));
        if (currentSwatchControl.attr('mainImageUrl') == '') {
            setImageUnavailableMsg(parentContainer, 999);
        }
        else {
            setImageUnavailableMsg(parentContainer); // removes message
            // save current main image (it may have swapped with an alt image)
            if (parentContainer.find(mainImageSelector).attr('src') != undefined) {
                //selectedValueHash[mainImageSelector + index] = parentContainer.find(mainImageSelector).attr('src');
                parentContainer.find(mainImageSelector).attr('src', currentSwatchControl.attr('mainImageUrl'));
            }
        }
        if (parentContainer.find('div.tabscontainer').css('display') == 'block') {
            parentContainer.find('div.tabscontainer div.image a').click(); // change video tab to image
        }
    }

    function swatchMouseOutSimple() {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        var index = getParentContainerIndex(parentContainer);

        if (selectedValueHash[colorNameSelector + index] != null) {
            parentContainer.find(colorNameSelector).text(selectedValueHash[colorNameSelector + index]);
        }
        else {
            parentContainer.find(colorNameSelector).text('');
        }
        parentContainer.find(mainImageSelector).attr('src', selectedValueHash[mainImageSelector + index]);
        setImageUnavailableMsg(parentContainer, index);
    }

    function swatchMouseOverWhenAvailable() {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        var index = getParentContainerIndex(parentContainer);
        if (currentSwatchControl.attr('mainImageUrl') == '') {
            setImageUnavailableMsg(parentContainer, 999);
        } else {
            setImageUnavailableMsg(parentContainer); // removes message
            // save current main image (it may have swapped with an alt image)
            if (parentContainer.find(mainImageSelector).attr('src') != undefined) {
                //selectedValueHash[mainImageSelector + index] = parentContainer.find(mainImageSelector).attr('src');
                parentContainer.find(mainImageSelector).attr('src', currentSwatchControl.attr('mainImageUrl'));
            }
        }
        $('.e-swatchTooltip').remove();

        // a size must be selected to update the availability status label or show the tooltip
        if (parentContainer.find(sizedropdownSelector).val() != "") {
            parentContainer.find(colorNameSelector).text(currentSwatchControl.attr('colorName'));
            colorName = currentSwatchControl.attr('colorname');
            size = currentSwatchControl.attr('size');
            price = currentSwatchControl.attr('price');
            weekStart = parseInt(currentSwatchControl.attr('availabilityPeriod'));
            weekEnd = weekStart + 1;


            if (currentSwatchControl.attr('availability') == 'B') {
                parentContainer.find(availabilityLabelSelector).html(getAvailabilityText('B', weekStart, weekEnd));

                showToolTip(currentSwatchControl, 'large', '<span class="e-swatchTooltip-reserve">Ships in ' + weekStart + ' - ' + weekEnd + ' weeks</span><span class="e-swatchTooltip-size">' + size + ' in ' + colorName + '</span><span class="e-swatchTooltip-price">' + price + '</span>');
            } else {
                parentContainer.find(availabilityLabelSelector).html(getAvailabilityText('A', "", ""));

                showToolTip(currentSwatchControl, 'large', '<span class="e-swatchTooltip-inStock">IN STOCK</span><span class="e-swatchTooltip-size">' + size + ' in ' + colorName + '</span><span class="e-swatchTooltip-price">' + price + '</span>');
            }
        }

        if (parentContainer.find('div.tabscontainer').css('display') == 'block') {
            parentContainer.find('div.tabscontainer div.image a').click(); // change video tab to image
        }

        updatePricingLabels(parentContainer, index, currentSwatchControl.attr('price'), currentSwatchControl.attr('wasprice'))
    }

    function swatchMouseOutWhenAvailable() {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        var index = getParentContainerIndex(parentContainer);
        var selSku = parseSkuDetails(parentContainer.find(hidSizevalue).val());
        if (selectedValueHash[mainImageSelector + index] == null && selectedValueHash[imageUnavailability + index] == null) {
            parentContainer.find(mainImageSelector).attr('src', selectedValueHash[mainImageSelector + index]);
            parentContainer.find(colorNameSelector).text(selSku != null && selSku.length > 0 ? selSku[0].colorName : "");
            parentContainer.find(availabilityLabelSelector).text('');
        } else {
            if (selectedValueHash[mainImageSelector + index] != null) {
                parentContainer.find(mainImageSelector).attr('src', selectedValueHash[mainImageSelector + index]);
            }
            if (selectedValueHash[colorNameSelector + index] != null) {
                parentContainer.find(colorNameSelector).text(selectedValueHash[colorNameSelector + index]);
            }

            if (selectedValueHash[availabilityLabelSelector + index] != "U") {
                // if there is no size selected then clear the availability label
                if (parentContainer.find(sizedropdownSelector).val() != "") {
                    weekStart = parseInt(selectedValueHash[availabilityPeriodSelector + index]);
                    weekEnd = weekStart + 1;

                    parentContainer.find(availabilityLabelSelector).html(getAvailabilityText(selectedValueHash[availabilityLabelSelector + index], weekStart, weekEnd));
                }
                else {
                    parentContainer.find(availabilityLabelSelector).text('');
                }
            }
            else {
                parentContainer.find(colorNameSelector).text(selSku != null && selSku.length > 0 ? selSku[0].colorName : "");
                parentContainer.find(availabilityLabelSelector).text('');
            }
        }

        if ((selectedValueHash[wasPriceSelector + index] == null && selectedValueHash[priceSelector + index] == null) || selectedValueHash[availabilityLabelSelector + index] == 'U') {
            // if a size is selected then sizeSpecificPricingStory should not be null, if it is then show the default savings story (for when nothing is selected)
            if (sizeSpecificPricingStory != null) {
                showSizeSpecificPricingStory(parentContainer);
            }
            else {
                parentContainer.find(priceLabelSelector).html(getInitialValue(parentContainer, priceLabelSelector));
            }
        }
        else {
            if (parentContainer.find(sizedropdownSelector).val() != "") {
                updatePricingLabels(parentContainer, index, selectedValueHash[priceSelector + index], selectedValueHash[wasPriceSelector + index])
            }
            else {
                parentContainer.find(priceLabelSelector).html(getInitialValue(parentContainer, priceLabelSelector));
            }
        }

        setImageUnavailableMsg(parentContainer, index);
        setZoomImage(parentContainer);
        jQuery(swatchToolTip).remove();
    }

    function swatchMouseOverWhenUnavailable() {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        parentContainer.find(availabilityLabelSelector).html(getAvailabilityText('U', '', ''));
        colorName = currentSwatchControl.attr('colorName');
        parentContainer.find(colorNameSelector).text(colorName);
        size = currentSwatchControl.attr('size');
        showToolTip(currentSwatchControl, 'large', '<span class="e-swatchTooltip-unavailable">OUT OF STOCK</span><span class="e-swatchTooltip-size">' + size + ' in ' + colorName + '</span>');
    }

    function swatchMouseOutWhenUnavailable() {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        var index = getParentContainerIndex(parentContainer);

        weekStart = parseInt(selectedValueHash[availabilityPeriodSelector + index]);
        weekEnd = weekStart + 1;
        var selSku = parseSkuDetails(parentContainer.find(hidSizevalue).val());
        if (selectedValueHash[availabilityLabelSelector + index] != "U") {
            parentContainer.find(availabilityLabelSelector).html(getAvailabilityText(selectedValueHash[availabilityLabelSelector + index], weekStart, weekEnd));
            if (selectedValueHash[colorNameSelector + index] != null) {
                parentContainer.find(colorNameSelector).text(selectedValueHash[colorNameSelector + index]);
            }
            else {
                parentContainer.find(colorNameSelector).text(selSku != null && selSku.length > 0 ? selSku[0].colorName : "");
            }
        }
        else {
            parentContainer.find(colorNameSelector).text(selSku != null && selSku.length > 0 ? selSku[0].colorName : "");
            parentContainer.find(availabilityLabelSelector).text('');
        }

        jQuery(swatchToolTip).remove();
    }

    function swatchOnClick(e) {
        var currentSwatchControl = jQuery(this);
        var parentContainer = getParentContainer(currentSwatchControl);
        parentContainer.find(swatchErrorMessage).html("");

        var index = getParentContainerIndex(parentContainer);
        var availability = currentSwatchControl.attr('availability');

        // determine if click is real to out of stock processing, and also to suppress showing a popup for in stock or reserved items
        var bIsRealClick = e.screenX && e.screenX != 0 && e.screenY && e.screenY != 0;

        if (isTouchDevice) {
            $('.e-swatchTooltip').remove();
        }

        if (availability != 'U') {
            parentContainer.find(selectedIndicator).css('border-color', '#fff');
            currentSwatchControl.parent().css('border-color', '#000');
            if (currentSwatchControl.attr('mainImageUrl') == '') {
                selectedValueHash[imageUnavailability + index] = '<span class="image-not-available"></span>';
            }
            else {
                parentContainer.find(mainImageSelector).attr('src', currentSwatchControl.attr('mainImageUrl'));
                selectedValueHash[mainImageSelector + index] = currentSwatchControl.attr('mainImageUrl');
                selectedValueHash[imageUnavailability + index] = null;
                setZoomImage(parentContainer);
            }

            // pricing

            var wasPrice = currentSwatchControl.attr('wasprice');
            var nowPrice = currentSwatchControl.attr('price');

            updatePricingLabels(parentContainer, index, nowPrice, wasPrice);

            parentContainer.find(colorNameSelector).text(currentSwatchControl.attr('colorName'));
            selectedValueHash[priceLabelSelector + index] = currentSwatchControl.attr('price');
            selectedValueHash[priceSelector + index] = currentSwatchControl.attr('price');
            selectedValueHash[wasPriceSelector + index] = currentSwatchControl.attr('wasprice');
            selectedValueHash[colorNameSelector + index] = currentSwatchControl.attr('colorName');
            var availability = selectedValueHash[availabilityLabelSelector + index] = currentSwatchControl.attr('availability');

            weekStart = "";
            weekEnd = "";

            if (availability == "B") {
                weekStart = selectedValueHash[availabilityPeriodSelector + index] = parseInt(currentSwatchControl.attr('availabilityPeriod'));
                weekEnd = weekStart + 1;
            }

            parentContainer.find(availabilityLabelSelector).html(getAvailabilityText(availability, weekStart, weekEnd));
            g_lastAvailabilityStatus = parentContainer.find(availabilityLabelSelector).text();

            setImageUnavailableMsg(parentContainer, index);
            showOutfitSubTotal();
            HideErrorMessageOnQuickView();
            updateSizeAvailability(parentContainer, currentSwatchControl);

            if (bIsRealClick) {
                jQuery(parentContainer).find(sizedropdownSelector).trigger('change');
            }
        }
        else {
            if (isTouchDevice && bIsRealClick) {
                parentContainer.find(selectedIndicator).css('border-color', '#fff');
                clearSelectedValues(parentContainer);
                parentContainer.find(availabilityLabelSelector).html(getAvailabilityText('U', '', ''));
                colorName = currentSwatchControl.attr('colorName');
                parentContainer.find(colorNameSelector).text(colorName);
                size = currentSwatchControl.attr('size');
                showToolTip(currentSwatchControl, 'large', '<span class="e-swatchTooltip-unavailable">OUT OF STOCK</span><span class="e-swatchTooltip-size">' + size + ' in ' + colorName + '</span>');
            }
        }

        if (availability != 'U' || (isTouchDevice && bIsRealClick)) {
            //set selected swatch detail to hidden field
            swatchKey = currentSwatchControl.attr('colorName');
            var lstSkus = parseSkuDetails(parentContainer.find(sizedropdownSelector).val());
            var skuDetail = getSkuDetailBySwatchAttributeKey(swatchKey, lstSkus);
            parentContainer.find(hidSizevalue).val(formSkuString(skuDetail));

            showOutfitSubTotal();
            ShowPriceOnATBButton(this);
            AddToBasketButton(this);
            parentContainer.find(errorSelector).hide();
        }
    }

    function updatePricingLabels(parentContainer, index, currPrice, wasPrice) {
        if ((wasPrice == null || typeof (wasPrice) == 'undefined' || wasPrice == '') && (currPrice == null || typeof (currPrice) == 'undefined') || currPrice == '') {
            nowPrice = initialValueHash[priceLabelSelector + index];
            parentContainer.find(priceLabelSelector).find(pricefromSelector).html(nowPrice);
        }
        else if (wasPrice != null && wasPrice != '' && wasPrice != '$0.00' && currPrice != wasPrice) {
            parentContainer.find(priceLabelSelector).find(pricefromSelector).html(formWasPrice(wasPrice, currPrice));
        }
        else {
            parentContainer.find(priceLabelSelector).find(pricefromSelector).html(formWasPrice('', currPrice));
        }
    }

    function setImageUnavailableMsg(parentContainer, index) {
        if (selectedValueHash[imageUnavailability + index] != null || index == 999) {
            if (parentContainer.find('span.image-not-available').length == 0) {
                parentContainer.find(imageUnavailability).append('<span class="image-not-available"></span>');
            }
        } else {
            parentContainer.find(imageUnavailability + ' span.image-not-available').remove();
        }
    }

    function showToolTip(currentSwatchControl, size, message) {
        currentSwatchControl.parent().append('<div class="swatch-tooltip e-swatchTooltip"><div class="m-tooltip"></div></div>');
        var toolTip = jQuery(swatchToolTip);
        toolTip.css('visibility', 'hidden');
        toolTip.find('.m-tooltip').html(message + '<img class="e-arrowDown" src="//secureimages.plussizetech.com/images/site_images/womanwithin/whiteTriangle.png" width="26" height="11"></div>');
        toolTip.show();
        toolTip.css('top', -($('.m-tooltip').height() + 15) + "px");
        toolTip.css('left', -(Math.ceil(($('.m-tooltip').outerWidth() / 2)) - Math.floor((currentSwatchControl.closest('.swatch-2011-link').outerWidth() / 2))) + 2 + 'px');
        toolTip.css('visibility', 'visible');
    }

    function setZoomImage(parentContainer) {
        if (parentContainer.find(mainImageSelector).attr('src') != undefined) {
            parentContainer.find(mainImageSelector).parent().attr('href', parentContainer.find(mainImageSelector).attr('src').split('?')[0]);
        }
    }

    function showOutfitSubTotal() {
        if (jQuery('span.subtotal-amount').length) {
            var subTotal = 0;

            jQuery(priceLabelSelector).each(function () {
                var currentPriceContainer = jQuery(this);
                var parentContainer = getParentContainer(currentPriceContainer);
                var hidSizeValue = $(parentContainer.find(hidSizevalue)).val();

                if (hidSizeValue.length > 1) {
                    var skuDetail = parseSkuDetails(hidSizeValue);
                    if (skuDetail.length > 0) {
                        var price = skuDetail[0].price;
                        subTotal += price.replace("$", "") * parentContainer.find('select.quantity').val();
                    }
                }
            });
            jQuery('span.subtotal-amount').html('$' + subTotal.toFixed(2));
        }
    }

    function ShowPriceOnATBButton(obj) {
        var subTotal = 0;
        var parentContainer = getParentContainer($(obj));
        var sizeValue = $(parentContainer.find(hidSizevalue)).val();
        if (typeof sizeValue != 'undefined' && sizeValue.length > 1) {
            var skuDetail = parseSkuDetails(sizeValue);
            if (skuDetail.length > 0) {
                var price = skuDetail[0].price;
                subTotal += parseFloat(price.replace("$", "")) * parseInt(parentContainer.find('select.quantity').val());
            }
        }
        if (subTotal == 0)
            parentContainer.find(".atb-display-price").find(".e-atb-Price").text("");
        else
            parentContainer.find(".atb-display-price").find(".e-atb-Price").text(" ($" + subTotal.toFixed(2) + ")");
    }

    function AddToBasketButton(obj) {
        var parentContainer = $(parentContainerSelector);
        var atbContainer = $(atbSelector);
        var flag = false;

        if (pageType == "Product detail" || pageType == "quickview") {
            parentContainer = getParentContainer($(obj));
            atbContainer = parentContainer.find(atbSelector);
        }

        atbContainer.addClass('disabled');
        parentContainer.each(function () {
            if ($(this).find(colorNameSelector).text() != "" && $(this).find(quantitySelector).val() != "0" && $(this).find(sizedropdownSelector).val() != "0" && $(this).find(hidSizevalue).val() != "0") {
                flag = true
            }
        });

        if (flag) {
            atbContainer.removeClass('disabled');
        }
    }

    function AddToBasket(obj) {
        var parentContainer = $(parentContainerSelector);
        var quickviewContainer = $(".quickview-container");
        var jsonSKU = [];
        parentContainer.find(errorSelector).hide();
        parentContainer.find('.errorWL').hide();

        // Call on PDPUnload before adding to the bag
        if (g_lastAvailabilityStatus.length == 0) {
            g_lastAvailabilityStatus = $(getParentContainer($(obj))).find(availabilityLabelSelector).text();
        }
        onPDPUnload();

        parentContainer.each(function () {
            if ($(this).find(colorNameSelector).text() != "" || $(this).find(quantitySelector).val() != "0" || $(this).find(sizedropdownSelector).val() != "") {
                sku = {}
                sku["ProductId"] = $(this).find(".productimage").attr('class').split('_')[1];
                sku["CategoryId"] = pageType == "quickview" && getQuerystring('DeptId', quickviewContainer.attr("qvproducturl")) != undefined ? getQuerystring('DeptId', quickviewContainer.attr("qvproducturl")) :
                getQuerystring('DeptId', window.location.href) != undefined ? getQuerystring('DeptId', window.location.href) : "";
                sku["ProductTypeId"] = $(this).find(".productimage").attr('prodtype');
                sku["QuickOrderNumber"] = getQuerystring('QoId', window.location.href) != undefined ? getQuerystring('QoId', window.location.href) : "";
                sku["BlueBoxNumber"] = getQuerystring('BlueBox', window.location.href) != undefined ? getQuerystring('BlueBox', window.location.href) : "";
                sku["Token"] = getQuerystring('Token', window.location.href) != undefined ? getQuerystring('Token', window.location.href) : "";
                sku["Color"] = $(this).find(colorNameSelector).text();
                sku["Size"] = $(this).find(".size option:selected").text();
                sku["Quantity"] = $(this).find(quantitySelector).val();
                sku["SizeValue"] = $(this).find(hidSizevalue).val();

                sku["IsHem"] = $(this).find('.hem-check').prop('checked');
                sku["HemSize"] = $(this).find('.hem-size').val();
                sku["IsMonogram"] = $(this).find('div.monogramwrapper').find('.checkboxMono').prop('checked');
                sku["MonogramColor"] = $(this).find('.Color').find('select').val();
                sku["MonogramFont"] = $(this).find('.Font').find('select').val();
                sku["MonogramLocationCode"] = $(this).find('.At').find('select').val();
                sku["MonogramLocationText"] = $(this).find('.At').find('select option:selected').text();

                var line = [];
                var textContainer = $(this).find('.text');
                textContainer.each(function () {
                    line.push($(this).val());
                });
                sku["Line"] = line;

                jsonSKU.push(sku);
            }
            if (pagetype == "quickview") {
                qvProductId = $(this).find(".productimage").attr('class').split('_')[1];
                qvCategoryId = getQuerystring('DeptId', quickviewContainer.attr("qvproducturl")) != undefined ? getQuerystring('DeptId', quickviewContainer.attr("qvproducturl")) : "";
                qvProductTypeId = $(this).find(".productimage").attr('prodtype');
                qvShoppingPref = getQuerystring('pref', quickviewContainer.attr("qvproducturl")) != undefined ? getQuerystring('pref', quickviewContainer.attr("qvproducturl")) : "";
                qvPurchaseType = getQuerystring('PurchaseType', quickviewContainer.attr("qvproducturl")) != undefined ? getQuerystring('PurchaseType', quickviewContainer.attr("qvproducturl")) : "";
            }
        });

        productInfo = {
            ProductId: pageType == "quickview" ? qvProductId : getQuerystring('pfid', window.location.href) != undefined ? getQuerystring('pfid', window.location.href) : "",
            CategoryId: pageType == "quickview" ? qvCategoryId : getQuerystring('DeptId', window.location.href) != undefined ? getQuerystring('DeptId', window.location.href) : "",
            LineItemId: pageType == "quickview" ? "" : getQuerystring('lineitemid', window.location.href) != undefined ? getQuerystring('lineitemid', window.location.href) : "",
            IsModified: pageType == "quickview" ? false : getQuerystring('action', window.location.href) != undefined && getQuerystring('action', window.location.href) == "mod" ? true : false,
            ProductTypeId: pageType == "quickview" ? qvProductTypeId : getQuerystring('ProductTypeId', window.location.href) != undefined ? getQuerystring('ProductTypeId', window.location.href) : "",
            PageType: pageType,
            ShoppingPref: pageType == "quickview" ? qvShoppingPref : getQuerystring('pref', window.location.href) != undefined ? getQuerystring('pref', window.location.href) : "",
            PurchaseType: pageType == "quickview" ? qvPurchaseType : getQuerystring('PurchaseType', window.location.href) != undefined ? getQuerystring('PurchaseType', window.location.href) : "",
            SKU: jsonSKU
        }

        //ATB AJAX CALL


        Product.AddToBasket(productInfo, function (model) {
            var successSKU = $.grep(model.SKU, function (getSuccessSKU) { return (!getSuccessSKU.IsError) });
            var failureSKU = $.grep(model.SKU, function (getFailureSKU) { return (getFailureSKU.IsError) });

            //Common omniture method call
            if (model) {
                OmnitureForAJAX(model.OminitureViewModel);
            }

            //Success message

            var confirmationSelector = $('.m-addToBagConfirmation');
            var productInfoTemplate = $('.m-addToBagConfirmation-productTemplate').not('.is-populated');

            // wipe any previously added products
            $('.m-addToBagConfirmation-productTemplate.is-populated').remove();

            var cnt = 0;
            var addtocartids = '';
            // for each product successfully added to cart (just 1 unless on ensemble)
            var totalCount = 0;
            // for each item successfully added to cart...
            $(successSKU).each(function (index, data) {

                if (cnt > 0)
                    addtocartids = addtocartids + ';' + data.ProductId;
                else
                    addtocartids = data.ProductId;
                cnt++;

                // start with blank template
                var newProductInfoTemplate = productInfoTemplate.clone();

                // fill in product data
                $('.e-productImage', newProductInfoTemplate).attr('src', data.ImageUrl);

                // little extra bit to strip out any potential HTML tags in name
                $('.e-productName', newProductInfoTemplate).html(data.Name.replace(/(<([^>]+)>)/ig, ""));

                // keep original dollar sign in the markup
                $('.e-price', newProductInfoTemplate).text(function (index, val) { return val + data.Price });

                $('.e-productColor', newProductInfoTemplate).text(data.Color);

                $('.e-productSize', newProductInfoTemplate).text(data.Size);

                $('.e-productQuantity', newProductInfoTemplate).text(data.Quantity);

                totalCount += parseInt(data.Quantity);
                // display shipping messages and change styles based on various conditions
                // @todo: remove hard coded shipping messages, extra classes, populate here or in a JSON data source
                // note: pattern class instead of show(), that doesn't seem to work when it's done on something that's already invisible

                var shippingConditions = {

                    backOrder: { modifier: 'backOrder', condition: data.IsBackorder, message: data.BackorderDate },
                    dropShip: { modifier: 'dropShip', condition: data.IsDropShip, message: null },
                    fullBeauty: { modifier: 'fullBeauty', condition: data.IsFullbeautyItem, message: null },
                    braClub: { modifier: 'braClub', condition: data.HasBraClubIndicator, message: null },
                    intlShipping: { modifier: 'intlShipping', condition: data.IsProductEligibleForInternationalShipping == false, message: null },
                    heavyItem: { modifier: 'heavyItem', condition: data.HasHeavyCode, message: null },
                    bonusItem: { modifier: 'bonusItem', condition: data.HasBonusItem, message: data.BonusItemUrl },
                    showMessage: function (theModifier) {

                        $('.e-shippingStatus--' + theModifier, newProductInfoTemplate).addClass('p-show');

                    },
                    setBonusItemUrl: function (theModifier, theMessage) {
                        $('.e-shippingStatus--' + theModifier, newProductInfoTemplate).addClass('p-show');
                        $('.e-shippingStatus--' + theModifier + ' .freeGifturl', newProductInfoTemplate).attr('href', theMessage);

                    },
                    replaceTextInMessage: function (theModifier, theMessage) {

                        $('.e-shippingStatus', newProductInfoTemplate).hide(); // don't display default "in stock" message
                        $('.e-shippingStatus--' + theModifier + ' .e-shippingStatusDate', newProductInfoTemplate).text(theMessage);
                        $('.e-shippingStatus--' + theModifier, newProductInfoTemplate).addClass('p-show');
                    }
                };

                $.each(shippingConditions, function (index, value) {

                    if (shippingConditions[index]['condition']) {

                        if (shippingConditions[index]['modifier'] == 'backOrder') {

                            shippingConditions.replaceTextInMessage(shippingConditions[index]['modifier'], shippingConditions[index]['message']);
                        }
                        else if (shippingConditions[index]['modifier'] == 'bonusItem') {

                            shippingConditions.setBonusItemUrl(shippingConditions[index]['modifier'], shippingConditions[index]['message']);
                        }
                        else {

                            shippingConditions.showMessage(shippingConditions[index]['modifier']);
                        }

                    }
                });

                // in case of multiple products being added
                if (index > 0) {
                    newProductInfoTemplate.addClass('is-multiItem');
                }

                // when done, tag it as populated and add it to the DOM
                newProductInfoTemplate.addClass('is-populated').insertAfter('.m-addToBagConfirmation-productTemplate:last');
            });

            // first, fill in total added count (usually 1)
            $('.e-addedItemCount', confirmationSelector).text(totalCount);

            //Open popup and Reset all the controller
            if (successSKU != null && successSKU.length > 0) {
                // fill in cart data
                confirmationSelector.find(".e-column-cartInfo .e-price").text(model.BasketSubTotal);
                confirmationSelector.find(".e-cartItemCount").text(model.BasketCount);

                $("#ShoppingBagCount").text(model.BasketCount);

                // hide quickview popup in case it is present
                $('.quickview-container').hide();

                // show confirmation popup
                popupSet['m-addToBagConfirmation'].togglePopup();

                parentContainer.each(function (obj) {
                    for (var cnt = 0; cnt < successSKU.length; cnt++) {
                        if (successSKU[cnt].ProductId == $(this).find(".productimage").attr('class').split('_')[1]) {
                            var currentSelector = $(this);
                            resetControls(currentSelector);
                            $(sizedropdownSelector, currentSelector).find('option:first').attr('selected', 'selected');
                            $(hidSizevalue, currentSelector).val('0');
                            if (pageType == "Outfit") {
                                $(quantitySelector, currentSelector).prop('selectedIndex', 0);
                            } else {
                                $(quantitySelector, currentSelector).prop('selectedIndex', 1);
                            }
                            if ($(sizedropdownSelector, currentSelector).prop('selectedIndex') == 0) {
                                SetSimpleSwatchEvents(currentSelector);
                            }
                        }
                    }
                });

                parentContainer.find(atbSelector).addClass('disabled');

                // For new Certona JS 2014 ATB tracking for QV
                isaddtobasket = true;
                addtobasketids = addtocartids;
                try {
                    AddToCartCertona();
                } catch (e) { }
            }


            //Display message in each product level
            parentContainer.each(function (obj) {
                for (var cnt = 0; cnt < failureSKU.length; cnt++) {
                    if (failureSKU[cnt].ProductId == $(this).find(".productimage").attr('class').split('_')[1]) {
                        var currentErrorSelector = $(this).find(errorSelector);
                        currentErrorSelector.show();

                        if (failureSKU[cnt].ErrorMessage) {
                            $(".error_msg", currentErrorSelector).show();
                            $(".unavailable", currentErrorSelector).hide();
                            $(".error_msg", currentErrorSelector).html(failureSKU[cnt].ErrorMessage);
                        }
                        else {
                            $(".error_msg", currentErrorSelector).hide();
                            $(".unavailable", currentErrorSelector).show();
                            $(".prod_name", currentErrorSelector).text(failureSKU[cnt].Name.replace(/(<([^>]+)>)/ig, "")); // strip HTML tags
                            $(".prod_color", currentErrorSelector).text(failureSKU[cnt].Color);
                            $(".prod_size", currentErrorSelector).text(failureSKU[cnt].Size);

                        }
                        break;
                    }
                }
            });
        });
    }

    //Start: Helper functions
    function formWasPrice(wasPrice, nowprice) {
        var priceHtml = "";
        var percentOff = 0;
        if (wasPrice != '') {
            percentOff = Math.floor(((parseFloat(wasPrice.replace('$', '')) - parseFloat(nowprice.replace('$', ''))) / parseFloat(wasPrice.replace('$', ''))) * 100);
            priceHtml += "<span class=\"" + wasPriceSelector + "\"> Was: " + wasPrice + "<br></span>";
        }
        priceHtml += "<div class=\"" + priceSelector + "\"><font size=\"3\">Now: " + nowprice + "</font></div>";

        //Adding saving story
        if (percentOff >= 10) {
            var percentText = isClearance ? "Clearance: " + percentOff + "% off" : "Save " + percentOff + "%";
            priceHtml += "<div class=\"" + priceSelector + "\"><font size=\"3\">" + percentText + "</font></div>";
        }

        return priceHtml;
    }

    function formSkuString(skuDetail) {
        if (skuDetail == undefined) return "0";
        var skuStr = skuDetail.styleNumber + "|" + skuDetail.size + "|" + skuDetail.sizeType + "|" + skuDetail.mediaKey + "|" + skuDetail.displaySize + "|" + skuDetail.colorName + "|" + skuDetail.price;
        skuStr = skuStr + "|" + skuDetail.highLevelDept + "|" + skuDetail.availability + "|" + skuDetail.availabilityPeriod + "|" + skuDetail.wasPrice;
        return skuStr;
    }
    function clearSelectedValues(parentContainer) {
        var index = getParentContainerIndex(parentContainer);
        delete selectedValueHash[mainImageSelector + index];
        delete selectedValueHash[priceLabelSelector + index];
        delete selectedValueHash[priceSelector + index];
        delete selectedValueHash[wasPriceSelector + index];
        delete selectedValueHash[colorNameSelector + index];
        delete selectedValueHash[imageUnavailability + index];
        delete selectedValueHash[availabilityLabelSelector + index];
    }

    function getParentContainer(control) {
        return jQuery(control).parents(parentContainerSelector);
    }

    function getSkuDetailBySwatchAttributeKey(swatchAttributeKey, lstSkuDetails) {
        var selectedSkuDetail = null;
        if (lstSkuDetails != null) {
            jQuery(lstSkuDetails).each(function (index, skuDetail) {
                var varSwatchAttributeKeyName = skuDetail[swatchAttributeKeyName];
                if (varSwatchAttributeKeyName.toUpperCase() == swatchAttributeKey.toUpperCase()) { selectedSkuDetail = skuDetail; return false; }
            });
        }
        return selectedSkuDetail;
    }

    //***23033502|12||1243|12|CORNSILK|$59.99|B|||***23033533|12||1243|12|BLUE LAGOON|$59.99|B|||***23033543|12||1243|12|BLUE VIOLET|$59.99|B|||
    function parseSkuDetails(skuDetailsString) {
        if (skuDetailsString == undefined) { return null; }
        var skuDetails = [];
        jQuery(skuDetailsString.split('***')).each(function (index, value) {
            skuArray = value.split('|');
            if (skuArray.length == 11) {
                var skuDetail = new Object;
                skuDetail.styleNumber = skuArray[0];
                skuDetail.size = skuArray[1];
                skuDetail.sizeType = skuArray[2];
                skuDetail.mediaKey = skuArray[3];
                skuDetail.displaySize = skuArray[4];
                skuDetail.colorName = skuArray[5];
                skuDetail.price = skuArray[6];
                skuDetail.wasPrice = skuArray[10];
                skuDetail.highLevelDept = skuArray[7];
                skuDetail.availability = skuArray[8];
                skuDetail.availabilityPeriod = skuArray[9];
                skuDetails.push(skuDetail);
            }
        });
        return skuDetails;
    }

    function getInitialValue(parentContainer, controlSelector) {
        return initialValueHash[controlSelector + getParentContainerIndex(parentContainer)];
    }

    function getParentContainerIndex(parentContainer) {
        return jQuery(parentContainerSelector).index(parentContainer);
    }

    function getAvailabilityText(availabilityCode, weekStart, weekEnd) {
        var availabilityText = '';
        switch (availabilityCode) {
            case 'A':
                availabilityText = '<span class="p-inStock">In Stock</span>';
                break;
            case 'B':
                availabilityText = '<span class="p-reserved">Ships within ' + weekStart + ' - ' + weekEnd + ' weeks</span>';
                break;
            case 'U':
                availabilityText = '<span class="p-outOfStock">Out of Stock</span>';
                break;
            default:
                availabilityText = '';
        }
        return availabilityText;
    }

    function InfoTooltip(obj) {
        $(toolTipSelector).append('<div class="info-tooltip"><div></div></div>');
        var toolTip = $('div.info-tooltip');
        toolTip.css('visibility', 'hidden');
        toolTip.html('Please select a size, color and quantity.');
        var toolTipPosition = $(obj).position();
        toolTip.css({
            'left': toolTipPosition.left - 1,
            'top': toolTipPosition.top - 50,
            'visibility': 'visible'
        });
    }

    function findAndClickSwatchByColorName(parentContainer, colorName) {
        parentContainer.find(swatchSelector).each(function (index, element) {
            element = jQuery(element);
            if (element.attr('colorname').toLowerCase() === colorName.toLowerCase()) {
                element.unbind('click');
                element.bind('click', swatchOnClick);
                element.trigger('click');
            }
        });
    }

    function updateSizeAvailability(parentContainer, selectedColor) {
        if (selectedColor != null) {
            selectedColorName = selectedColor.attr('colorName');

            // loop through options setting classes appropriate based on
            // 1. if the color is within the sku information, then it is either available or reserved
            // 2. if the color is NOT within the sku information, then it is out of stock
            parentContainer.find(sizedropdownSelector + ' option').each(function () {
                if ($(this).val().length > 0) {
                    var skuDetails = parseSkuDetails($(this).val());
                    var bFound = false;
                    var foundAvailability = "";
                    for (var i = 0; i < skuDetails.length; i++) {
                        if (skuDetails[i].colorName.toLowerCase() == selectedColorName.toLowerCase()) {
                            foundAvailability = skuDetails[i].availability;
                            bFound = true;
                        }
                    }

                    $(this).removeClass();
                    //$(this).attr("disabled", false);

                    if (bFound) {
                        if (foundAvailability == "A") {
                            $(this).addClass("p_inStock");
                        }
                        else if (foundAvailability == "B") {
                            $(this).addClass("p_reserved");
                        }
                        else {
                            $(this).addClass("p_outOfStock");
                        }
                    }
                    else {
                        $(this).addClass("p_outOfStock");
                        //$(this).attr("disabled", true);
                    }
                }
            });
        }
    }

    function resetSwatchAttributesAndPricing(parentContainer, index) {
        parentContainer.find(swatchSelector).removeClass('unavailable');
        parentContainer.find(swatchSelector).attr('availability', '');
        parentContainer.find(swatchSelector).attr('availabilityPeriod', '');
        parentContainer.find(swatchSelector).attr('price', '');
        parentContainer.find(swatchSelector).attr('wasprice', '');
        parentContainer.find(availabilityLabelSelector).text('');
        parentContainer.find(swatchSelector).unbind('mouseover');
        parentContainer.find(swatchErrorMessage).html('');
        parentContainer.find(imageUnavailability + ' span.image-not-available').remove();
        parentContainer.find(itemSelect).val('false');
        SetSimpleSwatchEvents(parentContainer);
        updatePricingLabels(parentContainer, index, '', '');
    }
    //End: Helper functions
}
/**** End: PDP UI Behaviour *********************************************************/

//PDP Page Numbering
var parentContainerIndex = -1;
function generateNumberingForLabels(parentContainerSelector, elementSelector) {
    var parentContainer;
    var count = 1;
    jQuery(elementSelector).each(function () {
        parentContainer = jQuery(this).parents(parentContainerSelector);
        var index = jQuery(parentContainerSelector).index(parentContainer);
        if ((index < parentContainerIndex) || (count == 1 && index == parentContainerIndex)) { return true; }
        if (index > parentContainerIndex) { parentContainerIndex = index; }

        var currentControl = jQuery(this);
        currentControl.text(count + ". " + currentControl.text());
        count++;
    });
}

// PDP Main Image Set With StyleNo
function pdp_ui_setmainimage(parentContainerSelector, mainImageSelector, swatchSelector, styleNo) {

    this.SetBehaviour = function () {
        SetMainImageForStyleNo();
    }

    function SetMainImageForStyleNo() {

        var flag = "true";

        //For back order items
        if (typeof (jsBackStyleNo) !== 'undefined' && jsBackStyleNo != null) {
            setMainImageToControl(jsBackStyleNo);
            flag = "false";
        }

        if (typeof (jsStyleNo) !== 'undefined' && jsStyleNo != null) {
            setMainImageToControl(jsStyleNo);
            flag = "false";
        }

        if (styleNo != undefined && flag == "true") {
            setMainImageToControl(styleNo);
        }
    }

    function setMainImageToControl(style) {
        var stylearray = style.split('|');
        for (var cnt = 0; cnt < stylearray.length; cnt++) {
            jQuery(parentContainerSelector).find(swatchSelector).each(function (index, element) {
                var imageUrl = jQuery(this).attr('mainImageUrl');
                var mcStyleNo = imageUrl.substring(imageUrl.lastIndexOf('.') - 4, imageUrl.lastIndexOf('.'));
                if (mcStyleNo == stylearray[cnt]) {
                    var parentContainer = getParentContainer(this);
                    jQuery(parentContainer).find(mainImageSelector).attr('src', imageUrl);
                    jQuery(parentContainer).find(mainImageSelector).parent().attr('href', jQuery(parentContainer).find(mainImageSelector).attr('src').split('?')[0]);
                }
            });
        }
    }

    function getParentContainer(control) {
        return jQuery(control).parents(parentContainerSelector);
    }
}

// View product full details
$("#ImageButtonViewFullDescription, #LinkButtonViewFullDescription").click(function () {

    // Retain product image colorization to click view full product details 
    var styleNo;
    var quickviewSelector = $('.quickview-container');
    var oldstyleNo = quickviewSelector.attr('styleno');
    var imageUrl = $(".imgMain").attr('src');
    var imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.indexOf('?'));

    var imageSlice = imageName.split(".")[0].split("_");
    if (imageSlice[2] != "mm") {
        styleNo = imageSlice[3];
    }

    if (styleNo != undefined) {
        var qvproducturl = quickviewSelector.attr('qvproducturl');
        if (oldstyleNo == undefined) {
            quickviewSelector.attr('qvproducturl', qvproducturl + "&StyleNo=" + styleNo);
            quickviewSelector.attr('styleno', styleNo);
        }
        else if (styleNo != oldstyleNo) {
            quickviewSelector.attr('qvproducturl', qvproducturl.replace(oldstyleNo, styleNo));
        }
    }
    window.parent.location.href = quickviewSelector.attr('qvproducturl');

    return false;

});
