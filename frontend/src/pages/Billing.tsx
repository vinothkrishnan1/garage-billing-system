import React, { useState, useEffect } from 'react';
import { fetchNextBillNo, fetchCustomers, fetchProducts, createBill, updateBill, fetchBillById } from '../services/api';
import { Bill, BillItem, Customer, Product } from '../types';
import { AutocompleteSelect } from '../components/AutocompleteSelect';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { Save, Printer, Plus, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { formatBillNo } from '../utils/format';

interface BillingProps {
  editBillId?: number | null;
  onFinishSave?: () => void;
}

export const Billing: React.FC<BillingProps> = ({ editBillId, onFinishSave }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [billNo, setBillNo] = useState<number>(1);
  const [billDate, setBillDate] = useState<string>(todayStr);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [kmDriven, setKmDriven] = useState<number | ''>('');
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(0);
  const [complaint, setComplaint] = useState<string>('');

  // Master lists for autocomplete
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Product Grid (Initially 30 rows)
  const createEmptyRows = (count: number, startSNo: number = 1): BillItem[] => {
    return Array.from({ length: count }, (_, idx) => ({
      s_no: startSNo + idx,
      product_name: '',
      qty: '',
      amount: ''
    }));
  };

  const [items, setItems] = useState<BillItem[]>(createEmptyRows(30));

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [savedBillForPrint, setSavedBillForPrint] = useState<Bill | null>(null);

  useEffect(() => {
    loadMasters();
    if (editBillId) {
      loadBillToEdit(editBillId);
    } else {
      loadNextBillNo();
    }
  }, [editBillId]);

  const loadMasters = async () => {
    try {
      const [custs, prods] = await Promise.all([fetchCustomers(), fetchProducts()]);
      setCustomers(custs);
      setProducts(prods);
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  const loadNextBillNo = async () => {
    try {
      const nextNo = await fetchNextBillNo();
      setBillNo(nextNo);
    } catch (err) {
      console.error('Error fetching next bill no:', err);
    }
  };

  const loadBillToEdit = async (id: number) => {
    try {
      setLoading(true);
      const bill = await fetchBillById(id);
      setBillNo(bill.bill_no);
      setBillDate(bill.bill_date);
      setVehicleNumber(bill.vehicle_number);
      setVehicleModel(bill.vehicle_model || '');
      setCustomerName(bill.customer_name || '');
      setMobileNumber(bill.mobile_number || '');
      setKmDriven(bill.km_driven !== '' ? bill.km_driven : '');
      setAdvanceAmount(bill.advance_amount);
      setComplaint(bill.complaint || '');

      // Load items & pad to at least 30 rows
      const loadedItems = bill.items || [];
      const paddedItems = [...loadedItems];
      if (paddedItems.length < 30) {
        const remaining = 30 - paddedItems.length;
        for (let i = 0; i < remaining; i++) {
          paddedItems.push({
            s_no: paddedItems.length + 1,
            product_name: '',
            qty: '',
            amount: ''
          });
        }
      }
      setItems(paddedItems);
    } catch (err) {
      setErrorMsg('Failed to load bill for editing');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Filter products that are ALREADY selected in other rows so they aren't shown in dropdown
  const getAvailableProductsForIndex = (currentIdx: number) => {
    const selectedNamesInOtherRows = new Set(
      items
        .filter((_, i) => i !== currentIdx)
        .map((item) => item.product_name.trim().toUpperCase())
        .filter((name) => name !== '')
    );

    return products.filter((p) => !selectedNamesInOtherRows.has(p.name.trim().toUpperCase()));
  };

  // Handle Vehicle Selection Autocomplete
  const handleVehicleChange = (val: string, option?: any) => {
    setVehicleNumber(val);
    if (option && option.meta) {
      const cust = customers.find((c) => c.vehicle_number === option.label);
      if (cust) {
        setCustomerName(cust.customer_name);
        setMobileNumber(cust.mobile_number);
        setVehicleModel(cust.vehicle_model);
        if (cust.km_driven) setKmDriven(cust.km_driven);
      }
    }
  };

  // Handle Item Row Updates with Duplicate Prevention
  const handleItemChange = (index: number, field: keyof BillItem, val: any) => {
    setErrorMsg('');

    // Check for Duplicate Item Selection
    if (field === 'product_name') {
      const inputNameUpper = String(val).trim().toUpperCase();
      if (inputNameUpper !== '') {
        const isDuplicate = items.some(
          (item, i) => i !== index && item.product_name.trim().toUpperCase() === inputNameUpper
        );
        if (isDuplicate) {
          setErrorMsg('This item has already been added to the bill.');
          const resetItems = [...items];
          resetItems[index] = { ...resetItems[index], product_name: '', amount: '' };
          setItems(resetItems);
          return;
        }
      }
    }

    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };

    // Auto-calculate amount if product selected from master
    if (field === 'product_name') {
      const selectedProd = products.find((p) => p.name.toUpperCase() === String(val).toUpperCase());
      if (selectedProd) {
        if (newItems[index].qty === '' || newItems[index].qty === 0) {
          newItems[index].qty = 1;
        }
        const qtyNum = Number(newItems[index].qty) || 1;
        newItems[index].amount = selectedProd.selling_price * qtyNum;
      }
    }

    // Recalculate amount if Qty changed and we have a unit price
    if (field === 'qty') {
      const selectedProd = products.find((p) => p.name.toUpperCase() === String(newItems[index].product_name).toUpperCase());
      if (selectedProd) {
        const qtyNum = Number(val) || 0;
        newItems[index].amount = selectedProd.selling_price * qtyNum;
      }
    }

    // Check if user is filling the last row - if so, auto-append 5 more blank rows!
    if (index === newItems.length - 1 && (field === 'product_name' || field === 'amount')) {
      if (String(val).trim() !== '') {
        const extraRows = createEmptyRows(5, newItems.length + 1);
        newItems.push(...extraRows);
      }
    }

    setItems(newItems);
  };

  // Append single blank row manually if needed
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      { s_no: prev.length + 1, product_name: '', qty: '', amount: '' }
    ]);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    if (items.length <= 1) return;
    const filtered = items.filter((_, i) => i !== index);
    const reindexed = filtered.map((item, idx) => ({ ...item, s_no: idx + 1 }));
    setItems(reindexed);
  };

  // Total Calculations
  const calculatedTotal = items.reduce((acc, item) => {
    const amt = Number(item.amount) || 0;
    return acc + amt;
  }, 0);

  const advanceNum = Number(advanceAmount) || 0;
  const calculatedBalance = Math.max(0, calculatedTotal - advanceNum);

  // Form Validation including Duplicate Checks
  const validateForm = (): boolean => {
    setErrorMsg('');

    if (!vehicleNumber || vehicleNumber.trim() === '') {
      setErrorMsg('Vehicle Number is required');
      return false;
    }

    const validItems = items.filter((item) => item.product_name.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Please enter at least one product line in the bill table');
      return false;
    }

    const seenItemNames = new Set<string>();
    for (const item of validItems) {
      const nameUpper = item.product_name.trim().toUpperCase();
      if (seenItemNames.has(nameUpper)) {
        setErrorMsg('This item has already been added to the bill.');
        return false;
      }
      seenItemNames.add(nameUpper);

      if (Number(item.amount) < 0) {
        setErrorMsg(`Negative amount found for product "${item.product_name}"`);
        return false;
      }
    }

    return true;
  };

  // Save Bill Handler
  const handleSaveBill = async (shouldPrintAfterSave: boolean = false) => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const validItems = items
        .filter((item) => item.product_name.trim() !== '')
        .map((item, idx) => ({
          s_no: idx + 1,
          product_name: item.product_name.trim().toUpperCase(),
          qty: Number(item.qty) || 1,
          amount: Number(item.amount) || 0
        }));

      const payload: Partial<Bill> = {
        bill_no: billNo,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_model: vehicleModel.trim(),
        customer_name: customerName.trim(),
        mobile_number: mobileNumber.trim(),
        km_driven: kmDriven !== '' ? Number(kmDriven) : 0,
        bill_date: billDate,
        total_amount: calculatedTotal,
        advance_amount: advanceNum,
        balance_amount: calculatedBalance,
        complaint: complaint.trim(),
        items: validItems
      };

      let saved: Bill;
      if (editBillId) {
        saved = await updateBill(editBillId, payload);
        setSuccessMsg(`Bill #${formatBillNo(billNo)} updated successfully! Masters auto-synced.`);
      } else {
        saved = await createBill(payload);
        setSuccessMsg(`Bill #${formatBillNo(saved.bill_no)} saved successfully! Master records updated.`);
      }

      await loadMasters();

      if (shouldPrintAfterSave) {
        setSavedBillForPrint(saved);
      } else {
        setTimeout(() => {
          if (onFinishSave) onFinishSave();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadNextBillNo();
    setBillDate(todayStr);
    setVehicleNumber('');
    setVehicleModel('');
    setCustomerName('');
    setMobileNumber('');
    setKmDriven('');
    setAdvanceAmount(0);
    setComplaint('');
    setItems(createEmptyRows(30));
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Filter items for mobile card rendering (showing all non-empty items + at least 1 blank row)
  const filledItemIndices = items
    .map((item, idx) => (item.product_name.trim() !== '' || Number(item.amount) > 0 ? idx : -1))
    .filter((idx) => idx !== -1);

  // If no items filled, show index 0
  const mobileDisplayIndices = filledItemIndices.length > 0 ? filledItemIndices : [0];
  // Always include the next blank row index for mobile if available
  const lastFilledIdx = Math.max(...mobileDisplayIndices);
  if (lastFilledIdx + 1 < items.length && !mobileDisplayIndices.includes(lastFilledIdx + 1)) {
    mobileDisplayIndices.push(lastFilledIdx + 1);
  }

  return (
    <div className="space-y-6 pb-8">

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {editBillId ? `Edit Invoice #${formatBillNo(billNo)}` : `Create New Invoice - Bill #${formatBillNo(billNo)}`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in vehicle & product details. Non-existing items or vehicles are automatically saved to Master.
          </p>
        </div>

        {/* Header Action: Reset Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 animate-pulse">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">

        {/* Section 1: Customer & Vehicle Information */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-4">
            Customer & Vehicle Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

            {/* Bill Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Billing Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full px-3 py-2 sm:py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Vehicle Number (Autocomplete) */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Number *</label>
              <AutocompleteSelect
                value={vehicleNumber}
                onChange={handleVehicleChange}
                placeholder="e.g. TN 02 BV 7500"
                options={customers.map((c) => ({
                  label: c.vehicle_number,
                  value: c.vehicle_number,
                  sublabel: `${c.customer_name} (${c.vehicle_model})`,
                  meta: `KM: ${c.km_driven}`
                }))}
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. HIMALAYAN"
                className="w-full px-3 py-2 sm:py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Vignesh"
                className="w-full px-3 py-2 sm:py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-3 py-2 sm:py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* KM Driven */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">KM Driven</label>
              <input
                type="number"
                value={kmDriven}
                onChange={(e) => setKmDriven(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 18047"
                className="w-full px-3 py-2 sm:py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Product Entry Grid */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Product & Labour Items ({items.filter(i => i.product_name.trim() !== '').length} filled)
            </h2>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Auto-expands on last row</span>
          </div>

          {/* Desktop & Tablet Table View (Hidden on mobile < 640px) */}
          <div className="hidden sm:block overflow-x-auto border border-slate-300 rounded-lg max-h-[500px]">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead className="bg-slate-800 text-white font-bold uppercase sticky top-0 z-20">
                <tr>
                  <th className="w-12 px-3 py-2 text-center">S.No</th>
                  <th className="px-4 py-2">Product Description / Particular</th>
                  <th className="w-24 px-3 py-2 text-center">Qty</th>
                  <th className="w-36 px-3 py-2 text-right">Amount (₹)</th>
                  <th className="w-12 px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-3 py-1 text-center font-bold text-slate-500">{item.s_no}</td>

                    {/* Searchable Product Autocomplete - Excludes products selected on other rows */}
                    <td className="px-2 py-1">
                      <AutocompleteSelect
                        value={item.product_name}
                        onChange={(val) => handleItemChange(idx, 'product_name', val)}
                        placeholder="Search or type product name..."
                        options={getAvailableProductsForIndex(idx).map((p) => ({
                          label: p.name,
                          value: p.name,
                          sublabel: `Price: ₹${p.selling_price.toLocaleString('en-IN')}`
                        }))}
                      />
                    </td>

                    {/* Quantity */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="1"
                        className="w-full text-center px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Amount */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.amount}
                        onChange={(e) => handleItemChange(idx, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full text-right px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Delete Action */}
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card / Touch-Friendly View (< 640px) */}
          <div className="sm:hidden space-y-3">
            {mobileDisplayIndices.map((idx) => {
              const item = items[idx];
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 relative shadow-xs">
                  {/* Card Header: S.No & Delete */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                      Item #{item.s_no}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>

                  {/* Product Autocomplete Input - Excludes products selected on other rows */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Product / Service Particular
                    </label>
                    <AutocompleteSelect
                      value={item.product_name}
                      onChange={(val) => handleItemChange(idx, 'product_name', val)}
                      placeholder="Search or type product..."
                      options={getAvailableProductsForIndex(idx).map((p) => ({
                        label: p.name,
                        value: p.name,
                        sublabel: `Price: ₹${p.selling_price.toLocaleString('en-IN')}`
                      }))}
                    />
                  </div>

                  {/* Qty & Amount Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="1"
                        className="w-full text-center px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.amount}
                        onChange={(e) => handleItemChange(idx, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full text-right px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-start">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg border border-indigo-200 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item Row</span>
            </button>
          </div>
        </div>

        {/* Section 3: Bill Summary & Complaint Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-200">

          {/* Complaint Text Area */}
          <div className="md:col-span-7 space-y-2">
            <label className="block text-xs font-extrabold uppercase text-slate-800">
              Complaint / Work Notes (Multi-line)
            </label>
            <textarea
              rows={4}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. General Service, Front & Rear brake noise check, Chain adjustment."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
            <p className="text-[11px] font-semibold text-slate-400 italic">
              Appears on the printed invoice under COMPLAINT block.
            </p>
          </div>

          {/* Totals Summary */}
          <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">

            {/* Total Bill Amount */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700 uppercase">Total Bill Amount</span>
              <span className="text-lg font-black text-slate-900">
                ₹ {calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Advance Received */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 uppercase">Advance Received</span>
              <div className="w-36">
                <input
                  type="number"
                  min="0"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full text-right px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Balance Amount */}
            <div className="flex items-center justify-between text-base pt-3 border-t-2 border-slate-900">
              <span className="font-black text-blue-900 uppercase">Balance Amount</span>
              <span className="text-xl font-black text-blue-900">
                ₹ {calculatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Footer Signature Notice */}
            <div className="pt-2 text-right">
              <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
                For VICKY'S GARAGE
              </span>
            </div>

          </div>

        </div>

        {/* Relocated Action Buttons Section - Placed Below "For Vicky's Garage" Section */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 sm:py-2.5 text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveBill(false)}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 sm:py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Bill'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveBill(true)}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 sm:py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Save & Print</span>
          </button>
        </div>

      </div>

      {/* Invoice PDF Print Modal */}
      {savedBillForPrint && (
        <InvoicePrintModal
          bill={savedBillForPrint}
          onClose={() => {
            setSavedBillForPrint(null);
            if (onFinishSave) onFinishSave();
          }}
        />
      )}

    </div>
  );
};
