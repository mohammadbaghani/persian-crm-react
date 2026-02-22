import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PersianDatePicker = ({
  label = "تاریخ:",
  onDateChange,
  initialValue = "",
  placeholder = "انتخاب تاریخ",
  className = "",
  disabled = false
}) => {
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [selectedGregorianDate, setSelectedGregorianDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef(null);

  const persianNumbers = useMemo(() => ({
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
  }), []);

  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  const toPersianNumber = useCallback((str) => {
    return String(str).replace(/[0-9]/g, (d) => persianNumbers[d]);
  }, [persianNumbers]);

  const toJalali = useCallback((date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';

    try {
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const parts = formatter.formatToParts(date);
      let year = '', month = '', day = '';

      for (const part of parts) {
        if (part.type === 'year') year = part.value;
        if (part.type === 'month') month = part.value.padStart(2, '0');
        if (part.type === 'day') day = part.value.padStart(2, '0');
      }

      return `${toPersianNumber(year)}/${toPersianNumber(month)}/${toPersianNumber(day)}`;
    } catch (error) {
      console.error('Error in toJalali:', error);
      return '';
    }
  }, [toPersianNumber]);

  const fromJalaliToGregorian = useCallback((jalaliDate) => {
    if (!jalaliDate) return null;

    try {
      const englishDate = String(jalaliDate).replace(/[۰-۹]/g, (d) => {
        return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
      });

      const parts = englishDate.split('/');
      if (parts.length !== 3) return null;

      const [year, month, day] = parts.map(Number);
      const gregorianDate = new Date();

      gregorianDate.setFullYear(year + 621, month - 1, day);

      if (isNaN(gregorianDate.getTime())) {
        return null;
      }

      return gregorianDate;
    } catch (error) {
      console.error('Error converting Jalali to Gregorian:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialValue) {
      setSelectedDate(initialValue);
      const gregorianDate = fromJalaliToGregorian(initialValue);

      if (gregorianDate && !isNaN(gregorianDate.getTime())) {
        setSelectedGregorianDate(gregorianDate);
        setCurrentMonth(gregorianDate);
      } else {
        const today = new Date();
        setSelectedGregorianDate(today);
        setCurrentMonth(today);
      }
    } else {
      setCurrentMonth(new Date());
    }
  }, [initialValue, fromJalaliToGregorian]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getJalaliMonthName = useCallback((date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';

    try {
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' });
      return formatter.format(date);
    } catch {
      return '';
    }
  }, []);

  const getJalaliYear = useCallback((date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';

    try {
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' });
      return formatter.format(date);
    } catch {
      return '';
    }
  }, []);

  const changeMonth = useCallback((increment) => {
    setCurrentMonth(prev => {
      try {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + increment);
        return newDate;
      } catch {
        return new Date();
      }
    });
  }, []);

  const getDaysInMonth = useCallback(() => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const days = [];

      let startOffset = firstDay.getDay() - 1;
      if (startOffset < 0) startOffset = 6;

      for (let i = 0; i < startOffset; i++) {
        days.push(null);
      }

      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }

      return days;
    } catch {
      return [];
    }
  }, [currentMonth]);

  const days = useMemo(() => getDaysInMonth(), [getDaysInMonth]);

  const handleDateSelect = useCallback((date) => {
    if (!date || disabled) return;

    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) return;

      const persianDate = toJalali(date);
      setSelectedDate(persianDate);
      setSelectedGregorianDate(date);
      setShowPicker(false);

      if (onDateChange) {
        onDateChange({
          persian: persianDate,
          gregorian: date,
          formatted: {
            year: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(date),
            month: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: '2-digit' }).format(date),
            day: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: '2-digit' }).format(date)
          }
        });
      }
    } catch (error) {
      console.error('Error in handleDateSelect:', error);
    }
  }, [toJalali, onDateChange, disabled]);

  const handleTodayClick = useCallback(() => {
    const today = new Date();
    if (!isNaN(today.getTime())) {
      handleDateSelect(today);
      setCurrentMonth(today);
    }
  }, [handleDateSelect]);

  const isSelectedDate = useCallback((date) => {
    if (!date || !selectedGregorianDate) return false;
    try {
      return date.toDateString() === selectedGregorianDate.toDateString();
    } catch {
      return false;
    }
  }, [selectedGregorianDate]);

  const getDayDisplay = useCallback((date) => {
    if (!date) return '';
    try {
      return toPersianNumber(new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(date));
    } catch {
      return '';
    }
  }, [toPersianNumber]);

  return (
    <div
      className={`flex items-center ${className}`}
      ref={pickerRef}
      dir="rtl" >
      {label && (
        <label className="w-32 font-bold text-slate-600">
          {label}
        </label>  )}

      <div className="flex-1 relative">
        <div
          onClick={() => !disabled && setShowPicker(!showPicker)}
          className={`
            w-full border border-slate-300 px-3 py-2 rounded cursor-pointer 
            text-right bg-white flex items-center justify-between
            ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'hover:border-blue-400'}
            transition-colors duration-200 `} >
          <span className={selectedDate ? 'text-blue-700 font-medium' : 'text-slate-400'}>
            {selectedDate || placeholder}
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor" >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {showPicker && !disabled && (
          <div className="absolute top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-3 z-10 w-64">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
                aria-label="ماه قبل" >
                ←
              </button>

              <span className="font-bold text-blue-800">
                {getJalaliMonthName(currentMonth)} {getJalaliYear(currentMonth)}
              </span>

              <button onClick={() => changeMonth(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors" aria-label="ماه بعد" >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-bold text-slate-600" >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={!date}
                  className={`
                    w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all
                    ${date ? 'hover:bg-blue-100 cursor-pointer' : 'text-transparent cursor-default'}
                    ${date && isSelectedDate(date)
                      ? 'bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md'
                      : date ? 'text-slate-700' : ''}
                    ${date && !isSelectedDate(date) && 'hover:scale-110'}`}>
                  {date && getDayDisplay(date)}
                </button>
              ))}
            </div>

            <button
              onClick={handleTodayClick}
              className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border-t border-slate-200 transition-colors" >
              امروز
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersianDatePicker;