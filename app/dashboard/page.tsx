'use client'
import React, { use, useEffect } from 'react'
import InitialForm from '@/components/dashboard/initialform'
import { useState } from 'react';

const Page = () => {

    const [isMetaDataAvailable, setIsMetaDataAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchMetaData = async () => {
            const response = await fetch("/api/metadata/fetch");
            const data = await response.json();
            setIsMetaDataAvailable(data.exists);
            setIsLoading(false);
        };
        fetchMetaData();
    }, []);

    if(isLoading){
        return(
            <div className='flex-1 flex w-full items-center justify-center p-4'/>
        )
    }
  return (
    <div className='flex-1 flex w-full'>
      {!isMetaDataAvailable ? (
         <div className='flex w-full items-center justify-center p-4'>
            <InitialForm />
         </div>
      ) : (
        <>
            
        </>
      )}

      </div>
    )
}   

export default Page