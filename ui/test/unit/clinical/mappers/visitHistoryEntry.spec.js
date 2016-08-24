'use strict';

describe("VisitHistoryEntry", function() {
	var VisitHistoryEntry = Bahmni.Clinical.VisitHistoryEntry;

	describe("isAcitve",function() {
		it("should be true when there is no stopDatetime", function() {
			var visitData = {
				"startDatetime": "2013-12-10T07:29:25.000+0530",
				"stopDatetime": null
			};

			var visitHistoryEntry = new VisitHistoryEntry(visitData);

			expect(visitHistoryEntry.isActive()).toBe(true);
		});

		it("should be false when there is stopDatetime", function() {
			var visitData = {
				"startDatetime": "2013-12-10T07:29:25.000+0530",
				"stopDatetime": "2013-12-10T07:29:25.000+0530"
			};

			var visitHistoryEntry = new VisitHistoryEntry(visitData);

			expect(visitHistoryEntry.isActive()).toBe(false);
		});
	});

	describe("isOneDayVisit",function() {
		it("should be true when startDate and stopDate are same but time is different", function() {
			var visitData = {
				"startDatetime": "2013-12-10T07:29:25.000+0530",
				"stopDatetime": "2013-12-10T07:40:25.000+0530"
			};

			var visitHistoryEntry = new VisitHistoryEntry(visitData);

			expect(visitHistoryEntry.isOneDayVisit()).toBe(true);
		});

		it("should be true when there is no stopDatetime", function() {
			var visitData = {
				"startDatetime": "2013-12-10T07:29:25.000+0530",
				"stopDatetime": null
			};

			var visitHistoryEntry = new VisitHistoryEntry(visitData);

			expect(visitHistoryEntry.isOneDayVisit()).toBe(true);
		});

		it("should be false when there is startDate and stopDate are different", function() {
			var visitData = {
				"startDatetime": "2013-12-10T07:29:25.000+0530",
				"stopDatetime": "2013-12-11T07:29:25.000+0530"
			};

			var visitHistoryEntry = new VisitHistoryEntry(visitData);

			expect(visitHistoryEntry.isOneDayVisit()).toBe(false);
		});
	});

    describe("getVisitType",function() {
        it("should return a visit type string if its a name", function () {
            var visitData = {
                visitType: {
                    name: "test_type"
                }
            };

            var visitHistoryEntry = new VisitHistoryEntry(visitData);

            expect(visitHistoryEntry.getVisitType()).toBe(visitData.visitType.name);
        });

        it("should return a visit type string if its a display", function () {
            var visitData = {
                visitType: {
                    display: "test_type"
                }
            };

            var visitHistoryEntry = new VisitHistoryEntry(visitData);

            expect(visitHistoryEntry.getVisitType()).toBe(visitData.visitType.display);
        });

        it("should return undefined if no visit type is there", function () {
            var visitData = {};

            var visitHistoryEntry = new VisitHistoryEntry(visitData);

            expect(visitHistoryEntry.getVisitType()).toBeUndefined();
        });
    });
});
