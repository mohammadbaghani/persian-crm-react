import React, { useState } from 'react';
import {BackIcon, DeleteIcon, AddIcon, InfoIcon, SearchIcon, MoneyIcon } from './components/Icons';
import PersianDatePicker from './PersianDatePicker';

const initialItems = [
  { id: '1', rowNum: 1, itemCode: '20010011', techNum: '6260128222233', spec1: '0103', spec2: '0102', spec3: '1001', spec4: '.', persianName: 'آبمیوه هلو', englishName: 'peach', supplier: '3001', unit: 'محصول - کارخانه', quantity: 10, unitPrice: 20, totalPrice: 0 },
  { id: '2', rowNum: 2, itemCode: '20010011', techNum: '6260128222233', spec1: '0103', spec2: '0102', spec3: '1001', spec4: '.', persianName: 'آبمیوه آناناس', englishName: 'pineapple', supplier: '3001', unit: 'محصول - کارخانه', quantity: 5, unitPrice: 2, totalPrice: 0 }
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const isEnglishOnly = (text) => /^[a-zA-Z\s\d]*$/.test(text);
const isPersianOnly = (text) => /^[\u0600-\u06FF\s]*$/.test(text);
const isNumbersOnly = (text) => /^[\d]*$/.test(text);

const App = () => {
  const [items, setItems] = useState(initialItems);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [header, setHeader] = useState({
    warehouse: '۸۰۰۹ انبار شعبه اراک',
    serial: '۱۴۰۳۰۰۰۲۰',
    accountCode: '',
    receivedBy: 'رسید مستقیم',
    receiptType: 'رسید انتقالی غیر همزمان',
    referralNum: '۱۵۳۵',
    requestNum: '',
    date: '۱۴۰۳/۰۳/۲۹',
    currency: 'نقدی'
  });

  const [newItemForm, setNewItemForm] = useState({
    itemCode: '',
    techNum: '',
    spec1: '',
    spec2: '',
    spec3: '',
    spec4: '',
    persianName: '',
    englishName: '',
    supplier: '',
    unit: '',
    quantity: 0,
    unitPrice: 0
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [taxRate, setTaxRate] = useState(10);

  const validateForm = () => {
    const errors = {};

    if (!newItemForm.itemCode) errors.itemCode = 'کد کالا الزامی است';

    if (!newItemForm.persianName) errors.persianName = 'نام کالا الزامی است';
    else if (!isPersianOnly(newItemForm.persianName)) errors.persianName = 'نام فارسی فقط باید شامل حروف فارسی باشد';

    if (newItemForm.englishName && !isEnglishOnly(newItemForm.englishName)) {
      errors.englishName = 'نام انگلیسی فقط باید شامل حروف انگلیسی باشد';
    }

    if (newItemForm.supplier && !isNumbersOnly(newItemForm.supplier)) {
      errors.supplier = 'تحویل دهنده فقط باید شامل عدد باشد';
    }

    if (newItemForm.quantity <= 0) errors.quantity = 'مقدار باید بیشتر از ۰ باشد';

    return errors;
  };

  const handleAddRow = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTimeout(() => setFieldErrors({}), 3000);
      return;
    }

    const newRowNum = items.length + 1;
    const newItem = {
      id: generateId(),
      rowNum: newRowNum,
      ...newItemForm,
      totalPrice: newItemForm.quantity * newItemForm.unitPrice
    };

    setItems([...items, newItem]);
    resetForm();
    setSelectedItemId(null);
    setIsEditing(false);
  };

  const handleEditRow = () => {
  
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTimeout(() => setFieldErrors({}), 3000);
      return;
    }

    setItems(items.map(item =>
      item.id === selectedItemId
        ? {
          ...item,
          ...newItemForm,
          totalPrice: newItemForm.quantity * newItemForm.unitPrice
        }
        : item
    ));

    resetForm();
    setSelectedItemId(null);
    setIsEditing(false);
  };

  const handleDeleteRow = () => {

    if (window.confirm('آیا از حذف این ردیف اطمینان دارید؟')) {
      const filteredItems = items.filter(item => item.id !== selectedItemId);
      const updatedItems = filteredItems.map((item, index) => ({
        ...item,
        rowNum: index + 1
      }));

      setItems(updatedItems);
      resetForm();
      setSelectedItemId(null);
      setIsEditing(false);
    }
  };

  const handleSelectRow = (item) => {
    setSelectedItemId(item.id);
    setNewItemForm({
      itemCode: item.itemCode,
      techNum: item.techNum,
      spec1: item.spec1,
      spec2: item.spec2,
      spec3: item.spec3,
      spec4: item.spec4,
      persianName: item.persianName,
      englishName: item.englishName,
      supplier: item.supplier,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setNewItemForm({
      itemCode: '',
      techNum: '',
      spec1: '',
      spec2: '',
      spec3: '',
      spec4: '',
      persianName: '',
      englishName: '',
      supplier: '',
      unit: '',
      quantity: 0,
      unitPrice: 0
    });
    setFieldErrors({});
  };

  const handleHeaderChange = (field, value) => {
    setHeader(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (dateObject) => {
    if (dateObject && typeof dateObject === 'object' && dateObject.persian) {
      setHeader(prev => ({
        ...prev,
        date: dateObject.persian
      }));
    } else if (typeof dateObject === 'string') {
      setHeader(prev => ({
        ...prev,
        date: dateObject
      }));
    }
  };

  const handleFormChange = (field, value) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'englishName' && typeof value === 'string') {
      if (value === '' || isEnglishOnly(value)) {
        setNewItemForm(prev => ({ ...prev, [field]: value }));
      }
    }
    else if (field === 'persianName' && typeof value === 'string') {
      if (value === '' || isPersianOnly(value)) {
        setNewItemForm(prev => ({ ...prev, [field]: value }));
      }
    }
    else if (field === 'supplier' && typeof value === 'string') {
      if (value === '' || isNumbersOnly(value)) {
        setNewItemForm(prev => ({ ...prev, [field]: value }));
      }
    }
    else if (field === 'unit') {
      setNewItemForm(prev => ({ ...prev, [field]: value }));
    }
    else {
      setNewItemForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setSelectedItemId(null);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (items.length === 0) {
      alert('هیچ آیتمی برای محاسبه وجود ندارد');
      return;
    }

    const invalidItems = items.filter(item => 
      item.quantity <= 0 || item.unitPrice < 0
    );

    if (invalidItems.length > 0) {
      alert(`${invalidItems.length} آیتم دارای مقدار یا قیمت نامعتبر است`);
      return;
    }

    const updatedItems = items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice
    }));
    
    setItems(updatedItems);
    
    setShowConfirmDialog(true);
    
    setTimeout(() => setShowConfirmDialog(false), 3000);
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal - taxAmount;

  const getCurrencyStyle = (type) => {
    switch (type) {
      case 'نقدی':
        return {
          bgColor: 'bg-green-100',
          borderColor: 'border-green-500',
          textColor: 'text-green-700',
          badge: 'bg-green-500'
        };
      case 'چک':
        return {
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700',
          badge: 'bg-yellow-500'
        };
      case 'سایر':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-500',
          textColor: 'text-red-700',
          badge: 'bg-red-500'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-700',
          badge: 'bg-gray-500'
        };
    }
  };

  const currentCurrencyStyle = getCurrencyStyle(header.currency);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800 text-sm" dir="rtl">
      {showConfirmDialog && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-reverse space-x-2">
            <span className="font-bold">✓</span>
            <span>محاسبات با موفقیت انجام شد</span>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-b from-blue-100 to-blue-200 border-b border-blue-300 shadow-sm p-1">
        <div className="flex items-center space-x-2 px-2 py-1" dir="rtl">
          <div className="flex space-x-4 ml-auto">
            <button className="flex flex-col items-center group px-3 py-1 hover:bg-white/50 rounded transition">
              <div className="w-8 h-8 bg-white border border-blue-400 rounded flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                <SearchIcon />
              </div>
              <span className="text-[10px] mt-1 font-bold">فراخوانی</span>
            </button>
            <button className="flex flex-col items-center group px-3 py-1 hover:bg-white/50 rounded transition">
              <div className="w-8 h-8 bg-white border border-blue-400 rounded flex items-center justify-center text-blue-600">
                <InfoIcon />
              </div>
              <span className="text-[10px] mt-1 font-bold">عوامل فاکتور</span>
            </button>
            <button className="flex flex-col items-center group px-3 py-1 hover:bg-white/50 rounded transition">
              <div className="w-8 h-8 bg-white border border-blue-400 rounded flex items-center justify-center text-blue-600">
                < MoneyIcon />
              </div>
              <span className="text-[10px] mt-1 font-bold">قیمت گذاری</span>
            </button>
            <button className="flex flex-col items-center group px-3 py-1 hover:bg-white/50 rounded transition">
              <div className="w-8 h-8 bg-white border border-blue-400 rounded flex items-center justify-center text-blue-600">
                < BackIcon />
              </div>
              <span className="text-[10px] mt-1 font-bold">ارجاع</span>
            </button>
          </div>
          <div className="flex border-r border-blue-300 pr-4 space-x-4">
            <span className="bg-yellow-200 px-3 py-1 rounded text-xs font-bold border border-yellow-400">ساختار ارزی فعال</span>
            <span className="bg-blue-100 px-3 py-1 rounded text-xs font-bold border border-blue-300">وضعیت : رسید موقت</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <section className="bg-white border border-slate-300 p-4 rounded-sm shadow-sm grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">انبار:</label>
              <input
                type="text"
                value={header.warehouse}
                onChange={(e) => handleHeaderChange('warehouse', e.target.value)}
                className="flex-1 border border-slate-300 px-2 py-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">سریال:</label>
              <input
                type="text"
                value={header.serial}
                onChange={(e) => handleHeaderChange('serial', e.target.value)}
                className="flex-1 border border-slate-300 px-2 py-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">کد حساب:</label>
              <input
                type="text"
                value={header.accountCode}
                onChange={(e) => handleHeaderChange('accountCode', e.target.value)}
                className="flex-1 border border-slate-300 px-2 py-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">نوع رسید:</label>
              <select
                value={header.receiptType}
                onChange={(e) => handleHeaderChange('receiptType', e.target.value)}
                className="flex-1 border border-slate-300 px-2 py-1 rounded bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" >
                <option>رسید انتقالی غیر همزمان</option>
                <option>رسید انبار</option>
                <option>رسید برگشت از فروش</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">شماره ارجاع:</label>
              <input
                type="text"
                value={header.referralNum}
                onChange={(e) => handleHeaderChange('referralNum', e.target.value)}
                className="flex-1 border border-slate-300 px-2 py-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" />
            </div>
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">تسویه وجه:</label>
              <div className="flex flex-1 items-center space-x-reverse space-x-2">
                <select
                  value={header.currency}
                  onChange={(e) => handleHeaderChange('currency', e.target.value)}
                  className={`flex-1 border-2 px-2 py-1 rounded font-bold focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none appearance-none`}
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\' stroke=\'%2347556e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2rem'
                  }}  >
                  <option value="نقدی">نقدی</option>
                  <option value="چک">چک</option>
                  <option value="سایر">سایر</option>
                </select>
                <div className={`w-4 h-4 rounded-full ${currentCurrencyStyle.badge} shadow-sm`}></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">تاریخ رسید:</label>
              <div className="flex flex-1 items-center space-x-reverse space-x-1">
                <PersianDatePicker
                  label=""
                  onDateChange={handleDateChange}
                  initialValue={header.date} />
                <span className="text-slate-400">۱۴:۳۵</span>
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-32 font-bold text-slate-600">بارکد کالا:</label>
              <input
                type="text"
                placeholder="اسکن بارکد..."
                className="flex-1 border border-slate-300 px-2 py-1 rounded italic focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"/>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 border border-blue-200 p-4 rounded-sm">
          <h3 className="font-bold text-blue-800 mb-3">
            {isEditing ? 'ویرایش کالا' : 'افزودن کالای جدید'}
            {selectedItemId && <span className="text-sm text-blue-600 mr-2">(ردیف {items.find(i => i.id === selectedItemId)?.rowNum} انتخاب شده)</span>}
          </h3>

          {Object.keys(fieldErrors).length > 0 && (
            <div className="bg-red-100 border-r-4 border-red-500 p-3 mb-3">
              <ul className="list-disc list-inside text-red-700 text-xs">
                {Object.values(fieldErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                کد کالا <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newItemForm.itemCode}
                onChange={(e) => handleFormChange('itemCode', e.target.value)}
                className={`w-full border ${fieldErrors.itemCode ? 'border-red-500' : 'border-slate-300'} px-2 py-1 rounded text-sm`}
                placeholder="مثال: 20010011"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">شماره فنی</label>
              <input
                type="text"
                value={newItemForm.techNum}
                onChange={(e) => handleFormChange('techNum', e.target.value)}
                className="w-full border border-slate-300 px-2 py-1 rounded text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ویژگی ۱</label>
              <input
                type="text"
                value={newItemForm.spec1}
                onChange={(e) => handleFormChange('spec1', e.target.value)}
                className="w-full border border-slate-300 px-2 py-1 rounded text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ویژگی ۲</label>
              <input
                type="text"
                value={newItemForm.spec2}
                onChange={(e) => handleFormChange('spec2', e.target.value)}
                className="w-full border border-slate-300 px-2 py-1 rounded text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ویژگی ۳</label>
              <input
                type="text"
                value={newItemForm.spec3}
                onChange={(e) => handleFormChange('spec3', e.target.value)}
                className="w-full border border-slate-300 px-2 py-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ویژگی ۴</label>
              <input
                type="text"
                value={newItemForm.spec4}
                onChange={(e) => handleFormChange('spec4', e.target.value)}
                className="w-full border border-slate-300 px-2 py-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                نام فارسی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newItemForm.persianName}
                onChange={(e) => handleFormChange('persianName', e.target.value)}
                className={`w-full border ${fieldErrors.persianName ? 'border-red-500' : 'border-slate-300'} px-2 py-1 rounded text-sm`}
                placeholder="فقط حروف فارسی"
                dir="rtl"
              />
              {fieldErrors.persianName && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.persianName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">نام انگلیسی</label>
              <input
                type="text"
                value={newItemForm.englishName}
                onChange={(e) => handleFormChange('englishName', e.target.value)}
                className={`w-full border ${fieldErrors.englishName ? 'border-red-500' : 'border-slate-300'} px-2 py-1 rounded text-sm`}
                placeholder="فقط حروف انگلیسی"
                dir="ltr"
              />
              {fieldErrors.englishName && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.englishName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">تحویل دهنده</label>
              <input
                type="text"
                value={newItemForm.supplier}
                onChange={(e) => handleFormChange('supplier', e.target.value)}
                className={`w-full border ${fieldErrors.supplier ? 'border-red-500' : 'border-slate-300'} px-2 py-1 rounded text-sm`}
                placeholder="فقط عدد"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {fieldErrors.supplier && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.supplier}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">واحد</label>
              <input
                type="text"
                value={newItemForm.unit}
                onChange={(e) => handleFormChange('unit', e.target.value)}
                className={`w-full border ${fieldErrors.unit ? 'border-red-500' : 'border-slate-300'} px-2 py-1 rounded text-sm`}
                placeholder="مثال: کیلوگرم، عدد، کارتن"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                مقدار <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newItemForm.quantity || ''}
                onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 0)}
                className={`w-full border ${fieldErrors.quantity ? 'border-red-500' : 'border-slate-300'} px-2 py-1 rounded text-sm`}
                placeholder="عدد"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">بهای واحد</label>
              <input
                type="number"
                value={newItemForm.unitPrice || ''}
                onChange={(e) => handleFormChange('unitPrice', parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 px-2 py-1 rounded text-sm"
                placeholder="ریال"
              />
            </div>
          </div>
        </section>


        <section className="bg-white border border-slate-300 rounded-sm shadow-md flex-1 overflow-x-auto min-h-[300px]">
          <table className="w-full text-center border-collapse text-xs">
            <thead className="bg-gradient-to-b from-blue-700 to-blue-800 text-white sticky top-0 z-10">
              <tr>
                <th className="border border-slate-400 p-2 whitespace-nowrap w-10">ردیف</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">کد کالا</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">شماره فنی</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">نام کالا</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">نام انگلیسی کالا</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">مقدار</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">بهای واحد</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">مبلغ کل</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">تحویل دهنده</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">واحد</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">ویژگی ۱</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">ویژگی ۲</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">ویژگی ۳</th>
                <th className="border border-slate-400 p-2 whitespace-nowrap">ویژگی ۴</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleSelectRow(item)}
                  className={`
                    odd:bg-white even:bg-blue-50/30 
                    hover:bg-yellow-100 cursor-pointer transition
                    ${selectedItemId === item.id ? 'bg-yellow-200 hover:bg-yellow-300 border-r-4 border-blue-600' : ''}
                  `}
                >
                  <td className="border border-slate-200 p-2 font-bold">{item.rowNum}</td>
                  <td className="border border-slate-200 p-2">{item.itemCode}</td>
                  <td className="border border-slate-200 p-2">{item.techNum}</td>
                  <td className="border border-slate-200 p-2 font-bold text-right">{item.persianName}</td>
                  <td className="border border-slate-200 p-2 italic text-left">{item.englishName}</td>
                  <td className="border border-slate-200 p-2 font-bold text-blue-700">{item.quantity.toLocaleString()}</td>
                  <td className="border border-slate-200 p-2">{item.unitPrice.toLocaleString()}</td>
                  <td className="border border-slate-200 p-2 font-bold text-green-700">{item.totalPrice.toLocaleString()}</td>
                  <td className="border border-slate-200 p-2">{item.supplier}</td>
                  <td className="border border-slate-200 p-2">{item.unit}</td>
                  <td className="border border-slate-200 p-2 bg-blue-50">{item.spec1}</td>
                  <td className="border border-slate-200 p-2 bg-blue-50">{item.spec2}</td>
                  <td className="border border-slate-200 p-2">{item.spec3}</td>
                  <td className="border border-slate-200 p-2">{item.spec4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-blue-50 border border-blue-200 p-4 rounded grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">جمع مبلغ :</span>
              <span className="font-bold text-lg text-blue-900">{subtotal.toLocaleString()} ریال</span>
            </div>
            <div className="flex items-center justify-between border-t border-blue-200 pt-2 mt-2">
              <span className="font-bold text-slate-600">مالیات (۱۰٪) :</span>
              <span className="font-bold text-orange-600">{taxAmount.toLocaleString()} ریال</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">جمع مقدار :</span>
              <span className="font-bold text-lg text-blue-900">{totalQuantity.toLocaleString()} عدد</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">تعداد اقلام :</span>
              <span className="font-bold">{items.length}</span>
            </div>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-100 mb-1">قابل پرداخت</div>
              <div className="text-2xl font-black text-white">{totalAmount.toLocaleString()}</div>
              <div className="text-xs text-blue-200 mt-1">ریال</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-100 border-t border-slate-300 p-3 flex items-center justify-between sticky bottom-0 z-20">
        <div className="flex space-x-reverse space-x-2">
          <button
            onClick={isEditing ? handleEditRow : handleAddRow}
            className="flex items-center space-x-reverse space-x-1 bg-green-600 text-white px-4 py-1.5 rounded-sm hover:bg-green-700 transition font-bold shadow-sm"
          >
            <AddIcon />
            <span>{isEditing ? 'ثبت ویرایش' : 'تنظیم'}</span>
          </button>
          <button
            onClick={handleDeleteRow}
            className="flex items-center space-x-reverse space-x-1 bg-white border border-red-300 text-red-600 px-4 py-1.5 rounded-sm hover:bg-red-50 transition font-bold shadow-sm"
          >
            <DeleteIcon />
            <span>حذف</span>
          </button>
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center space-x-reverse space-x-1 bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-sm hover:bg-slate-50 transition font-bold shadow-sm"
            >
              <span>لغو ویرایش</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-reverse space-x-4">
          <div className="flex space-x-reverse space-x-2">
            <button className="bg-slate-300 text-slate-700 px-6 py-1.5 rounded-sm hover:bg-slate-400 transition font-bold">انصراف</button>
            <button 
              onClick={handleConfirm}
              className="bg-blue-800 text-white px-8 py-1.5 rounded-sm hover:bg-blue-900 transition font-bold shadow-md"
            >
              تایید
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;