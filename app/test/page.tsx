import React from 'react'
import Script from 'next/script'
const Page = () => {
  return (
    <div>
      <Script src={`${process.env.NEXT_PUBLIC_URI || 'http://localhost:3000'}/widget.js`} data-id="3494c039-358c-46ea-ad42-7559b83234a5" defer />
    </div>
  )
}

export default Page