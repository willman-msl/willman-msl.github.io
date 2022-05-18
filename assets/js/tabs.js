/*
    @author Daniel Nichols
    @date August 2020
    Sets current navigation tab to selected.
*/


$(document).ready(function() {

    let currentURL = window.location.href;

    $('.masthead__menu-item a').each(function() {
        if (currentURL == (this.href)) {
            $(this).closest('li').addClass('masthead__nav-selected');
        } else {
            $(this).closest('li').removeClass('masthead__nav-selected');
        }
    });

});
