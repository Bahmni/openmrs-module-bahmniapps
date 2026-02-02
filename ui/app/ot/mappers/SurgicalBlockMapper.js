/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.OT.SurgicalBlockMapper = function () {
    var mapSelectedOtherSurgeon = function (otherSurgeonAttribute, surgeonList) {
        var selectedOtherSurgeon = _.filter(surgeonList, function (surgeon) {
            return surgeon.id === parseInt(otherSurgeonAttribute.value);
        });
        otherSurgeonAttribute.value = _.isEmpty(selectedOtherSurgeon) ? null : selectedOtherSurgeon[0];
    };

    var mapOpenMrsSurgicalAppointmentAttributes = function (openMrsSurgicalAppointmentAttributes, surgeonsList) {
        var mappedAttributes = {};
        _.each(openMrsSurgicalAppointmentAttributes, function (attribute) {
            var attributeName = attribute.surgicalAppointmentAttributeType.name;
            mappedAttributes[attributeName] = {
                id: attribute.id,
                uuid: attribute.uuid,
                value: attribute.value,
                surgicalAppointmentAttributeType: {
                    uuid: attribute.surgicalAppointmentAttributeType.uuid,
                    name: attribute.surgicalAppointmentAttributeType.name
                }
            };
        });
        var otherSurgeonnAttribute = mappedAttributes['otherSurgeon'];
        if (otherSurgeonnAttribute) {
            mapSelectedOtherSurgeon(otherSurgeonnAttribute, surgeonsList);
        }
        return mappedAttributes;
    };

    var mapConcepts = function (observations, conceptDisplayName, validityDays) {
        if (!observations || !angular.isArray(observations) || observations.length === 0) {
            return { value: null, date: null };
        }
        var latestValue = null;
        var latestDate = null;
        _.each(observations, function (obs) {
            if (!obs || !obs.display) {
                return;
            }
            if (obs.concept && obs.concept.display === conceptDisplayName) {
                var currentObsDate = obs.obsDatetime;
                var parsedDate = currentObsDate && Bahmni.Common.Util.DateUtil.parseServerDateToDate(currentObsDate);
                if (!latestDate || (parsedDate && parsedDate > latestDate)) {
                    if (obs.value) {
                        latestValue = obs.value.display || obs.value;
                    }
                    if (parsedDate) {
                        latestDate = parsedDate;
                    }
                }
            }
        });
        if (latestDate && validityDays) {
            var now = new Date();
            var diffDays = (now - latestDate) / (1000 * 60 * 60 * 24);
            if (diffDays > validityDays) {
                return { value: '', date: null };
            }
        }
        return { value: latestValue, date: latestDate };
    };

    var mapAnaesthesiaAssessment = function (anaesthesiaAssessmentObs) {
        return mapConcepts(anaesthesiaAssessmentObs, Bahmni.OT.Constants.preAnaesthesiaAssessedForSurgery, Bahmni.OT.Constants.anaesthesiaAssessmentValidityDays);
    };

    var mapPaediatricAssessment = function (paediatricAssessmentObs) {
        return mapConcepts(paediatricAssessmentObs, Bahmni.OT.Constants.assessedForSurgery, Bahmni.OT.Constants.paediatricAssessmentValidityDays);
    };

    var needsAnaesthesiaData = function (columnConfig) {
        if (!columnConfig || !angular.isArray(columnConfig)) {
            return false;
        }
        return columnConfig.indexOf('anaesthesiaAssessmentDate') !== -1 ||
               columnConfig.indexOf('anaesthesiaAssessment') !== -1;
    };

    var needsPaediatricData = function (columnConfig) {
        if (!columnConfig || !angular.isArray(columnConfig)) {
            return false;
        }
        return columnConfig.indexOf('paediatricAssessmentDate') !== -1 ||
               columnConfig.indexOf('paediatricAssessment') !== -1;
    };

    var mapPrimaryDiagnoses = function (diagnosisObs) {
        if (!diagnosisObs || !angular.isArray(diagnosisObs) || diagnosisObs.length === 0) {
            return "";
        }
        var uniqueDiagnoses = new Map();
        _.each(diagnosisObs, function (diagnosis) {
            if (!diagnosis || !diagnosis.display) {
                return;
            }
            var existingDiagnosis = uniqueDiagnoses.get(diagnosis.display);
            if (existingDiagnosis) {
                if (existingDiagnosis.obsDatetime < diagnosis.obsDatetime) {
                    uniqueDiagnoses.set(diagnosis.display, diagnosis);
                }
            } else {
                uniqueDiagnoses.set(diagnosis.display, diagnosis);
            }
        });
        var primaryDiagnosesNames = _.filter(Array.from(uniqueDiagnoses.values()), function (diagnosis) {
            if (!diagnosis.obsGroup || !diagnosis.obsGroup.display) {
                return false;
            }
            var splitResult = diagnosis.obsGroup.display.split(": ");
            if (splitResult.length < 2) {
                return false;
            }
            var obsGroupList = splitResult[1].split(", ");
            return _.includes(obsGroupList, "Primary") && !(_.includes(obsGroupList, "Ruled Out Diagnosis"));
        }).map(function (diagnosis) {
            if (diagnosis.concept && diagnosis.concept.display == "Non-coded Diagnosis") {
                return diagnosis.value;
            }
            return diagnosis.value && diagnosis.value.display ? diagnosis.value.display : "";
        }).filter(function (name) {
            return name && name.trim() !== "";
        }).join(", ");
        return primaryDiagnosesNames;
    };

    var mapSurgicalAppointment = function (openMrsSurgicalAppointment, attributeTypes, surgeonsList, columnConfig) {
        var surgicalAppointmentAttributes = mapOpenMrsSurgicalAppointmentAttributes(openMrsSurgicalAppointment.surgicalAppointmentAttributes, surgeonsList);

        var anaesthesiaAssessmentData = { date: null, value: "" };
        var paediatricAssessmentData = { date: null, value: "" };

        if (needsAnaesthesiaData(columnConfig)) {
            anaesthesiaAssessmentData = mapAnaesthesiaAssessment(openMrsSurgicalAppointment.patientObservations) || { date: null, value: "" };
        }

        if (needsPaediatricData(columnConfig)) {
            paediatricAssessmentData = mapPaediatricAssessment(openMrsSurgicalAppointment.patientObservations) || { date: null, value: "" };
        }

        return {
            id: openMrsSurgicalAppointment.id,
            uuid: openMrsSurgicalAppointment.uuid,
            voided: openMrsSurgicalAppointment.voided || false,
            patient: openMrsSurgicalAppointment.patient,
            sortWeight: openMrsSurgicalAppointment.sortWeight,
            actualStartDatetime: Bahmni.Common.Util.DateUtil.parseServerDateToDate(openMrsSurgicalAppointment.actualStartDatetime),
            actualEndDatetime: Bahmni.Common.Util.DateUtil.parseServerDateToDate(openMrsSurgicalAppointment.actualEndDatetime),
            notes: openMrsSurgicalAppointment.notes,
            status: openMrsSurgicalAppointment.status,
            bedLocation: (openMrsSurgicalAppointment.bedLocation || ""),
            bedNumber: (openMrsSurgicalAppointment.bedNumber || ""),
            surgicalAppointmentAttributes: new Bahmni.OT.SurgicalBlockMapper().mapAttributes(surgicalAppointmentAttributes, attributeTypes),
            primaryDiagnosis: mapPrimaryDiagnoses(openMrsSurgicalAppointment.patientObservations) || "",
            anaesthesiaAssessmentDate: anaesthesiaAssessmentData.date || null,
            anaesthesiaAssessmentValue: anaesthesiaAssessmentData.value || "",
            paediatricAssessmentDate: paediatricAssessmentData.date || null,
            paediatricAssessmentValue: paediatricAssessmentData.value || ""
        };
    };

    this.map = function (openMrsSurgicalBlock, attributeTypes, surgeonsList, columnConfig) {
        var surgicalAppointments = _.map(openMrsSurgicalBlock.surgicalAppointments, function (surgicalAppointment) {
            return mapSurgicalAppointment(surgicalAppointment, attributeTypes, surgeonsList, columnConfig);
        });
        return {
            id: openMrsSurgicalBlock.id,
            uuid: openMrsSurgicalBlock.uuid,
            voided: openMrsSurgicalBlock.voided || false,
            startDatetime: Bahmni.Common.Util.DateUtil.parseServerDateToDate(openMrsSurgicalBlock.startDatetime),
            endDatetime: Bahmni.Common.Util.DateUtil.parseServerDateToDate(openMrsSurgicalBlock.endDatetime),
            provider: openMrsSurgicalBlock.provider,
            location: openMrsSurgicalBlock.location,
            surgicalAppointments: _.sortBy(surgicalAppointments, 'sortWeight')
        };
    };

    var mapSurgicalAppointmentAttributesUIToDomain = function (appointmentAttributes) {
        var attributes = _.cloneDeep(appointmentAttributes);
        var otherSurgeon = attributes['otherSurgeon'];
        otherSurgeon.value = otherSurgeon.value && otherSurgeon.value.id;
        return _.values(attributes).filter(function (attribute) {
            return !_.isUndefined(attribute.value);
        }).map(function (attribute) {
            attribute.value = !_.isNull(attribute.value) && attribute.value.toString() || "";
            return attribute;
        });
    };

    var mapSurgicalAppointmentUIToDomain = function (surgicalAppointmentUI) {
        return {
            id: surgicalAppointmentUI.id,
            uuid: surgicalAppointmentUI.uuid,
            voided: surgicalAppointmentUI.voided || false,
            patient: {uuid: surgicalAppointmentUI.patient.uuid},
            actualStartDatetime: surgicalAppointmentUI.actualStartDatetime,
            actualEndDatetime: surgicalAppointmentUI.actualEndDatetime,
            sortWeight: surgicalAppointmentUI.sortWeight,
            notes: surgicalAppointmentUI.notes,
            status: surgicalAppointmentUI.status,
            surgicalAppointmentAttributes: mapSurgicalAppointmentAttributesUIToDomain(surgicalAppointmentUI.surgicalAppointmentAttributes)
        };
    };

    this.mapSurgicalBlockUIToDomain = function (surgicalBlockUI) {
        return {
            id: surgicalBlockUI.id,
            uuid: surgicalBlockUI.uuid,
            voided: surgicalBlockUI.voided || false,
            startDatetime: surgicalBlockUI.startDatetime,
            endDatetime: surgicalBlockUI.endDatetime,
            provider: {uuid: surgicalBlockUI.provider.uuid},
            location: {uuid: surgicalBlockUI.location.uuid},
            surgicalAppointments: _.map(surgicalBlockUI.surgicalAppointments, function (surgicalAppointment) {
                return mapSurgicalAppointmentUIToDomain(surgicalAppointment);
            })
        };
    };

    var getAttributeTypeByName = function (attributeTypes, name) {
        return _.find(attributeTypes, function (attributeType) {
            return attributeType.name === name;
        });
    };

    this.mapAttributes = function (attributes, attributeTypes) {
        _.each(attributeTypes, function (attributeType) {
            var existingAttribute = attributes[attributeType.name];
            if (!existingAttribute) {
                attributes[attributeType.name] = {
                    surgicalAppointmentAttributeType: getAttributeTypeByName(attributeTypes, attributeType.name)
                };
                if (attributeType.name === "cleaningTime") {
                    attributes[attributeType.name].value = 15;
                } else if (attributeType.name === "estTimeMinutes") {
                    attributes[attributeType.name].value = 0;
                } else if (attributeType.name === "estTimeHours") {
                    attributes[attributeType.name].value = 0;
                } else {
                    attributes[attributeType.name].value = "";
                }
            }
        });
        return attributes;
    };

    this.mapPrimaryDiagnoses = mapPrimaryDiagnoses;
    this.mapAnaesthesiaAssessment = mapAnaesthesiaAssessment;
    this.mapPaediatricAssessment = mapPaediatricAssessment;
    this.needsAnaesthesiaData = needsAnaesthesiaData;
    this.needsPaediatricData = needsPaediatricData;
};
