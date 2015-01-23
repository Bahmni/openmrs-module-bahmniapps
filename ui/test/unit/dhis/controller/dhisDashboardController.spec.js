'use strict';

describe("DhisDashboardController", function () {

    beforeEach(module('bahmni.dhis'));

    var scope;
    var wrapperPromise;
    var _taskService;


    describe("Tasks should be empty when no reports have been run earlier", function () {

        beforeEach(inject(function ($controller, $rootScope, $state) {
            var allTasks = [];
            scope = $rootScope.$new();

            wrapperPromise = specUtil.respondWith({"data": allTasks});

            _taskService = jasmine.createSpyObj('TaskService', ['getAllTasks']);
            _taskService.getAllTasks.and.returnValue(wrapperPromise);

            $controller('DhisDashboardController', {
                $scope: scope,
                $state: $state,
                TaskService: _taskService
            });
        }));

        it("empty tasks", function (done) {

            wrapperPromise.then(function () {
                expect(scope.tasks.isEmpty()).toBeTruthy();
                done();
            })
        });
    });

    describe("Tasks should not be empty when no reports have been run earlier", function () {
        var now = new Date().getTime();
        beforeEach(inject(function ($controller, $rootScope, $state) {

            var allTasks = [
                {"dateCreated": now, "taskStatus": "IN PROGRESS"},
                {"dateCreated": now - 1, "taskStatus": "DONE"},
                {"dateCreated": now - 2, "taskStatus": "DONE"},
                {"dateCreated": now - 3, "taskStatus": "DONE"},
                {"dateCreated": now - 4, "taskStatus": "DONE"},
                {"dateCreated": now - 5, "taskStatus": "ERROR"}
            ];
            scope = $rootScope.$new();

            wrapperPromise = specUtil.respondWith({"data": allTasks});

            _taskService = jasmine.createSpyObj('TaskService', ['getAllTasks']);
            _taskService.getAllTasks.and.returnValue(wrapperPromise);

            $controller('DhisDashboardController', {
                $scope: scope,
                $state: $state,
                TaskService: _taskService
            });
        }));

        it("not empty tasks", function (done) {

            wrapperPromise.then(function () {
                var actualTasks = scope.tasks;
                expect(actualTasks.isEmpty()).toBeFalsy();
                expect(actualTasks.length).toBe(6);

                var inProgressTasks = actualTasks.filter(function (task) {
                    return task.status === "IN PROGRESS";
                });
                expect(inProgressTasks.length).toBe(1);
                expect(inProgressTasks[0].dateCreated).toBe(now);

                var completedTasks = actualTasks.filter(function (task) {
                    return task.status === "DONE";
                });
                expect(completedTasks.length).toBe(4);

                var erroredTasks = actualTasks.filter(function (task) {
                    return task.status === "ERROR";
                });
                expect(erroredTasks.length).toBe(1);

                done();
            })
        });
    });

    describe("Refresh", function () {
        var _state, initialState;

        beforeEach(inject(function ($controller, $rootScope, $state) {
            scope = $rootScope.$new();
            initialState = $state.current;

            _taskService = jasmine.createSpyObj('TaskService', ['fireQueries', 'getAllTasks']);
            _taskService.getAllTasks.and.returnValue(specUtil.respondWith({"data": []}));

            _state = jasmine.createSpyObj('$state', ['reload']);

            $controller('DhisDashboardController', {
                $scope: scope,
                $state: _state,
                TaskService: _taskService
            });
        }));

        it("should refresh the status of tasks", function () {

            scope.refresh();

            expect(_state.reload).toHaveBeenCalled();
        })
    });


    describe("Fire queries test", function () {
        var now = new Date().getTime();
        var initialState;
        var state;
        beforeEach(inject(function ($controller, $rootScope, $state) {

            var allTasks = [
                {"dateCreated": now, "taskStatus": "IN PROGRESS"},
                {"dateCreated": now - 1, "taskStatus": "DONE"},
                {"dateCreated": now - 2, "taskStatus": "DONE"},
                {"dateCreated": now - 3, "taskStatus": "DONE"},
                {"dateCreated": now - 4, "taskStatus": "DONE"},
                {"dateCreated": now - 5, "taskStatus": "ERROR"}
            ];
            scope = $rootScope.$new();
            initialState = $state.current;
            wrapperPromise = specUtil.respondWith({"data": allTasks});

            _taskService = jasmine.createSpyObj('TaskService', ['fireQueries', 'getAllTasks']);
            _taskService.fireQueries.and.returnValue(specUtil.respondWith({"data": undefined}));
            _taskService.getAllTasks.and.returnValue(wrapperPromise);
            state = $state;
            $controller('DhisDashboardController', {
                $scope: scope,
                $state: state,
                TaskService: _taskService
            });
        }));

        it("Firequeries is called with correct parameters", function () {
            scope.fireQueries();
            expect(_taskService.fireQueries).toHaveBeenCalledWith(scope.report);
        });

        it("Firequeries changes state", function () {
            scope.fireQueries();
            expect(state.current).toBe(initialState);
        });
    });

    describe("Open Report Test", function () {
        var now = new Date().getTime();
        var initialState;
        var state;
        beforeEach(module('stateMock'));

        beforeEach(inject(function ($controller, $rootScope, $state) {

            var allTasks = [
                {"dateCreated": now, "taskStatus": "IN PROGRESS"},
                {"dateCreated": now - 1, "taskStatus": "DONE"},
                {"dateCreated": now - 2, "taskStatus": "DONE"},
                {"dateCreated": now - 3, "taskStatus": "DONE"},
                {"dateCreated": now - 4, "taskStatus": "DONE"},
                {"dateCreated": now - 5, "taskStatus": "ERROR"}
            ];
            scope = $rootScope.$new();
            initialState = $state.current;
            wrapperPromise = specUtil.respondWith({"data": allTasks});

            _taskService = jasmine.createSpyObj('TaskService', ['fireQueries', 'getAllTasks']);
            _taskService.fireQueries.and.returnValue(specUtil.respondWith({"data": undefined}));
            _taskService.getAllTasks.and.returnValue(wrapperPromise);
            state = $state;
            state.params = {"taskId": 15};
            $controller('DhisDashboardController', {
                $scope: scope,
                $state: state,
                TaskService: _taskService
            });
        }));

        it("Open Report should transition state", function () {
            state.expectTransitionTo("dhis.report");
            scope.openReport();
            state.ensureAllTransitionsHappened();
        });
    });

});