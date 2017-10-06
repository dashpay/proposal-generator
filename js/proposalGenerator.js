function ProposalGenerator(gov) {
    this._mode = 'proposal';
    if(!gov.network) gov.network = 'livenet';

    this.gov = gov;

    // proposal basic fields
    this.gov.name = $('#name').val().trim();
    this.gov.url = $('#url').val().trim();
    this.gov.payment_address = $('#payment_address').val().trim();
    this.gov.payment_amount = $('#payment_amount').val().trim();
    this.gov.start_epoch = $('#start_epoch').val();
    this.gov.end_epoch = $('#end_epoch').val();

    // hidden elements
    this.gov.type = parseInt($('#type').val());
}

ProposalGenerator.prototype.validate = function() {
    try {
        var gov = this.gov.serialize();
    }
    catch (e) {

        switch(e.message) {

            case 'Invalid Name':
                console.log("error: invalid name");
                $('#name').addClass('validationError');
                $('#name').val("Invalid name. Please enter a 40 character alphanumeric name without spaces.");
                break;

            case 'Invalid URL':
                console.log("Error: invalid url");
                $('#url').addClass('validationError');
                $('#url').val("There is a formatting error in your URL. Did you forget the leading 'http://'?");
                break;

            case 'Invalid Payment Amount':
                console.log("Error: invalid payment amount");
                $('#payment_amount').addClass('validationError');
                // $('#payment_amount').val("Invalid payment amount.");
                break;

            case 'Invalid Timespan':
                console.log("Error: invalid timespan");
                $('#start_epoch, #end_epoch').addClass('validationError');
                break;

            case 'Invalid Start Date':
                console.log("Error: invalid start date");
                $('#start_epoch').addClass('validationError');
                break;

            case 'Invalid End Date':
                console.log("Error: invalid end date");
                $('#end_epoch').addClass('validationError');
                break;

            case 'Invalid Address':
                console.log("Error: invalid address");
                $('#payment_address').addClass('validationError');
                $('#payment_address').val("Invalid payment address.");
                break;

            case 'Invalid P2SHAddress':
                console.log("Error: invalid address - multisig not supported");
                $('#payment_address').addClass('validationError');
                $('#payment_address').val("Invalid payment address - multisig not supported.");
                break;

            default:
                console.log(e);
                break;
        }

        return false;
    }

    return true;
};

ProposalGenerator.prototype.walletCommands = function() {
    var gov = this.gov;

    var prepCommand = "gobject prepare "+$('#parentHash').val() + " " + $('#revision').val() +" " + $('#time').val() +" " + gov.serialize();
    console.log(prepCommand);
    $("textarea#prepareProposal").val(prepCommand);

    if(this._mode == 'proposal') {
        setFormEditable(true);

        $('.walletCommands#walletCommandsHeader').removeClass('hidden');
        $('.walletCommands#walletCommandsPrepare').removeClass('hidden');
        $('.walletCommands#walletCommandsTx').removeClass('hidden');
        //$('.walletCommands#walletCommandsProgress').removeClass('hidden');
        //$('.walletCommands#walletCommandsSubmit').removeClass('hidden');

        this._mode = 'command';
    }
};

ProposalGenerator.prototype.createProposal = function() {
    $('#feeTxid').val("");
    $('#submitProposal').val("");

    if(this._mode == 'command') {
        setFormEditable(false);

        $('.walletCommands#walletCommandsHeader').addClass('hidden');
        $('.walletCommands#walletCommandsPrepare').addClass('hidden');
        $('.walletCommands#walletCommandsTx').addClass('hidden');
        $('.walletCommands#walletCommandsProgress').addClass('hidden');
        $('.walletCommands#walletCommandsSubmit').addClass('hidden');

        this._mode = 'proposal';
    }
};

ProposalGenerator.prototype.resetProposal = function() {
    $('.createProposal input').each(function() {
        $(this).val('');
    });
    $("#btnEdit").val('Edit Proposal');
    $("#btnNew").val('New Proposal');
    $("#btnPrepare").val('Create Proposal');
    setFormEditable(false);
    $('.walletCommands#walletCommandsHeader').addClass('hidden');
    $('.walletCommands#walletCommandsPrepare').addClass('hidden');
    $('.walletCommands#walletCommandsTx').addClass('hidden');
    $('.walletCommands#walletCommandsProgress').addClass('hidden');
    $('.walletCommands#walletCommandsSubmit').addClass('hidden');

    this._mode = 'proposal';
};
