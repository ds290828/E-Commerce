import React from 'react'
import './NewsLetter.css'

export const NewsLetter = () => {
  return (
    <div className="newsletter">
         <h1>Get Exclusive Offer on your Email</h1>
         <p>Subscribe to our NewsLetter and stay updated</p>
         <div>
            <input type="email" placeholder='Your Email Id' />
            <button>Subscribe</button>
         </div>
    </div>
  )
}
