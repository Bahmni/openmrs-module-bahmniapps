/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


describe('Filter: thumbnail', function() {
    var thumbnailFilter;

    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(inject(function($filter) {
        thumbnailFilter = $filter('thumbnail');
    }));

    it("should return the url with thumbnail when extension is not specified ", function () {
        var url = thumbnailFilter("200/124-Consultation-eab25794-9a9c-47db-8192-925bc8663cf8.png");
        expect(url).toEqual("/document_images/200/124-Consultation-eab25794-9a9c-47db-8192-925bc8663cf8_thumbnail.png")
    });

    it("should return the url with thumbnail when extension is specified ", function () {
        var url = thumbnailFilter("200/124-Consultation-eab25794-9a9c-47db-8192-925bc8663cf8.mp4", 'jpg');
        expect(url).toEqual("/document_images/200/124-Consultation-eab25794-9a9c-47db-8192-925bc8663cf8_thumbnail.jpg")
    });
});