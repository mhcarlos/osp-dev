/** DOM-READY ****************************************************************************/
jQuery(document).ready(function () {
    if (jQuery('#prev_viewed').length > 0)
        PrevViewedSetup();

    /* Make search pattern case-insensitive in case URL contains variations of "affiliatebrowsing" or "gift-card" */
    if (!location.href.match(/AffiliateBrowsing|Gift-Card/i)) {
        var pdp = new pdp_ui_behaviour("div.product-wrap", "#Main_Image_0", "select.size", "div#current_price", "span.swatch-2011", "a.swatch-2011-link", "div.selectionHolder span.item_status_msg", "div.quantity_container span.item_status_msg", "colorName", "div.swatch-tooltip", ".hidSizeValue", ".swatch-error-msg", "a.zoomLink", ".hdItemSelect", ".pricefrom", "salepricestyle",
        "StrikeStyle", ".addToBasket", ".quantity", "span.action-selection", "Product detail");
        pdp.SetBehaviour();

        //Set default quantity is one
        if (jQuery('.quantity').val() == 0)
            jQuery('.quantity').val(1);
    }

    // 'hem my pants' checkbox enables/disables hem size dropdown (tt #23856)
    $('input.hem-check').on('change', function () {
        $select = $(this).siblings('select');
        if ($(this).attr('checked')) { $select.removeAttr('disabled'); }
        else { $select.attr('disabled', 'disabled'); }
    });

    //Keep PDP alternate images array - it will used to retain the pdp images after open and close the QV on PDP page 
    //because both PDP and QV use the same "product_images" array
    if (typeof product_images != 'undefined') {
        pdp_product_images = product_images
    }
});

/* If IE7 suddenly goes crazy, destroying the PDP */

/////////////////////////////////////Start of ProductLastViewedCookie//////////////////////////////////
	var pfid="";
	var deptid="";
	var producttypeid="";
	function SetLastViewedCookie()
	{
	    var cookieName = 'LastViewedProducts';
		var currentViewedProducts = GetCookie(cookieName);
		var url = document.location.href;		
  		     disectUrl(url);
		
		// get the current product and documentid
		var currentProduct = "";
		if(pfid !="")
			currentProduct = pfid;
		else
			currentProduct ="";	
			
		currentProduct +="#";
		
		if(producttypeid !="")
			currentProduct += producttypeid;
		else
			currentProduct += producttypeid;
		
		currentProduct += "*";
		
		if(deptid !="")
		{currentProduct +=deptid;}
		
		else
			currentProduct +="";
				
		if (currentProduct == null)
  		     {currentProduct = "";}

		if (currentViewedProducts == null)
		     {currentViewedProducts = "";}

		//Ten products
		if (currentViewedProducts.length > 11*50)
		  {currentViewedProducts =popFirstOne(currentViewedProducts);}
		
		var currentViewedProductsList = "";
		currentViewedProductsList = currentViewedProducts.split(',');
		if(currentViewedProductsList != null && currentViewedProductsList.length >11)
		{
		    if (currentViewedProducts.indexOf(currentProduct) == -1)
  		       {currentViewedProducts =popFirstProduct(currentViewedProducts);}
		}
		
		if (currentProduct.length > 4)
		{
			if (currentViewedProducts.length == 0)
			   {currentViewedProducts = currentProduct;}
			else
			{	
				if (currentViewedProducts.indexOf(currentProduct) == -1)
 			   	      {currentViewedProducts = currentProduct+  ','  + currentViewedProducts;}
			}
			var today = new Date();
			var expires_date = new Date(today.getTime() + 30 * 1000 * 60 * 60 * 24);			
			setNoEscapeCookie(cookieName,currentViewedProducts,expires_date);
		}
	}	
	function getCookieVal (offset)
	{
		var endstr = document.cookie.indexOf (";", offset);
		if (endstr == -1)
			endstr = document.cookie.length;
		return unescape(document.cookie.substring(offset, endstr));
	
	}
	function GetCookie (name)
	{
		var arg = name + "=";
		var alen = arg.length;
		var clen = document.cookie.length;
		var i = 0;
		while (i < clen)
		{
			var j = i + alen;
			if (document.cookie.substring(i, j) == arg)
			return getCookieVal (j);
			i = document.cookie.indexOf(" ", i) + 1;
			if (i == 0) break; 
		}
		return null;
	}
	function setNoEscapeCookie(name, value, expires, path, domain, secure)
	{
		var thisCookie = name + "=" + value +
		((expires) ? "; expires=" + expires.toGMTString() : "") +
		((path) ? "; path=" + path :"; path=/") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");
		document.cookie = thisCookie;
	}
	function popFirstOne(list)
	{
		var templist=list;
		templist = templist.substr(templist.indexOf(',')+1,templist.length);
		return templist;
		
	}
	function popFirstProduct(list)
	{
		var templist=list;
		templist = templist.substr(0,templist.lastIndexOf(','));
		return templist;
		
	}
	function disectUrl(url)
	{
		var cntQuest=0;
		var cntUrlLen=0;
		var tempurl="";
		var arrWhole = "";
		var arrPart  = new Array();
		var arrDeptid= new Array();
		var arrProductType = new Array();
		var navigator="";
		tempurl=url.toLowerCase();
		cntQuest = tempurl.indexOf('?');
		cntUrlLen = tempurl.length;
		tempurl= tempurl.substr(cntQuest+1,cntUrlLen);
		arrWhole= tempurl.split('&');
		for(i=0;i<arrWhole.length;i++)
		{
			arrPart= arrWhole[i].split('=');
			navigator=arrPart[0];
			switch (navigator)
			{
				case "pfid":
					pfid = arrPart[1];
					break;
				case "deptid":
				    deptid = arrPart[1];
				    break;
				case "producttypeid":
					producttypeid = arrPart[1];				
	}}}
