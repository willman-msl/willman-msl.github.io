/**
 * For dynamic behavior regarding the news feed on the "About" page.
 * @author Daniel Nichols
 * @date April 2022
 */

/** Set true so only 1 news item can be expanded at once */
const NEWS_FEED_ONLY_ONE = true;

$(document).ready(function () {

    $('.news-item-title').on('click', function() {
        $(this).next('.news-item-excerpt').slideToggle(200);

        if (NEWS_FEED_ONLY_ONE) {
            $('.news-item-excerpt')
                .not($(this).next('.news-item-excerpt'))
                .hide();
        }
    });


});
