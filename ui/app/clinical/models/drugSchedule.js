(function(){
	var DateUtil = Bahmni.Common.Util.DateUtil;
	Bahmni.Clinical.DrugSchedule = function(fromDate, toDate, drugOrders) {
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.drugOrders = drugOrders;
		this.days = this.getDays();
		this.drugs = this.getDrugs();
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

		getDrugs: function() {
			var drugOrders = this.drugOrders.map(Bahmni.Clinical.DrugOrder.create);
			return drugOrders.reduce(function(drugs, drugOrder){
						var drug = drugs.filter(function(drug) { return drug.name === drugOrder.drugName; } )[0];
						if(drug) { drug.orders.push(drugOrder); }
						else { drugs.push(new Drug(drugOrder.drugName, [drugOrder])); }
						return drugs;
					}, []);
		},

		hasDrugOrders: function() {
			return this.drugOrders.length > 0;
		}
	};

	Bahmni.Clinical.DrugSchedule.create = function(visit) {
		var fromDate = visit.getAdmissionDate();
		var toDate = visit.getDischargeDispositionEncounterDate() || visit.getDischargeDate() || DateUtil.now();
		var drugOrdersDuringIpd = visit.drugOrders.filter(function(drugOrder){
			return DateUtil.parse(drugOrder.startDate) < toDate && DateUtil.parse(drugOrder.endDate) >= fromDate;
		});
		return new this(fromDate, toDate, drugOrdersDuringIpd);
	}

	var Drug = function(name, orders) {
		this.name = name;
		this.orders = orders || [];
	};

	Drug.prototype = {
		isActiveOnDate: function(date) {
			return this.orders.some(function(order) { return order.isActiveOnDate(date); });
		},

		isActive: function() {
			return this.orders.some(function(order) { return order.isActive(); });
		}
	}
})();



