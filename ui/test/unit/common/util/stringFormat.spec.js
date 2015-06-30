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