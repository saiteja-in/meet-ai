
import React from 'react'
import { caller } from '@/lib/trpc/server';
const page = async() => {
  const greeting = await caller.hello({text:"saiteja"})
  return (
    <div className=''>
     {greeting.greeting}
    </div>
  )
}

export default page
