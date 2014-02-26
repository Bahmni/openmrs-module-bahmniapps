'use strict';

Bahmni.Common.Util.DateUtil = {
	diffInDays: function (dateFrom, dateTo) {
		return Math.floor((dateTo - dateFrom) / (60 * 1000 * 60 * 24));
	},

	getDayNumber: function (referenceDate, date) {
		return this.diffInDays(this.getDate(referenceDate), this.getDate(date))  + 1;
	},

	getDate: function (dateTime) {
		return new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
	},

	getCurrentDate: function(){
		return moment(Date.now()).format("YYYY-MM-DDTHH:mm:ss") + "Z";
	}
}