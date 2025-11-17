import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Printer } from "lucide-react";
import "./PlcModificationForm.css";

function PlcModificationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    modificationNumber: "",
    date: new Date().toISOString().split("T")[0],
    plcTagNo: "",
    description: "",
    equipmentAffected: "",
    detailsOfModification: "",
    requestType: "Permanent",
    isPermanent: true,
    reasonForModification: "",
    expectedDurationApplied: "",
    expectedDurationCanceled: "",
    performedBy: "",
    performedSignature: "",
    requesterManager: "",
    requesterManagerSignature: "",
    eiHOD: "",
    eiHODSignature: "",
    pmeHOD: "",
    pmeHODSignature: "",
    maintenanceManager: "",
    maintenanceManagerSignature: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add Firebase submission logic here
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="plc-form-page">
      <div className="plc-form-header no-print">
        <button className="plc-form-home-btn" onClick={() => navigate("/home")}>
          <Home size={20} />
          Home
        </button>
        <h2>PLC Modification Request Form</h2>
        <button className="plc-form-print-btn" onClick={handlePrint}>
          <Printer size={20} />
          Print
        </button>
      </div>

      <div className="plc-form-container">
        {/* <header className="calibration-header">
                    <div className="header-left">
                        <img src="/hcclogo2.png" alt="Company Logo" className="logo" />
                    </div>
 
                </header> */}
        <form onSubmit={handleSubmit} className="plc-form">
          <div className="plc-form-title">
            <h1>PLC MODIFICATION REQUEST FORM</h1>
          </div>

          <div className="plc-form-section">
            <div className="plc-form-row">
              <div className="plc-form-field-row">
                <label className="plc-form-label">Modification Number:</label>
              </div>
              <div className="plc-form-field-row">
                <label className="plc-form-label">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="plc-form-input"
                />
              </div>
            </div>

            <div className="plc-form-field-full-row">
              <label className="plc-form-label">Equipment Code: </label>
              <input
                type="text"
                name="plcTagNo"
                value={formData.plcTagNo}
                onChange={handleChange}
                className="plc-form-input"
                placeholder=" "
              />
            </div>

            <div className="plc-form-field-full-row">
              <label className="plc-form-label">Description:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="plc-form-input-row"
                placeholder=" "
              />
            </div>

            <div className="plc-form-field-full-row">
              <label className="plc-form-label">
                Equipment/s to be affected:
              </label>
              <input
                type="text"
                name="equipmentAffected"
                value={formData.equipmentAffected}
                onChange={handleChange}
                className="plc-form-input-row"
              />
            </div>
            {/* </div> */}

            {/* <div className="plc-form-section"> */}
            <h3 className="plc-form-section-title">
              DETAILS OF PLC SIGNAL MODIFICATION:
            </h3>
            <textarea
              name="detailsOfModification"
              value={formData.detailsOfModification}
              onChange={handleChange}
              className="plc-form-textarea"
              rows="1"
              placeholder=" "
            />
            {/* </div> */}

            {/* <div className="plc-form-section"> */}
            <div className="plc-form-reason-section">
              <h3 className="plc-form-section-title-reason">
                REASON FOR SIGNAL MODIFICATION:
              </h3>
              <input
                type="text"
                name="equipmentAffected"
                // value={formData.equipmentAffected}
                // onChange={handleChange}
                className="plc-form-input-reason"
              />
            </div>
     
    
          </div>
          <div className="plc-form-request-type">
            <label className="plc-form-label">Type of Request:</label>
            <div className="plc-form-radio-group">
              <label className="plc-form-radio">
                <input
                  type="radio"
                  name="requestType"
                  value="Permanent"
                  checked={formData.requestType === "Permanent"}
                  onChange={handleChange}
                />
                <span>Permanent</span>
              </label>
              <label className="plc-form-radio">
                <input
                  type="radio"
                  name="requestType"
                  value="temporary"
                  checked={formData.requestType === "temporary"}
                  onChange={handleChange}
                />
                <span>Temporary</span>
              </label>
            </div>
          </div>
          <div className="plc-form-field-row">
            <label className="plc-form-label">
              Expected Duration of the PLC signal Modification if temporary:
            </label>

            <input
              type="text"
              name="modificationNumber"
              value={formData.modificationNumber}
              onChange={handleChange}
              className="plc-form-input"
              placeholder=""
            />
          </div>

          {true && (
            <div className="plc-form-section">
              <table className="plc-form-duration-table">
                <thead>
                  <tr>
                    <th className="plc-form-duration-header-cell">
                      Date and time Applied
                    </th>
                    <th className="plc-form-duration-header-cell">
                      Date and time Canceled
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="plc-form-duration-data-cell"></td>
                    <td className="plc-form-duration-data-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="plc-form-signature-section">
            <div className="plc-form-signature-row">
              <label className="plc-form-label">Performed by:</label>
              <input
                type="text"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleChange}
                className="plc-form-input-short"
              />
              <label className="plc-form-label">Signature:</label>
              <label className="plc-form-label">-------------</label>
            </div>
          </div>

          <div className="plc-form-approvals">
            <h3 className="plc-form-section-title">APPROVALS</h3>

            <div className="plc-form-approval-row">
              <label className="plc-form-label">HOD Requester:</label>
              <input
                type="text"
                name="requesterManager"
                value={formData.requesterManager}
                onChange={handleChange}
                className="plc-form-input-medium"
              />
              <label className="plc-form-label">Signature:</label>
              <label className="plc-form-label">-------------</label>
            </div>

            <div className="plc-form-approval-row">
              <label className="plc-form-label">Requester Manager:</label>
              <input
                type="text"
                name="requesterManager"
                value={formData.requesterManager}
                onChange={handleChange}
                className="plc-form-input-medium"
              />
              <label className="plc-form-label">Signature:</label>
              <label className="plc-form-label">-------------</label>
            </div>

            <div className="plc-form-approval-row">
              <label className="plc-form-label">E&I HOD:</label>
              <input
                type="text"
                name="eiHOD"
                value={formData.eiHOD}
                onChange={handleChange}
                className="plc-form-input-medium"
              />
              <label className="plc-form-label">Signature:</label>
              <label className="plc-form-label">-------------</label>
            </div>

            <div className="plc-form-approval-row">
              <label className="plc-form-label">PME HOD:</label>
              <input
                type="text"
                name="pmeHOD"
                value={formData.pmeHOD}
                onChange={handleChange}
                className="plc-form-input-medium"
              />
              <label className="plc-form-label">Signature:</label>
              <label className="plc-form-label">-------------</label>
            </div>

            <div className="plc-form-approval-row">
              <label className="plc-form-label">Maintenance Manager:</label>
              <input
                type="text"
                name="maintenanceManager"
                value={formData.maintenanceManager}
                onChange={handleChange}
                className="plc-form-input-medium"
              />
              <label className="plc-form-label">Signature:</label>
              <label className="plc-form-label">-------------</label>
            </div>
          </div>

          <div className="plc-form-footer">
            <p>Document No: HIMS-L2-F-01-14.02</p>
            <p>Date Issued: 17-03-2019 | Next Rev. Date: 1/10/2027</p>
            <p>Revision number: 04</p>
          </div>

          <div className="plc-form-actions no-print">
            <button
              type="button"
              className="plc-form-btn-cancel"
              onClick={() => navigate("/home")}
            >
              Cancel
            </button>
            <button type="submit" className="plc-form-btn-submit">
              Save Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlcModificationForm;
