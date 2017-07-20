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

  it('getCalculatedDose should not call to service when rule is undefined', function (done) {
    var data = {
      value: 12.23,
      doseUnit: 'mg'
    };
    mockHttp.get.and.returnValue(specUtil.createFakePromise(data));

    orderSetService.getCalculatedDose('somePatientUuid','drugName', 1, 'mg/m2','orderset', undefined);
    expect(mockHttp.get).not.toHaveBeenCalled();
    done();
  });

  it('getCalculatedDose should not call to service when rule is null', function (done) {
    var data = {
      value: 12.23,
      doseUnit: 'mg'
    };
    mockHttp.get.and.returnValue(specUtil.createFakePromise(data));

    orderSetService.getCalculatedDose('somePatientUuid','drugName', 1, 'mg' ,'orderset', null);
    expect(mockHttp.get).not.toHaveBeenCalled();
    done();
  });

  it('getCalculatedDose should round off the dose for special dose unit', function (done) {
    var data = {
      value: 12.23,
      doseUnit: 'mg'
    };
    mockHttp.get.and.returnValue(specUtil.createFakePromise(data));

    orderSetService.getCalculatedDose('somePatientUuid','drugName', 1, 'mg/m2','orderset','mg/m2').then(function (response) {
      expect(response.data).toEqual({ dose: 12, doseUnit: 'mg' });
    });
    expect(mockHttp.get).toHaveBeenCalled();
    done();
  });

  it('getCalculatedDose should not round off the dose when it is less than 0.49', function(done){
    var baseDose = 0.48;
    var doseUnit = 'mg/kg';
    var mockedReturnData = {
      value: 0.48,
      doseUnit: 'mg'
    };
    mockHttp.get.and.returnValue(specUtil.createFakePromise(mockedReturnData));

    orderSetService.getCalculatedDose('somePatientUuid','drugName',baseDose, doseUnit,'orderset','mg/kg').then(function(response){
      expect(response.data).toEqual({ dose: 0.48, doseUnit: 'mg'});
      done();
    });
  });

  it('getCalculatedDose should round off the dose to 0.1 when it is less than 0.1', function(done){
    var baseDose = 0.05;
    var doseUnit = 'mg/kg';
    var mockedReturnData = {
      value: 0.05,
      doseUnit: 'mg'
    };
    mockHttp.get.and.returnValue(specUtil.createFakePromise(mockedReturnData));

    orderSetService.getCalculatedDose('somePatientUuid','drugName',baseDose, doseUnit,'orderset','mg/kg').then(function(response){
      expect(response.data).toEqual({ dose: 0.1, doseUnit: 'mg'});
      done();
    });
  });
});