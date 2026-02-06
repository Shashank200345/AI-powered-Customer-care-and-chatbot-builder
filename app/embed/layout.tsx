'use client'

import { useEffect } from "react";

const EmbedLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="bg-[#050509] min-h-screen font-sans antialiased text-zinc-100 selection:bg-zinc-800">
      {children}
    </div>
  )
}

export default EmbedLayout