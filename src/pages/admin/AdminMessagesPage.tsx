import React, { useEffect, useState, useMemo } from 'react';
import { DB } from '../../services/db';
import type { ContactMessage } from '../../types';
import {
  Search,
  Star,
  Mail,
  Phone,
  Archive,
  Trash2,
  CheckSquare,
  Square,
  Inbox,
  CheckCircle2,
  Send,
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

type FilterTab = 'all' | 'new' | 'starred' | 'read' | 'replied' | 'archived';

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Hộp thư Liên hệ — Admin CMS';
    loadData();
  }, []);

  const loadData = async () => {
    const data = await DB.getContactMessages();
    setMessages(data);
    if (data.length > 0 && !selectedMsgId) {
      setSelectedMsgId(data[0].id);
    }
  };

  // Currently viewed message detail
  const currentMsg = useMemo(() => {
    return messages.find(m => m.id === selectedMsgId) || null;
  }, [messages, selectedMsgId]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: messages.length,
      unread: messages.filter(m => m.status === 'new').length,
      starred: messages.filter(m => m.isStarred).length,
      replied: messages.filter(m => m.status === 'replied').length,
      archived: messages.filter(m => m.status === 'archived').length,
    };
  }, [messages]);

  // Filtered & Searched Messages
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Tab filter
      if (activeTab === 'new' && m.status !== 'new') return false;
      if (activeTab === 'starred' && !m.isStarred) return false;
      if (activeTab === 'read' && m.status !== 'read') return false;
      if (activeTab === 'replied' && m.status !== 'replied') return false;
      if (activeTab === 'archived' && m.status !== 'archived') return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = m.fullName.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        const matchPhone = m.phone ? m.phone.toLowerCase().includes(q) : false;
        const matchSubject = m.subject.toLowerCase().includes(q);
        const matchContent = m.message.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchSubject || matchContent;
      }

      return true;
    });
  }, [messages, activeTab, searchQuery]);

  // Toggle selection for bulk actions
  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map(m => m.id));
    }
  };

  // Single Message Actions
  const handleSelectMsg = async (msg: ContactMessage) => {
    setSelectedMsgId(msg.id);
    setReplyInput(msg.replyNote || '');
    // Automatically mark as read if it's new
    if (msg.status === 'new') {
      const updated = await DB.updateMessageStatus(msg.id, 'read');
      setMessages(updated);
    }
  };

  const handleToggleStar = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = await DB.toggleStarMessage(id);
    setMessages(updated);
    setToast({ msg: 'Đã cập nhật trạng thái Đánh dấu Quan trọng.', type: 'success' });
  };

  const handleUpdateStatus = async (id: string, status: ContactMessage['status']) => {
    const updated = await DB.updateMessageStatus(id, status);
    setMessages(updated);
    setToast({ msg: `Đã chuyển trạng thái thư sang "${status}".`, type: 'success' });
  };

  const handleSendReply = async () => {
    if (!currentMsg) return;
    const note = replyInput.trim() || 'Đã gửi phản hồi qua Email.';
    const updated = await DB.replyToMessage(currentMsg.id, note);
    setMessages(updated);

    // Open mailto link
    const mailtoUrl = `mailto:${currentMsg.email}?subject=Re: ${encodeURIComponent(currentMsg.subject)}&body=${encodeURIComponent('\n\n---\nPhản hồi từ Thầy Nguyễn Trọng Huy Hoàng:\n' + replyInput)}`;
    window.open(mailtoUrl, '_blank');

    setToast({ msg: 'Đã lưu phản hồi & mở ứng dụng gửi Email!', type: 'success' });
  };

  const handleDeleteSingle = async () => {
    if (deleteId) {
      const updated = await DB.deleteMessage(deleteId);
      setMessages(updated);
      if (selectedMsgId === deleteId) {
        const remaining = updated.filter(m => m.id !== deleteId);
        setSelectedMsgId(remaining.length > 0 ? remaining[0].id : null);
      }
      setDeleteId(null);
      setToast({ msg: 'Đã xóa thư khỏi hộp thư.', type: 'success' });
    }
  };

  // Bulk Actions
  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return;
    const updated = await DB.bulkUpdateMessageStatus(selectedIds, 'read');
    setMessages(updated);
    setSelectedIds([]);
    setToast({ msg: `Đã đánh dấu ${selectedIds.length} thư là Đã đọc.`, type: 'success' });
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    const updated = await DB.bulkUpdateMessageStatus(selectedIds, 'archived');
    setMessages(updated);
    setSelectedIds([]);
    setToast({ msg: `Đã chuyển ${selectedIds.length} thư vào Lưu trữ.`, type: 'success' });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    const updated = await DB.bulkDeleteMessages(selectedIds);
    setMessages(updated);
    setSelectedIds([]);
    setIsBulkDeleting(false);
    if (selectedIds.includes(selectedMsgId || '')) {
      setSelectedMsgId(updated.length > 0 ? updated[0].id : null);
    }
    setToast({ msg: `Đã xóa ${selectedIds.length} thư đã chọn.`, type: 'success' });
  };

  const getStatusBadge = (status: ContactMessage['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="sky">📬 Mới</Badge>;
      case 'read':
        return <Badge variant="slate">✉️ Đã đọc</Badge>;
      case 'replied':
        return <Badge variant="emerald">✅ Đã trả lời</Badge>;
      case 'archived':
        return <Badge variant="amber">📥 Lưu trữ</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-sky-500" />
            <span>Hộp Thư Liên Hệ</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống quản lý, lưu trữ & xử lý thông điệp từ học viên, phụ huynh và đối tác gửi tới thầy Huy Hoàng.
          </p>
        </div>
      </div>

      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
            activeTab === 'all'
              ? 'bg-sky-500/10 border-sky-500/40 ring-2 ring-sky-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Tất Cả Thư</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setActiveTab('new')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
            activeTab === 'new'
              ? 'bg-sky-500/10 border-sky-500/40 ring-2 ring-sky-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>Chưa Đọc (Mới)</span>
          </div>
          <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">{stats.unread}</div>
        </div>

        <div
          onClick={() => setActiveTab('starred')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
            activeTab === 'starred'
              ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Quan Trọng</span>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.starred}</div>
        </div>

        <div
          onClick={() => setActiveTab('replied')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
            activeTab === 'replied'
              ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã Trả Lời</span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.replied}</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo Tên, Email, SĐT, Chủ đề hoặc Nội dung tin nhắn..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'new', label: `Chưa đọc (${stats.unread})` },
              { id: 'starred', label: `⭐ Quan trọng (${stats.starred})` },
              { id: 'read', label: 'Đã đọc' },
              { id: 'replied', label: 'Đã trả lời' },
              { id: 'archived', label: 'Lưu trữ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Bar (Visible when item checked) */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-sky-50/50 dark:bg-sky-950/30 p-3 rounded-xl">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
              Đã chọn {selectedIds.length} thư
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkRead}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-sm"
              >
                Đánh dấu đã đọc
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Archive className="w-3.5 h-3.5" /> Chuyển Lưu trữ
              </button>
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa các thư chọn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Email List (5/12 grid) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
          {/* Header check all */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-slate-400 hover:text-sky-600 cursor-pointer"
                title="Chọn tất cả"
              >
                {selectedIds.length > 0 && selectedIds.length === filteredMessages.length ? (
                  <CheckSquare className="w-4 h-4 text-sky-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <span>Danh sách thư ({filteredMessages.length})</span>
            </div>
            <button
              onClick={loadData}
              className="text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
              title="Làm mới danh sách"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[650px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <Inbox className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Không tìm thấy thư liên hệ nào.</p>
              </div>
            ) : (
              filteredMessages.map((m) => {
                const isSelected = selectedMsgId === m.id;
                const isChecked = selectedIds.includes(m.id);

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMsg(m)}
                    className={`p-4 transition-all cursor-pointer relative group flex items-start gap-3 ${
                      isSelected
                        ? 'bg-sky-500/10 border-l-4 border-l-sky-500 dark:bg-sky-950/40'
                        : m.status === 'new'
                        ? 'bg-sky-500/5 dark:bg-sky-950/10 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => toggleSelectOne(m.id, e)}
                      className="mt-0.5 text-slate-400 hover:text-sky-600 shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Star */}
                    <button
                      onClick={(e) => handleToggleStar(m.id, e)}
                      className="mt-0.5 shrink-0"
                      title={m.isStarred ? 'Bỏ đánh dấu quan trọng' : 'Đánh dấu quan trọng'}
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          m.isStarred
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${m.status === 'new' ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                          {m.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{m.createdAt}</span>
                      </div>

                      <div className={`text-xs truncate ${m.status === 'new' ? 'font-bold text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {m.subject}
                      </div>

                      <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                        {m.message}
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        {getStatusBadge(m.status)}
                        {m.status === 'new' && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Workbench & Detail Reading Panel (7/12 grid) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {!currentMsg ? (
            <div className="py-20 text-center space-y-3 text-slate-400">
              <Mail className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Chọn một thư để xem nội dung chi tiết
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                Bấm vào danh sách tin nhắn bên trái để đọc thông điệp, phản hồi Email hoặc thực hiện thao tác lưu trữ.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Detail Header & Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {currentMsg.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                      {currentMsg.fullName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs mt-0.5">
                      <a href={`mailto:${currentMsg.email}`} className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium">
                        <Mail className="w-3.5 h-3.5" /> {currentMsg.email}
                      </a>
                      {currentMsg.phone && (
                        <a href={`tel:${currentMsg.phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5" /> {currentMsg.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStar(currentMsg.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    title={currentMsg.isStarred ? 'Bỏ đánh dấu quan trọng' : 'Đánh dấu quan trọng'}
                  >
                    <Star className={`w-4 h-4 ${currentMsg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(currentMsg.id, currentMsg.status === 'archived' ? 'read' : 'archived')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    title={currentMsg.status === 'archived' ? 'Khôi phục từ lưu trữ' : 'Chuyển vào lưu trữ'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteId(currentMsg.id)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                    title="Xóa thư"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject & Meta info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {currentMsg.subject}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {currentMsg.createdAt}
                    </span>
                    {getStatusBadge(currentMsg.status)}
                  </div>
                </div>
              </div>

              {/* Message Content Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nội dung thư:</div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                  "{currentMsg.message}"
                </p>
              </div>

              {/* Previous Response Note (If replied) */}
              {currentMsg.replyNote && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lịch sử tác nghiệp & phản hồi:</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{currentMsg.replyNote}"
                  </p>
                </div>
              )}

              {/* Quick Reply & Operation Workspace */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>Tác nghiệp Phản hồi Email</span>
                  </h4>
                  {currentMsg.phone && (
                    <a
                      href={`tel:${currentMsg.phone}`}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Gọi điện: {currentMsg.phone}
                    </a>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={`Soạn nội dung trả lời tới ${currentMsg.fullName}...`}
                  className="w-full p-3.5 rounded-2xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(currentMsg.id, 'replied')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      Đánh dấu Đã trả lời
                    </button>
                    {currentMsg.status !== 'read' && (
                      <button
                        onClick={() => handleUpdateStatus(currentMsg.id, 'read')}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                      >
                        Đánh dấu Đã đọc
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleSendReply}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Mở Email & Gửi Phản Hồi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Single Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSingle}
        title="Xóa Thư Liên Hệ"
        message="Bạn có chắc chắn muốn xóa thư này khỏi hệ thống không?"
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleting}
        onClose={() => setIsBulkDeleting(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Xóa Hàng Loạt Thư"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} thư đã chọn không? Action này không thể hoàn tác.`}
      />
    </div>
  );
};
