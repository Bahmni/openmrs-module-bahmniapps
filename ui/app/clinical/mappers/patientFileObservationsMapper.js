Bahmni.Clinical.PatientFileObservationsMapper = function () {
    this.mapToDisplayItems = function (encounters) {
        var displayItems = [];
        encounters.forEach(function (encounter) {
            encounter.obs.forEach(function (parentObservation) {
                var imageConcept = parentObservation.concept.name;
                parentObservation.groupMembers.forEach(function (member) {
                    var documentImage = {};
                    documentImage = new Bahmni.Common.DocumentImage(
                        {
                            id:member.id,
                            src:"/document_images/" + member.value,
                            concept:imageConcept,
                            obsDatetime:member.obsDatetime
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
            return image1.id - image2.id
        });
    }
};