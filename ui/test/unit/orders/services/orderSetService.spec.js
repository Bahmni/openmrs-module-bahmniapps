describe('Order Set Service', function () {
  var orderSetService, mockHttp;

  beforeEach(module('bahmni.common.orders'));
  beforeEach(module(function ($provide) {
    mockHttp = jasmine.createSpyObj('$http', ['get']);
    $provide.value('$http', mockHttp);
  }));

  beforeEach(inject(['orderSetService',
    function (orderSetServiceInjected) {
      orderSetService = orderSetServiceInjected;
    }
  ]));

  it('getCalculatedDose should round off the dose for special dose unit', function (done) {
    var data = {
      value: 12.23,
      doseUnit: 'mg'
    };
    mockHttp.get.and.returnValue(specUtil.createFakePromise(data));

    orderSetService.getCalculatedDose('somePatientUuid', 1, 'mg/m2').then(function (response) {
      expect(response.data).toEqual({ dose: 12, doseUnit: 'mg' });
      done();
    });
    expect(mockHttp.get).toHaveBeenCalled();
  });
});