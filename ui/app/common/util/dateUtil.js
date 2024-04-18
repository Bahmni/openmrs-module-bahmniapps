'use strict';

const clientTimeDisplayFormat = Bahmni.Common.Constants.clientTimeDisplayFormat;
const clientDateDisplayFormat = Bahmni.Common.Constants.clientDateDisplayFormat;

Bahmni.Common.Util.DateUtil = {
    diffInDays: function (dateFrom, dateTo) {
        return Math.floor((this.parse(dateTo) - this.parse(dateFrom)) / (60 * 1000 * 60 * 24));
    },

    diffInMinutes: function (dateFrom, dateTo) {
        return moment(dateTo).diff(moment(dateFrom), 'minutes');
    },

    diffInSeconds: function (dateFrom, dateTo) {
        return moment(dateFrom).diff(moment(dateTo), 'seconds');
    },

    isInvalid: function (date) {
        return date == "Invalid Date";
    },

    diffInDaysRegardlessOfTime: function (dateFrom, dateTo) {
        var from = new Date(dateFrom);
        var to = new Date(dateTo);
        from.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        return Math.floor((to - from) / (60 * 1000 * 60 * 24));
    },

    addSeconds: function (date, seconds) {
        return moment(date).add(seconds, 'seconds').toDate();
    },

    addMinutes: function (date, minutes) {
        return this.addSeconds(date, minutes * 60);
    },

    addDays: function (date, days) {
        return moment(date).add(days, 'day').toDate();
    },
    addMonths: function (date, months) {
        return moment(date).add(months, 'month').toDate();
    },
    addYears: function (date, years) {
        return moment(date).add(years, 'year').toDate();
    },

    subtractSeconds: function (date, seconds) {
        return moment(date).subtract(seconds, 'seconds').toDate();
    },
    subtractDays: function (date, days) {
        return this.addDays(date, -1 * days);
    },
    subtractISOWeekDays: function (date, days) {
        if (days == null) {
            return moment(date).isoWeekday();
        }
        return moment(date).isoWeekday() >= days ? moment(date).isoWeekday() - days
            : 7 + moment(date).isoWeekday() - days;
    },
    subtractMonths: function (date, months) {
        return this.addMonths(date, -1 * months);
    },
    subtractYears: function (date, years) {
        return this.addYears(date, -1 * years);
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
        return this.diffInDays(this.getDate(referenceDate), this.getDate(date)) + 1;
    },

    getDateWithoutTime: function (datetime) {
        return datetime ? moment(datetime).format("YYYY-MM-DD") : null;
    },

    getDateInMonthsAndYears: function (date, format) {
        var format = format || "MMM YYYY";
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        if (!moment(dateRepresentation).isValid()) {
            return date;
        }
        return dateRepresentation ? moment(dateRepresentation).format(format) : null;
    },

    formatDateWithTime: function (datetime) {
        var dateRepresentation = isNaN(Number(datetime)) ? datetime : Number(datetime);
        if (!moment(dateRepresentation).isValid()) {
            return datetime;
        }
        return dateRepresentation ? moment(dateRepresentation).format(clientDateDisplayFormat + " " + clientTimeDisplayFormat) : null;
    },

    formatDateWithoutTime: function (dateTime) {
        var dateRepresentation = isNaN(Number(dateTime)) ? dateTime : Number(dateTime);
        if (!moment(dateRepresentation).isValid()) {
            return dateTime;
        }
        return dateRepresentation ? moment(dateRepresentation).format(clientDateDisplayFormat) : null;
    },

    formatDateWithoutTimeToLocal: function (dateTime) {
        var dateRepresentation = isNaN(Number(dateTime)) ? dateTime : Number(dateTime);
        if (!moment(dateRepresentation).isValid()) {
            return dateTime;
        }
        return dateRepresentation ? moment.utc(dateTime).local().format(clientDateDisplayFormat) : null;
    },

    formatDateInStrictMode: function (date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        if (moment(dateRepresentation, 'YYYY-MM-DD', true).isValid()) {
            return moment(dateRepresentation).format(clientDateDisplayFormat);
        }
        if (moment(dateRepresentation, 'YYYY-MM-DDTHH:mm:ss.SSSZZ', true).isValid()) {
            return moment(dateRepresentation).format(clientDateDisplayFormat);
        }
        return date;
    },

    formatTime: function (dateTime) {
        var dateRepresentation = isNaN(Number(dateTime)) ? dateTime : Number(dateTime);
        if (!moment(dateRepresentation).isValid()) {
            return dateTime;
        }
        return dateRepresentation ? moment(dateRepresentation).format(clientTimeDisplayFormat) : null;
    },

    formatTimeToLocal: function (dateTime) {
        var dateRepresentation = isNaN(Number(dateTime)) ? dateTime : Number(dateTime);
        if (!moment(dateRepresentation).isValid()) {
            return dateTime;
        }
        return dateRepresentation ? moment.utc(dateTime).local().format(clientTimeDisplayFormat) : null;
    },

    getDate: function (dateTime) {
        return moment(this.parse(dateTime)).startOf('day').toDate();
    },

    parse: function (dateString) {
        return dateString ? moment(dateString).toDate() : null;
    },

    parseDatetime: function (dateTimeString) {
        return dateTimeString ? moment(dateTimeString) : null;
    },

    now: function () {
        return new Date();
    },

    today: function () {
        return this.getDate(this.now());
    },
    endOfToday: function () {
        return moment(this.parse(this.now())).endOf('day').toDate();
    },

    getDateWithoutHours: function (dateString) {
        return moment(dateString).toDate().setHours(0, 0, 0, 0);
    },

    getDateTimeWithoutSeconds: function (dateString) {
        return moment(dateString).toDate().setSeconds(0, 0);
    },

    isSameDateTime: function (date1, date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        var dateOne = this.parse(date1);
        var dateTwo = this.parse(date2);
        return dateOne.getTime() == dateTwo.getTime();
    },

    isBeforeDate: function (date1, date2) {
        return moment(date1).isBefore(moment(date2));
    },
    isSameDate: function (date1, date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        var dateOne = this.parse(date1);
        var dateTwo = this.parse(date2);
        return dateOne.getFullYear() === dateTwo.getFullYear() &&
            dateOne.getMonth() === dateTwo.getMonth() &&
            dateOne.getDate() === dateTwo.getDate();
    },

    diffInYearsMonthsDays: function (dateFrom, dateTo) {
        dateFrom = this.parse(dateFrom);
        dateTo = this.parse(dateTo);

        var from = {
            d: dateFrom.getDate(),
            m: dateFrom.getMonth(),
            y: dateFrom.getFullYear()
        };

        var to = {
            d: dateTo.getDate(),
            m: dateTo.getMonth(),
            y: dateTo.getFullYear()
        };

        var age = {
            d: 0,
            m: 0,
            y: 0
        };

        var daysFebruary = (from.y % 4 === 0 && from.y % 100 !== 0) || from.y % 400 === 0 ? 29 : 28;
        var daysInMonths = [31, daysFebruary, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        age.y = to.y - from.y;
        age.m = to.m - from.m;

        if (from.m > to.m) {
            age.y = age.y - 1;
            age.m = to.m - from.m + 12;
        }
        age.d = to.d - from.d;

        if (from.d > to.d) {
            age.m = age.m - 1;

            if (from.m == to.m) {
                age.y = age.y - 1;
                age.m = age.m + 12;
            }
            age.d = to.d - from.d + daysInMonths[parseInt(from.m)];
        }
        return {
            days: age.d,
            months: age.m,
            years: age.y
        };
    },

    convertToUnits: function (minutes) {
        var allUnits = {"Years": 365 * 24 * 60, "Months": 30 * 24 * 60, "Weeks": 7 * 24 * 60, "Days": 24 * 60, "Hours": 60, "Minutes": 1};

        var durationRepresentation = function (value, unitName, unitValueInMinutes) {
            return {"value": value, "unitName": unitName, "unitValueInMinutes": unitValueInMinutes, "allUnits": allUnits };
        };

        for (var unitName in allUnits) {
            var unitValueInMinutes = allUnits[unitName];
            if (minutes || minutes !== 0) {
                if (minutes >= unitValueInMinutes && minutes % unitValueInMinutes === 0) {
                    return durationRepresentation(minutes / unitValueInMinutes, unitName, unitValueInMinutes);
                }
            }
        }
        return durationRepresentation(undefined, undefined, undefined);
    },

    getEndDateFromDuration: function (dateFrom, value, unit) {
        dateFrom = this.parse(dateFrom);
        var from = {
            h: dateFrom.getHours(),
            d: dateFrom.getDate(),
            m: dateFrom.getMonth(),
            y: dateFrom.getFullYear()
        };
        var to = new Date(from.y, from.m, from.d, from.h);

        if (unit === "Months") {
            to.setMonth(from.m + value);
        } else if (unit === "Weeks") {
            to.setDate(from.d + (value * 7));
        } else if (unit === "Days") {
            to.setDate(from.d + value);
        } else if (unit === "Hours") {
            to.setHours(from.h + value);
        }
        return to;
    },

    parseLongDateToServerFormat: function (longDate) {
        return longDate ? moment(longDate).format("YYYY-MM-DDTHH:mm:ss.SSSZZ") : null;
    },

    parseServerDateToDate: function (longDate) {
        return longDate ? moment(longDate, "YYYY-MM-DDTHH:mm:ss.SSSZZ").toDate() : null;
    },
    getDateTimeInSpecifiedFormat: function (date, format) {
        return date ? moment(date).format(format) : null;
    },
    getISOString: function (date) {
        return date ? moment(date).toDate().toISOString() : null;
    },
    isBeforeTime: function (time, otherTime) {
        return moment(time, clientTimeDisplayFormat).format('YYYY-MM-DD');
    },
    getWeekStartDate: function (date, startOfWeek) {
        var daysToBeSubtracted = this.subtractISOWeekDays(date, startOfWeek);
        return moment(date).subtract(daysToBeSubtracted, 'days').toDate();
    },
    getWeekEndDate: function (weekStartDate) {
        return moment(weekStartDate).add(6, 'days').toDate();
    }
};
