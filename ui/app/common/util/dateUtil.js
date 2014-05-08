'use strict';

Bahmni.Common.Util.DateUtil = {
	diffInDays: function (dateFrom, dateTo) {
		return Math.floor((this.parse(dateTo) - this.parse(dateFrom)) / (60 * 1000 * 60 * 24));
	},

    isInvalid: function(date){
        return date == "Invalid Date";
    },

    diffInDaysRegardlessOfTime: function(dateFrom, dateTo) {
        dateFrom.setHours(0,0,0,0);
        dateTo.setHours(0,0,0,0);
        return Math.floor((dateTo - dateFrom) / (60 * 1000 * 60 * 24));
    },

	addDays: function (date, days) {
		var newDate = new Date(date);
		newDate.setDate(date.getDate() + days);
		return newDate;
	},

    createDays: function (startDate, endDate) {
        var startDate = this.getDate(startDate);
        var endDate = this.getDate(endDate);
        var numberOfDays = this.diffInDays(startDate, endDate);
        var days = [];
        for (var i = 0; i <= numberOfDays; i++) {
            days.push({dayNumber: i + 1, date: this.addDays(startDate, i)});
        }
        return days;
    },

	getDayNumber: function (referenceDate, date) {
		return this.diffInDays(this.getDate(referenceDate), this.getDate(date))  + 1;
	},

	getDate: function (dateTime) {
		var dateTimeObject = this.parse(dateTime);
		return new Date(dateTimeObject.getFullYear(), dateTimeObject.getMonth(), dateTimeObject.getDate());
	},

	getCurrentDate: function(){
		return moment(Date.now()).format("YYYY-MM-DDTHH:mm:ss") + "Z";
	},

	parse: function(dateString){
		return moment(dateString).toDate();
	},

	now: function(){
	    return new Date();
	},

	today: function(){
	    return this.getDate(this.now());
	},

    isSameDate: function(date1, date2) {
    	if(date1 == null || date2 == null) {
    		return false;
    	}
        var dateOne = this.parse(date1);
        var dateTwo = this.parse(date2);
        return dateOne.getFullYear() == dateTwo.getFullYear()
            && dateOne.getMonth() == dateTwo.getMonth()
            && dateOne.getDate() == dateTwo.getDate();
    },

	diffInYearsMonthsDays: function (dateFrom, dateTo) {
	    dateFrom = this.parse(dateFrom)
	    dateTo = this.parse(dateTo)
	    var from = {
	        d: dateFrom.getDate(),
	        m: dateFrom.getMonth() + 1,
	        y: dateFrom.getFullYear()
	    };

	    var to = {
	        d: dateTo.getDate(),
	        m: dateTo.getMonth() + 1,
	        y: dateTo.getFullYear()
	    };

	    var daysFebruary = to.y % 4 != 0 || (to.y % 100 == 0 && to.y % 400 != 0)? 28 : 29;
	    var daysInMonths = [0, 31, daysFebruary, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	    if (to.d < from.d) {
	        to.d   += daysInMonths[parseInt(to.m - 1)];
	        from.m += 1;
	    }
	    if (to.m < from.m) {
	        to.m   += 12;
	        from.y += 1;
	    }

	    return {
	        days:   to.d - from.d,
	        months: to.m - from.m,
	        years:  to.y - from.y
	    };
	},

    convertToUnits: function (hours) {
        var allUnits = {"Years": 365 * 30 * 24, "Months": 30 * 24, "Weeks": 7 * 24, "Days": 24, "Hours": 1};

        var durationRepresentation = function (value, unitName, unitValueInHours) {
            return {"value": value, "unitName": unitName, "unitValueInHours": unitValueInHours, "allUnits": allUnits };
        }

        for (var unitName in  allUnits) {
            var unitValueInHours = allUnits[unitName];
            if (hours || hours !== 0) {
                if (hours >= unitValueInHours && hours % unitValueInHours === 0) {
                    return durationRepresentation(hours / unitValueInHours, unitName, unitValueInHours);
                }
            }
        }
        return durationRepresentation(0, "Hours", 1);
    }

}