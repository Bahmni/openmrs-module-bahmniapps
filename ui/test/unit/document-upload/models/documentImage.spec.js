/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("DocumentImage", function() {
	var DocumentImage = Bahmni.Common.DocumentImage;

	describe("getTitle", function() {
		it("should have concept name when concept is present", function() {
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}})

		  expect(image.getTitle()).toBe("Chest X-Ray");
		});

		it("should have observation date when present", function() {
			var obsDate = new Date();
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}, obsDatetime: obsDate})

		  expect(image.getTitle()).toBe("Chest X-Ray, "+ moment(obsDate).format("DD-MMM-YYYY"));
		});

		it("should be blank when concept is absent", function() {
		  var image = new DocumentImage({concept: null})

		  expect(image.getTitle()).toBe("");
		});
	});
});