/////////////////////////////////////End of ProductLastViewedCookie////////////////////////////////////
/////////////////////////////////////Start of Products ////////////////////////////////////////////////
/* start - scripts used from ProductVariants controls */
 
  function SelectItemByDefault(ddlSizeId,chkId,hiddenSizeId,hdItemSelect,ddlQtyId)
 {
    var ddlSize = document.getElementById(ddlSizeId);
    var chkBox = document.getElementById(chkId);
    var hiddenSizectrl = document.getElementById(hiddenSizeId);
    var hiddenItemSelect = document.getElementById(hdItemSelect);
    var ddlQty = document.getElementById(ddlQtyId);
    
    if(ddlSize != null )
    {
        if( hiddenSizectrl != null)
        {hiddenSizectrl.value = ddlSize.value;}
           if(chkBox != null && hiddenSizectrl != null)
             {
               if(hiddenSizectrl.value != "0")
                 {
                   chkBox.checked = true;
                    if( hiddenItemSelect != null)
                      {hiddenItemSelect.value = true;}
                       if(ddlQty !=  null)
                        {ddlQty.value = "1";}
       }}}}
 
function SetSizeDropdownDefaultValues(sizedropdownId,qtyDropdownId)
    {
        var sizeDropdown = document.getElementById(sizedropdownId);        
        var quantityDropdown  = document.getElementById(qtyDropdownId); 
        if(sizeDropdown.length == 2)
        { 
            //remove the default "select size" option if only one size and one color available
            sizeDropdown.remove(0);           
           
        }
        quantityDropdown.selectedIndex=1;
    }
     //Helper function to populate color options  for product
    ////sample color option "***15840281|0||1190|One Size|LINEN|$12.99|B***15840283|0||1190|One Size|RUSSET|$12.99|B"
    
     function FillColorDropdownForProduct(colordropdownId,selectedSize,hidSizeValueID)
     {        
        //get color dropdown refernce
        
        var colorDropdown = document.getElementById(colordropdownId);          
        var hidsize = document.getElementById(hidSizeValueID);
         
        if(colorDropdown == null)
        {
            return;
        }        
               
        colorDropdown.length=0;   
        colorDropdown[0] = new Option("Then, Select Color", "0");
        //if size is not yet selected add this default option
        if (selectedSize == "")
        colorDropdown[1] = new Option("Select Size First", "0");
       
        //variable to track if available color option is selected
        var selected = -1;        
        //split the selectedSize option value, it has all the available colors seperated by ***    
        //sample color option "***15840281|0||1190|One Size|LINEN|$12.99|B***15840283|0||1190|One Size|RUSSET|$12.99|B"
        var colorOptions = selectedSize.split("***");                   
       if(colorOptions.length > 0)
       {                              
            for(var index =1; index<colorOptions.length; index++)
            {               
                var optionvalues = colorOptions[index].split("|");                  
                if(optionvalues.length > 0)
                {                   
                    var colorDesc = optionvalues[5];
                    var price = optionvalues[6];
                    var displayOption = colorDesc +" "+price;
                    var newOption = new Option(displayOption, colorOptions[index]);                  
                    colorDropdown[index] = newOption;
                    if(colorOptions[index] == hidsize.value)
                    {                        
                        newOption.selected = true;  
                         selected=1; 		   
                    }
                    //if only one color option is available for the selected size, select that color by default                    
                    if(colorOptions.length ==2)
		            { 
		              newOption.selected = true;  
		              //remove the default option		              
		              colorDropdown.remove(0);		              	             		               
		              hidsize.value = 	colorOptions[1];	
		               //set the tracking variable to 1		                
		                selected=1; 	
		            }
		          
                 }
            }            
            //if no color option is selected reset the hidden variable
             if( selected == -1)
	        {
	            hidsize.value = "0";
    	        
	        }     
       }              
     }
     
 function OnOutfitSubItemSelectionChanged(chkId,hdId )
    { 
         var chkBox = document.getElementById(chkId);
         var hiddenctrl = document.getElementById(hdId);
         
         if(chkBox != null && hiddenctrl != null)
            {hiddenctrl.value = chkBox.checked;}
    }
    
	function ShowPopUPWindow( href )
	{
	    var x = window.open(
	            href,
	            'newwin', 
	            'left=20,top=20,width=580,height=500,menubar=no,toolbar=no,scrollbars=yes,resizable=no,location=no,status=yes '
	            ); 
                x.focus(); 
 }
	function displayMonogramDetail( addmonigramid, monogramdDetailID )
      {
        var checkbox = document.getElementById(addmonigramid);
        var monogramDetail = document.getElementById(monogramdDetailID);
        monogramDetail.style.display = checkbox.checked?"inline":"none";
      }
    
    function OnGiftCardAddMessageSelectionChanged(chkId,hdId,txtSender,txtRecipient,txtMessage)
    { 
         var chkBox = document.getElementById(chkId);
         var hiddenctrl = document.getElementById(hdId);
         var txtSenderCtrl = document.getElementById(txtSender);
         var txtRecipientCtrl = document.getElementById(txtRecipient);
         var txtMessageCtrl = document.getElementById(txtMessage);
         
         if(chkBox != null && hiddenctrl != null)
         {
           hiddenctrl.value = chkBox.checked;
           if(!chkBox.checked)
           {
             if(txtSenderCtrl != null)
                {txtSenderCtrl.value ="";}
             if(txtRecipientCtrl != null)
                {txtRecipientCtrl.value ="";}
             if(txtMessageCtrl != null)
                {txtMessageCtrl.value ="";}       
      }}}

