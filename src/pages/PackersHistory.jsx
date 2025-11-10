import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./PackersHistory.css";

const PackersHistory = () => {
  const navigate = useNavigate();

  // Cache key for localStorage
  const CACHE_KEY = "packers_history_cache";

  // Load cache from localStorage
  const loadCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error("Error loading cache:", error);
      return {};
    }
  };

  // Save cache to localStorage
  const saveCache = (cache) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  };

  // Packer filter states
  const [selectedPacker, setSelectedPacker] = useState("Packer-1");
  const [showPackerDropdown, setShowPackerDropdown] = useState(false);
  const packerOptions = [
    "Packer-1",
    "Packer-2",
    "Packer-3",
    "Packer-4",
    "Ventocheck-Packer-1",
    "Ventocheck-Packer-2",
    "Ventocheck-Packer-3",
    "Ventocheck-Packer-4",
  ];

  // Data states
  const [historyData, setHistoryData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [dataCache, setDataCache] = useState(loadCache());

  // Modal states for detailed view
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load cached data on component mount and when packer changes
  useEffect(() => {
    if (dataCache[selectedPacker]) {
      setHistoryData(dataCache[selectedPacker]);
      setHasData(dataCache[selectedPacker].length > 0);
    } else {
      setHistoryData([]);
      setHasData(false);
    }
  }, [selectedPacker, dataCache]);

  // Function to handle packer selection
  const handlePackerSelection = (packer) => {
    setSelectedPacker(packer);
    setShowPackerDropdown(false);
    
    // Data will be loaded by useEffect when selectedPacker changes
  };

  // Function to fetch calibration history from Firestore
  const fetchCalibrationHistory = async () => {
    // Check if data is already cached for this packer
    if (dataCache[selectedPacker]) {
      alert(`Using cached data for ${selectedPacker}. Click "Clear Cache" to refresh.`);
      return;
    }

    try {
      setIsFetching(true);

      // Get Firestore instance
      const db = getFirestore();
      const packerDocRef = doc(db, "packers_calibration", selectedPacker);

      // Get document
      const docSnap = await getDoc(packerDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const calibrations = data.calibrations || [];

        if (calibrations.length > 0) {
          // Sort by created_at in descending order (newest first)
          const sortedCalibrations = calibrations.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          // Update cache and save to localStorage
          const updatedCache = { ...dataCache, [selectedPacker]: sortedCalibrations };
          setDataCache(updatedCache);
          saveCache(updatedCache);

          setHistoryData(sortedCalibrations);
          setHasData(true);

          alert(
            `Success: Found ${calibrations.length} calibration records for ${selectedPacker}`
          );
        } else {
          // Cache empty array
          const updatedCache = { ...dataCache, [selectedPacker]: [] };
          setDataCache(updatedCache);
          saveCache(updatedCache);
          
          setHistoryData([]);
          setHasData(false);
          alert(`No calibration records found for ${selectedPacker}`);
        }
      } else {
        // Cache empty array
        const updatedCache = { ...dataCache, [selectedPacker]: [] };
        setDataCache(updatedCache);
        saveCache(updatedCache);
        
        setHistoryData([]);
        setHasData(false);
        alert(`No calibration data exists for ${selectedPacker}`);
      }
    } catch (error) {
      console.error("Error fetching calibration history:", error);
      alert("Error: Failed to fetch calibration history. Please try again.");
      setHistoryData([]);
      setHasData(false);
    } finally {
      setIsFetching(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Function to handle record click
  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // Function to close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRecord(null);
  };

  // Helper functions for status
  const getErrorColor = (errorValue) => {
    const err = parseFloat(errorValue);
    if (err >= -0.5 && err <= 0.5) return "#4CAF50";
    if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
      return "#FF9800";
    return "#F44336";
  };

  const getStatusText = (errorValue) => {
    const err = parseFloat(errorValue);
    if (err >= -0.5 && err <= 0.5) return "Good";
    if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
      return "Warning";
    return "Critical";
  };

  return (
    <div className="packers-history-container">
      {/* Header */}
      <header className="history-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <span className="icon">←</span>
          </button>
          <div className="header-icon-container">
            <span className="icon">🕒</span>
          </div>
        </div>
        <h1 className="header-title">Packers History</h1>
        <div className="header-spacer"></div>
      </header>

      <div className="history-content">
        {/* Navigation Button */}
        {/* <div className="navigation-container">
          <button
            className="navigation-button"
            onClick={() => navigate("/packer")}
          >
            <span className="button-icon">🧮</span>
            <span>New Calibration</span>
          </button>
        </div> */}

        {/* Packer Filter Card */}
        <div className="card">
          <h2 className="card-title">Select Machine</h2>
          <button
            className="dropdown-button"
            onClick={() => setShowPackerDropdown(!showPackerDropdown)}
          >
            <span>{selectedPacker}</span>
            <span className="dropdown-icon">▼</span>
          </button>

          {/* Dropdown Menu */}
          {showPackerDropdown && (
            <div className="dropdown-menu">
              {packerOptions.map((packer, index) => (
                <div
                  key={index}
                  className={`dropdown-option ${
                    selectedPacker === packer ? "selected" : ""
                  }`}
                  onClick={() => handlePackerSelection(packer)}
                >
                  <span>{packer}</span>
                  {selectedPacker === packer && (
                    <span className="checkmark">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fetch Button */}
        <div className="fetch-button-container">
          <button
            className={`fetch-button ${isFetching ? "disabled" : ""}`}
            onClick={fetchCalibrationHistory}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <span className="spinner"></span>
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <span className="button-icon">⬇</span>
                <span>
                  {dataCache[selectedPacker] ? "Refresh Data" : "Fetch History"}
                </span>
              </>
            )}
          </button>
          
          {/* Clear Cache Button */}
          {dataCache[selectedPacker] && (
            <button
              className="clear-cache-button"
              onClick={() => {
                const updatedCache = { ...dataCache };
                delete updatedCache[selectedPacker];
                setDataCache(updatedCache);
                saveCache(updatedCache);
                setHistoryData([]);
                setHasData(false);
                alert(`Cache cleared for ${selectedPacker}`);
              }}
            >
              <span className="button-icon">🗑️</span>
              <span>Clear Cache</span>
            </button>
          )}
        </div>

        {/* History Table */}
        {hasData && historyData.length > 0 && (
          <div className="card">
            <h2 className="card-title">Calibration History</h2>
            <p className="subtitle">
              {historyData.length} records found for {selectedPacker}
            </p>

            {/* Table */}
            <div className="history-table">
              {/* Table Header */}
              <div className="table-header">
                <div className="header-cell date-column">Date & Time</div>
                <div className="header-cell user-column">User</div>
                <div className="header-cell records-column">Records</div>
                <div className="header-cell action-column">Sheet</div>
              </div>

              {/* Table Rows */}
              {historyData.map((record, index) => (
                <div
                  key={index}
                  className="table-row"
                >
                  <div 
                    className="table-cell date-column"
                    onClick={() => handleRecordClick(record)}
                  >
                    {formatDate(record.created_at)}
                  </div>
                  <div 
                    className="table-cell user-column"
                    onClick={() => handleRecordClick(record)}
                  >
                    {record.user_name || "Unknown User"}
                  </div>
                  <div 
                    className="table-cell records-column"
                    onClick={() => handleRecordClick(record)}
                  >
                    {record.data ? record.data.length : 0}
                  </div>
                  <div className="table-cell action-column">
                    <button
                      className="document-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/packersheet', { 
                          state: { 
                            calibrationData: record,
                            packerName: selectedPacker 
                          } 
                        });
                      }}
                      title="View Calibration Sheet"
                    >
                      📄
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!hasData && !isFetching && (
          <div className="no-data-container">
            <span className="no-data-icon">📄</span>
            <h3 className="no-data-text">No calibration history available</h3>
            <p className="no-data-subtext">
              Select a packer and tap "Fetch History" to load data
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="detail-modal-header">
              <h2 className="detail-modal-title">Calibration Details</h2>
              <button className="close-button" onClick={closeDetailModal}>
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="detail-modal-content">
              {/* Session Info */}
              <div className="session-info-card">
                <h3 className="session-info-title">Session Information</h3>
                <div className="info-row">
                  <span className="info-label">Date & Time:</span>
                  <span className="info-value">
                    {formatDate(selectedRecord.created_at)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">User:</span>
                  <span className="info-value">
                    {selectedRecord.user_name || "Unknown User"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Machine:</span>
                  <span className="info-value">{selectedPacker}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Records:</span>
                  <span className="info-value">
                    {selectedRecord.data ? selectedRecord.data.length : 0}
                  </span>
                </div>
              </div>

              {/* Calibration Data */}
              {selectedRecord.data && selectedRecord.data.length > 0 && (
                <div className="calibration-data-card">
                  <h3 className="calibration-data-title">Measurements</h3>

                  {/* Data Table */}
                  <div className="data-table">
                    {/* Table Header */}
                    <div className="data-table-header">
                      <div className="data-header-cell index-column">#</div>
                      <div className="data-header-cell input-column">
                        Input
                      </div>
                      <div className="data-header-cell error-column">
                        Error (%)
                      </div>
                      <div className="data-header-cell status-column">
                        Status
                      </div>
                    </div>

                    {/* Data Rows */}
                    {selectedRecord.data.map((measurement, index) => (
                      <div key={index} className="data-table-row">
                        <div className="data-cell index-column">
                          {index + 1}
                        </div>
                        <div className="data-cell input-column">
                          {measurement.input?.toFixed(2) || "N/A"}
                        </div>
                        <div
                          className="data-cell error-column"
                          style={{ color: getErrorColor(measurement.error) }}
                        >
                          {measurement.error?.toFixed(2) || "N/A"}
                        </div>
                        <div
                          className="data-cell status-column"
                          style={{ color: getErrorColor(measurement.error) }}
                        >
                          {getStatusText(measurement.error)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackersHistory;
