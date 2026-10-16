import React, { useState, useRef } from 'react';
import { Card, Btn, Badge } from './UIComponents';
import { api } from '../api';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  ArrowRight,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

export const BulkPurchaseImport = ({ currentUser, onSuccess, onCancel }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileSize, setFileSize] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Download Standard CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'asset_name',
      'vendor_name',
      'category',
      'subcategory',
      'purchase_date',
      'purchase_price',
      'quantity',
      'invoice_number',
      'invoice_date',
      'warranty_expiry',
      'notes'
    ];

    const sampleRows = [
      [
        'Dell OptiPlex 7090 Desktop',
        'Dell India Enterprise',
        'Electronics',
        'Computer',
        '2026-03-15',
        '65000',
        '10',
        'INV-2026-1044',
        '2026-03-15',
        '3 Years Onsite Warranty',
        'Batch procurement for CS Lab 3'
      ],
      [
        'Ergonomic High-Back Executive Chair',
        'Godrej Interio Solutions',
        'Furniture',
        'Chair',
        '2026-04-01',
        '14500',
        '25',
        'INV-2026-2190',
        '2026-04-01',
        '5 Years Warranty',
        'Faculty cabins upgrade'
      ],
      [
        'Epson 4K Ultra Laser Projector',
        'Sigma Audio Visuals',
        'Electronics',
        'Projector',
        '2026-05-10',
        '115000',
        '4',
        'INV-2026-3022',
        '2026-05-10',
        '2 Years Warranty',
        'Seminar Hall AV modernization'
      ]
    ];

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...sampleRows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AssetMS_Bulk_Purchase_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 2. Parse CSV Text into Records
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or does not contain header and data rows.');
    }

    // Parse header row
    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const records = [];
    const seenRows = new Set();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted values containing commas
      const values = [];
      let inQuote = false;
      let token = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(token.trim().replace(/^["']|["']$/g, ''));
          token = '';
        } else {
          token += char;
        }
      }
      values.push(token.trim().replace(/^["']|["']$/g, ''));

      const rowObj = { rowNumber: i + 1 };
      rawHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });

      // Validation
      const errors = [];
      const assetName = rowObj.asset_name || rowObj.assetname || rowObj.asset || rowObj.name;
      const vendorName = rowObj.vendor_name || rowObj.vendorname || rowObj.vendor || rowObj.supplier;
      const purchaseDate = rowObj.purchase_date || rowObj.purchasedate || rowObj.date;
      const rawPrice = rowObj.purchase_price !== undefined ? rowObj.purchase_price : rowObj.price;
      const rawQty = rowObj.quantity !== undefined ? rowObj.quantity : rowObj.qty;

      if (!assetName || assetName.trim() === '') {
        errors.push('Asset name is required');
      }
      if (!vendorName || vendorName.trim() === '') {
        errors.push('Vendor name is required');
      }
      if (!purchaseDate || isNaN(new Date(purchaseDate).getTime())) {
        errors.push('Valid purchase date (YYYY-MM-DD) is required');
      }

      const price = parseFloat(rawPrice);
      if (isNaN(price) || price < 0) {
        errors.push('Purchase price must be a valid number >= 0');
      }

      const qty = parseInt(rawQty, 10);
      if (isNaN(qty) || qty < 1) {
        errors.push('Quantity must be an integer >= 1');
      }

      // Check duplicate row within CSV
      const duplicateKey = `${(assetName || '').toLowerCase()}|${(vendorName || '').toLowerCase()}|${purchaseDate}|${rowObj.invoice_number || ''}`;
      if (seenRows.has(duplicateKey)) {
        errors.push('Duplicate transaction detected in CSV');
      } else if (assetName && vendorName) {
        seenRows.add(duplicateKey);
      }

      const calculatedTotal = (!isNaN(price) && !isNaN(qty) && price >= 0 && qty >= 1) ? (price * qty) : 0;

      const normalized = {
        rowNumber: i + 1,
        asset_name: assetName || '',
        vendor_name: vendorName || '',
        category: rowObj.category || 'Furniture',
        subcategory: rowObj.subcategory || rowObj.sub_category || 'General',
        purchase_date: purchaseDate || '',
        purchase_price: !isNaN(price) ? price : 0,
        quantity: !isNaN(qty) ? qty : 1,
        total_amount: calculatedTotal,
        invoice_number: rowObj.invoice_number || rowObj.invoicenumber || rowObj.invoice || '',
        invoice_date: rowObj.invoice_date || purchaseDate || '',
        warranty_expiry: rowObj.warranty_expiry || rowObj.warranty || '1 Year Standard',
        notes: rowObj.notes || rowObj.remarks || '',
        isValid: errors.length === 0,
        errors
      };

      records.push(normalized);
    }

    return records;
  };

  // 3. Handle File Selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const processFile = (f) => {
    if (!f.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid CSV file (.csv format).');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setFile(f);
    setFileSize(f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / (1024 * 1024)).toFixed(2)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const records = parseCSV(text);
        setParsedRows(records);

        const valids = records.filter(r => r.isValid);
        const invalids = records.filter(r => !r.isValid);

        setValidRows(valids);
        setInvalidRows(invalids);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to parse CSV file.');
        setParsedRows([]);
        setValidRows([]);
        setInvalidRows([]);
      }
    };
    reader.readAsText(f);
  };

  // 4. Submit Bulk Import
  const handleImportSubmit = async () => {
    if (validRows.length === 0) {
      setErrorMsg('No valid rows available to import.');
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      setImportProgress(20);

      const batchId = `BATCH-${Date.now()}`;
      setImportProgress(50);

      const response = await api.bulkImportPurchases({
        purchases: validRows,
        batchId,
        importSource: 'csv',
        createdBy: currentUser?.name || 'Administrator'
      });

      setImportProgress(100);
      setSuccessMsg(response.message || `Successfully imported ${response.imported} purchase transactions.`);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response);
        }, 1200);
      }
    } catch (err) {
      console.error('Bulk import submit error:', err);
      setErrorMsg(err.message || 'Failed to execute bulk purchase import.');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileSize('');
    setParsedRows([]);
    setValidRows([]);
    setInvalidRows([]);
    setErrorMsg('');
    setSuccessMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white font-display">Bulk Purchase CSV Importer</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Import multiple procurement transactions directly into AssetMS MySQL database</p>
          </div>
        </div>

        <Btn variant="secondary" size="sm" onClick={handleDownloadTemplate} className="text-xs cursor-pointer">
          <Download size={13} /> Download CSV Template
        </Btn>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900/50 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud size={24} />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">
            Click to Browse or Drag & Drop your CSV file here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports standard UTF-8 CSV with asset, vendor, price, and quantity headers (Max 10MB)
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          {/* File Meta Info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{file.name}</p>
                <p className="text-[11px] text-slate-400">{fileSize} • {parsedRows.length} total rows parsed</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 size={13} /> Remove File
            </button>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">TOTAL ROWS</span>
              <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{parsedRows.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">VALID ROWS</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{validRows.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold">INVALID ROWS</span>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">{invalidRows.length}</span>
            </div>
          </div>

          {/* Error Message Toast */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Toast */}
          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={15} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Progress Bar if importing */}
          {importing && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Executing MySQL Transaction...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${importProgress}%` }}
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="max-h-[220px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Row</th>
                    <th className="py-2 px-3">Asset</th>
                    <th className="py-2 px-3">Vendor</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Unit Price</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3">Total Amount</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.slice(0, 50).map((r) => (
                    <tr
                      key={r.rowNumber}
                      className={r.isValid ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40' : 'bg-rose-50/40 dark:bg-rose-950/20'}
                    >
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">#{r.rowNumber}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{r.asset_name || '—'}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[110px]">{r.vendor_name || '—'}</td>
                      <td className="py-2 px-3 text-slate-500">{r.category}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{r.purchase_date || '—'}</td>
                      <td className="py-2 px-3 font-mono font-semibold">₹{Number(r.purchase_price).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 font-mono">{r.quantity}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(r.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 size={10} /> Valid
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 cursor-help"
                            title={r.errors.join(', ')}
                          >
                            <AlertCircle size={10} /> {r.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 50 && (
              <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                Showing first 50 rows of {parsedRows.length} records.
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <Btn variant="secondary" size="sm" onClick={onCancel} disabled={importing} className="text-xs">
              Cancel
            </Btn>

            <Btn
              size="sm"
              onClick={handleImportSubmit}
              disabled={validRows.length === 0 || importing}
              className="text-xs"
            >
              {importing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Importing Valid Records...
                </>
              ) : (
                <>
                  Import {validRows.length} Valid Records <ArrowRight size={13} />
                </>
              )}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};
