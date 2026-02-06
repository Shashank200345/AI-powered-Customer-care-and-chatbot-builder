'use client';
import { BookOpen, Bot, Layers, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import React from 'react'
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';




const SIDEBAR_ITEMS = [
    {label: "Dashboard", href: "/dashboard", icon: LayoutDashboard},
    {label: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen},
    {label: "Sections", href: "/dashboard/sections", icon: Layers},
    {label: "Chatbot", href: "/dashboard/chatbot", icon: Bot},
    {
        label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare
    },
    {label: "Settings", href: "/dashboard/settings", icon: Settings},
]
const Sidebar = () => {
    const pathname = usePathname();
    const {email} = useUser();
    const [metadata, setMetadata] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetaData = async () => {
            const response = await fetch("/api/metadata/fetch");
            const res = await response.json();
            setMetadata(res.data);
            setIsLoading(false);
        };
        fetchMetaData();
    }, []);
  return (
    <aside className='w-64 border-r border-white/5 bg-[#050509] flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex'>
       <div className='h-16 flex items-center px-6 border-b border-white/5'>
         <Link href="/" className='flex items-center gap-2'>
        
            <div className='w-5 h-5 bg-white rounded-sm flex items-center justify-center'>
                <div className='w-2.5 h-2.5 bg-black rounded-[1px]'></div>
            </div>
            <span className='text-sm font-medium tracking-tight text-white/90'>
                One Minute Support
            </span>
          </Link>
          </div>
         <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
            {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link href={item.href} key={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", 
                        isActive
                        ? "bg-white/5 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}>
                        <item.icon className='w-4 h-4' />
                        <span>{item.label}</span>
                    </Link>
                )
            })}
         </nav>

         {/* profile  */}
         <div className='p-4 border-t border-white/5'>
            <div className='flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors group'>
              <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10'>
                <span className='text-xs text-zinc-400 group-hover:text-white'>
                    {metadata?.business_name?.slice(0, 2).toUpperCase() || ".."}
                </span>
              </div>
              <div className='flex flex-col overflow-hidden'>
                <span className='text-sm font-medium text-zinc-300 truncte group-hover:text-white'>
                    {isLoading ? "Loading..." : `${metadata?.business_name}'s Workspace`}
                </span>
                <span className='text-xs text-zinc-500 truncate'>{email}</span>
              </div>
            </div>
         </div>
    </aside>
  );
};

export default Sidebar;