'use strict';

Bahmni.Clinical.DrugOrder = (function () {
	var DateUtil = Bahmni.Common.Util.DateUtil;

    var DrugOrder = function (drugOrderData) {
		angular.extend(this, drugOrderData);
    };

    DrugOrder.create = function(drugOrderData) {
		return new DrugOrder(drugOrderData);
	};

	DrugOrder.prototype = {
		isActiveOnDate: function(date) {
			return date >= DateUtil.getDate(this.startDate) && date <= DateUtil.getDate(this.endDate);
		},

		isActive: function() {
			return this.isActiveOnDate(DateUtil.today());
		},

        isFreeTextDosingType: function() {
            return this.dosingType === 'FREE_TEXT';
        }
	};

	return DrugOrder;
})();

