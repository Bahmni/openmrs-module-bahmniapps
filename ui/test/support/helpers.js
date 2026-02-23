/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

var Bahmni = Bahmni || {};
Bahmni.Tests = Bahmni.Tests || {};

Bahmni.Tests.openMRSConceptHelper = {
	getConceptByName: function(concepts, conceptName) {
        var foundConcept = concepts.filter(function(concept) {
            return concept.name.name === conceptName;
        })[0];
        if(foundConcept) return foundConcept;
        concepts.forEach(function(concept){
            if(!foundConcept) foundConcept = Bahmni.Tests.openMRSConceptHelper.getConceptByName(concept.setMembers, conceptName);
        });
        return foundConcept;
    },

    mapToConcept: function(openMRSConcept) {
        return {uuid: openMRSConcept.uuid, name: openMRSConcept.name.name};
    }
}