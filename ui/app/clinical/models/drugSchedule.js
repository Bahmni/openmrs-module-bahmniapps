(function(){
	var DrugOrder = function(drugOrderData) {
		angular.extend(this, drugOrderData);
		var DateUtil = Bahmni.Common.Util.DateUtil;

		this.isDrugConsumedOnDate = function(date) {
			return date >= DateUtil.getDate(this.startDate) && date <= DateUtil.getDate(this.endDate);
		}
	}

	DrugOrder.create = function(drugOrderData) {
		return new DrugOrder(drugOrderData);
	}

	Bahmni.Clinical.DrugSchedule = function(fromDate, toDate, drugOrders) {
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.drugOrders = drugOrders.map(DrugOrder.create);
		this.days = this.getDays();
	}

	Bahmni.Clinical.DrugSchedule.prototype = {
		getDays: function() {
			var DateUtil = Bahmni.Common.Util.DateUtil;
			var numberOfDays = DateUtil.diffInDays(this.fromDate, this.toDate);
			var days = [];
			var startDate = DateUtil.getDate(this.fromDate);
			for (var i = 0; i <= numberOfDays; i++) {
				days.push({dayNumber: i + 1, date: DateUtil.addDays(startDate, i)});
			};
			return days;
		}
	};

	Bahmni.Clinical.DrugSchedule.create = function(visit) {
		var fromDate = visit.getAdmissionDate();
		var toDate = visit.getDischargeDate() || new Date();
		var drugOrdersDuringIpd = visit.drugOrders.filter(function(drugOrder){
			return new Date(drugOrder.startDate) >= fromDate || new Date(drugOrder.endDate) <= toDate;
		});
		return new this(fromDate, toDate, drugOrdersDuringIpd);
	}
})();



