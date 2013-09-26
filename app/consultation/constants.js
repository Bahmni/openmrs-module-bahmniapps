var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};

Bahmni.Opd.Constants = (function() {
	var orderTypes = {
	    	lab: "Lab Order",
	    	radiology: "Radiology Order"
	};
	return {
	    activePatientsListUrl: "../patients",
	    dispositionConcept : "DispositionOptions",
	    dispositionNoteConcept : "disposition note",
	    dispositionOrderType : "Disposition Order",
	    orderTypes : orderTypes,
	    testOrderTypes: [orderTypes.lab, orderTypes.radiology]
	};	
})();



