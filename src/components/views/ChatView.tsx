'use client';

// ==============================================================================
// CHAT VIEW: KÊNH TRAO ĐỔI NỘI BỘ BTV ĐOÀN TRƯỜNG HCMUTE
// Khớp 100% thiết kế 10-internal-chat.png (Layout 2 cột: Danh sách & Khung chat)
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MessageSquare,
  CheckCheck,
  Search,
  Phone,
  Video,
  Info,
  Image as ImageIcon,
  Users,
  Shield,
  MoreVertical,
  Plus,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Command,
  AtSign,
  X,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole } from '@/lib/formatters';
import { ChatRichCard } from '@/types';

interface SlashCommand {
  cmd: string;
  label: string;
  description: string;
  icon: any;
  templateBody: string;
  richCard: ChatRichCard;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    cmd: '/baocao',
    label: '/baocao',
    description: 'Gửi thẻ báo cáo tiến độ tuần & đánh giá KPI BTV',
    icon: BarChart3,
    templateBody: '[BÁO CÁO NHANH] Tiến độ tuần 39/2026: Đã hoàn thành 18/24 việc (75%). Các công tác chuẩn bị Khai giảng năm học mới đã sẵn sàng.',
    richCard: {
      title: 'Báo cáo Tiến độ Tuần 39 / Tháng 9',
      description: 'Hoàn thành 75% chỉ tiêu tuần. 6 việc đang thực hiện, 0 việc quá hạn.',
      type: 'progress_report',
      badge: 'Tuần 39 / 2026',
      primary_action_label: 'Xem bảng Báo cáo KPI',
      primary_action_route: 'bao_cao',
    },
  },
  {
    cmd: '/giaoviec',
    label: '/giaoviec',
    description: 'Phân công nhiệm vụ khẩn cấp cho thành viên BTV',
    icon: CheckCircle2,
    templateBody: '[PHÂN CÔNG GẤP] Nhờ các đồng chí rà soát danh sách đại biểu dự Khai giảng năm học mới.',
    richCard: {
      title: 'Nhiệm vụ Khẩn cấp: Rà soát đại biểu',
      description: 'Đề nghị Văn phòng Đoàn phối hợp Ban Phong trào hoàn tất trước 17:00 ngày mai.',
      type: 'task_assign',
      badge: 'Khẩn cấp',
      primary_action_label: 'Mở tạo việc chi tiết',
      primary_action_route: 'cong_viec',
    },
  },
  {
    cmd: '/tiendo',
    label: '/tiendo',
    description: 'Cập nhật % tiến độ các chiến dịch và mảng việc lớn',
    icon: Sparkles,
    templateBody: '[CẬP NHẬT TIẾN ĐỘ] Kế hoạch Chiến dịch Mùa hè Xanh 2026 đã hoàn thành tổng duyệt!',
    richCard: {
      title: 'Tiến độ: Chiến dịch Mùa hè Xanh 2026',
      description: 'Đạt 100% hồ sơ nghiệm thu từ 15 Đoàn cơ sở và các đội hình chuyên.',
      type: 'progress_report',
      badge: '100% Hoàn thành',
      primary_action_label: 'Xem danh sách việc',
      primary_action_route: 'cong_viec',
    },
  },
  {
    cmd: '/vanban',
    label: '/vanban',
    description: 'Thông báo & liên kết công văn đến quan trọng từ cấp trên',
    icon: FileText,
    templateBody: '[VĂN BẢN MỚI] Thành Đoàn TP.HCM vừa gửi Công văn số 262-TB/TDTN về Đại hội Đoàn các cấp.',
    richCard: {
      title: 'Công văn 262-TB/TDTN: Thông báo Đại hội',
      description: 'Đơn vị gửi: Thành Đoàn TP. Hồ Chí Minh. Thời hạn xử lý: 25/09/2026.',
      type: 'doc_alert',
      badge: 'Văn bản đến',
      primary_action_label: 'Mở Sổ Văn bản đến',
      primary_action_route: 'van_ban_den',
    },
  },
  {
    cmd: '/dondoc',
    label: '/dondoc',
    description: 'Gửi thông điệp đôn đốc hạn chót hoàn thành nhiệm vụ',
    icon: AlertCircle,
    templateBody: '[ĐÔN ĐỐC TIẾN ĐỘ] Đề nghị các đồng chí phụ trách các mảng nhanh chóng hoàn tất báo cáo tuần!',
    richCard: {
      title: 'Đôn đốc BTV: Khẩn trương nộp kết quả',
      description: 'Nhắc nhở tự động từ Thường trực Đoàn trường gửi tất cả các đ/c BTV.',
      type: 'urgent_ping',
      badge: 'Nhắc việc',
      primary_action_label: 'Xem Việc của tôi',
      primary_action_route: 'viec_cua_toi',
    },
  },
];

const playMentionChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio restrictions
  }
};

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'direct';
  memberCount?: number;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
  avatar?: string;
  memberId?: string;
  online?: boolean;
}

export default function ChatView() {
  const { chatMessages, sendChatMessage, currentMember, members, setActiveTab } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState('btv-chung');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMsgCountRef = useRef(chatMessages.length);

  // State cho Autocomplete @mentions và /slash commands
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [activeMentions, setActiveMentions] = useState<string[]>([]);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [pendingRichCard, setPendingRichCard] = useState<ChatRichCard | null>(null);

  // Lưu trữ tương tác reaction emoji cho từng tin nhắn
  const [messageReactions, setMessageReactions] = useState<
    Record<string, { emoji: string; count: number; reactedByMe: boolean }[]>
  >({
    'init-1': [
      { emoji: '👍', count: 3, reactedByMe: true },
      { emoji: '❤️', count: 2, reactedByMe: false },
    ],
  });

  // Bộ lọc cho @mentions và /slash commands
  const filteredMentionMembers = members.filter((m) => {
    if (!mentionQuery) return true;
    return (
      m.full_name.toLowerCase().includes(mentionQuery) ||
      m.role.toLowerCase().includes(mentionQuery)
    );
  });

  const filteredSlashCommands = SLASH_COMMANDS.filter((cmd) => {
    if (!slashQuery) return true;
    return (
      cmd.cmd.toLowerCase().includes(slashQuery) ||
      cmd.label.toLowerCase().includes(slashQuery) ||
      cmd.description.toLowerCase().includes(slashQuery)
    );
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Kích hoạt rung Haptic & âm thanh Chime khi có tin nhắn nhắc đến mình
  useEffect(() => {
    if (chatMessages.length > prevMsgCountRef.current) {
      const latest = chatMessages[chatMessages.length - 1];
      if (latest && latest.member_id !== currentMember.id) {
        const isMentioned =
          latest.mentions?.includes(currentMember.id) ||
          latest.body.toLowerCase().includes(`@${currentMember.full_name.toLowerCase()}`);
        if (isMentioned) {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([150, 100, 150]);
          }
          playMentionChime();
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const sender = members.find((m) => m.id === latest.member_id);
            new Notification(`Đ/c ${sender?.full_name || 'BTV'} đã nhắc đến bạn`, {
              body: latest.body,
              icon: '/icon-192.png',
            });
          }
        }
      }
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages, currentMember, members]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    if (val.startsWith('/')) {
      setSlashQuery(val.slice(1).toLowerCase());
      setMentionQuery(null);
      setSlashSelectedIndex(0);
    } else {
      setSlashQuery(null);
      const lastAtIdx = val.lastIndexOf('@');
      if (lastAtIdx !== -1) {
        const query = val.slice(lastAtIdx + 1);
        if (!query.includes(' ')) {
          setMentionQuery(query.toLowerCase());
          setMentionSelectedIndex(0);
          return;
        }
      }
      setMentionQuery(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && filteredMentionMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((prev) => (prev + 1) % filteredMentionMembers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((prev) => (prev - 1 + filteredMentionMembers.length) % filteredMentionMembers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMention(filteredMentionMembers[mentionSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (slashQuery !== null && filteredSlashCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectSlashCommand(filteredSlashCommands[slashSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashQuery(null);
        return;
      }
    }
  };

  const selectMention = (member: any) => {
    const lastAtIdx = inputMessage.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const before = inputMessage.slice(0, lastAtIdx);
      setInputMessage(`${before}@${member.full_name} `);
      if (!activeMentions.includes(member.id)) {
        setActiveMentions([...activeMentions, member.id]);
      }
    }
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const selectSlashCommand = (cmd: SlashCommand) => {
    setInputMessage(cmd.templateBody);
    setPendingRichCard(cmd.richCard);
    setSlashQuery(null);
    inputRef.current?.focus();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const finalMentions = members
      .filter((m) => inputMessage.toLowerCase().includes(`@${m.full_name.toLowerCase()}`))
      .map((m) => m.id);

    sendChatMessage(
      inputMessage,
      undefined,
      finalMentions.length > 0 ? finalMentions : undefined,
      pendingRichCard || undefined
    );

    setInputMessage('');
    setPendingRichCard(null);
    setActiveMentions([]);
    setMentionQuery(null);
    setSlashQuery(null);
  };

  const renderMessageBody = (text: string) => {
    const parts = text.split(/(@[A-Za-zÀ-ỹ\s]+?)(?=[,\.\s]|$)/);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            const mentionedName = part.slice(1).trim();
            const isMember = members.some((m) =>
              m.full_name.toLowerCase().includes(mentionedName.toLowerCase())
            );
            if (isMember) {
              return (
                <span
                  key={i}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0B5CFF]/15 text-[#0B5CFF] dark:text-blue-300 mx-0.5 shadow-2xs"
                >
                  @{mentionedName}
                </span>
              );
            }
          }
          return part;
        })}
      </span>
    );
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessageReactions((prev) => {
      const currentList = prev[msgId] || [];
      const existing = currentList.find((r) => r.emoji === emoji);

      let updatedList;
      if (existing) {
        if (existing.reactedByMe) {
          updatedList = currentList
            .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reactedByMe: false } : r))
            .filter((r) => r.count > 0);
        } else {
          updatedList = currentList.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r
          );
        }
      } else {
        updatedList = [...currentList, { emoji, count: 1, reactedByMe: true }];
      }

      return { ...prev, [msgId]: updatedList };
    });
  };

  // Danh mục kênh chat theo thiết kế 10-internal-chat.png
  const channels: Channel[] = [
    {
      id: 'btv-chung',
      name: 'Ban Thường vụ (Chung)',
      type: 'channel',
      memberCount: members.length,
      lastMessage: 'Đã hoàn thành duyệt maket sân khấu!',
      lastTime: '10:45',
      unreadCount: 0,
    },
    {
      id: 'thuong-truc',
      name: 'Thường trực Đoàn trường',
      type: 'channel',
      memberCount: 3,
      lastMessage: 'Đ/c xem lại tờ trình kinh phí.',
      lastTime: '09:15',
      unreadCount: 2,
    },
    {
      id: 'doan-khoa',
      name: 'Đoàn – Hội các Khoa',
      type: 'channel',
      memberCount: 24,
      lastMessage: 'Đoàn khoa CNTT đã nộp báo cáo.',
      lastTime: 'Hôm qua',
      unreadCount: 0,
    },
  ];

  // Danh sách hội thoại trực tiếp với các thành viên BTV
  const directChats: Channel[] = members
    .filter((m) => m.id !== currentMember.id)
    .map((m) => ({
      id: `dm-${m.id}`,
      name: m.full_name,
      type: 'direct',
      avatar: m.avatar_url,
      memberId: m.id,
      online: true,
      lastMessage:
        m.role === 'bi_thu'
          ? 'Đã duyệt đề xuất chiến dịch.'
          : m.role === 'chanh_van_phong'
          ? 'Hồ sơ văn bản đã gửi sang VP.'
          : 'Đang triển khai theo kế hoạch.',
      lastTime: '08:30',
    }));

  const allChats = [...channels, ...directChats];
  const filteredChats = allChats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat = allChats.find((c) => c.id === activeChatId) || channels[0];

  return (
    <div className="chat-layout flex bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
      {/* CỘT TRÁI: DANH SÁCH CUỘC TRÒ CHUYỆN (WIDTH 300px trên desktop) */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-64 xl:w-72 border-r border-border flex-col bg-muted/20 shrink-0`}>
        {/* Tìm kiếm cuộc trò chuyện */}
        <div className="p-3.5 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0B5CFF]" />
              Kênh trao đổi BTV
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
              {members.length} thành viên
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tin nhắn, thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card text-xs pl-8 pr-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-[#0B5CFF] text-foreground transition-all"
            />
          </div>
        </div>

        {/* Danh sách kênh & Direct Messages */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 scrollbar-thin">
          {/* Nhóm Kênh chung */}
          <div className="py-2">
            <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Kênh thảo luận
            </div>
            {filteredChats
              .filter((c) => c.type === 'channel')
              .map((c) => {
                const isActive = c.id === activeChatId;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setActiveChatId(c.id); setShowMobileChat(true); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-[#EBF2FF] dark:bg-blue-950/40 border-l-4 border-l-[#0B5CFF]'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive
                          ? 'bg-[#0B5CFF] text-white shadow-xs'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      #
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-[#0B5CFF]' : 'text-foreground'
                          }`}
                        >
                          {c.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-1">
                          {c.lastTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    </div>

                    {c.unreadCount ? (
                      <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
          </div>

          {/* Nhóm Trò chuyện trực tiếp */}
          <div className="py-2">
            <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Thành viên BTV
            </div>
            {filteredChats
              .filter((c) => c.type === 'direct')
              .map((c) => {
                const isActive = c.id === activeChatId;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setActiveChatId(c.id); setShowMobileChat(true); }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-[#EBF2FF] dark:bg-blue-950/40 border-l-4 border-l-[#0B5CFF]'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <AvatarWithFallback
                        src={c.avatar}
                        name={c.name}
                        className="w-9 h-9 rounded-full ring-1 ring-border"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-card absolute bottom-0 right-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-[#0B5CFF]' : 'text-foreground'
                          }`}
                        >
                          {c.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-1">
                          {c.lastTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: KHUNG CHAT TRỰC TIẾP */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-card`}>
        {/* Header khung chat */}
        <div className="px-3 sm:px-5 py-3.5 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button aria-label="Quay lại danh sách trò chuyện" onClick={() => setShowMobileChat(false)} className="md:hidden p-2 text-primary rounded-lg hover:bg-muted"><ArrowLeft size={18} /></button>
            {activeChat.type === 'channel' ? (
              <div className="w-10 h-10 rounded-2xl bg-[#0B5CFF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                #
              </div>
            ) : (
              <AvatarWithFallback
                src={activeChat.avatar}
                name={activeChat.name}
                className="w-10 h-10 rounded-full ring-2 ring-[#0B5CFF]/20"
              />
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{activeChat.name}</h3>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {activeChat.memberCount
                  ? `${activeChat.memberCount} Thành viên • Bảo mật nội bộ Đoàn trường`
                  : 'Trực tuyến • BTV Đoàn trường HCMUTE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <button
              className="p-2 rounded-xl hover:bg-muted hover:text-foreground transition-colors"
              title="Tìm kiếm trong cuộc trò chuyện"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-xl hover:bg-muted hover:text-foreground transition-colors"
              title="Thông tin kênh"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Danh sách tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin bg-muted/10">
          <div className="text-center py-2">
            <span className="text-[10px] font-semibold text-muted-foreground bg-card px-3 py-1 rounded-full uppercase tracking-wider border border-border shadow-2xs">
              Kênh trao đổi chính thức Ban Thường vụ
            </span>
          </div>

          {chatMessages.map((msg, idx) => {
            const isMe = msg.member_id === currentMember.id;
            const sender = members.find((m) => m.id === msg.member_id) || currentMember;
            const reactions = messageReactions[msg.id] || (idx === 0 ? messageReactions['init-1'] : []);

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 max-w-xl group ${
                  isMe ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div className="shrink-0">
                  <AvatarWithFallback
                    src={sender.avatar_url}
                    name={sender.full_name}
                    className="w-8 h-8 rounded-full ring-1 ring-border mt-0.5"
                  />
                </div>

                <div className={`space-y-1 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-bold text-foreground">{sender.full_name}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : ''}
                    </span>
                  </div>

                  {/* Bubble Tin nhắn */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs relative ${
                      isMe
                        ? 'bg-[#0B5CFF] text-white rounded-tr-xs shadow-blue-500/10'
                        : 'bg-card text-foreground rounded-tl-xs border border-border/80'
                    }`}
                  >
                    <div className="font-medium whitespace-pre-wrap">{renderMessageBody(msg.body)}</div>

                    {/* Rich Card nếu có */}
                    {msg.rich_card && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-white/95 dark:bg-card/95 text-foreground border border-border/80 shadow-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0B5CFF]/10 text-[#0B5CFF] border border-[#0B5CFF]/20">
                            <Sparkles className="w-3 h-3" />
                            <span>{msg.rich_card.badge || 'Lệnh BTV'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                            {msg.rich_card.type.replace('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-foreground">{msg.rich_card.title}</h5>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {msg.rich_card.description}
                          </p>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (msg.rich_card?.primary_action_route) {
                                setActiveTab(msg.rich_card.primary_action_route as any);
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[#0B5CFF] hover:bg-[#094cd4] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center"
                          >
                            <span>{msg.rich_card.primary_action_label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reaction Pills bên dưới tin nhắn */}
                  <div className={`flex items-center gap-1.5 pt-0.5 ${isMe ? 'justify-end' : ''}`}>
                    {reactions?.map((r, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => handleToggleReaction(msg.id, r.emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${
                          r.reactedByMe
                            ? 'bg-[#EBF2FF] text-[#0B5CFF] border-[#BFDBFE]'
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span className="font-mono text-[10px]">{r.count}</span>
                      </button>
                    ))}

                    {/* Nút thêm reaction nhanh */}
                    <button
                      onClick={() => handleToggleReaction(msg.id, '👍')}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[11px] rounded-full hover:bg-muted text-muted-foreground transition-all"
                      title="Thích"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleToggleReaction(msg.id, '❤️')}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[11px] rounded-full hover:bg-muted text-muted-foreground transition-all"
                      title="Thả tim"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Khung nhập tin nhắn theo thiết kế 10-internal-chat.png */}
        <div className="shrink-0 p-3 sm:p-4 bg-card border-t border-border relative">
          {/* Autocomplete Popover @mentions */}
          {mentionQuery !== null && filteredMentionMembers.length > 0 && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-30 max-h-56 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 border-b border-border mb-1">
                <AtSign className="w-3 h-3 text-primary" />
                <span>Nhắc đến thành viên BTV (Dùng phím ↑ ↓ Enter)</span>
              </div>
              {filteredMentionMembers.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectMention(m)}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 text-xs transition-colors ${
                    idx === mentionSelectedIndex ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <AvatarWithFallback src={m.avatar_url} name={m.full_name} className="w-7 h-7 rounded-full ring-1 ring-border" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold">{m.full_name}</div>
                    <div className="text-[10px] text-muted-foreground">{formatRole(m.role)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Autocomplete Popover /slash commands */}
          {slashQuery !== null && filteredSlashCommands.length > 0 && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-30 max-h-64 overflow-y-auto p-1.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 border-b border-border mb-1">
                <Command className="w-3 h-3 text-primary" />
                <span>Lệnh Slash BTV (Dùng phím ↑ ↓ Enter)</span>
              </div>
              {filteredSlashCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.cmd}
                    type="button"
                    onClick={() => selectSlashCommand(cmd)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 text-xs transition-colors ${
                      idx === slashSelectedIndex ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="text-primary">{cmd.label}</span>
                        <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-muted text-muted-foreground border border-border">
                          Thẻ tương tác
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{cmd.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Staged Rich Card Preview */}
          {pendingRichCard && (
            <div className="mb-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-foreground">{pendingRichCard.title}</span>
                <span className="text-[11px] text-muted-foreground truncate">({pendingRichCard.description})</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingRichCard(null)}
                className="p-1 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-muted"
                title="Hủy đính kèm thẻ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {showEmojiPicker && (
            <div className="flex items-center gap-2 p-2 mb-2 bg-muted/60 rounded-xl border border-border">
              {['👍', '❤️', '🔥', '🎉', '👏', '✅', '🚀'].map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    setInputMessage((prev) => prev + em);
                    setShowEmojiPicker(false);
                  }}
                  className="text-base p-1.5 hover:scale-125 transition-transform"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title="Đính kèm tệp văn bản"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title="Gửi hình ảnh"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder={`Nhắn tin trong ${activeChat.name} (gõ @ để nhắc tên, / để ra lệnh)...`}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="flex-1 min-w-0 text-xs bg-muted/40 focus:bg-card text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-2xl border border-input outline-none focus:ring-2 focus:ring-[#0B5CFF] transition-all"
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title="Biểu tượng cảm xúc"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim() && !pendingRichCard}
              className="bg-[#0B5CFF] hover:bg-[#094cd4] disabled:opacity-40 text-white p-3 rounded-full shadow-xs active:scale-95 transition-all shrink-0"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
