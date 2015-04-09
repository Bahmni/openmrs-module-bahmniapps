describe("scrollToService", function() {
    var scrollToService = {};
    var mockElement =  {offsetTop: 10};

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(['scrollToService', function (scrollToServiceInjected) {
        scrollToService = scrollToServiceInjected;
    }]));

    describe("scrollTo", function(){
        it("call to scrollTo for an element should return the scrollToService", function() {
            var scroll = scrollToService.scrollTo(mockElement);
            expect(scroll).toBe(scrollToService);
        });
    });
});