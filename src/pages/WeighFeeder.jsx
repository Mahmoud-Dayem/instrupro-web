import React, { useState } from 'react'
import './WeighFeeder.css'
import LossOfWeight from '../components/LossOfWeight'

function WeighFeeder() {
  const [data, setData] = useState([
    { code: '331WF1', name: 'Limestone', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '331WF2', name: 'Ironore', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '331WF3', name: 'Clay', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '331WF4', name: 'Sand', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '531WF1', name: 'Gyspum', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '531WF2', name: 'Clinker-new', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '531WF3', name: 'Clinker', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '531FM1', name: 'Limestone', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '532WF1', name: 'Gyspum', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '532WF2', name: 'Clinker-new', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '532WF3', name: 'Clinker', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
    { code: '532FM1', name: 'Limestone', binBefore: '', binAfter: '', totBefore: '', totAfter: '' },
  ])
  const [isSaving, setIsSaving] = useState(false)

  const handleDataChange = (index, field, value) => {
    const newData = [...data]
    newData[index][field] = value
    setData(newData)
  }

  const saveToGoogleSheets = async () => {
    setIsSaving(true)
    try {
      // Calculate error values for each code
      const errorValues = {}
      data.forEach(row => {
        const binBefore = parseFloat(row.binBefore) || 0
        const binAfter = parseFloat(row.binAfter) || 0
        const totBefore = parseFloat(row.totBefore) || 0
        const totAfter = parseFloat(row.totAfter) || 0
        
        const binDiff = binBefore - binAfter
        const totDiff = totBefore - totAfter
        
        let error = 0
        if (binBefore > 0 && binAfter > 0 && totBefore > 0 && totAfter > 0 && totDiff !== 0) {
          error = ((binDiff / totDiff) - 1) * 100
        }
        
        errorValues[row.code] = Number(error.toFixed(2))
      })

      // Format data as: Date, Code1Error, Code2Error, ...
      const formattedData = {
        date: new Date().toISOString(),
        errors: errorValues
      }
      const DEPLOY_ID = 'AKfycbyIPi6sW_CNqnKb985AQTNOaNWZgyyyiNlNOSQkF-lC6PM5JJ_6eNdO5n7kAk3um5hV';
      // Replace this URL with your Google Apps Script Web App URL
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIPi6sW_CNqnKb985AQTNOaNWZgyyyiNlNOSQkF-lC6PM5JJ_6eNdO5n7kAk3um5hV/exec'
      
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      })

      alert('Data saved successfully to Google Sheets!')
      
      // Reset all inputs to empty strings
      const resetData = data.map(row => ({
        ...row,
        binBefore: '',
        binAfter: '',
        totBefore: '',
        totAfter: ''
      }))
      setData(resetData)
      
    } catch (error) {
      console.error('Error saving to Google Sheets:', error)
      alert('Failed to save data. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="weigh-feeder-container">
      <div className="header-section">
        <h1 className="weigh-feeder-title">Weigh Feeder - Loss of Weight</h1>
        <button 
          className="save-button" 
          onClick={saveToGoogleSheets}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save to Google Sheets'}
        </button>
      </div>
      <div className="table-container">
        <div className="header">
          <span>Code</span>
          <span>Name</span>
          <span>Bin Weight Before</span>
          <span>Bin Weight After</span>
          <span>Bin Difference</span>
          <span>Totalizer Before</span>
          <span>Totalizer After</span>
          <span>Tot. Difference</span>
          <span>Error %</span>
        </div>
        {data.map((row, index) => (
          <LossOfWeight 
            key={row.code} 
            tag={row}
            index={index}
            onDataChange={handleDataChange}
          />
        ))}
      </div>
    </div>
  )
}

export default WeighFeeder