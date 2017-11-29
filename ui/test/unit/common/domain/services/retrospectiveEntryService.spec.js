'use strict';

describe('retrospectiveEntryService', function () {
    var rootScope, $bahmniCookieStore, retrospectiveEntryService;

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'remove', 'put']);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
    }));

    beforeEach(inject(function (_$rootScope_, _retrospectiveEntryService_) {
        rootScope = _$rootScope_;
        retrospectiveEntryService = _retrospectiveEntryService_;
    }));


    it("should initialise retrospective entry from the cookie", function(){
        var retrospectiveDateString = "2014-03-18";
        $bahmniCookieStore.get.and.callFake(function(cookieName) {
            if (cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName) {
                return  retrospectiveDateString;
            }
        });

        retrospectiveEntryService.initializeRetrospectiveEntry();

        expect(rootScope.retrospectiveEntry.encounterDate).toEqual(moment(retrospectiveDateString).toDate());
    });

    it("should not initialise retrospective entry when there is no retrospective date cookie", function(){
        $bahmniCookieStore.get.and.callFake(function(cookieName) {
            if (cookieName == Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName) {
                return  undefined;
            }
        });

        retrospectiveEntryService.initializeRetrospectiveEntry();

        expect(rootScope.retrospectiveEntry).toEqual(undefined);
    });

    it("should reset retrospective entry if the selected date is in past", function(){
        var date = moment("2015-06-12").toDate();
        rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(moment());

        retrospectiveEntryService.resetRetrospectiveEntry(date);

        expect($bahmniCookieStore.remove.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
        expect($bahmniCookieStore.remove.calls.mostRecent().args[1]).toEqual({path: '/', expires: 1});
        expect($bahmniCookieStore.put.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
        expect($bahmniCookieStore.put.calls.mostRecent().args[1]).toEqual(date);
        expect($bahmniCookieStore.put.calls.mostRecent().args[2]).toEqual({path: '/', expires: 1});
        expect(rootScope.retrospectiveEntry.encounterDate).toEqual(date);
    });

    it("should delete retrospective entry if the selected date is today", function(){
        var date = moment().toDate();
        rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(moment());

        retrospectiveEntryService.resetRetrospectiveEntry(date);

        expect($bahmniCookieStore.remove.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
        expect($bahmniCookieStore.remove.calls.mostRecent().args[1]).toEqual({path: '/', expires: 1});
        expect(rootScope.retrospectiveEntry).toEqual(undefined);
    });
});