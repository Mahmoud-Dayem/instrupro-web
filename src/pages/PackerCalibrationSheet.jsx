import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PackerCalibrationSheet.css";

const CalibrationSheet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { calibrationData, packerName } = location.state || {};

  // Format date from calibration data
  const formatDate = (dateString) => {
    if (!dateString) return "_________________";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} (DD/MM/YYYY)`;
  };

  // Get calibration records (limit to 8 rows for the form)
  const calibrationRecords = calibrationData?.data || [];
  const displayRecords = [...Array(8)].map((_, index) => {
    return calibrationRecords[index] || null;
  });

  return (
    <div className="calibration-container">
      {/* Action Buttons */}
      <div className="action-buttons-container">
        <button 
          className="back-to-history-btn" 
          onClick={() => navigate(-1)}
        >
          ← Back to History
        </button>
        <button 
          className="print-btn" 
          onClick={() => window.print()}
        >
          🖨️ Print Sheet
        </button>
      </div>

      {/* Header Section */}
      <header className="calibration-header">
        <div className="header-left">
          <img src="/hcclogo.png" alt="Company Logo" className="logo" />
        </div>
        <div className="header-right">
          <p>Document No: HIMS-L3-F-03-02.30.03</p>
          <p>Date Issued: 14-12-2023</p>
          <p>Next Revision: 14-12-2026</p>
          <p>Revision: 03</p>
        </div>
      </header>

      <h1>Calibration Sheet for ROTO Packer</h1>

      {/* Instrument Info */}
      <section className="instrument-info">
        <table>
          <tbody>
            <tr>
              <td>Instrument: Packer</td>
              <td>Make: FLS Ventomatic</td>
            </tr>
            <tr>
              <td>Model: Gev Ventocem 8</td>
              <td>Capacity: 2400 Bags/Hour</td>
            </tr>
            <tr>
              <td>Code: {packerName || "_________________"}</td>
              <td>Location: Packing Plant</td>
            </tr>
            <tr>
              <td>Date: {formatDate(calibrationData?.created_at)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Calibration Table */}
      <section className="calibration-table">
        <table>
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Applied Test Weight (Kg)</th>
              <th>Actual Result (Kg)</th>
              <th>% Error</th>
              <th>After Calibration (Kg)</th>
              <th>% Error</th>
            </tr>
          </thead>
          <tbody>
            {displayRecords.map((record, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>50.00</td>
                <td>{record?.input?.toFixed(2) || ""}</td>
                <td>{record?.error?.toFixed(2) || ""}</td>
                <td>{record ? "50.00" : ""}</td>
                <td>{record ? "0.00" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Footer Section */}
      <footer className="calibration-footer">
        <table>
          <tbody>
            <tr>
              <td>Checked By : {calibrationData?.user_name || "__ "}</td>
           
              <td></td>
              <td>Verified By:</td>
              <td>_________________</td>
            </tr>
          </tbody>
        </table>
      </footer>
    </div>
  );
};

export default CalibrationSheet;
