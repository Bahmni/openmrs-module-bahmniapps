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

    var mapAnaesthesiaAssessment = function (anaesthesiaAssessmentObs) {
        if (!anaesthesiaAssessmentObs || !angular.isArray(anaesthesiaAssessmentObs) || anaesthesiaAssessmentObs.length === 0) {
            return { value: null, date: null };
        }
        var anaesthesiaAssessmentValue = null;
        var anaesthesiaAssessmentDate = null;
        _.each(anaesthesiaAssessmentObs, function (anaesthesiaAssessment) {
            if (!anaesthesiaAssessment || !anaesthesiaAssessment.display) {
                return;
            }
            if (anaesthesiaAssessment.concept && anaesthesiaAssessment.concept.display === Bahmni.OT.Constants.preAnaesthesiaAssessedForSurgery) {
                var currentObsDate = anaesthesiaAssessment.obsDatetime;
                if (!anaesthesiaAssessmentDate || (currentObsDate && currentObsDate > anaesthesiaAssessmentDate)) {
                    if (anaesthesiaAssessment.value) {
                        anaesthesiaAssessmentValue = anaesthesiaAssessment.value.display;
                    }
                    if (currentObsDate) {
                        anaesthesiaAssessmentDate = Bahmni.Common.Util.DateUtil.parseServerDateToDate(currentObsDate);
                    }
                }
            }
        });
        if (anaesthesiaAssessmentDate) {
            var now = new Date();
            var diffDays = (now - anaesthesiaAssessmentDate) / (1000 * 60 * 60 * 24);
            if (diffDays > Bahmni.OT.Constants.anaesthesiaAssessmentValidityDays) {
                return { value: '', date: null };
            }
        }
        return { value: anaesthesiaAssessmentValue, date: anaesthesiaAssessmentDate };
    };

    var mapPaediatricAssessment = function (paediatricAssessmentObs) {
        if (!paediatricAssessmentObs || !angular.isArray(paediatricAssessmentObs) || paediatricAssessmentObs.length === 0) {
            return { value: null, date: null };
        }
        var paediatricAssessmentValue = null;
        var paediatricAssessmentDate = null;
        _.each(paediatricAssessmentObs, function (paediatricAssessment) {
            if (!paediatricAssessment || !paediatricAssessment.display) {
                return;
            }
            if (paediatricAssessment.concept && paediatricAssessment.concept.display === Bahmni.OT.Constants.assessedForSurgery) {
                var currentObsDate = paediatricAssessment.obsDatetime;
                if (!paediatricAssessmentDate || (currentObsDate && currentObsDate > paediatricAssessmentDate)) {
                    if (paediatricAssessment.value) {
                        paediatricAssessmentValue = paediatricAssessment.value.display;
                    }
                    if (currentObsDate) {
                        paediatricAssessmentDate = Bahmni.Common.Util.DateUtil.parseServerDateToDate(currentObsDate);
                    }
                }
            }
        });
        if (paediatricAssessmentDate) {
            var now = new Date();
            var diffDays = (now - paediatricAssessmentDate) / (1000 * 60 * 60 * 24);
            if (diffDays > Bahmni.OT.Constants.paediatricAssessmentValidityDays) {
                return { value: '', date: null };
            }
        }
        return { value: paediatricAssessmentValue, date: paediatricAssessmentDate };
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

    var mapSurgicalAppointment = function (openMrsSurgicalAppointment, attributeTypes, surgeonsList) {
        var surgicalAppointmentAttributes = mapOpenMrsSurgicalAppointmentAttributes(openMrsSurgicalAppointment.surgicalAppointmentAttributes, surgeonsList);
        var anaesthesiaAssessmentData = mapAnaesthesiaAssessment(openMrsSurgicalAppointment.patientObservations) || "";
        var paediatricAssessmentData = mapPaediatricAssessment(openMrsSurgicalAppointment.patientObservations) || "";
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

    this.map = function (openMrsSurgicalBlock, attributeTypes, surgeonsList) {
        var surgicalAppointments = _.map(openMrsSurgicalBlock.surgicalAppointments, function (surgicalAppointment) {
            return mapSurgicalAppointment(surgicalAppointment, attributeTypes, surgeonsList);
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
};
