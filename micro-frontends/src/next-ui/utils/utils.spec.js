import {
  calculateAgeFromEpochDOB,
  parseDateArray,
  formatDate,
  formatArrayDateToDefaultDateFormat,
  formatGender
} from './utils';
describe('calculateAgeFromEpochDOB', () => {

  describe('formatDate', () => {

    it('should correctly format date using custom format', () => {
      const dateValue = '2023-12-25T08:45:00Z';
      const customFormat = 'YYYY/MM/DD';

      const formattedDate = formatDate(dateValue, customFormat);

      expect(formattedDate).toEqual('2023/12/25');
    });

    it('should return value unchanged if value is falsy', () => {
      const falsyValue = null;

      const formattedDate = formatDate(falsyValue);

      expect(formattedDate).toBeNull();
    });
  });

  describe('formatGender function', () => {
    test('should return "Male" when gender is "M"', () => {
      const gender = "M";
      const formattedGender = formatGender(gender);
      expect(formattedGender).toEqual("Male");
    });

    test('should return "Female" when gender is "F"', () => {
      const gender = "F";
      const formattedGender = formatGender(gender);
      expect(formattedGender).toEqual("Female");
    });

    test('should return "Other" when gender is neither "M" nor "F"', () => {
      const gender = "X";
      const formattedGender = formatGender(gender);
      expect(formattedGender).toEqual("Other");
    });
  });

  describe('formatArrayDateToDefaultDateFormat', () => {
    it('should correctly format date array to default format', () => {
      const dateArray = [2024, 2, 7];

      const formattedDate = formatArrayDateToDefaultDateFormat(dateArray);

      expect(formattedDate).toEqual('7/2/2024');
    });

    it('should correctly format date array with different values to default format', () => {
      const dateArray = [2023, 12, 25];

      const formattedDate = formatArrayDateToDefaultDateFormat(dateArray);

      expect(formattedDate).toEqual('25/12/2023');
    });
  });

  it('should correctly calculate age from epoch date of birth', () => {
    jest.spyOn(Date, 'now').mockImplementation(() =>
      new Date('2024-02-07T00:00:00Z').getTime()
    );

    expect(calculateAgeFromEpochDOB(946684800000)).toEqual('24 years 1 months 6 days');

    expect(calculateAgeFromEpochDOB(631123200000)).toEqual('34 years 1 months 6 days');

    Date.now.mockRestore();
  });

  it('should correctly parse date array into a moment object', () => {
    const dateArray1 = [2024, 2, 7, 12, 30, 0];
    const dateArray2 = [2000, 1, 1, 0, 0, 0];

    const result1 = parseDateArray(dateArray1).format('YYYY-MM-DD HH:mm:ss');
    const result2 = parseDateArray(dateArray2).format('YYYY-MM-DD HH:mm:ss');

    expect(result1).toEqual('2024-02-07 12:30:00');
    expect(result2).toEqual('2000-01-01 00:00:00');
  });
});
