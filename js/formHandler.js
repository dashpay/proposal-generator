function setFormEditable(edit) {
    $('.createProposal input').each(function() {
        $(this).attr("disabled", edit);
    });
    $('.createProposal select').each(function() {
        $(this).attr("disabled", edit);
    });

    if (edit === true) {
        $('#btnPrepare').addClass('hidden');
        $('#btnEdit').removeClass('hidden');
        $('#btnEdit').removeAttr('disabled');
        $('#btnNew').removeClass('hidden');
        $('#btnNew').removeAttr('disabled');
    } else {
        $('#btnPrepare').removeClass('hidden');
        $('#btnEdit').addClass('hidden');
        $('#btnNew').addClass('hidden');
    }
}

var copyToClipboard = function(id) {
    document.getElementById(id).select();
    document.execCommand('copy');
};
