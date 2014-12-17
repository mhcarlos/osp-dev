// by Pavel Goldin; updated 12.12.11 by M. Fletcher (IE issues)

// var $j = jQuery.noConflict();
var browserNameID = navigator.appName;


//start of the plugin*******************************************************************************

$(document).ready(function () {
    zoomPreload();
});

function zoomPreload() {
    $('.zoomLink').each(function () {
        var parent = this;
        $(this).children('img').load(function () {
            zoomPreloadInit(parent);
        });
    });
}
//the end*******************************************************************************************
function zoomPreloadInit(initElObj) {

    // initial settings_________________
    var options = {
        loadingImg: "http://images.plussizetech.com/images/site_images/mastersite/picto_loading.gif"
    };
    var zoomerInitialized = false;
    //End of initial settings___________

    //OBJECTS________________________________________________	
    var zoomerEL = $(initElObj);
    var lense = document.createElement('span');
    var zoomContainer = document.createElement('div');
    var zoomContainerImg = document.createElement('img');

    var smallIMG = {};
    var bigIMG = {};
    var img_main = zoomerEL.find('img');
    var zoomStageConteiner = $(zoomContainer);
    var zoomer_offset;

    var waitingImageContainer;
    var nozoomContainer;
    var zoomError = false;
    var waitingImageIcon;
    var IE6Cover = null;

    var imgProportion;
    var lenseWidth;
    var lenseHeight;
    var waitingImageFlag = false;
    var MouseOverFlag = false;
    var mouseX = 0;
    var mouseY = 0;
    //END OBJECTS____________________________________________

    //main image container css setup
    zoomerEL.css({ position: 'relative',
        margin: '0px',
        padding: '0px',
        display: 'block'
    });


    bigIMG = {
        src: zoomerEL.attr('href'),
        loaded: false,
        urlChanged: false
    };

    var imageKeeperObj = document.createElement('div');

    function imageKeeper(imgUrl) {

        var imageFound = false;
        var imagesArray = imageKeeperObj.getElementsByTagName('img');

        for (var i = 0; i < imagesArray.length; i++) {
            if (imagesArray[i].src == imgUrl) {
                imageFound = true;

                return imagesArray[i].src;
                break;
            } else {
                imageFound = false;
            }
        }
        if (imageFound == false) {

            //write new image
            var imageObj = document.createElement('img');
            imageObj.src = imgUrl;
            $(imageKeeperObj).append(imageObj);
            return null;
        }

    }



    function Loader(elUrl) {

        if (nozoomContainer != undefined) {
            if ($(nozoomContainer).css('display') == 'none') {
                //reinit zoom for exidental errors temporary turned down 
                //zoomError = false;
            }

        }
        if ((elUrl != "") && (elUrl != undefined)) {
            var keeperImg = imageKeeper(elUrl);

            if (keeperImg == null) {

                if (!waitingImageFlag) {

                    waitingImageContainer = document.createElement("div");
                    $(waitingImageContainer)
								.css({
								    width: '100px',
								    height: '100px',
								    position: 'absolute',
								    top: "145px",
								    left: "85px",
								    border: '1px solid #666',
								    backgroundColor: "#fff",
								    opacity: "0.4",
								    backgroundImage: "url(" + options.loadingImg + ")",
								    backgroundRepeat: "no-repeat",
								    backgroundPosition: "41px 40px"
								});
                    if ($.browser.msie && $.browser.version < 9) {
                        $(waitingImageContainer).css({ opacity: "1" });
                    }
                    zoomerEL.append(waitingImageContainer);
                    waitingImageIcon = document.createElement("img");
                    waitingImageFlag = true;
                }



                var loaderImg = document.createElement("img");

                $(loaderImg)
						.appendTo("body")
						.css('visibility', 'hidden');

                $(loaderImg).load(function () {
                    this.style.display = 'block';

                    bigIMG.width = Math.round($(this).width());
                    bigIMG.height = Math.round($(this).height());

                    this.style.display = 'none';
                    bigIMG.loaded = true;
                    $(loaderImg).remove();
                    $(waitingImageContainer).remove();
                    waitingImageFlag = false;
                    zoomError = false;
                    initZoom();
                });
                $(loaderImg).error(function () {
                    $(loaderImg).remove();
                    $(waitingImageContainer).remove();
                    waitingImageFlag = false;
                    BigImgError();
                });

                loaderImg.src = elUrl;
            } else {
                zoomContainerImg.src = keeperImg;
                var secondError = false;
                $(zoomContainerImg).error(function () {
                    $(loaderImg).remove();
                    $(waitingImageContainer).remove();
                    waitingImageFlag = false;
                    BigImgError();
                    secondError = true;

                });
                if (secondError == false) {

                    bigIMG.loaded = true;
                    initZoom();
                } else {
                    return;
                }

            }

        } else {
            $(loaderImg).remove();
            $(waitingImageContainer).remove();
            waitingImageFlag = false;
            BigImgError();
        }


    }


    function BigImgError() {

        if (!zoomError) {
            if (nozoomContainer == undefined) {

                nozoomContainer = document.createElement("div");
                var nozoomspan = document.createElement("div");
                $(nozoomContainer).append(nozoomspan);
                nozoomspan.innerHTML = "We're sorry!<br/>Zoom is currently<br/>not available.";
                $(nozoomspan)
                        .css({
                            margin: "11px 14px 14px 14px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            textAlign: "center"
                        });
                $(nozoomContainer)
					    .css({
					        width: '148px',
					        height: '72px',
					        position: 'absolute',
					        top: "159px",
					        left: "61px",
					        border: '0px',
					        backgroundImage: 'url(//secureimages.plussizetech.com/images/site_images/womanwithin/zoom_lens_background.png)'
					    });
                zoomerEL.append(nozoomContainer);
            } else {
                $(nozoomContainer).css('display', 'block');

            }

            zoomError = true;
        }
        return;
    }

    var initStarted = false;
    // initialization___________________________________________________________________________________
    function initZoom() {

        if (!initStarted) {
            if (bigIMG.urlChanged == true) {
                bigIMG.urlChanged = false;
                zoomError = false;

            }
            initStarted = true;
            //main img dimentions
            smallIMG = {
                width: Math.round(img_main.width()),
                height: Math.round(img_main.height())
            };
            zoomer_offset = img_main.offset();



            if (zoomerEL.children().length < 2) {
                zoomerEL.append(lense);
            }
            zoomContainer.style.display = "none";

            $('body').append(zoomContainer);


            Loader(bigIMG.src);
            zoomContainerImg.src = bigIMG.src;
        }

        if (bigIMG.loaded) {

            imgProportion = Math.round(bigIMG.width / smallIMG.width);
            lenseWidth = Math.round(smallIMG.width / imgProportion);
            lenseHeight = Math.round(smallIMG.height / imgProportion);

            //lense OBJ______________________________________________
            lense.style.width = lenseWidth + 'px';
            lense.style.border = "1px solid #000";
            lense.style.height = lenseHeight + 'px';
            lense.style.position = "absolute";
            lense.style.top = "0px";
            lense.style.left = "0px";
            if (browserNameID == "Microsoft Internet Explorer") {
                // lense.style.filter = "alpha(opacity=40)" caused the parent page background to show.
                lense.style.backgroundImage = "url(//secureimages.plussizetech.com/images/site_images/womanwithin/zoom_lens_background.png)";
                lense.style.border = "1px solid #666";
            } else {
                lense.style.backgroundColor = "#ccc";
                lense.style.opacity = "0.4";
            }
            lense.style.cursor = "crosshair";
            lense.style.display = "none";
            //end of lense OBJ_______________________________________

            //Zoom stage conteiner OBJ_______________________________
            zoomStageConteiner.css({

                width: smallIMG.width + 'px',  //can be chaged to other size
                height: smallIMG.height + 'px', //can be chaged to other size
                overflow: 'hidden',
                position: 'absolute',
                zIndex: '9999',
                top: zoomer_offset.top + "px",
                left: zoomer_offset.left + smallIMG.width + 10 + 'px', //10 is extra padding
                border: '1px solid #ccc'
            });

            if (browserNameID == "Microsoft Internet Explorer") {
                IE6Cover = document.createElement("iframe");
                $(IE6Cover).css({
                    width: smallIMG.width + 'px',  //can be chaged to other size
                    height: smallIMG.height + 'px', //can be chaged to other size
                    boreder: '0px',
                    position: 'absolute',
                    top: zoomer_offset.top + "px",
                    left: zoomer_offset.left + smallIMG.width + 10 + 'px',
                    zIndex: '800',
                    display: 'none'

                });

                $('body').append(IE6Cover);
            }

            $(zoomContainerImg).css({
                position: 'absolute',
                zIndex: '999'
            });
            zoomStageConteiner.append(zoomContainerImg);

            if ((MouseOverFlag) && (!zoomError)) {
                zoomContainer.style.display = "block";
                lense.style.display = "block";
                //following bolck is to fix position when mous even is passive
                var BigLenseX = Math.round((mouseX - lenseWidth / 2) * imgProportion);
                var BigLenseY = Math.round((mouseY - lenseHeight / 2) * imgProportion);
                var smallLenseX = Math.round(mouseX - lenseWidth / 2);
                var smallLenseY = Math.round(mouseY - lenseHeight / 2);
                if ((mouseX > lenseWidth / 2) && (mouseX < smallIMG.width - lenseWidth / 2)) {

                    $(zoomContainerImg).css('left', '-' + BigLenseX + 'px');
                    $(lense).css('left', +smallLenseX + 'px');

                } else {
                    if (mouseX <= lenseWidth / 2) {
                        $(zoomContainerImg).css('left', '0px');
                        $(lense).css('left', '0px');
                    }
                    if (mouseX >= smallIMG.width - lenseWidth / 2) {
                        $(zoomContainerImg).css('left', '-' + (bigIMG.width - lenseWidth * imgProportion) + 'px');
                        $(lense).css('left', +smallIMG.width - lenseWidth + 'px');
                    }

                }
                if ((mouseY > lenseHeight / 2) && (mouseY < smallIMG.height - lenseWidth / 2)) {
                    $(zoomContainerImg).css('top', '-' + BigLenseY + 'px');
                    $(lense).css('top', +smallLenseY + 'px')
                } else {
                    if (mouseY <= lenseHeight / 2) {
                        $(zoomContainerImg).css('top', '-0px');
                        $(lense).css('top', '0px');
                    }
                    if (mouseY >= smallIMG.height - lenseWidth / 2) {
                        $(zoomContainerImg).css('top', '-' + (bigIMG.height - lenseHeight * imgProportion) + 'px');
                        $(lense).css('top', +smallIMG.height - lenseHeight + 'px');
                    }

                }
                //END following bolck is to fix position when mous even is passive
            } else {
                zoomContainer.style.display = "none";
                lense.style.display = "none";
            }

            //END of Zoom stage conteiner OBJ_________________________
            zoomerInitialized = true;
        }

    }
    //END of initialization_____________________________________________________________________________

    ZoomReInit = function () {
        alert('inint');
        initZoom();
    };
    //codebase

    // mouse coordinates and zoom positioning===========================================================
    zoomerEL.mousemove(function (e) {
        if (zoomer_offset != undefined) {

            mouseX = Math.round(e.pageX - zoomer_offset.left);
            mouseY = Math.round(e.pageY - zoomer_offset.top);


        }
        if ((zoomerEL.attr('href') == bigIMG.src) && (!zoomError)) {

            if (zoomerInitialized) {
                if (IE6Cover != null) {
                    IE6Cover.style.display = "block";
                }
                zoomContainer.style.display = "block";
                lense.style.display = "block";


                var BigLenseX = Math.round((mouseX - lenseWidth / 2) * imgProportion);
                var BigLenseY = Math.round((mouseY - lenseHeight / 2) * imgProportion);
                var smallLenseX = Math.round(mouseX - lenseWidth / 2);
                var smallLenseY = Math.round(mouseY - lenseHeight / 2);
                if ((mouseX > lenseWidth / 2) && (mouseX < smallIMG.width - lenseWidth / 2)) {

                    $(zoomContainerImg).css('left', '-' + BigLenseX + 'px');
                    $(lense).css('left', +smallLenseX + 'px');

                } else {
                    if (mouseX <= lenseWidth / 2) {
                        $(zoomContainerImg).css('left', '0px');
                        $(lense).css('left', '0px');
                    }
                    if (mouseX >= smallIMG.width - lenseWidth / 2) {
                        $(zoomContainerImg).css('left', '-' + (bigIMG.width - lenseWidth * imgProportion) + 'px');
                        $(lense).css('left', +smallIMG.width - lenseWidth + 'px');
                    }

                }
                if ((mouseY > lenseHeight / 2) && (mouseY < smallIMG.height - lenseWidth / 2)) {
                    $(zoomContainerImg).css('top', '-' + BigLenseY + 'px');
                    $(lense).css('top', +smallLenseY + 'px')
                } else {
                    if (mouseY <= lenseHeight / 2) {
                        $(zoomContainerImg).css('top', '-0px');
                        $(lense).css('top', '0px');
                    }
                    if (mouseY >= smallIMG.height - lenseWidth / 2) {
                        $(zoomContainerImg).css('top', '-' + (bigIMG.height - lenseHeight * imgProportion) + 'px');
                        $(lense).css('top', +smallIMG.height - lenseHeight + 'px');
                    }

                }

            } else {

                initZoom();
            }
        } else {
            if (zoomerEL.attr('href') != bigIMG.src) {

                bigIMG.urlChanged = true;
                bigIMG.src = zoomerEL.attr('href');
            }
            zoomerInitialized = false;
            initStarted = false;
            bigIMG.loaded = false;
            initZoom();
        }
    });
    // end of  mouse coordinates and zoom positioning===================================================


    // mouseout, in this case used hover event as recomedation fro Jquery to have it fiered only once===
    $(zoomerEL).hover(
	function () {

	    MouseOverFlag = true;

	    $('#status').html(MouseOverFlag);
	},
	function () {
	    MouseOverFlag = false;
	    $('#status').html(MouseOverFlag);
	    $(zoomContainer).fadeOut(200);
	    $(nozoomContainer).fadeOut(200); //commented due to.delay(2000).css('display', 'none');
	    lense.style.display = "none";
	    if (browserNameID == "Microsoft Internet Explorer") {
	        $(IE6Cover).css('display', 'none');
	    }
	});
    return false;
}