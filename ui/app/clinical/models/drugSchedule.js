(function(){
	var DateUtil = Bahmni.Common.Util.DateUtil;
	Bahmni.Clinical.DrugSchedule = function(fromDate, toDate, drugOrders) {
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.drugOrders = drugOrders;
		this.days = this.getDays();
		this.drugs = this.getDrugs();
	};

	Bahmni.Clinical.DrugSchedule.prototype = {
		getDays: function() {
			return DateUtil.createDays(this.fromDate, this.toDate);
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

	Bahmni.Clinical.DrugSchedule.create = function(fromDate, toDate, drugOrders) {
		var drugOrdersDuringIpd = drugOrders.filter(function(drugOrder){
			return DateUtil.parse(drugOrder.startDate) < toDate && DateUtil.parse(drugOrder.endDate) >= fromDate;
		});
		return new this(fromDate, toDate, drugOrdersDuringIpd);
	};

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



