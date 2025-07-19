import CustomLoader from '@/components/CustomLoader'
import React from 'react'

const loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8 h-[calc(100vh-100px)] flex justify-center items-center">
            <CustomLoader size="lg" />
        </div>
      </div>
  )
}

export default loading
