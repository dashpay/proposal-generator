function TXListener(socket, provider, prefix, transaction) {

    this.socket = socket;
    this.provider = provider;
    this.prefix = prefix;
    this.transaction = transaction;

    this.blockheight = null;
    this.confirmations = null;

}

TXListener.prototype.initSocket = function(cb) {
    var self = this;
    var socket = this.socket;
    var confirmations = 0;

    socket.on('block', function(data) {
        console.log('block: '+ data);

        self.getBlock(data, function(err, res) {

            if (err) console.log("error fetching block: " + data);
            //self.confirmations = (res.height - self.blockheight) + 1; // compare blockHeight against transaction blockHeight
            confirmations++;

            if (confirmations >= 6) {
              cb();
            };
            $("#progressbar").progressbar({value: ((100 / 6) * confirmations)});

            console.log('confirmations: ' + confirmations);

        });
    });

};

TXListener.prototype.getTx = function(cb) {
    var txid = this.transaction;

    var opts = {
        type: "GET",
        route: "/tx/"+txid,
        data: {
            format: "json"
        }
    };

    this._fetch(opts, cb);
};

TXListener.prototype.getBlock = function(hash, cb) {

    var opts = {
        type: "GET",
        route: "/block/"+hash,
        data: {
            format: "json"
        }
    };

    this._fetch(opts, cb);
};

TXListener.prototype._fetch = function(opts,cb) {
    var self = this;
    var provider = opts.provider || self.provider;
    var prefix = opts.prefix || self.prefix;

    if(opts.type && opts.route && opts.data) {

        jQuery.ajax({
            type: opts.type,
            url: provider + prefix + opts.route,
            data: JSON.stringify(opts.data),
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            dataType: "json",
            success: function (data, status, jqXHR) {
                cb(null, data);
            },
            error: function (jqXHR, status, error) {
                var err = jqXHR.status;
                //var err = eval("(" + jqXHR.responseText + ")");
                cb(err, null);
            }
        });

    } else {
        cb('missing parameter',null);
    }
};
