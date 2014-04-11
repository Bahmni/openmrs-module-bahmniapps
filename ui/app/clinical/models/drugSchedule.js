(function(){
	var DateUtil = Bahmni.Common.Util.DateUtil;
	Bahmni.Clinical.DrugSchedule = function(fromDate, toDate, drugOrders) {
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.drugOrders = drugOrders.map(Bahmni.Clinical.DrugOrder.create);
		this.days = this.getDays();
	}

	Bahmni.Clinical.DrugSchedule.prototype = {
		getDays: function() {
			var startDate = DateUtil.getDate(this.fromDate);
			var numberOfDays = DateUtil.diffInDays(startDate, this.toDate);
			var days = [];
			for (var i = 0; i <= numberOfDays; i++) {
				days.push({dayNumber: i + 1, date: DateUtil.addDays(startDate, i)});
			};
			return days;
		},

		hasDrugOrders: function() {
			return this.drugOrders.length > 0;
		}
	};

	Bahmni.Clinical.DrugSchedule.create = function(visit) {
		var fromDate = visit.getAdmissionDate();
		var toDate = visit.getDischargeDispositionDate() || visit.getDischargeDate() || DateUtil.now();
		var drugOrdersDuringIpd = visit.drugOrders.filter(function(drugOrder){
			return DateUtil.parse(drugOrder.startDate) <= toDate && DateUtil.parse(drugOrder.endDate) >= fromDate;
		});
		return new this(fromDate, toDate, drugOrdersDuringIpd);
	}
})();



