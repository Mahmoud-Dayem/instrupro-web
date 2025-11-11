import React from 'react'
import './WeighFeeder.css'
import LossOfWeight from '../components/LossOfWeight'
function WeighFeeder() {
  const  tags = [
    {
        code:'331WF1',
        name: 'Limestone'
    },
    {
        code:'331WF2',
        name: 'Ironore'
    },
    {
        code:'331WF3',
        name: 'Clay'
    },
    {
        code:'331WF4',
        name: 'Sand'
    },
    {
        code:'531WF1',
        name: 'Gyspum'
    },
    {
        code:'531WF2',
        name: 'Clinker-new'
    },
    {
        code:'531WF3',
        name: 'Clinker'
    },
    
    {
        code:'531FM1',
        name: 'Limestone'
    },
       {
        code:'532WF1',
        name: 'Gyspum'
    },
    {
        code:'532WF2',
        name: 'Clinker-new'
    },
    {
        code:'532WF3',
        name: 'Clinker'
    },
    
    {
        code:'532FM1',
        name: 'Limestone'
    },

    ]

  return (
    <div className="weigh-feeder-container">
      <h1 className="weigh-feeder-title">Weigh Feeder - Loss of Weight</h1>
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
          <span>Error</span>
        </div>
        {tags.map(tag => <LossOfWeight key={tag.code} tag={tag} />)}
      </div>
    </div>
  )
}

export default WeighFeeder