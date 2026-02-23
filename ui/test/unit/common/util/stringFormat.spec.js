/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


describe('stringFormat', function() {
    describe('toValidId', function() {
        it('should replace all the spaces with hyphens to make it a valid html id value', function() {
            expect("Radiology Test section".toValidId()).toEqual("Radiology-Test-section");
        });

        it('should replace nothing', function() {
            expect("Radiology".toValidId()).toEqual("Radiology");
        });
    })
})