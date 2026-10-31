'use strict';

/**
 * Adds a small Code 128 barcode under every value of the configured columns of an HTML report.
 * Enable it per report in reports.json, e.g. "config": { "barcodeColumns": ["Lab Order Number"] }
 */
angular.module('bahmni.reports')
    .service('reportBarcodeService', ['$window', function ($window) {
        var BARCODE_CLASS = 'report-barcode';
        var BARCODE_STYLE =
            '.' + BARCODE_CLASS + '{display:block;margin-top:2px;line-height:0}' +
            '.' + BARCODE_CLASS + ' svg{height:24px;width:auto;max-width:150px}' +
            '@media print{.' + BARCODE_CLASS + '{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

        var normalize = function (text) {
            return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
        };

        var isEnabledFor = function (report) {
            var columns = report && report.config && report.config.barcodeColumns;
            return !!(columns && columns.length && $window.JsBarcode);
        };

        /** Maps each cell to its starting column so header and data cells line up despite colspans */
        var cellsWithOffsets = function (row) {
            var offset = 0;
            return _.map(row.cells, function (cell) {
                var entry = { cell: cell, offset: offset };
                offset += cell.colSpan || 1;
                return entry;
            });
        };

        var createBarcode = function (doc, value) {
            var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
            $window.JsBarcode(svg, value, {
                format: 'CODE128',
                displayValue: false,
                margin: 0,
                width: 1,
                height: 24
            });
            var wrapper = doc.createElement('span');
            wrapper.className = BARCODE_CLASS;
            wrapper.appendChild(svg);
            return wrapper;
        };

        var addBarcodesToTable = function (doc, table, columnNames) {
            var columnOffsets = [];
            _.each(table.rows, function (row) {
                var cells = cellsWithOffsets(row);
                var headerCells = _.filter(cells, function (entry) {
                    return _.includes(columnNames, normalize(entry.cell.textContent));
                });
                if (headerCells.length) {
                    columnOffsets = _.map(headerCells, 'offset');
                    return;
                }
                _.each(cells, function (entry) {
                    var value = entry.cell.textContent.trim();
                    if (!value || !_.includes(columnOffsets, entry.offset) ||
                        entry.cell.querySelector('.' + BARCODE_CLASS)) {
                        return;
                    }
                    try {
                        entry.cell.appendChild(createBarcode(doc, value));
                    } catch (e) {
                        // value cannot be encoded as Code 128; leave the text as it is
                    }
                });
            });
        };

        var addBarcodes = function (html, columns, baseUrl) {
            var doc = new $window.DOMParser().parseFromString(html, 'text/html');
            var columnNames = _.map(columns, normalize);
            _.each(doc.querySelectorAll('table'), function (table) {
                addBarcodesToTable(doc, table, columnNames);
            });

            var style = doc.createElement('style');
            style.textContent = BARCODE_STYLE;
            doc.head.appendChild(style);
            if (baseUrl && !doc.querySelector('base')) {
                var base = doc.createElement('base');
                base.href = baseUrl;
                doc.head.insertBefore(base, doc.head.firstChild);
            }
            // Keep the report's own doctype so the browser renders it in the same mode as before
            var doctype = doc.doctype ? new $window.XMLSerializer().serializeToString(doc.doctype) : '<!DOCTYPE html>';
            return doctype + doc.documentElement.outerHTML;
        };

        return {
            isEnabledFor: isEnabledFor,
            addBarcodes: addBarcodes
        };
    }]);
