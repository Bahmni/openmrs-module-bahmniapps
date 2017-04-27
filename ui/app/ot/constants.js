'use strict';

var Bahmni = Bahmni || {};
Bahmni.OT = Bahmni.OT || {};

Bahmni.OT.Constants = (function () {
    return {
        getSurgeonNames: "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&locale=en&name=FSTG,+Name+(s)+of+Surgeon+1&v=bahmni"
    };
})();

