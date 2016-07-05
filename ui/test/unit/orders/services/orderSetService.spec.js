describe('Order Set Service', function () {
  var orderSetService, mockHttp, $q=Q;

  beforeEach(module('bahmni.common.orders'));
  beforeEach(module(function ($provide) {
    mockHttp = jasmine.createSpyObj('$http', ['get']);
    $provide.value('$http', mockHttp);
    $provide.value('$q', $q);
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
    });
    expect(mockHttp.get).toHaveBeenCalled();
    done();
  });

  it('getCalculatedDose should not round off the dose for non special dose unit', function (done) {
    orderSetService.getCalculatedDose('somePatientUuid', 12.23, 'ml').then(function (response) {
      expect(response).toEqual({ dose: 12.23, doseUnit: 'ml' });
      done();
    });
  });
});