/*
    @author Daniel Nichols
    @date July 2020
    For code related to the publications.md page.
    This is loaded in the header, but after jQuery
*/

$(document).ready(function() {

    /*
        Toggles the abstract on press
    */
    $('.abstract-expand-link').on('click', function() {
        $(this).next('.abstract-expand-content').toggle();
        $(this).children('.fas').first().toggleClass('fa-caret-down fa-caret-up');
    });


    /*
        Sort the authors list alphabetically by first name.
    */
    $('#publications__author-select').html(
        $('#publications__author-select option').sort(function(a,b) {
            /* hard check to keep All at top of list */
            if (a.text == 'All')
                return -1;
            else if (b.text == 'All')
                return 1;
            return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
        })
    );


    /*
        Chosen lib. for multi-select. see here: https://harvesthq.github.io/chosen/
    */
    $('.chosen-select').chosen({
        no_results_text: 'Nothing selected'
    });

    /* Update publications list when any filter inputs change */
    $('#publications__author-select,#publications__year-select,#publications__tag-select').on('change', updateFilterAndPublications);

    /**
     * Reads the filter inputs on the sidebar and updates the publication list.
     */
    function updateFilterAndPublications(caller) {
        const authorSelectValue = $('#publications__author-select').val();
        const yearSelectValue = $('#publications__year-select').val();
        const tagSelectValue = $('#publications__tag-select').val();

        const authors = (authorSelectValue === 'All') ? null : [authorSelectValue];
        const years = (yearSelectValue === 'All') ? null : [yearSelectValue];
        const tags = (tagSelectValue.length === 0 || tagSelectValue.includes('All')) ? null : tagSelectValue;

        filterPublications(authors, years, tags);
    }


    /**
     * Filter the publications and update the list.
     * 
     * @param {[string]} authors List of authors to include. If null, include all authors.
     * @param {[string]} years List of years to include. If null, include all years.
     * @param {[string]} tags List of tags to include. If null, include all tags.
     */
    function filterPublications(authors, years, tags) {

        /* Collect all publication data */
        const pubs = JSON.parse( $(".archive").attr("data-pubs") );

        /* aggregate authors, years, and tags (build unique lists) */
        if (authors === null) authors = pubs.reduce((acc, val) => acc.concat(val.authors), []).filter((item, i, arr) => arr.indexOf(item) === i);
        if (tags === null) tags = pubs.reduce((acc, val) => acc.concat(val.tags), []).filter((item, i, arr) => arr.indexOf(item) === i);
        if (years === null) {
            years = pubs.reduce((acc, val) => acc.concat(val.date), []).filter((item, i, arr) => arr.indexOf(item) === i);
            years = years.map(x => new Date(x).getFullYear());
        }

        /* make sure all the years passed are interpreted as numbers for consistency */
        years = years.map(y => Number(y));

        /* loop through list__item elements
           - hide if (item.authors INTERSECT authors == {}) OR ...
           - show otherwise
        */
        $('.list__item').each(function(i, obj) {
            /* get metadata from data-pub attribute in tag */
            const itemData = JSON.parse($(obj).attr('data-pub'));
            itemData.date = Number((new Date(itemData.date)).getFullYear());

            if ((authors.filter(val => itemData.authors.includes(val)).length === 0) ||
                (tags.filter(val => itemData.tags.includes(val)).length === 0) ||
                (!years.includes(itemData.date))) {
                $(obj).hide();
            } else {
                $(obj).show();
            }
       });
            
    }

    /*  Handle the BibTex button being clicked. Call the showModal to display
        the bibtex content.
    */
    $('.bibtex-btn').on('click', function(e) {
        /* retrieve bibtex value */
        bibtexStr = $(e.currentTarget).attr('data-bibtex');

        /* format text */
        bibtexStr = formatBibtex(bibtexStr);

        /* show the modal */
        showModal(bibtexStr);
    });

    /*  Formats the bibtex string. Given a bibtex string of
        @desc{item1, item2, ...} this will put tabs before each item and a
        newline after the commas.
    */
    function formatBibtex(str) {
        /* split outer-most { } pair */
        begin = str.substring(0, str.indexOf('{')+1);
        middle = str.substring(str.indexOf('{')+1, str.lastIndexOf('}'));
        end = str.substring(str.lastIndexOf('}'));

        /* regex matches commas not within {}'s */
        middle = middle.replace(/,(?![^{]*\})/gm, ',\n\t');

        return begin + middle  + '\n' + end;
    }

    $('#bibtex-modal-close-btn').on('click', hideModal);

    function showModal(content) {
        $('#bibtex-modal-textarea').html(content);
        $('#bibtex-modal').show();
    }

    function hideModal() {
        $('#bibtex-modal').hide();
    }

    $('#bibtex-modal-download-btn').on('click', function() {
        downloadText($('#bibtex-modal-textarea').text());
    });

    $('#bibtex-modal-copy-btn').on('click', function() {
        $('#bibtex-copied-label').show(100).delay(4*1000).hide(100);
        copyToClipboard($('#bibtex-modal-textarea').text());
    });

    /*  Copy text to clipboard. See
        https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
        for browser support.
    */
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {}, (err) => {
            console.log('error copying bibtex to clipboard');
        });
    }

    /*  Download bib file as 'citation.bib'. Download code comes from
        https://stackoverflow.com/a/33542499/3769237.
        TODO -- This code does not work with my pop-up blocker and I have to 
                disable it. I'm not sure how to fix this or if I should.
    */
    function downloadText(text) {
        const fname = 'citation.bib';
        const data = new Blob([text], {type: 'text/plain', oneTimeOnly: true});

        if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(data, fname);
        } else {
            const anchor = window.document.createElement('a');
            anchor.href = window.URL.createObjectURL(data);
            anchor.download = fname;
            anchor.style.display = 'none';

            document.body.appendChild(anchor);
            anchor.click();        
            document.body.removeChild(anchor);
        }
    }


});