function SetState(textareaId,hdId, chkId)
    { 
        var chkBox = document.getElementById(chkId);
        var hiddenctrl = document.getElementById(hdId);
        var txtCtrl = document.getElementById(textareaId);
          
          if(chkBox != null && hiddenctrl != null && txtCtrl != null)
          {  
                if(!txtCtrl.checked)
                {
                chkBox.checked = true;
                hiddenctrl.value = 'true';
                }
                else
                {
                chkBox.checked = false;
                hiddenctrl.value = 'false';
                }
            }
    }

//////////////////////////////////////End of Products ////////////////////////////////////////////////

////////////////////////////////////////Start of Zoom swatch /////////////////////////////////////////
  function SwitchMenu(obj,imgPath)
{
    var zoomimage = document.getElementById(obj);
    
    if( zoomimage!=null && imgPath !=null && imgPath.length > 1)
    {
        zoomimage.style.visibility  = 'visible'; 
        zoomimage.src=imgPath;
    }
    else
    {zoomimage.style.visibility  = 'hidden';} 
 }
////////////////////////////////////////End of Zoom Swatch //////////////////////////////////////////
/// Tabs ////////////////////////////////////////////////////////////////////////////////////////////
		$(function () {
			var tabContainers = $('div.tabs > div');
			tabContainers.hide().filter(':first').show();
 			  $('div.tabs ul.tabNavigation a').click(function () {
				tabContainers.hide();
				tabContainers.filter(this.hash).show();
			  	 $('div.tabs ul.tabNavigation a').removeClass('selected');
				 $(this).addClass('selected');
				return false;
			});
		});		
