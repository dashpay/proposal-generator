var Bitcore = require('@anonymousbitcoin/anoncore-lib');

var socket;
var paymentCycle;

var mainnetProvider = 'http://texplorer.anonfork.io/';
var mainnetPrefix = 'insight-api-anon';

var testnetProvider = 'http://texplorer.anonfork.io/';
var testnetPrefix = 'insight-api-anon';

var init = function(network, provider, prefix) {
    var gov = new Bitcore.GovObject.Proposal();
    gov.network = network || 'mainnet';

    paymentCycle = new PaymentCycle(gov, provider, prefix);

    socket = io(provider);

    socket.on('connect', function() {
        socket.emit('subscribe', 'inv');
        console.log("socket.io initialized...");
    });

    socket.on('disconnect', function() {
        console.log('connection lost');
    });

    return gov;
};

var updateTotal = function() {
    paymentCycle.selectedPeriods = $('#end_epoch').find(':selected').data('index');

    var payment_amount = parseFloat($('#payment_amount').val());
    if (isNaN(payment_amount)) payment_amount = 0;

    var periods = parseInt((paymentCycle.selectedPeriods+1)-paymentCycle.selectedStartIndex);

    var label = $('#end_epoch').find(':selected').data('label');

    $('#total_amount').text(payment_amount * periods);
    $('#total_amount_due').text(" with a final payment on " + label);
};

$(document).ready(function() {

    var gov = init('mainnet', mainnetProvider, mainnetPrefix); // default network;

    $('#mainnet').change(function() { gov = init('mainnet', mainnetProvider, mainnetPrefix); });
    $('#testnet').change(function() { gov = init('testnet', testnetProvider, testnetPrefix); });

    $('#start_epoch').change(function() {
        paymentCycle.selectedStartIndex = $('#start_epoch').find(':selected').data('index');
        paymentCycle.updateEndEpoch();

        updateTotal();
    });

    $('#end_epoch').change(function() {
        updateTotal();
    });
    
    $('#payment_amount').on('input',function(){
      //As of now, core doesn't handle comma, but handle dots. Therefore we change it to the user.
      var payment_amount_value = $('#payment_amount').val();
      $('#payment_amount').val(payment_amount_value.replace(/,/g, '.'));
    });

    $('#payment_amount').change(function() {
        updateTotal();
    });

    $("#time").val(Math.floor((new Date).getTime() / 1000));

    $('#prepareProposal').click(function() {
        copyToClipboard($(this).attr('id'));
    });

    $('#submitProposal').click(function() {
        copyToClipboard($(this).attr('id'));
    });

    $('#feeTxid').focus(function() {
        if ($(this).hasClass('validationError')) {
            $(this).val('');
        }
        $(this).removeClass('validationError');
    });

    $('.createProposal input').focus(function() {
        if ($(this).hasClass('validationError')) {
            $(this).val('');
        }
        $(this).removeClass('validationError');
    });

    $('#btnPrepare').click(function() {

        var proposal = new ProposalGenerator(gov);

        var validProposal = proposal.validate();

        if (validProposal) {
            document.getElementById('step_two').click();
            $('#step_two').removeClass('hidden');
            document.getElementsByClassName('progress-bar')[0].style.width = "50%";
            document.getElementsByClassName('progress-bar')[0].innerText = "Generated wallet commands";
            $('#network_toggle').addClass('hidden');

            proposal.walletCommands();

            // transactionListener(proposal);

            $('#btnEdit').click(function() {
                proposal.createProposal();
            });

            $('#btnNew').click(function() {
                proposal.resetProposal();
                $('#network_toggle').removeClass('hidden');

                $('#step_two').addClass('hidden');
                $('#step_three').addClass('hidden');
                $('#step_four').addClass('hidden');
                document.getElementsByClassName('progress-bar')[0].style.width = "25%";
                document.getElementsByClassName('progress-bar')[0].innerText = "Create Proposal";
            });
        }
    });

    $('#feeTxid').on('input', function() {

        var proposal = new ProposalGenerator(gov);

        var transaction = $(this).val().trim();
        var txListener = new TXListener(socket, paymentCycle.provider, paymentCycle.prefix, transaction);

        // check if tx exists in insight
        txListener.getTx(function(err, res) {
            if(err) {
                console.log("Error:", err);
                if(err == 404) {
                    $('#feeTxid').addClass('validationError');
                    $('#feeTxid').val('Transaction ID not found');
                    $('#error_modal').modal('show');
                    $('#error_text').text('Proposal transaction ID not found');
                } else if (err == 400) {
                    $('#feeTxid').addClass('validationError');
                    $('#feeTxid').val('Please paste a valid transaction ID');
                    $('#error_modal').modal('show');
                    $('#error_text').text('Please paste a valid transaction ID');
                }

            }
            if(res) {
                console.log("Response:", res);

        //         transaction exists, proceed to step three
                document.getElementById('step_three').click();
                $('#step_three').removeClass('hidden');
                document.getElementsByClassName('progress-bar')[0].style.width = "75%";
                document.getElementsByClassName('progress-bar')[0].innerText = "Awaiting transaction confirmation";

                $('#walletCommandsProgress').removeClass('hidden'); // probably a better way to do this....
                $("#progressbar").progressbar({value: 0}); // TXListener will bump this along as confirmations occur

                txListener.blockheight = 19//res.blockheight;
                txListener.confirmations = 10//res.confirmations;

                txListener.initSocket(function() {
                    $('#walletCommandsSubmit').removeClass('hidden');
                    document.getElementById('step_four').click();
                    $('#step_four').removeClass('hidden');
                    document.getElementsByClassName('progress-bar')[0].style.width = "100%";
                    document.getElementsByClassName('progress-bar')[0].innerText = "Proposal ready for submission";
                    console.log($('#feeTxid').val().trim());
                    var submitCommand = "gobject submit " + $('#parentHash').val() + " " + $('#revision').val() + " " + $('#time').val() + " " + proposal.gov.serialize() + " " + $('#feeTxid').val().trim();
                    console.log(submitCommand);
                    $('textarea#submitProposal').val(submitCommand);
                }); //  callback issued after tx confirmations >= 6

            }
        });
    });
});
