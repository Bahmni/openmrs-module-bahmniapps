'use strict';

describe('reportBarcodeService', function () {
    var reportBarcodeService;

    var reportHtml =
        '<html><head><title>LAB-009</title></head><body>' +
        '<table>' +
        '<tr><td colspan="2"><span>LAB-009 Lab Shipping List</span></td></tr>' +
        '<tr><td><span>Date Specimen Collected</span></td><td><span>Lab Order Number</span></td></tr>' +
        '<tr><td><span>2026-04-07</span></td><td><span>EDAX000465</span></td></tr>' +
        '<tr><td><span>2026-04-08</span></td><td><span>EDAX000458</span></td></tr>' +
        '<tr><td><span>2026-04-08</span></td><td><span></span></td></tr>' +
        '</table></body></html>';

    // Structure of the real LAB-009 HTML from bahmnireports (JasperReports), with inline styles trimmed
    var lab009Html = [
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        '<html><head><title></title></head><body>',
        '<table width="100%"><tr><td width="50%">&nbsp;</td><td align="center">',
        '<a name="JR_PAGE_ANCHOR_0_1"></a>',
        '<table class="jrPage">',
        '<tr style="height:0"><td></td><td></td><td></td><td></td><td></td></tr>',
        '<tr><td colspan="5"></td></tr>',
        '<tr><td></td><td colspan="3"><span>LAB-009 Lab Shipping List</span></td><td></td></tr>',
        '<tr><td></td><td colspan="3"><span>From 2026-10-31 to 2026-10-31</span></td><td></td></tr>',
        '<tr><td></td><td colspan="3"></td><td></td></tr>',
        '<tr><td></td><td><span>Date Specimen Collected</span></td><td colspan="2"><span>Lab Order Number</span></td><td></td></tr>',
        '<tr><td></td><td><span>31-Oct-2026</span></td><td colspan="2"><span>BDEP000570</span></td><td></td></tr>',
        '<tr><td></td><td><span>31-Oct-2026</span></td><td colspan="2"><span>BDEP000565</span></td><td></td></tr>',
        '<tr><td colspan="5"></td></tr>',
        '<tr><td></td><td colspan="2"><span>1</span></td><td><span>&nbsp;of 1</span></td><td></td></tr>',
        '<tr><td colspan="5"></td></tr>',
        '</table>',
        '</td><td width="50%">&nbsp;</td></tr></table>',
        '</body></html>'
    ].join('\n');

    var parse = function (html) {
        return new DOMParser().parseFromString(html, 'text/html');
    };

    beforeEach(function () {
        module('bahmni.reports');
        inject(function (_reportBarcodeService_) {
            reportBarcodeService = _reportBarcodeService_;
        });
    });

    describe('isEnabledFor', function () {
        it('is enabled only when the report configures barcode columns', function () {
            expect(reportBarcodeService.isEnabledFor({ config: { barcodeColumns: ['Lab Order Number'] } })).toBe(true);
            expect(reportBarcodeService.isEnabledFor({ config: { barcodeColumns: [] } })).toBe(false);
            expect(reportBarcodeService.isEnabledFor({ config: {} })).toBe(false);
            expect(reportBarcodeService.isEnabledFor({})).toBe(false);
        });
    });

    describe('addBarcodes', function () {
        it('adds a barcode under each value of the configured column', function () {
            var doc = parse(reportBarcodeService.addBarcodes(reportHtml, ['Lab Order Number']));
            var rows = doc.querySelectorAll('tr');

            expect(doc.querySelectorAll('.report-barcode svg').length).toBe(2);
            expect(rows[2].cells[1].querySelector('.report-barcode svg rect')).not.toBeNull();
            expect(rows[3].cells[1].querySelector('.report-barcode svg')).not.toBeNull();
            expect(rows[2].cells[1].textContent).toBe('EDAX000465');
        });

        it('does not add barcodes to other columns, headers or empty cells', function () {
            var doc = parse(reportBarcodeService.addBarcodes(reportHtml, ['Lab Order Number']));
            var rows = doc.querySelectorAll('tr');

            expect(rows[0].querySelector('.report-barcode')).toBeNull();
            expect(rows[1].querySelector('.report-barcode')).toBeNull();
            expect(rows[2].cells[0].querySelector('.report-barcode')).toBeNull();
            expect(rows[4].querySelector('.report-barcode')).toBeNull();
        });

        it('matches column names ignoring case and spacing', function () {
            var doc = parse(reportBarcodeService.addBarcodes(reportHtml, ['  lab order   NUMBER ']));
            expect(doc.querySelectorAll('.report-barcode svg').length).toBe(2);
        });

        it('lines columns up correctly when cells span several columns', function () {
            var html = '<table>' +
                '<tr><td colspan="3">Date</td><td>Lab Order Number</td></tr>' +
                '<tr><td colspan="2">2026-04-07</td><td>x</td><td>EDAX000465</td></tr>' +
                '</table>';
            var doc = parse(reportBarcodeService.addBarcodes(html, ['Lab Order Number']));
            var cells = doc.querySelectorAll('tr')[1].cells;

            expect(cells[1].textContent).toBe('x');
            expect(cells[1].querySelector('.report-barcode')).toBeNull();
            expect(cells[2].querySelector('.report-barcode svg')).not.toBeNull();
        });

        it('adds the barcode styles and a base url for relative links', function () {
            var doc = parse(reportBarcodeService.addBarcodes(reportHtml, ['Lab Order Number'], 'https://host/bahmnireports/report?name=x'));

            expect(doc.head.querySelector('style').textContent).toContain('.report-barcode');
            expect(doc.head.querySelector('base').getAttribute('href')).toBe('https://host/bahmnireports/report?name=x');
        });

        describe('with the LAB-009 Lab Shipping List layout', function () {
            var doc;

            beforeEach(function () {
                doc = parse(reportBarcodeService.addBarcodes(lab009Html, ['Lab Order Number']));
            });

            var cellContaining = function (text) {
                return _.find(doc.querySelectorAll('.jrPage td'), function (cell) {
                    return cell.textContent.trim() === text;
                });
            };

            it('adds a barcode to every lab order number', function () {
                expect(doc.querySelectorAll('.report-barcode svg').length).toBe(2);
                expect(cellContaining('BDEP000570').querySelector('.report-barcode svg rect')).not.toBeNull();
                expect(cellContaining('BDEP000565').querySelector('.report-barcode svg rect')).not.toBeNull();
            });

            it('leaves the title, header, dates and page number alone', function () {
                _.each(['LAB-009 Lab Shipping List', 'Lab Order Number', 'Date Specimen Collected', '1'], function (text) {
                    expect(cellContaining(text).querySelector('.report-barcode')).toBeNull();
                });
                _.each(doc.querySelectorAll('.jrPage tr'), function (row) {
                    if (row.textContent.indexOf('31-Oct-2026') !== -1) {
                        expect(row.cells[1].querySelector('.report-barcode')).toBeNull();
                    }
                });
            });

            it('keeps the report doctype', function () {
                var html = reportBarcodeService.addBarcodes(lab009Html, ['Lab Order Number']);
                expect(html.indexOf('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"')).toBe(0);
            });
        });

        it('leaves the report unchanged when the column is not present', function () {
            var doc = parse(reportBarcodeService.addBarcodes(reportHtml, ['Patient Identifier']));
            expect(doc.querySelectorAll('.report-barcode').length).toBe(0);
        });
    });
});
