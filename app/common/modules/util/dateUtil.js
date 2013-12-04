'use strict';

Bahmni.Common.Util.DateUtil = {
	diffInDays: function (dateFrom, dateTo) {
		return Math.floor((dateTo - dateFrom) / (60 * 1000 * 60 * 24));
	}
}