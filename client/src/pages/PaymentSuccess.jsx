import React from 'react'
import { Link } from 'react-router-dom'

const PaymentSuccess = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-6 md:px-16 lg:px-40'>
      <div className='bg-white/90 border border-primary/20 rounded-3xl shadow-xl p-10 text-center max-w-xl'>
        <h1 className='text-3xl font-bold mb-4 text-primary'>Payment Completed</h1>
        <p className='text-gray-600 mb-6'>Your payment flow is finished. You can check your booking status on the My Bookings page.</p>
        <Link to='/my-bookings' className='inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition'>Go to My Bookings</Link>
      </div>
    </div>
  )
}

export default PaymentSuccess
