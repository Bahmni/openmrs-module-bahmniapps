'use strict';

Bahmni.Clinical.DrugOrder = (function () {
	var DateUtil = Bahmni.Common.Util.DateUtil;

    var DrugOrder = function (drugOrderData) {
		angular.extend(this, drugOrderData);
    };

    DrugOrder.createFromOpenMRSRest = function (drugOrder) {
        return {name: drugOrder.drug.name,
            orderDate: drugOrder.startDate,
            dosage: drugOrder.drug.dosageForm.display,
            dose: drugOrder.dose,
            days: DateUtil.diffInDays(DateUtil.parse(drugOrder.startDate), DateUtil.parse(drugOrder.autoExpireDate))}
    };

    DrugOrder.create = function(drugOrderData) {
		return new DrugOrder(drugOrderData);
	}

	DrugOrder.prototype = {
		isActiveOnDate: function(date) {
			return date >= DateUtil.getDate(this.startDate) && date <= DateUtil.getDate(this.endDate);
		},

		isActive: function() {
			return this.isActiveOnDate(DateUtil.today());
		}
	}

	return DrugOrder;
})();

