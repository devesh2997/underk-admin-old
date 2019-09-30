import React, { Component } from 'react'

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'placed':
    case 'success':
      return <span className='badge badge-success'>{status}</span>
    case 'error':
      return <span className='badge badge-danger'>{status}</span>
    case 'created':
    case 'init':
      return <span className='badge badge-warning'>{status}</span>
    default:
      return <span className='badge badge-primary'>{status}</span>
  }
}

export { StatusBadge }
