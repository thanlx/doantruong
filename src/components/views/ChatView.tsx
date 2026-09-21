'use client';

// ==============================================================================
// CHAT VIEW: KÊNH TRAO ĐỔI NỘI BỘ BTV ĐOÀN TRƯỜNG HCMUTE
// Kênh chat tập trung duy nhất hỗ trợ trao đổi thông tin hỏa tốc
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Send, Smile, Paperclip, MessageSquare, CheckCheck, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatView() {
  const { chatMessages, sendChatMessage, currentMember, members } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendChatMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="h-[calc(100dvh-175px)] md:h-[calc(100vh-140px)] flex flex-col bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
      {/* Header kênh chat */}
      <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Kênh trao đổi Ban Thường vụ</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-muted-foreground">9 Thành viên trực tuyến • Bảo mật nội bộ BTV</p>
          </div>
        </div>

        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {members.slice(0, 5).map((m) => (
            <img
              key={m.id}
              src={m.avatar_url}
              alt={m.full_name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-card"
            />
          ))}
          <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
            +4
          </div>
        </div>
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        <div className="text-center py-2">
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full uppercase tracking-wider border border-border">
            Đầu kênh trao đổi chính thức
          </span>
        </div>

        {chatMessages.map((msg) => {
          const isMe = msg.member_id === currentMember.id;
          const sender = members.find((m) => m.id === msg.member_id) || currentMember;

          return (
            <div key={msg.id} className={`flex items-start gap-2.5 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <img
                src={sender.avatar_url}
                alt={sender.full_name}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-border"
              />

              <div className={`space-y-1 ${isMe ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-2 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                  <span className="font-bold text-foreground">{sender.full_name}</span>
                  <span className="text-[9px] text-muted-foreground">
                    {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : ''}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-xs'
                      : 'bg-muted text-foreground rounded-tl-xs border border-border/50'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Khung nhập tin nhắn */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-card border-t border-border flex items-center gap-2">
        <input
          type="text"
          placeholder="Nhập tin nhắn trao đổi với Ban Thường vụ..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 text-xs bg-muted/40 focus:bg-card text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-2xl border border-input outline-none focus:ring-2 focus:ring-ring transition-all"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground p-3 rounded-2xl shadow-sm active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
