import React, { useState, useEffect } from "react";

function LossOfWeight({ tag }) {
  const { code, name } = tag;
  const [binWeightBefore, setBinWeightBefore] = useState(0);
  const [binWeightAfter, setBinWeightAfter] = useState(0);
  const [totalizerBefore, setTotalizerBefore] = useState(0);
  const [totalizerAfter, setTotalizerAfter] = useState(0);
  const [binDifference, setBinDifference] = useState(0);
  const [totDifference, setTotDifference] = useState(0);
  const [error, setError] = useState(0);

  useEffect(() => {
    const binbefore = parseFloat(binWeightBefore) || 0 ;
    const binafter = parseFloat(binWeightAfter) || 0 ;
    const bindiff = binbefore -  binafter
    const totbefore  = parseFloat(totalizerBefore) || 0 ;
    const totafter = parseFloat(totalizerAfter) || 0 ;
    const totdiff = totbefore - totafter ;
    setBinDifference(binbefore-binafter);
    setTotDifference(totdiff);
    if(binbefore>0&&binafter>0&&totbefore>0&&totafter>0){
       let  wfError = ((bindiff/totdiff)-1) *100 ;
       setError(Number(wfError.toFixed(2)))
    }
  }, [binWeightBefore,binWeightAfter,totalizerAfter,totalizerBefore]);
  const handleNumberInput = (value, setter) => {
    // Allow empty string, numbers, decimal point, and negative sign
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className="row">
      <span>{code}</span>
      <span>{name}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Bin Weight Before"
        value={binWeightBefore}
        onChange={(e) => handleNumberInput(e.target.value, setBinWeightBefore)}
      />
      <input
        type="text"
        inputMode="decimal"
        placeholder="Bin Weight After"
        value={binWeightAfter}
        onChange={(e) => handleNumberInput(e.target.value, setBinWeightAfter)}
      />
      <span>{binDifference}</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder="Totalizer Before"
        value={totalizerBefore}
        onChange={(e) => handleNumberInput(e.target.value, setTotalizerBefore)}
      />
      <input
        type="text"
        inputMode="decimal"
        placeholder="Totalizer After"
        value={totalizerAfter}
        onChange={(e) => handleNumberInput(e.target.value, setTotalizerAfter)}
      />
      <span>{totDifference}</span>
      <span>{error}</span>
    </div>
  );
}

export default LossOfWeight;
