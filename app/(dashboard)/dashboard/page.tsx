"use client"
import { useTRPC } from '@/lib/trpc/client';
// import { useQuery } from '@tanstack/react-query';
import React from 'react'

const page = () => {
  const trpc = useTRPC();
  // const {data}= useQuery(trpc.hello.queryOptions({text:"Sai teja"}))
  return (
    <div className=''>
      {/* {data?.greeting} */}
      sai teja
    </div>
  )
}

export default page
  