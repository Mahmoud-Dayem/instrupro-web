import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { db } from '../firebase/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { RefreshCw } from 'lucide-react'
import './DashBoard.css'

function DashBoard() {
  const [equipmentData, setEquipmentData] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const equipment = useMemo(() => [
    'Packer-1', 'Packer-2', 'Packer-3', 'Packer-4',
    'Ventocheck-Packer-1', 'Ventocheck-Packer-2', 'Ventocheck-Packer-3', 'Ventocheck-Packer-4',
  ], [])

  const CACHE_KEY = 'dashboard_equipment_data'
  const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const now = Date.now()
        if (now - timestamp < CACHE_EXPIRY) {
          return data
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error)
    }
    return null
  }

  const setCachedData = (data) => {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject))
    } catch (error) {
      console.error('Error setting cache:', error)
    }
  }

  const fetchEquipmentData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = getCachedData()
      if (cachedData) {
        setEquipmentData(cachedData)
        setLoading(false)
        return
      }
    }

    if (forceRefresh) {
      setRefreshing(true)
    }
    
    try {
      const dataPromises = equipment.map(async (equipmentName) => {
        const docRef = doc(db, 'packers_calibration', equipmentName)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          const calibrations = data.calibrations || []
          
          let lastCreatedAt = null
          if (calibrations.length > 0) {
            // Get the last calibration's created_at
            const lastCalibration = calibrations[calibrations.length - 1]
            lastCreatedAt = lastCalibration.created_at
          }
          
          return {
            name: equipmentName,
            count: calibrations.length,
            lastCreatedAt: lastCreatedAt
          }
        } else {
          return {
            name: equipmentName,
            count: 0,
            lastCreatedAt: null
          }
        }
      })
      
      const results = await Promise.all(dataPromises)
      const dataMap = {}
      results.forEach(result => {
        dataMap[result.name] = {
          count: result.count,
          lastCreatedAt: result.lastCreatedAt
        }
      })
      
      setEquipmentData(dataMap)
      setCachedData(dataMap)
    } catch (error) {
      console.error('Error fetching equipment data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [equipment])

  useEffect(() => {
    fetchEquipmentData()
  }, [fetchEquipmentData])

  const handleRefresh = () => {
    fetchEquipmentData(true)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No data'
    
    try {
      // Handle Firestore Timestamp
      let date
      if (timestamp.toDate) {
        date = timestamp.toDate()
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000)
      } else {
        date = new Date(timestamp)
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const calculateDaysSince = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    try {
      let date
      if (timestamp.toDate) {
        date = timestamp.toDate()
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000)
      } else {
        date = new Date(timestamp)
      }
      
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      return `${diffDays} days ago`
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getDaysClass = (daysText) => {
    if (daysText === 'Today') return 'recent'
    
    const daysMatch = daysText.match(/(\d+) days? ago/)
    if (daysMatch) {
      const days = parseInt(daysMatch[1])
      if (days <= 7) return 'recent'
      if (days <= 30) return 'moderate'
      if (days <= 90) return 'old'
      return 'very-old'
    }
    
    return 'moderate'
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Equipment Dashboard</h1>
        </div>
        <div className="loading">Loading equipment data...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Equipment Dashboard</h1>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={20} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      <div className="equipment-grid">
        {equipment.map((item, index) => {
          const data = equipmentData[item] || { count: 0, lastCreatedAt: null }
          const daysSince = calculateDaysSince(data.lastCreatedAt)
          
          return (
            <div key={index} className="equipment-card">
              <h3 className="equipment-title">{item}</h3>
              <div className="equipment-stats">
                <div className="stat-item">
                  <span className="stat-label">Calibrations:</span>
                  <span className="stat-value">{data.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Updated:</span>
                  <span className="stat-date">{formatDate(data.lastCreatedAt)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Days Since:</span>
                  <span className={`stat-days ${daysSince === 'N/A' ? 'no-data' : getDaysClass(daysSince)}`}>
                    {daysSince}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashBoard
