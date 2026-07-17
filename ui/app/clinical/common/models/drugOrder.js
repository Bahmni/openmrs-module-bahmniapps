/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.Clinical.DrugOrder = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var DrugOrder = function (drugOrderData) {
        angular.extend(this, drugOrderData);
    };

    DrugOrder.create = function (drugOrderData) {
        return new DrugOrder(drugOrderData);
    };

    DrugOrder.createFromUIObject = function (drugOrderData) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDosingInstructions = function (drugOrderData) {
            var dosingInstructions = {};
            dosingInstructions.instructions = drugOrderData.instructions && drugOrderData.instructions;
            dosingInstructions.additionalInstructions = drugOrderData.additionalInstructions;
            dosingInstructions.isLoadingDose = drugOrderData.isLoadingDose || false;
            if (drugOrderData.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
                dosingInstructions.morningDose = drugOrderData.variableDosingType.morningDose;
                dosingInstructions.afternoonDose = drugOrderData.variableDosingType.afternoonDose;
                dosingInstructions.eveningDose = drugOrderData.variableDosingType.eveningDose;
            }
            return JSON.stringify(dosingInstructions);
        };

        var frequency = drugOrderData.isUniformDosingType() && !drugOrderData.isCurrentDosingTypeEmpty() && drugOrderData.uniformDosingType.frequency;

        var route = drugOrderData.route;

        var drugOrder = new DrugOrder({
            careSetting: drugOrderData.careSetting || "OUTPATIENT",
            drug: drugOrderData.drug,
            drugNonCoded: drugOrderData.drugNonCoded,
            orderType: "Drug Order",
            dosingInstructionType: Bahmni.Clinical.Constants.flexibleDosingInstructionsClass,
            dosingInstructions: {
                dose: drugOrderData.uniformDosingType.dose,
                doseUnits: drugOrderData.doseUnits,
                route: route,
                frequency: frequency,
                asNeeded: drugOrderData.asNeeded,
                administrationInstructions: getDosingInstructions(drugOrderData),
                quantity: drugOrderData.quantity,
                quantityUnits: drugOrderData.quantityUnit,
                numberOfRefills: 0
            },
            duration: drugOrderData.duration,
            durationUnits: drugOrderData.durationUnit,
            scheduledDate: dateUtil.parse(drugOrderData.scheduledDate),
            autoExpireDate: dateUtil.parse(drugOrderData.autoExpireDate),
            previousOrderUuid: drugOrderData.previousOrderUuid,
            action: drugOrderData.action,
            orderReasonConcept: drugOrderData.orderReasonConcept,
            orderReasonText: drugOrderData.orderReasonText,
            dateStopped: dateUtil.parse(drugOrderData.dateStopped),
            concept: drugOrderData.concept,
            sortWeight: drugOrderData.sortWeight,
            orderGroup: {
                uuid: drugOrderData.orderGroupUuid,
                orderSet: {
                    uuid: drugOrderData.orderSetUuid
                }
            }
        }
        );
        if (!drugOrder.dosingInstructions.quantityUnits) {
            drugOrder.dosingInstructions.quantityUnits = "Unit(s)";
        }
        return drugOrder;
    };

    DrugOrder.createFhirDrugOrder = function (vdt) {
        var utils = Bahmni.Clinical.FhirDosingUtils;
        var stages = vdt.stages || [];
        var fhirDosages = utils.buildFhirDosageArray(stages, vdt.units, vdt.route);

        var totalDays = stages.reduce(function (sum, s) {
            if (s.stageName === utils.LOADING_DOSE_STAGE_NAME) { return sum; }
            return sum + utils.normalizeToDays(s.duration, s.durationUnit);
        }, 0);

        var totalDosage = stages.reduce(function (sum, s) {
            if (s.stageName === utils.LOADING_DOSE_STAGE_NAME) {
                return sum + (parseFloat(s.dose) || 0);
            }
            return sum + (parseFloat(s.dose) || 0) * (s.frequencyPerDay || 1) * utils.normalizeToDays(s.duration, s.durationUnit);
        }, 0);

        return new DrugOrder({
            drug: vdt.drug,
            drugNonCoded: vdt.drugNonCoded || null,
            concept: vdt.concept || null,
            orderType: 'Drug Order',
            action: Bahmni.Clinical.Constants.orderActions.new,
            dosingInstructionType: utils.FHIR_DOSING_INSTRUCTION_TYPE,
            duration: totalDays,
            durationUnits: 'Days',
            scheduledDate: vdt.startDate,
            careSetting: vdt.careSetting || 'OUTPATIENT',
            dosingInstructions: {
                administrationInstructions: JSON.stringify(fhirDosages),
                doseUnits: vdt.units || '',
                route: vdt.route || '',
                asNeeded: false,
                quantity: totalDosage,
                quantityUnits: vdt.units || 'Unit(s)',
                numberOfRefills: 0
            }
        });
    };

    DrugOrder.createFhirDrugOrderRevise = function (vdt) {
        var order = DrugOrder.createFhirDrugOrder(vdt);
        order.action = Bahmni.Clinical.Constants.orderActions.revise;
        order.previousOrderUuid = vdt.previousOrderUuid;
        return order;
    };

    DrugOrder.prototype = {
        isActiveOnDate: function (date) {
            return date >= DateUtil.getDate(this.effectiveStartDate) && date <= DateUtil.getDate(this.effectiveStopDate);
        },

        getStatusOnDate: function (date) {
            if (DateUtil.isSameDate(this.dateStopped, date)) {
                return 'stopped';
            }
            return this.isActiveOnDate(date) ? 'active' : 'inactive';
        },

        isActive: function () {
            return this.isActiveOnDate(DateUtil.today());
        }
    };

    return DrugOrder;
})();
