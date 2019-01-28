/***
 * Payment Cycle Generator
 *
 * @param gov
 * @constructor
 */
function PaymentCycle(gov, provider, prefix) {
	var self = this;

	this.network = gov.network;
	this.provider = provider;
	this.prefix = prefix;
	this.paymentCycle = 4380;
	this.proposalMaturity = 432; // ~(60*24*3)/10 = about three days
	this.budgetCycles = 23;
	this.selectedStartIndex = 0;
	this.selectedPeriods = 1;

	if (this.network == "testnet") this.paymentCycle = 10;
	if (this.network == "testnet") this.proposalMaturity = 1; // a little more than one hour
	if (this.network == "testnet") this.budgetCycles = 99;

	this.blockHeight = 0;

	this.startDate = [];
	this.endDate = [];

	this.Messages = {
		paymentCycle: {
			payment: "Payment",
			payments: "Payments",
			months: "Months",
			month: "Month",
			days: "Days",
			day: "Day",
			hours: "Hours",
			hour: "Hour",
			minutes: "Minutes",
			minute: "Minute",
			seconds: "Seconds",
			second: "Second"
		}
	};

	this.getInfo(function(err, res) {
		self.blockHeight = res.info.blocks;

		self.updateDropdowns();
	});
}

PaymentCycle.prototype.getNextSuperblock = function(block) {
	return (
		Math.floor(block / this.paymentCycle) * this.paymentCycle +
		this.paymentCycle
	);
};

PaymentCycle.prototype.getBlockTimestamp = function(block) {
	var blocks = block - this.blockHeight;
	var now = Math.floor(Date.now());

	return now + blocks * (600 * 1000); // 600 seconds per block x 1000 = ms per block
};

PaymentCycle.prototype.getTimeDifference = function(opts, start, end) {
	var precision = opts.precision;

	var millisec = end - start;

	var seconds = (millisec / 1000).toFixed(precision);

	var minutes = (millisec / (1000 * 60)).toFixed(precision);

	var hours = (millisec / (1000 * 60 * 60)).toFixed(precision);

	var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(precision);

	var months = (millisec / (1000 * 60 * 60 * 24 * 30)).toFixed(precision);

	if (seconds < 60) {
		if (seconds <= 1) return seconds + " " + this.Messages.paymentCycle.second; // singular
		return seconds + " " + this.Messages.paymentCycle.seconds;
	} else if (minutes < 60) {
		if (minutes <= 1) return minutes + " " + this.Messages.paymentCycle.minute; // singular
		return minutes + " " + this.Messages.paymentCycle.minutes;
	} else if (hours < 24) {
		if (hours <= 1) return hours + " " + this.Messages.paymentCycle.hour; // singular
		return hours + " " + this.Messages.paymentCycle.hours;
	} else if (days < 30) {
		if (days <= 1) return days + " " + this.Messages.paymentCycle.day; // singular
		return days + " " + this.Messages.paymentCycle.days;
	} else {
		if (months <= 1) return months + " " + this.Messages.paymentCycle.month; // singular
		return months + " " + this.Messages.paymentCycle.months;
	}
};

PaymentCycle.prototype.updateDropdowns = function() {
	var self = this;

	var blockHeight = this.blockHeight;
	var now = Math.floor(Date.now());

	for (i = 0; i < this.budgetCycles + 1; i++) {
		var superblock = this.getNextSuperblock(blockHeight);
		var timestamp = this.getBlockTimestamp(superblock);
		var before = this.getBlockTimestamp(superblock); // set start_epoch to halfway before superblock
		var after = this.getBlockTimestamp(superblock + this.paymentCycle); // set end_epoch to halfway after superblock
		
		var votingDeadline = this.getBlockTimestamp(
			superblock - this.proposalMaturity
		); // if superblock is within ~3 days skip to the next one

		var label = new Date(timestamp).toLocaleDateString();
		if (this.network == "testnet")
			label += " @ " + new Date(timestamp).toLocaleTimeString();

		var superblockDate = {
			superblock: superblock,
			timestamp: timestamp,
			before: before,
			after: after,
			label: label
		};

		// include superblock if proposal maturity date is later than now
		if (votingDeadline > now) {
			this.startDate.push(superblockDate);
			this.endDate.push(superblockDate);
		}

		blockHeight = superblock;
	}

	// this.endDate.shift(); // remove first element of endDate
	// this.startDate.pop(); // remove last element of startDate to keep length even

	var opts = {
		precision: 2
	}; // 2 unit of precision for eta formatting

	// calculate the amount of time between start and stop, show: e.g. 5 Months or 5 Hours

	var start_epoch = $("#start_epoch");
	start_epoch.find("option").remove();

	$.each(this.startDate, function(index) {
		var eta = self.getTimeDifference(opts, now, this.timestamp);
		var time = this.timestamp - now;
		var option = $("<option />")
			.val(Math.floor(this.before / 1000))
			.text(this.label)
			.attr("data-index", index)
			.attr("data-time", time)
			.attr("data-eta", eta)
			.attr("data-block", this.superblock);
		start_epoch.append(option);
	});

	self.updateEndEpoch();
};

PaymentCycle.prototype.updateEndEpoch = function() {
	var self = this;

	var opts = {
		precision: null
	}; // 0 units of precision for eta formatting

	var end_epoch = $("#end_epoch");
	end_epoch.find("option").remove();

	var i = 1;
	var payments = self.Messages.paymentCycle.payment;

	$.each(this.endDate, function(index) {
		if (index >= self.selectedStartIndex) {
			if (i > 1) payments = self.Messages.paymentCycle.payments;

			var eta = self.getTimeDifference(
				opts,
				self.startDate[self.selectedStartIndex].timestamp,
				this.timestamp
			);
			var time =
				this.timestamp - self.startDate[self.selectedStartIndex].timestamp;

			var option = $("<option />")
				.val(Math.floor(this.after / 1000))
				.text(i + " " + payments)
				.attr("data-index", index)
				.attr("data-label", this.label)
				.attr("data-time", time)
				.attr("data-eta", eta)
				.attr("data-block", this.superblock);
			end_epoch.append(option);

			i++;
		}
	});
};

PaymentCycle.prototype.getInfo = function(cb) {
	$.getJSON(this.provider + this.prefix + "/status?q=getinfo", function(data) {
		cb(null, data);
	});
};
