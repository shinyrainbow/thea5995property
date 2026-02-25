'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  allowDecimal?: boolean;
}

function addCommas(str: string): string {
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function stripNonNumeric(str: string, allowDecimal: boolean): string {
  if (allowDecimal) {
    let result = str.replace(/[^\d.]/g, '');
    const dotIdx = result.indexOf('.');
    if (dotIdx !== -1) {
      result = result.slice(0, dotIdx + 1) + result.slice(dotIdx + 1).replace(/\./g, '');
    }
    return result;
  }
  return str.replace(/[^\d]/g, '');
}

export default function NumberInput({
  value,
  onChange,
  allowDecimal = false,
  className,
  ...props
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState(() => {
    if (value === null || value === undefined) return '';
    return String(value);
  });

  // Sync from external value changes (form reset, initial load)
  useEffect(() => {
    if (value === null || value === undefined) {
      setRaw('');
    } else {
      const currentNum = allowDecimal ? parseFloat(raw) : parseInt(raw, 10);
      if (isNaN(currentNum) || currentNum !== value) {
        setRaw(String(value));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const cursorPos = input.selectionStart ?? 0;

      const cleaned = stripNonNumeric(input.value, allowDecimal);

      setRaw(cleaned);

      if (cleaned === '' || cleaned === '.') {
        onChange(null);
      } else {
        const num = allowDecimal ? parseFloat(cleaned) : parseInt(cleaned, 10);
        onChange(isNaN(num) ? null : num);
      }

      // Restore cursor — count digit-chars before cursor, then find same
      // position in the newly formatted string
      const charsBeforeCursor = input.value.slice(0, cursorPos);
      const digitsBefore = charsBeforeCursor.replace(/[^\d.]/g, '').length;

      const formatted = addCommas(cleaned);
      let newCursor = 0;
      let count = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/[\d.]/.test(formatted[i])) count++;
        if (count >= digitsBefore) {
          newCursor = i + 1;
          break;
        }
      }
      if (count < digitsBefore) newCursor = formatted.length;

      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(newCursor, newCursor);
      });
    },
    [allowDecimal, onChange],
  );

  const displayValue = addCommas(raw);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}
