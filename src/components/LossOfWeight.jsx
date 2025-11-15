import React, { useState, useEffect } from "react";

function LossOfWeight({ tag, index, onDataChange }) {
  const { code, name, binBefore, binAfter, totBefore, totAfter } = tag;
  const [binDifference, setBinDifference] = useState(0);
  const [totDifference, setTotDifference] = useState(0);
  const [error, setError] = useState(0);

  useEffect(() => {
    const binBeforeVal = parseFloat(binBefore) || 0;
    const binAfterVal = parseFloat(binAfter) || 0;
    const binDiff = (binBeforeVal - binAfterVal).toFixed(2);
    const totBeforeVal = parseFloat(totBefore) || 0;
    const totAfterVal = parseFloat(totAfter) || 0;
    const totDiff = ( totAfterVal - totBeforeVal).toFixed(2);
    
    setBinDifference(binDiff);
    setTotDifference(totDiff);
    
    if (binBeforeVal > 0 && binAfterVal > 0 && totBeforeVal > 0 && totAfterVal > 0) {
      let wfError = ((binDiff / totDiff) - 1) * 100;
      setError(Number(wfError.toFixed(2)));
    }
  }, [binBefore, binAfter, totBefore, totAfter]);

  const handleNumberInput = (value, field) => {
    // Allow empty string, numbers, decimal point, and negative sign
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      onDataChange(index, field, value);
    }
  };

  return (
    <div className="row">
      <span>{code}</span>
      <span>{name}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder=" "
        value={binBefore}
        onChange={(e) => handleNumberInput(e.target.value, 'binBefore')}
      />
      <input
        type="text"
        inputMode="decimal"
        placeholder=" "
        value={binAfter}
        onChange={(e) => handleNumberInput(e.target.value, 'binAfter')}
      />
      <span>{binDifference}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder=" "
        value={totBefore}
        onChange={(e) => handleNumberInput(e.target.value, 'totBefore')}
      />
      <input
        type="text"
        inputMode="decimal"
        placeholder=" "
        value={totAfter}
        onChange={(e) => handleNumberInput(e.target.value, 'totAfter')}
      />
      <span>{totDifference}</span>
      <span>{error}</span>
    </div>
  );
}

export default LossOfWeight;
