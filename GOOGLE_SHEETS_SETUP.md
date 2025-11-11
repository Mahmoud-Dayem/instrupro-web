# Google Sheets Setup Guide

Follow these steps to set up Google Sheets integration for the Weigh Feeder data:

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Weigh Feeder - Loss of Weight Data"
4. In the first row, add these headers:
   - Column A: `Date`
   - Column B: `331WF1`
   - Column C: `331WF2`
   - Column D: `331WF3`
   - Column E: `331WF4`
   - Column F: `531WF1`
   - Column G: `531WF2`
   - Column H: `531WF3`
   - Column I: `531FM1`
   - Column J: `532WF1`
   - Column K: `532WF2`
   - Column L: `532WF3`
   - Column M: `532FM1`

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Prepare row data: [Date, 331WF1 error, 331WF2 error, ...]
    const rowData = [
      new Date(data.date),
      data.errors['331WF1'] || 0,
      data.errors['331WF2'] || 0,
      data.errors['331WF3'] || 0,
      data.errors['331WF4'] || 0,
      data.errors['531WF1'] || 0,
      data.errors['531WF2'] || 0,
      data.errors['531WF3'] || 0,
      data.errors['531FM1'] || 0,
      data.errors['532WF1'] || 0,
      data.errors['532WF2'] || 0,
      data.errors['532WF3'] || 0,
      data.errors['532FM1'] || 0
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾 icon)
5. Name your project (e.g., "Weigh Feeder Data Logger")

## Step 3: Deploy the Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: Enter "Weigh Feeder API v1"
   - **Execute as**: Choose "Me"
   - **Who has access**: Choose "Anyone" (this allows your React app to send data)
5. Click **Deploy**
6. **Important**: Copy the **Web app URL** that appears
   - It will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

## Step 4: Update Your React App

1. Open `src/pages/WeighFeeder.jsx`
2. Find the line:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your copied Web app URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
   ```

## Step 5: Test the Integration

1. Fill in some data in your Weigh Feeder form
2. Click the "Save to Google Sheets" button
3. Check your Google Sheet - you should see the new data appended

## Troubleshooting

### If data isn't appearing:

1. **Check the Web App URL**: Make sure you copied the entire URL including `https://`
2. **Check permissions**: In Apps Script, go to **Deploy** → **Manage deployments** and ensure "Who has access" is set to "Anyone"
3. **Check the browser console**: Open Developer Tools (F12) to see if there are any error messages
4. **Test the script**: In Apps Script, you can test by clicking the **Run** button (but doPost requires actual POST requests)

### If you get authorization errors:

1. In Apps Script, click **Run** on any function
2. Click **Review permissions**
3. Choose your Google account
4. Click **Allow**

## Data Format

Each time you click "Save to Google Sheets", one row will be added with:
- **Column A**: Current date and time
- **Columns B-M**: Error percentage values for each code (331WF1, 331WF2, etc.)

Example row:
```
2025-11-11 10:30:00 | 2.5 | 1.8 | 3.2 | 0.5 | 1.2 | 2.1 | 1.9 | 0.8 | 1.5 | 2.3 | 1.7 | 0.9
```

## Advanced: Add Error Column (Optional)

If you want to include the error percentage calculation, update the Apps Script:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    data.data.forEach(row => {
      // Calculate error percentage
      const binDiff = row.binDifference;
      const totDiff = row.totalizerDifference;
      const error = totDiff !== 0 ? ((binDiff / totDiff) - 1) * 100 : 0;
      
      sheet.appendRow([
        row.timestamp,
        row.code,
        row.name,
        row.binWeightBefore,
        row.binWeightAfter,
        row.binDifference,
        row.totalizerBefore,
        row.totalizerAfter,
        row.totalizerDifference,
        error.toFixed(2) + '%'  // Add error column
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

Don't forget to add "Error %" as a header in your Google Sheet!
