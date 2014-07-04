Bahmni.Clinical.PatientFileObservationsMapper = function () {
    this.mapToDisplayItems = function (encounters) {
        var displayItems = [];
        encounters.forEach(function (encounter) {
            var visitUuid = encounter.visit && encounter.visit.uuid;
            encounter.obs.forEach(function (parentObservation) {
                var imageConcept = parentObservation.concept.name;
                parentObservation.groupMembers.forEach(function (member) {
                    var documentImage = {};
                    documentImage = new Bahmni.Common.DocumentImage(
                        {
                            id:member.id,
                            src:"/document_images/" + member.value,
                            concept:imageConcept,
                            obsDatetime:member.obsDatetime,
                            visitUuid: visitUuid
                        });
                    displayItems.push(documentImage);
                })
            })
        });
        sortDisplayItems(displayItems);
        return displayItems;
    };

    var sortDisplayItems = function (displayItems) {
        displayItems.sort(function (image1, image2) {
            return Date.parse(image1.obsDatetime) !==  Date.parse(image2.obsDatetime)?
                Date.parse(image1.obsDatetime) -  Date.parse(image2.obsDatetime):
                image1.id - image2.id;
        });
    }
};