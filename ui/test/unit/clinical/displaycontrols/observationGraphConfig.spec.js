/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

describe("observationGraphConfig", function () {

    it("should create the config object", function () {
        var config = {
            "yAxisConcepts": ["Systolic", "Diastolic"],
            "xAxisConcept": "observationDateTime"
        };
        expect(new Bahmni.Clinical.ObservationGraphConfig(config).yAxisConcepts).toEqual(["Systolic", "Diastolic"])
    });

    it("should create the config object for growth chart with given y-axis concept", function () {
        var config = {
            "yAxisConcepts":["Weight"],
            "referenceData": "growthChartReference.csv",
            "numberOfVisits": 20
        };
        var graphConfig = new Bahmni.Clinical.ObservationGraphConfig(config);
        expect(graphConfig.yAxisConcepts).toEqual(["Weight"]);
        expect(graphConfig.xAxisConcept).toEqual("Age");
    });

});