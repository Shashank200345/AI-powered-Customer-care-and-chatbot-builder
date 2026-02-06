'use client';
import React, { useEffect, useRef } from 'react'
import ChatSimulator from '@/components/dashboard/chatbot/chatSimulator'
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppearanceConfig from '@/components/dashboard/chatbot/appearanceConfig';
import EmbedCodeConfig from '@/components/dashboard/chatbot/embedCodeConfig';




interface ChatbotMetadata {
  id: string;
  user_email: string;
  welcome_messages:string;
  created_at: string;
  source_ids: string[];
  color: string;
}

const Chatbot = () => {
  const [metadata, setMetadata] = useState<ChatbotMetadata | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);


  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [isSaving, setIsSaving] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("Hi! How can I help you today?");

  useEffect(() => {
    const fetchData = async() => {
      try {
        const metaRes = await fetch("/api/chatbot/metadata/fetch");
        const metaJson = await metaRes.json();
        const metaData = metaJson.existingMetadata || metaJson.newMetadata || null;
        setMetadata(metaData);
        if(metaData) {
          setPrimaryColor(metaData.color || "#4f46e5");
          setWelcomeMessage(
            metaData.welcome_messages || "Hi! How can I help you today?"
          );
          setMessages([{
            role: "assistant",
            content: metaData.welcome_messages || metaData.welcome_message || "Hi! How can I help you today?",
            isWelcome: true,
            section: null,
          }]);
        } else {
          setMessages([{
            role: "assistant",
            content: "Hi! How can I help you today? Select a section below to start asking questions—answers use all sources in that section.",
            isWelcome: true,
            section: null,
          }]);
        }
        const sectionRes = await fetch("/api/sections/fetch", { credentials: "include" });
        if(sectionRes.ok){
          const sectionsData = await sectionRes.json();
          setSections(sectionsData || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }finally{
        setLoading(false);
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    if(scrollViewportRef.current){
      scrollViewportRef.current.scrollIntoView({behavior:"smooth"});
    }
  }, [messages, isTyping]);



  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeSectionId) return;

    const userMsg = { role: "user", content: trimmed, section: null };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = [
        ...messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: trimmed },
      ];

      const res = await fetch("/api/chat/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          section_id: activeSectionId,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.error ?? "Something went wrong. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? "I couldn't generate a response.",
          sectionUsed: data.sectionUsed,
        },
      ]);
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSectionClick = async (section: Section) => {
    setActiveSection(section.name);
    setActiveSectionId(section.id);
    const userMsg = { role: "user", content: section.name, section: null };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = {
        role: "assistant",
        content: `You can ask me any question related to "${section.name}"`,
        section: section.name,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const handleReset = async () => {
    setActiveSection(null);
    setActiveSectionId(null);
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        isWelcome: true,
        section: null,
      }
    ])
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/chatbot/metadata/update",{
        method: "PUT",
        headers: {
          "Content-Type": "application/json"},
        body: JSON.stringify({
          welcome_messages: welcomeMessage,
          color: primaryColor,
        }),
      });
      if(res.ok){
        const updated = await res.json();
        setMetadata(updated);
        const newWelcome = updated.welcome_messages ?? welcomeMessage;
        setMessages((prev) => {
          if (prev.length === 0) {
            return [{ role: "assistant", content: newWelcome, isWelcome: true, section: null }];
          }
          const first = prev[0];
          if (first.role === "assistant" && first.isWelcome) {
            return [{ ...first, content: newWelcome }, ...prev.slice(1)];
          }
          return prev;
        });
      } else {
        console.error("Failed to update changes");
      }
    } catch (error) {
      console.error("Failed to update metadata:", error);
    } finally {
      setIsSaving(false);
    }
  }
  const hasChanges = metadata ? (primaryColor !== (metadata.color || "#4f46e5") || welcomeMessage !== (metadata.welcome_messages || "Hi! How can I help you?")) : false;
  
  if(loading){
    return (
      <div className='p-8 text-zinc-500'>Loading chatbot configuration...</div>
    )
  }

  return (
      <div className='p-6 md:p-8 space-y-8 max-w-400 mx-auto animate-in fade-in duration-500 h-[calc(100vh-64px)] overflow-hidden flex flex-col'>
        <div className='flex justify-between items-center shrink-0'>
          <div>
            <h1 className='text-2xl font-semibold text-white tracking-tight'>Chatbot Playground</h1>
            <p className='text-sm text-zinc-400 mt-1'>
              Test your assistant, customize appearance, and deploy it.
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0'>
          <div className='lg:col-span-7 flex flex-col h-full min-h-0 space-y-4'>
            <ChatSimulator  
              messages={messages}
              primaryColor={primaryColor}
              sections={sections}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              handleSectionClick={handleSectionClick}
              activeSection={activeSection}
              isTyping={isTyping}
              handleReset={handleReset}
              scrollRef={scrollViewportRef} 
            />
          </div>

          <div className='lg:col-span-5 h-full min-h-0 overflow-hidden flex flex-col'>
            <ScrollArea className='h-full pr-4'>
              <div className='space-y-6 pb-8'>
                <AppearanceConfig 
                  primaryColor={primaryColor}
                  setPrimaryColor={setPrimaryColor}
                  welcomeMessage={welcomeMessage}
                  setWelcomeMessage={setWelcomeMessage}
                  handleSave={handleSave}
                  isSaving={isSaving}
                  hasChanges={hasChanges}
                />
                <EmbedCodeConfig chatbotId={metadata?.id} />

              </div>

            </ScrollArea>

          </div>
        </div>
      </div>
  )
}


export default Chatbot