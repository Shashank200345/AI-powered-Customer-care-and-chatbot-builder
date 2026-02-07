import React from 'react'
import Image from 'next/image'
import { Send, User } from 'lucide-react'


const Hero = () => {
  return (
      <div>
          <section className='relative pt-32 pb-20 md:pt-40 mb:pb-32 px-6 overflow-hidden'>
              <div className='max-w-4xl mx-auto text-center relative z-20'>
                  <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'></span>
                      <span className='text-xs text-zinc-300 tracking-wide font-light'>
                          Version 1.0.0 available now
                    </span>
                  </div>

                  <h1 className='text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 leading-[1.1]'>Human-friendly support
                          <br />
                         <span className='text-zinc-500'>
                              powered by AI.
                         </span> 
                  </h1>   
                  
                  <p className='text-lg md:text-xl text-zinc-400 font-light mb-10 max-w-2xl mx-auto leading-relaxed'>
                      Instantly resolve customer questions with an assistant that reads your 
                      docs and speaks with empathy. No robotic replies, just answers.
                  </p>

                  <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-20'>
                      <button className='h-11 px-8 cursor-pointer rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2'>
                          Start for free
                          
                       </button>
                      <button className='h-11 px-8 cursor-pointer rounded-full text-zinc-300 text-sm font-medium border border-zinc-800 hover:border-zinc-600 hover:text-white transition-all bg-black/20 backdrop-blur-sm'>
                          View demo
                       </button>
                  </div>
              </div>

              <div className='max-w-3xl mx-auto relative z-10'>
                  <div className='absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none'></div>  

                  <div className='rounded-2xl p-1 md:p-2 relative overflow-hidden ring-1 ring-white/10 bg-[#0a0a0e] shadow-2xl'>
                      <div className='flex flex-col h-125 md:h-150 w-full bg-[#0a0a0e] rounded-xl overflow-hidden'>
                          <div className='h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0E0E12] shrink-0'>
                              <div className='flex items-center gap-2'>
                                  <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'/>
                                  <span className='text-sm font-medium text-zinc-300'>
                                          BotForge AI Inc.
                                    </span>
                              </div>   
                          </div>
                          <div className='flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-950/30'>
                              <div className='flex w-full flex-col items-start'>
                                  <div className='flex max-w-[85%] gap-3 flex-row'>
                                    <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-900/30 overflow-hidden'>
                                        <Image src='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEFJfGVufDB8fDB8fHww'
                                            alt='Support Agent'
                                            width={40}
                                            height={40}
                                            className='w-full h-full object-cover'/>
                                    </div>
                                    <div className='space-y-2'>
                                        <div className='p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-white text-zinc-900 rounded-tl-sm'>
                                            Hi there. How can I help you today?
                                        </div>

                                        <div className='flex flex-wrap gap-2 pt-1 ml-1'>
                                            <span className='px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default'>FAQ</span>
                                            <span className='px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default'>Pricing</span>
                                            <span className='px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default'>Support</span>
                                        </div>
                                         
                                    </div>
                                  </div>


                                    <div className='flex w-full flex-col items-end mt-3'>
                                    <div className='flex max-w-[85%] gap-3 flex-row-reverse'>
                                        <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-zinc-800 overflow-hidden'> 
                                          <User className='w-4 h-4 text-white' />
                                        </div>

                                        <div className='p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-zinc-900 text-white rounded-tr-sm'>
                                            I need some information about BotForge AI.
                                        </div>
                                    </div>
                                </div>
                                  
                                 <div className='flex w-full flex-col items-start mt-5'>
                                    <div className='flex max-w-[85%] gap-3 flex-row'>
                                        <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 overflow-hidden'>
                                        <Image src='https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEFJfGVufDB8fDB8fHww'
                                            alt='Support Agent'
                                            width={40}
                                            height={40}
                                            className='w-full h-full object-cover'/>
                                        </div>
                                        <div className='p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-white text-zinc-900 rounded-tl-sm'>
                                            BotForge AI is an integrated ecosystem designed to 
                                            enhance developer efficiency. It includes tools like 
                                            BotForge AI Logs for real-time monitoring.  
                                        </div>
                                    </div>
                                 </div>

                               
                            </div>
                          </div>
                          <div className='p-4 bg-[#0A0A0E] border-t border-white/5 shrink-0'>
                                    <div className='relative'>
                                        <div className='min-h-[50px] w-full px-4 py-3 text-sm gap-2 text-zinc-500 bg-zinc-900/50 border border-white/10 rounded-xl flex items-center justify-between'>
                                            <span>Type a message...</span>
                                            <button className='h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center'>
                                                <Send className='w-4 h-4' />
                                            </button>
                                        </div>
                                    </div>
                                 </div>
                    </div>
                  </div>
                  
              </div>
          </section>
    </div>
  )
}

export default Hero