"use strict";

Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
    var self = this;
    // TODO : Shouldn't this be in clinical module. Don't see a reason for this to be in concept-set code - Shruthi
    this.getObservationsForView = function (observations, conceptSetConfig, conceptGroupFormatService) {
        return internalMapForDisplay(observations, conceptSetConfig, conceptGroupFormatService);
    };

    var internalMapForDisplay = function (observations, conceptSetConfig, conceptGroupFormatService) {
        var observationsForDisplay = [];
        _.forEach(observations, function (savedObs) {
            if (conceptGroupFormatService.isObsGroupFormatted(savedObs)) {
                var observationNode = new Bahmni.ConceptSet.ObservationNode(savedObs, savedObs, [], savedObs.concept);
                var obsToDisplay = createObservationForDisplay(observationNode, observationNode.primaryObs.concept, conceptGroupFormatService);
                if (obsToDisplay) {
                    observationsForDisplay.push(obsToDisplay);
                    return;
                }
            }
            else {
                if (savedObs.concept.set) {
                    if (conceptSetConfig[savedObs.concept.name] && conceptSetConfig[savedObs.concept.name].grid) {
                        savedObs.value = self.getGridObservationDisplayValue(savedObs, conceptGroupFormatService);
                        observationsForDisplay = observationsForDisplay.concat(createObservationForDisplay(savedObs, savedObs.concept, conceptGroupFormatService));
                    } else {
                        var groupMemberObservationsForDisplay = internalMapForDisplay(savedObs.groupMembers, conceptSetConfig, conceptGroupFormatService);
                        observationsForDisplay = observationsForDisplay.concat(groupMemberObservationsForDisplay);
                    }
                } else {
                    var obsToDisplay = null;
                    if (savedObs.isMultiSelect) {
                        obsToDisplay = savedObs;
                    } else if (!savedObs.hidden) {
                        var observation = newObservation(savedObs.concept, savedObs, []);
                        obsToDisplay = createObservationForDisplay(observation, observation.concept, conceptGroupFormatService);
                    }
                    if (obsToDisplay) {
                        observationsForDisplay.push(obsToDisplay);
                    }
                }
            }
        });
        return observationsForDisplay;
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        var savedObs = findInSavedObservation(rootConcept, observations)[0];
        return mapObservation(rootConcept, savedObs, conceptSetConfig || {});
    };

    var findInSavedObservation = function (concept, observations) {
        return _.filter(observations, function (obs) {
            return obs && obs.concept && concept.uuid === obs.concept.uuid;
        });
    };

    var mapObservation = function (concept, savedObs, conceptSetConfig) {
        var obs = null;
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode)) {
            return savedObs;
        }
        var mappedGroupMembers = concept && concept.set ? mapObservationGroupMembers(savedObs ? savedObs.groupMembers : [], concept, conceptSetConfig) : [];

        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            obs = newObservationNode(concept, savedObs, conceptSetConfig, mappedGroupMembers);
        } else {
            obs = newObservation(concept, savedObs, conceptSetConfig, mappedGroupMembers);
            new Bahmni.ConceptSet.MultiSelectObservations(conceptSetConfig).map(mappedGroupMembers);
        }

        mapTabularObs(mappedGroupMembers, concept, obs, conceptSetConfig);
        return obs;
    };

    function mapTabularObs (mappedGroupMembers, concept, obs, conceptSetConfig) {
        var tabularObsGroups = _.filter(mappedGroupMembers, function (member) {
            return conceptSetConfig[member.concept.name] && conceptSetConfig[member.concept.name]['isTabular'];
        });

        if (tabularObsGroups.length > 0) {
            var array = _.map(concept.setMembers, function (member) {
                return member.name.name;
            });
            tabularObsGroups.forEach(function (group) {
                group.hidden = true;
            });

            var groupedObsGroups = _.groupBy(tabularObsGroups, function (group) {
                return group.concept.name;
            });

            _.values(groupedObsGroups).forEach(function (groups) {
                var tabularObservations = new Bahmni.ConceptSet.TabularObservations(groups, obs, conceptSetConfig);
                obs.groupMembers.push(tabularObservations);
            });
            var sortedGroupMembers = _.sortBy(obs.groupMembers, function (observation) {
                return array.indexOf(observation.concept.name);
            });
            obs.groupMembers.length = 0;
            obs.groupMembers.push.apply(obs.groupMembers, sortedGroupMembers);
        }
    }

    var mapObservationGroupMembers = function (observations, parentConcept, conceptSetConfig) {
        var observationGroupMembers = [];
        var conceptSetMembers = parentConcept.setMembers;
        conceptSetMembers.forEach(function (memberConcept) {
            var savedObservations = findInSavedObservation(memberConcept, observations);
            var configForConcept = conceptSetConfig[memberConcept.name.name] || {};
            var numberOfNodes = configForConcept.multiple || 1;
            for (var i = savedObservations.length - 1; i >= 0; i--) {
                observationGroupMembers.push(mapObservation(memberConcept, savedObservations[i], conceptSetConfig));
            }
            for (var i = 0; i < numberOfNodes - savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, null, conceptSetConfig));
            }
        });
        return observationGroupMembers;
    };

    var getDatatype = function (concept) {
        if (concept.dataType) {
            return concept.dataType;
        }
        return concept.datatype && concept.datatype.name;
    };

    // tODO : remove conceptUIConfig
    var newObservation = function (concept, savedObs, conceptSetConfig, mappedGroupMembers) {
        var observation = buildObservation(concept, savedObs, mappedGroupMembers);
        var obs = new Bahmni.ConceptSet.Observation(observation, savedObs, conceptSetConfig, mappedGroupMembers);
        if (getDatatype(concept) == "Boolean") {
            obs = new Bahmni.ConceptSet.BooleanObservation(obs, conceptSetConfig);
        }
        return obs;
    };

    // TODO : remove conceptUIConfig
    var newObservationNode = function (concept, savedObsNode, conceptSetConfig, mappedGroupMembers) {
        var observation = buildObservation(concept, savedObsNode, mappedGroupMembers);
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig, concept);
    };

    var showAddMoreButton = function (rootObservation) {
        var observation = this;
        var lastObservationByLabel = _.findLast(rootObservation.groupMembers, {label: observation.label});
        return lastObservationByLabel.uuid === observation.uuid;
    };

    function buildObservation (concept, savedObs, mappedGroupMembers) {
        var comment = savedObs ? savedObs.comment : null;
        return {
            concept: conceptMapper.map(concept),
            units: concept.units,
            label: getLabel(concept),
            possibleAnswers: concept.answers,
            groupMembers: mappedGroupMembers,
            comment: comment,
            showAddMoreButton: showAddMoreButton
        };
    }

    var createObservationForDisplay = function (observation, concept, conceptGroupFormatService) {
        if (observation.value == null) {
            return;
        }
        var observationValue = getObservationDisplayValue(observation, conceptGroupFormatService);
        observationValue = observation.durationObs ? observationValue + " " + getDurationDisplayValue(observation.durationObs) : observationValue;
        return {
            value: observationValue,
            abnormalObs: observation.abnormalObs,
            duration: observation.durationObs,
            provider: observation.provider,
            label: getLabel(observation.concept),
            observationDateTime: observation.observationDateTime,
            concept: concept,
            comment: observation.comment,
            uuid: observation.uuid
        };
    };

    var getObservationDisplayValue = function (observation, conceptGroupFormatService) {
        if (observation.isBoolean || observation.type === "Boolean") {
            return observation.value === true ? "Yes" : "No";
        }
        if (!observation.value) {
            return "";
        }
        if (typeof observation.value.name === "object") {
            var valueConcept = conceptMapper.map(observation.value);
            return valueConcept.shortName || valueConcept.name;
        }

        if (observation.groupMembers === undefined || observation.groupMembers.length <= 0) {
            return observation.value.shortName || observation.value.name || observation.value;
        }

        if (observation.durationObs !== undefined) {
            return observation.primaryObs && (observation.primaryObs.value.shortName || observation.primaryObs.value.name || observation.primaryObs.value);
        }

        return conceptGroupFormatService.groupObs(observation);
    };

    var getDurationDisplayValue = function (duration) {
        var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(duration.value);
        if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
            return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
        }
        return "";
    };

    this.getGridObservationDisplayValue = function (observation, conceptGroupFormatService) {
        var memberValues = _.compact(_.map(observation.groupMembers, function (member) {
            return getObservationDisplayValue(member, conceptGroupFormatService);
        }));
        return memberValues.join(', ');
    };
    var getLabel = function (concept) {
        var mappedConcept = conceptMapper.map(concept);
        return mappedConcept.shortName || mappedConcept.name;
    };
};
