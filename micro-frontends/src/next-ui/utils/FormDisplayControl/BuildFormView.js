import axios from "axios";
import { GET_ALL_FORMS_BASE_URL, GET_FORMS_BASE_URL, GET_FORM_TRANSLATE_URL } from "../../constants";
import { cloneDeep, remove } from "lodash";


var getAllForms = async () => {
    const apiURL = GET_ALL_FORMS_BASE_URL;
    const params = {
        v: "custom:(version,name,uuid)"
    };
    try {
        const response = await axios.get(apiURL, { params });
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
};

var getFormDetail = async (formUuid ) => {
    const apiURL = GET_FORMS_BASE_URL.replace('{formUuid}', formUuid);
    const params = { 
        v: "custom:(resources:(value))"
    };
    try {
        const response = await axios.get(apiURL, { params });
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
};


var getFormTranslate = async (formName, formVersion, locale, formUuid ) => {
    const apiURL = GET_FORM_TRANSLATE_URL;
    const params = {
        "formName": formName,
        "formVersion": formVersion,
        "locale": locale,
        "formUuid": formUuid
    };
    try {
        const response = await axios.get(apiURL, { params });
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
};
var formBuildForms = [];
export const build = async (bahmniObservations, hasNoHierarchy) => {
    bahmniObservations.forEach(function (obs) {
        obs.value = preProcessMultiSelectObs(obs.value);
    });
    formBuildForms = await getAllForms();
    var obs = createObsGroupForForm(bahmniObservations, formBuildForms);
    if (!hasNoHierarchy) {
        const newObs = await updateObservationsWithFormDefinition(obs, formBuildForms);
        return newObs;
    }
};

var getLatestObservationDateTime = function (groupMembers) {
    var latestObservationDateTime = groupMembers[0].observationDateTime;
    groupMembers.forEach(function (member) {
        latestObservationDateTime = latestObservationDateTime < member.observationDateTime ? member.observationDateTime : latestObservationDateTime;
    });
    return latestObservationDateTime;
};

var createMultiSelectObservation = function (observations) {
    var multiSelectObject = {};
    multiSelectObject.type = "multiSelect";
    multiSelectObject.concept = observations[0].concept;
    multiSelectObject.encounterDateTime = observations[0].encounterDateTime;
    // multiSelectObject.groupMembers = observations; // might need to add observations based on other approaches.
    multiSelectObject.groupMembers = [];
    const multiSelectValue = observations.map(obs => obs.value && obs.value.shortName || obs.value)
    multiSelectObject.value = multiSelectValue.join(', ');
    multiSelectObject.conceptConfig = {multiSelect: true};
    multiSelectObject.observationDateTime = getLatestObservationDateTime(observations);
    multiSelectObject.providers = observations[0].providers;
    multiSelectObject.creatorName = observations[0].creatorName;
    multiSelectObject.formFieldPath = observations[0].formFieldPath;
    multiSelectObject.encounterUuid = observations[0].encounterUuid;
    return multiSelectObject;
};

var preProcessMultiSelectObs = function (value) {
    var clonedGroupMembers = cloneDeep(value);
    clonedGroupMembers.forEach( function (member) {
        if (member && member.groupMembers.length === 0) {
            var obsWithSameFormFieldPath = getRecordObservations(member.formFieldPath, value);
            if (obsWithSameFormFieldPath.length > 1) {
                var multiSelectObject = createMultiSelectObservation(obsWithSameFormFieldPath);
                value.push(multiSelectObject);
            } else if (obsWithSameFormFieldPath.length === 1) {
                value.push(obsWithSameFormFieldPath[0]);
            }
        } else if (member.groupMembers.length > 0) {
            var obsGroups = getRecordObservations(member.formFieldPath, value);
            obsGroups.forEach( function (obsGroup) {
                obsGroup.groupMembers = preProcessMultiSelectObs(obsGroup.groupMembers);
                value.push(obsGroup);
            });
        }
    });
    return value;
};

var createObsGroupForForm = function (observations, formBuilderForms) {
    observations.forEach( function (obs) {
        var newValues = [];
        obs.value.forEach( function (value) {
            if (!value.formFieldPath) {
                newValues.push(value);
                return;
            }
            var obsGroup = {
                "groupMembers": [],
                "concept": {
                    "shortName": "",
                    "conceptClass": null
                },
                "encounterUuid": ""

            };
            var formName = value.formFieldPath.split('.')[0];
            var formBuilderForm = formBuilderForms.find(function (form) {
                return form.name ===
                    formName;
            });
            obsGroup.concept.shortName = formName;
            var locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
            var formNameTranslations = formBuilderForm && formBuilderForm.nameTranslation ? JSON.parse(formBuilderForm.nameTranslation) : [];
            if (formNameTranslations.length > 0) {
                var currentLabel = formNameTranslations.find(function (formNameTranslation) {
                        return formNameTranslation.locale === locale;
                    });
                if (currentLabel) {
                    obsGroup.concept.shortName = currentLabel.display;
                }
            }
            obsGroup.encounterUuid = value.encounterUuid;
            var previousObsGroupFound;
            newValues.forEach( function (newValue) {
                if (obsGroup.concept.shortName === newValue.concept.shortName) {
                    newValue.groupMembers.push(value);
                    previousObsGroupFound = true;
                }
            });
            if (previousObsGroupFound) {
                return;
            }
            obsGroup.groupMembers.push(value);
            newValues.push(obsGroup);
        });
        obs.value = newValues;
    });
    return observations;
};

var updateObservationsWithFormDefinition = async function (observations, formBuildForms) {
    var allForms = formBuildForms;
    for(let observation of observations) {
        var forms = [];
        for (let form of observation.value) {
            if (form.concept.conceptClass) {
                forms.push(form);
                return;
            }
            var observationForm = getFormByFormName(allForms, getFormName(form.groupMembers), getFormVersion(form.groupMembers));
            if (!observationForm) {
                return;
            }
            var response = await getFormDetail(observationForm.uuid)
            //doubt: which resource it should pick - response.resources[0].value;
            var formDetailsAsString = response.resources[0].value;
            if (formDetailsAsString) {
                var formDef = JSON.parse(formDetailsAsString);
                formDef.version = observationForm.version;
                var locale = localStorage["NG_TRANSLATE_LANG_KEY"] || "en";
                var translationData = await getFormTranslate(formDef.name, formDef.version, locale, formDef.uuid)
                forms.push(updateObservationsWithRecordTree(formDef, form, translationData));
                observation.value = forms;
            }
            observation.value = forms;
        };
    };
    return observations;
};

var getFormByFormName = function (formList, formName, formVersion) {
    return formList.find( function (form) {
        return form.name === formName && form.version === formVersion;
    });
};

var getFormName = function (members) {
    var member = members.find( function (member) {
        return member.formFieldPath !== null;
    });
    return member ? member.formFieldPath.split('.')[0] : undefined;
};

var getFormVersion = function (members) {
    var member = members.find( function (member) {
        return member.formFieldPath !== null;
    });
    return member ? member.formFieldPath.split('.')[1].split('/')[0] : undefined;
};

var updateObservationsWithRecordTree = function (formDef, form, translationData) {
    var recordTree = getRecordTree(formDef, form.groupMembers);
    recordTree = JSON.parse(JSON.stringify(recordTree));
    createGroupMembers(recordTree, form, form.groupMembers, translationData);
    return form;
};

var createColumnGroupsForTable = function (record, columns, tableGroup, obsList, translationData) {
    columns.forEach( function (column, index) {
        var obsGroup = {
            "groupMembers": [],
            "concept": {
                "shortName": "",
                "conceptClass": null
            }
        };
        var translationKey = column.translationKey;
        var defaultShortName = column.value;
        obsGroup.concept.shortName = getTranslatedShortName(translationData, translationKey, obsGroup, defaultShortName);
        var columnRecord = getColumnObs(index, record);
        column.children = columnRecord;
        createGroupMembers(column, obsGroup, obsList, translationData);
        if (obsGroup.groupMembers.length > 0) {
            tableGroup.groupMembers.push(obsGroup);
        }
    });
};

var getTranslatedShortName = function (translationData, translationKey, obsGroup, defaultShortName) {
    if (isTranslationKeyPresent(translationData, translationKey)) {
        return translationData.labels[translationKey][0];
    }
    return defaultShortName;
};

var isTranslationKeyPresent = function (translationData, translationKey) {
    return translationData && translationData.labels &&
        translationData.labels[translationKey][0] !== translationKey;
};

var getColumnObs = function (columnIndex, record) {
    var columnChildren = [];
    record.children.map( function (child) {
        if (child.control.properties && child.control.properties.location.column === columnIndex) {
            columnChildren.push(child);
        }
    });
    return columnChildren;
};

var createGroupMembers = function (recordTree, obsGroup, obsList, translationData) {
    recordTree.children.forEach( function (record) {
        if (record.control.type === 'obsControl' || record.control.type === 'obsGroupControl') {
            var recordObservations = getRecordObservations(record.formFieldPath, obsList);
            recordObservations.forEach( function (recordObservation) {
                obsGroup.groupMembers.push(recordObservation);
            });
        }
        else if (record.control.type === 'section') {
            var sectionGroup = createObsGroup(record, translationData);
            createGroupMembers(record, sectionGroup, obsList, translationData);
            if (sectionGroup.groupMembers.length > 0) {
                obsGroup.groupMembers.push(sectionGroup);
            }
        }
        else if (record.control.type === "table") {
            var tableGroup = createObsGroup(record, translationData);
            var columns = record.control.columnHeaders;
            createColumnGroupsForTable(record, columns, tableGroup, obsList, translationData);
            if (tableGroup.groupMembers.length > 0) {
                obsGroup.groupMembers.push(tableGroup);
            }
        }
    });
};

var getRecordObservations = function (obsFormFieldPath, obsList) {
    return remove(obsList, function (obs) {
        return obs.formFieldPath && obs.formFieldPath === obsFormFieldPath;
    });
};

var createObsGroup = function (record, translationData) {
    var obsGroup = {
        "groupMembers": [],
        "concept": {
            "shortName": "",
            "conceptClass": null
        }
    };
    var translationKey = record.control.label.translationKey;
    var defaultShortName = record.control.label.value;
    obsGroup.concept.shortName = getTranslatedShortName(translationData, translationKey, obsGroup, defaultShortName);
    return obsGroup;
};