/// [END] Tabs /////////////////////////////////////////////////////////////////////////////////////	
/// CR /////////////////////////////////////////////////////////////////////////////////////////////
   function showTabWithScroll(tab1) {
       scrollWindow();
     $('div.tabs ul.tabNavigation a').removeClass('selected');      
     $('#openCR').addClass('selected');
     $("a#openCR:first").click();} 
/// [END] CR ///////////////////////////////////////////////////////////////////////////////////////
/**** PREVIOUSLY VIEWED PRODUCTS *********************************************************/
/** [PVP] Setup **************************************************************************/
function PrevViewedSetup(){
    // Setup Item Count (Don't Count the Controller List Item)
    var pv_item_count = $('ul.pv_items li').length - 1;
    
    if(pv_item_count >= 1){
        // Update 'View All' Link Item Count
        $('#pv_viewall').html('View All (' + pv_item_count + ')');
        // Set The Controller To Open
        $('#pv_display_ctrl').addClass('open');
        // Show The List
        PrevViewedShow();
     }
     
    // Get Previously Viewed Display State From Cookie
    var state = PrevViewedCookieGetState('PreviousViewedProductsState');
    if(state == 'undefined')
        state = true;
    // Set Previously Viewed Display Based On Cookie
    PrevViewedCookieCtrl(state);
}
/** [PVP] Show ***************************************************************************/
function PrevViewedShow(){
    // Show The List
    $('#prev_viewed').css('visibility', 'visible');
}
/** [PVP] Hide ***************************************************************************/
function PrevViewedHide(){
    // Hide The List
    $('#prev_viewed').css('display', 'none');
    // Remove Body Min-Width 
    $('body').css('min-width', '0');   
    $('#container').css('display', 'block');  
    $('#RM_UniversalBrandConnection_Header').css('display', 'block');  
}
/** [PVP] Justify Alignment for low resolution *******************************************/
function AlignLeft(){
    $('#container').css('float', 'left');     
    $('#RM_UniversalBrandConnection_Header').css('float', 'left');     
}
/** [PVP] Display Controller *************************************************************/
function PrevViewedCtrl(){
	if($('#pv_display_ctrl').attr('class') == 'open'){
		// Collapse Previously Viewed Content
		PrevViewedCtrlCollapse();
		// Set Display State Cookie (Closed)
		PrevViewedCookieSetState(false);
	} 
	else if($('#pv_display_ctrl').attr('class') == 'closed'){
        // Expand Previously Viewed Content
		PrevViewedCtrlExpand();
		// Set Display State Cookie (Open)
		PrevViewedCookieSetState(true);
	}
}
/** [PVP] Show Display *******************************************************************/
function PrevViewedCtrlShow(){
    // Enable Display
    $('#prev_viewed .content').css('display', 'block');
	// Change Display Controller Icon
	$('#pv_display_ctrl').removeClass('closed');
	$('#pv_display_ctrl').addClass('open');
	// Manually Change Controller Icon for IE6
	if($.browser.msie && $.browser.version.substr(0,1) < 7)
		$('#pv_display_ctrl').css('background-position', 'top left');
}
/** [PVP] Hide Display *******************************************************************/
function PrevViewedCtrlHide(){
    // Disable Display
    $('#prev_viewed .content').css('display', 'none');
	// Change Display Controller Icon
	$('#pv_display_ctrl').removeClass('open');
	$('#pv_display_ctrl').addClass('closed');
	// Manually Change Controller Icon for IE6
	if ($.browser.msie && $.browser.version.substr(0,1)<7)
		$('#pv_display_ctrl').css('background-position', 'top right');
}
/** [PVP] Expand Display *****************************************************************/
function PrevViewedCtrlExpand(){
    $('#prev_viewed .content').slideDown('normal');
	// Change Display Controller Icon
	$('#pv_display_ctrl').removeClass('closed');
	$('#pv_display_ctrl').addClass('open');
	// Manually Change Controller Icon for IE6
	if($.browser.msie && $.browser.version.substr(0,1) < 7)
		$('#pv_display_ctrl').css('background-position', 'top left');
}
/** [PVP] Collapse Display ***************************************************************/
function PrevViewedCtrlCollapse(){
	$('#prev_viewed .content').slideUp('normal');
	// Change Display Controller Icon
	$('#pv_display_ctrl').removeClass('open');
	$('#pv_display_ctrl').addClass('closed');
	// Manually Change Controller Icon for IE6
	if ($.browser.msie && $.browser.version.substr(0,1)<7)
		$('#pv_display_ctrl').css('background-position', 'top right');
}
/** [PVP] Cookie Controller **************************************************************/
function PrevViewedCookieCtrl(value){
	if(value=='false') // Hide Previously Viewed Content
		PrevViewedCtrlHide();
	else if(value=='true') // Show Previously Viewed Content
		PrevViewedCtrlShow();
}
/** [PVP] Set Cookie State ***************************************************************/
function PrevViewedCookieSetState(pvpState, path, domain, secure){
    var cookieName = 'PreviousViewedProductsState';
    var today = new Date();
    var thisCookie = cookieName + "=" + pvpState +
	((path) ? "; path=" + path :"; path=/") +
	((domain) ? "; domain=" + domain : "") +
	((secure) ? "; secure" : "");
	document.cookie = thisCookie;
}
/** [PVP] Get Cookie State ***************************************************************/
function PrevViewedCookieGetState(name){
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen){
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg)
		return getCookieVal (j);
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) break;
	}
	return null;
}
/**** [END] PREVIOUSLY VIEWED PRODUCTS ***************************************************/
/**** Add to Basket Script ***************************************************************/
 function ShowBagAgain(content) {
   var duration = 2000 ;
   var target = '.placeholderDropdown' ;
   if(IE6) {
     $(target).css('display', 'block');
     $(target).html('<div class="bg_load"><p class="loadPop"><span class="display">Loading...</span></p></div>');
     $(target).html(content);           
     $(".closeBag").click(
        function() {
        $(".placeholderDropdown").css('display', 'none');
     });
   }  else {
     $(target).fadeIn('slow').fadeTo(duration, 1).fadeOut('slow'); 
     $(target).html('<div class="bg_load"><p class="loadPop"><span class="display">Loading...</span></p></div>');
     $(target).html(content);
 }}
