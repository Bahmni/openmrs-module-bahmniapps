describe("DrugOrder", function() {
	var DrugOrder = Bahmni.Clinical.DrugOrder;
	var DateUtil = Bahmni.Common.Util.DateUtil;
	
	describe("isActiveOnDate", function() {
		it("should be true when date is between start date and end date", function() {
			var drugOrder = new DrugOrder({
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530'
			});

			expect(drugOrder.isActiveOnDate(DateUtil.parse('2014-04-09'))).toBe(false);
			expect(drugOrder.isActiveOnDate(DateUtil.parse('2014-04-10'))).toBe(true);
			expect(drugOrder.isActiveOnDate(DateUtil.parse('2014-04-11'))).toBe(true);
			expect(drugOrder.isActiveOnDate(DateUtil.parse('2014-04-12'))).toBe(false);
		});
	});

	describe("getStatusOnDate", function() {
		it("should be stopped when drug is stopped on that date", function() {
			var drugOrder = new DrugOrder({
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530',
				dateStopped: '2014-04-11T15:52:59.000+0530'
			});

			expect(drugOrder.getStatusOnDate(DateUtil.parse('2014-04-11'))).toBe('stopped');
		});

		it("should not be stopped when drug is not stopped but expires on that date", function() {
			var drugOrder = new DrugOrder({
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530',
				dateStopped: null
			});

			expect(drugOrder.getStatusOnDate(DateUtil.parse('2014-04-11'))).not.toBe('stopped');
		});

		it("should be active when drug is not stopped on that date and is active", function() {
			var drugOrder = new DrugOrder({
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530',
				dateStopped: '2014-04-11T15:52:59.000+0530'
			});

			expect(drugOrder.getStatusOnDate(DateUtil.parse('2014-04-10'))).toBe('active');
		});

		it("should be inactive when date falls out of the start date and expire date / stopped date", function() {
			var drugOrder = new DrugOrder({
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530',
				dateStopped: '2014-04-11T15:52:59.000+0530'
			});

			expect(drugOrder.getStatusOnDate(DateUtil.parse('2014-04-09'))).toBe('inactive');
			expect(drugOrder.getStatusOnDate(DateUtil.parse('2014-04-12'))).toBe('inactive');
		});
	});

	describe("isActive", function() {
		it("should be true if drug is consumed today", function() {
			spyOn(DateUtil, 'today');
			var drugOrder = new DrugOrder({
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530'
			});

			DateUtil.today.and.returnValue(DateUtil.parse('2014-04-09'));
			expect(drugOrder.isActive()).toBe(false);
			
			DateUtil.today.and.returnValue(DateUtil.parse('2014-04-10'));
			expect(drugOrder.isActive()).toBe(true);
			
			DateUtil.today.and.returnValue(DateUtil.parse('2014-04-11'));
			expect(drugOrder.isActive()).toBe(true);
			
			DateUtil.today.and.returnValue(DateUtil.parse('2014-04-12'));
			expect(drugOrder.isActive()).toBe(false);
		});
	});

	describe("createFromUIObject", function() {
		it("should create DrugOrder Object", function() {
			var uiDrugObject = {
				asNeeded: false,
				autoExpireDate: undefined,
				doseUnits: "Tablet(s)",
				dosingInstructionType: "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions",
				drugNameDisplay: "abc 400mg Tablet",
				drugNonCoded: "abc 400mg Tablet",
				duration: 1,
				durationInDays: 1,
				durationUnit: "Day(s)",
				frequencyType: "variable",
				instructions: "As directed",
				quantity: 3,
				quantityUnit: "Tablet(s)",
				route: "Topical",
				scheduledDate: null,
				uniformDosingType: {
					dose: 1,
					doseUnits: "Tablet(s)",
					frequency: "Twice a day"
				},
				variableDosingType : {
					afternoonDose: 1,
					doseUnits: "Tablet(s)",
					eveningDose: 1,
					morningDose: 1
				},
				effectiveStartDate: '2014-04-10T15:52:59.000+0530',
				effectiveStopDate: '2014-04-11T15:52:59.000+0530',
				isUniformDosingType: function() {
					return false;
				}
			};
			var drugOrder = Bahmni.Clinical.DrugOrder.createFromUIObject(uiDrugObject);

			expect(drugOrder.careSetting).toBe("OUTPATIENT");
			expect(drugOrder.drugNonCoded).toBe(uiDrugObject.drugNonCoded);
			expect(drugOrder.orderType).toBe("Drug Order");
			expect(drugOrder.dosingInstructionType).toBe(uiDrugObject.dosingInstructionType);
			var administrationInstructions = JSON.parse(drugOrder.dosingInstructions.administrationInstructions);
			expect(administrationInstructions.morningDose).toBe(1);
			expect(administrationInstructions.afternoonDose).toBe(1);
			expect(administrationInstructions.eveningDose).toBe(1);
			expect(drugOrder.dosingInstructions.quantity).toBe(uiDrugObject.quantity);
			expect(drugOrder.dosingInstructions.quantityUnits).toBe(uiDrugObject.quantityUnit);
			expect(drugOrder.dosingInstructions.route).toBe(uiDrugObject.route);
			expect(drugOrder.dosingInstructions.frequency).toBe(false);
			expect(drugOrder.duration).toBe(uiDrugObject.duration);
			expect(drugOrder.durationUnits).toBe(uiDrugObject.durationUnit);
		});
	});
});