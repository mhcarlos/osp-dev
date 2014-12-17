/* main product alternate images - 02/2008, 08/2011  */


var product_alts = {
    init: function (this_slideshow, container_width, image_height, thumbs_to_display, thumb_width, thumb_padding) {
        product_alts.container_width = container_width;
        product_alts.image_height = image_height; /* only use if all site images are uniform size */
        product_alts.thumbs_to_display = thumbs_to_display;
        product_alts.thumb_width = thumb_width;
        product_alts.thumb_padding = thumb_padding;
        product_alts.main_image_params = '?wid=' + container_width + '&qlt=95&op_sharpen=1" width="' + container_width + '" />'; /* + '" height="' + image_height */
        product_alts.thumbnail_params = '?wid=' + thumb_width + '&qlt=95&op_sharpen=1" width="' + thumb_width + '" /></a>';
        product_alts.slider_limit_left = 12;
        product_alts.slide_delay = 30;   /* delay of the longest slide anim frame */

        /* navigation image locations */
        product_alts.nav_base_url = "http://images.plussizetech.com/images/site_images/ksd/";
        product_alts.prev_active = product_alts.nav_base_url + "ks_slide_show_prev.gif";
        product_alts.next_active = product_alts.nav_base_url + "ks_slide_show_next.gif";
        product_alts.prev_inactive = product_alts.nav_base_url + "ks_slide_show_prev_off.gif";
        product_alts.next_inactive = product_alts.nav_base_url + "ks_slide_show_next_off.gif";
        product_alts.slideshow_wrapper_div = "";         /* contents of the script-created slide show container */
        product_alts.placeholder = product_alts.nav_base_url + "spacer.gif";

        /* internal variables */
        product_alts.swapped = 0;            /* position in the array of clicked thumbnail    */
        product_alts.sliding = '';            /* the timeout object for a slide */
        product_alts.slide_distance = thumb_width + thumb_padding;

        product_alts.slide_travel = new Array();     /* current position during slide */
        product_alts.main_image_div = new Array();   /* html contents of the main product image's div */

        product_alts.slider_width = new Array();
        product_alts.slider_position = new Array();
        product_alts.slider_limit_right = new Array();
        product_alts.fp_slider_pos = new Array();    /* floating point position of the slider */
        product_alts.fetched = new Array(); 	        /* flag for all images loaded (only visible thumbs are loaded with the page). */

        product_alts.setup_slideshow(this_slideshow);
    },

    setup_slideshow: function (this_slideshow) {
        /* create a unique slide show for each product */
        slideshow_wrapper_div = '<div id="slideshow_' + this_slideshow + '" class="product-image-wrapper"><div id="previewPane_' + this_slideshow + '"><div id="alt_main_image_' + this_slideshow + '"><!-- placeholder --></div></div><div id="gallery-container_' + this_slideshow + '" class="gallery-container"><div id="arrow_left_' + this_slideshow + '" class="arrow_left"><a href="javascript:product_alts.slide_right(' + this_slideshow + ')"><!--<asp:Literal ID="litLeft" runat="server"></asp:Literal>--><img src="' + product_alts.prev_inactive + '" id="arrow_left_image_' + this_slideshow + '" /></a></div><div id="arrow_right_' + this_slideshow + '" class="arrow_right"><a href="javascript:product_alts.slide_left(' + this_slideshow + ')"><!--<asp:Literal ID="litRight" runat="server"></asp:Literal>--><img src="' + product_alts.next_active + '" id="arrow_right_image_' + this_slideshow + '" /></a></div><div id="slideshow_images_' + this_slideshow + '" class="slideshow_images"><div id="alt_thumbnails_' + this_slideshow + '"><!-- placeholder --></div><div class="slideEnd"></div></div></div></div><div class="clear"></div>';

        document.getElementById("slideshow_wrapper_" + this_slideshow).innerHTML = slideshow_wrapper_div;

        /* populate arrays and put the images in the page layout */
        product_alts.fetched[this_slideshow] = false;
        product_alts.slide_travel[this_slideshow] = product_alts.slide_distance;
        product_alts.fp_slider_pos[this_slideshow] = 12;
        product_alts.refresh_main_image(this_slideshow);
        product_alts.setup_thumbnails(this_slideshow);
    },

    setup_thumbnails: function (this_slideshow) {
        /* hide slider navigation and kill fetching of additional thumbs if not necessary. */
        if (product_images[this_slideshow].length < product_alts.thumbs_to_display + 2) {
            document.getElementById("arrow_left_" + this_slideshow).style.visibility = "hidden";
            document.getElementById("arrow_right_" + this_slideshow).style.visibility = "hidden";
            product_alts.fetched[this_slideshow] = true;
        }

        if (product_images[this_slideshow].length < 2) {
            document.getElementById("gallery-container_" + this_slideshow).style.display = "none";
            product_alts.fetched[this_slideshow] = true;
        }

        /* size and position the thumbnail container */
        product_alts.slider_width = (product_images[this_slideshow].length - 1) * (product_alts.thumb_width + product_alts.thumb_padding);
        document.getElementById("slideshow_images_" + this_slideshow).style.width = product_alts.slider_width + "px";
        product_alts.slider_position[this_slideshow] = product_alts.slider_limit_left;
        product_alts.slider_limit_right[this_slideshow] = product_alts.container_width - product_alts.slider_width - product_alts.thumb_width;

        product_alts.set_slider_position(this_slideshow);
        product_alts.refresh_thumbnails(this_slideshow);
    },

    get_slider_position: function (this_slideshow) {
        /* get the thumbs container's position without the 'px' */
        product_alts.slider_position[this_slideshow] = product_alts.fp_slider_pos[this_slideshow];
    },

    set_slider_position: function (this_slideshow) {
        /* make the thumbs container's position css-friendly */
        product_alts.slider_position[this_slideshow] = product_alts.fp_slider_pos[this_slideshow] + "px";
        document.getElementById("slideshow_images_" + this_slideshow).style.left = product_alts.slider_position[this_slideshow];
    },

    slide_left: function (this_slideshow) {
        /* with the first slide, load any unfetched thumbnails */
        if (!product_alts.fetched[this_slideshow]) {
            product_alts.fetched[this_slideshow] = true;
            product_alts.refresh_thumbnails(this_slideshow);
        }
        product_alts.get_slider_position(this_slideshow);

        /* if the thumbs container is in range, and no slide is in progress, go! */
        if ((product_alts.slider_position[this_slideshow] >= product_alts.slider_limit_right[this_slideshow] + product_alts.slide_distance) && product_alts.slide_travel[this_slideshow] == product_alts.slide_distance) {
            /* if we can slide, we can slide back. turn the other arrow on. */
            document.getElementById("arrow_left_image_" + this_slideshow).src = product_alts.prev_active;
            product_alts.sliding_left(this_slideshow);
        }
    },

    sliding_left: function (this_slideshow) {
        product_alts.get_slider_position(this_slideshow);

        /* find the distance to slide */
        if (product_alts.slide_travel[this_slideshow] < .3) {
            /* the slider is close enough, so finish the slide and reset. */
            product_alts.fp_slider_pos[this_slideshow] -= product_alts.slide_travel[this_slideshow];
            product_alts.set_slider_position(this_slideshow);
            product_alts.slide_travel[this_slideshow] = product_alts.slide_distance;
        } else {
            /* continue the slide */
            product_alts.slide_travel[this_slideshow] *= .5;
            product_alts.fp_slider_pos[this_slideshow] -= product_alts.slide_travel[this_slideshow];
            product_alts.set_slider_position(this_slideshow);
            product_alts.sliding = setTimeout("product_alts.sliding_left(" + this_slideshow + ")", product_alts.slide_delay);
        }

        /* if no more sliding can be done, dim the control */
        product_alts.get_slider_position(this_slideshow);
        if (product_alts.fp_slider_pos[this_slideshow] <= product_alts.slider_limit_right[this_slideshow] + product_alts.slide_distance) {
            document.getElementById("arrow_right_image_" + this_slideshow).src = product_alts.next_inactive;
        }
    },

    slide_right: function (this_slideshow) {
        product_alts.get_slider_position(this_slideshow);
        /* if the thumbs container is in range, and no slide is in progress, go! */
        if ((product_alts.slider_position[this_slideshow] <= product_alts.slider_limit_left - product_alts.slide_distance + 1) && product_alts.slide_travel[this_slideshow] == product_alts.slide_distance) {
            /* if we can slide, we can slide back. turn the other arrow on. */
            document.getElementById("arrow_right_image_" + this_slideshow).src = product_alts.next_active;
            product_alts.sliding_right(this_slideshow);
        }
    },

    sliding_right: function (this_slideshow) {
        product_alts.get_slider_position(this_slideshow);
        /* find the distance to slide */
        if (product_alts.slide_travel[this_slideshow] < .3) {
            /* the slider is close enough, so finish the slide and reset. */
            product_alts.fp_slider_pos[this_slideshow] += product_alts.slide_travel[this_slideshow];
            product_alts.set_slider_position(this_slideshow);
            product_alts.slide_travel[this_slideshow] = product_alts.slide_distance;
        } else {
            /* continue the slide */
            product_alts.slide_travel[this_slideshow] *= .5;
            product_alts.fp_slider_pos[this_slideshow] += product_alts.slide_travel[this_slideshow];
            product_alts.set_slider_position(this_slideshow);
            product_alts.sliding = setTimeout("product_alts.sliding_right(" + this_slideshow + ")", product_alts.slide_delay);
        }
        /* if no more sliding can be done, dim the control */
        product_alts.get_slider_position(this_slideshow);
        if (product_alts.fp_slider_pos[this_slideshow] >= product_alts.slider_limit_left - 1) {
            document.getElementById("arrow_left_image_" + this_slideshow).src = product_alts.prev_inactive;
        }
    },

    swap_alt_image: function (this_slideshow, swapped) {
        /* re-order the image array when user clicks a thumbnail. selection replaces main image. */
        var temp = product_images[this_slideshow][0];
        product_images[this_slideshow][0] = product_images[this_slideshow][swapped];
        product_images[this_slideshow][swapped] = temp;
        product_alts.refresh_main_image(this_slideshow);
        product_alts.refresh_thumbnails(this_slideshow);
    },

    refresh_main_image: function (this_slideshow) {
        /* create the new main image's source link */
        main_image_div = '<a style="position:relative; display:block;" class="zoomLink" onclick="return false;" href="' + product_images[this_slideshow][0] + '" ><img class="alt-main-image imgMain" id="Main_Image_' + this_slideshow + '" alt="' + eval("product_images_alt_tag_" + this_slideshow) + '" src="' + product_images[this_slideshow][0] + product_alts.main_image_params;
        /* replace the old main image */
        document.getElementById("alt_main_image_" + this_slideshow).innerHTML = main_image_div;
        zoomPreload(); /* updates the zoom image */
    },

    refresh_thumbnails: function (this_slideshow) {
        var thumbnails_div = "";
        /* should thumbs get fetched? or use placeholders? */
        if (product_alts.fetched[this_slideshow]) {
            /* update all thumbnails */
            for (var j = 1; j < product_images[this_slideshow].length; j++) {
                thumbnails_div += '<a href="javascript:product_alts.swap_alt_image(' + this_slideshow + ',' + j + ')">';
                thumbnails_div += '<img id="image_' + this_slideshow + '_' + j + '"alt="' + eval("product_images_alt_tag_" + this_slideshow) + '" src="' + product_images[this_slideshow][j] + product_alts.thumbnail_params;
            }
        } else {
            /* load initially visible thumbs. the rest get placeholders */
            for (var j = 1; j < product_alts.thumbs_to_display + 1; j++) {
                thumbnails_div += '<a href="javascript:product_alts.swap_alt_image(' + this_slideshow + ',' + j + ')">';
                thumbnails_div += '<img id="image_' + this_slideshow + '_' + j + '"alt="' + eval("product_images_alt_tag_" + this_slideshow) + '" src="' + product_images[this_slideshow][j] + product_alts.thumbnail_params;
            }
            /* here are those placeholders... */
            for (var j = product_alts.thumbs_to_display + 1; j < product_images[this_slideshow].length; j++) {
                thumbnails_div += '<a href="#">';
                /* need a link so styles will apply */
                thumbnails_div += '<img id="image_' + this_slideshow + '_' + j + '"alt="' + eval("product_images_alt_tag_" + this_slideshow) + '" src="' + product_alts.placeholder + product_alts.thumbnail_params;
            }
        }
        document.getElementById("alt_thumbnails_" + this_slideshow).innerHTML = thumbnails_div;
    }
}