/**** [END] Add to Basket Script *********************************************************/
/**** Report to omniture on click of Sizing tab ******************************************/
function SetSizingOmniture() {
    ResetOmnitureOldValue();
    var s = s_gi(s_account);
    s.pageName = 'US:KS:Product_Detail_Sizing_Tab';
    s.linkTrackVars = 'events,prop24,eVar73';
    s.linkTrackEvents = 'event51';
    s.prop24 = "Sizing tab";
    s.events = 'event51';
    s.eVar73 = 'PDP Sizing Tab';
    s.tl(true, 'o', 'Sizing tab');
    s.prop24 = "";
    s.events = "";
}
/**** [END] Report to omniture on click of Sizing tab ************************************/

function SetTabOmniture(tab) {
    ResetOmnitureOldValue();
    var s = s_gi(s_account);
    s.linkTrackVars = 'prop24';
    s.prop24 = tab;
    s.tl(true, 'o', 'PDP TAB');
    s.prop24 = "";
}

function ResetOmnitureOldValue() {
    s.prop5 = "";
    s.prop6 = "";
    s.prop7 = "";
    s.prop11 = "";
    s.prop12 = "";
    s.prop16 = "";
    s.prop17 = "";
    s.prop40 = "";
    s.eVar1 = "";
    s.eVar2 = "";
    s.eVar3 = "";
    s.eVar5 = "";
    s.eVar37 = "";
    s.eVar57 = "";
    s.eVar58 = "";
    s.products = "";
    s.prop24 = "";
    s.events = "";
    s.eVar73 = "";
}
