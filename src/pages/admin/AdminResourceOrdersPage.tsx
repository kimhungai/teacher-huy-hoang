import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { ResourceOrder, TeachingResource } from '../../types';
import { Trash2, Mail, Phone, MapPin, Gift, CreditCard, Calendar, FileSpreadsheet } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

export const AdminResourceOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ResourceOrder[]>([]);
  const [resources, setResources] = useState<TeachingResource[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Danh Sách Đăng Ký Học Liệu — Admin CMS';
    loadData();
  }, []);

  const loadData = async () => {
    const [ordersData, resData] = await Promise.all([
      DB.getResourceOrders(),
      DB.getResources()
    ]);
    setOrders(ordersData);
    setResources(resData);
  };

  const handleUpdateStatus = async (id: string, status: ResourceOrder['status']) => {
    const updated = await DB.updateResourceOrderStatus(id, status);
    setOrders(updated);
    setToastMessage('Đã cập nhật trạng thái đơn hàng học liệu.');
  };

  const handleDelete = async () => {
    if (deletingId) {
      const updated = await DB.deleteResourceOrder(deletingId);
      setOrders(updated);
      setDeletingId(null);
      setToastMessage('Đã xóa lượt đăng ký học liệu.');
    }
  };

  const handleExportExcel = () => {
    if (orders.length === 0) {
      setToastMessage('Không có dữ liệu đơn hàng học liệu để xuất Excel.');
      return;
    }

    // CSV Headers
    const headers = [
      'STT',
      'Mã Đơn Hàng (ID)',
      'Họ và Tên Khách Hàng / Phụ Huynh',
      'Số Điện Thoại',
      'Email',
      'Địa Chỉ Giao Hàng',
      'Học Liệu Đặt Mua / Yêu Cầu',
      'Mức Giá Học Liệu (khi Đặt hàng)',
      'Mức Giá KM (khi Đặt hàng)',
      'Ngày Đăng Ký',
      'Trạng Thái Đơn Hàng',
      'Ghi Chú Yêu Cầu'
    ];

    // CSV Rows
    const rows = orders.map((o, index) => {
      const targetRes = resources.find(r => r.id === o.resourceId || r.titleVi === o.resourceTitle || r.titleEn === o.resourceTitle);
      const priceOrig = o.resourcePrice || targetRes?.priceVi || '';
      const priceDisc = o.discountPrice || '';

      let statusText: string = o.status;
      if (o.status === 'new') statusText = 'Mới đăng ký';
      if (o.status === 'confirmed') statusText = 'Đã thanh toán & Xác nhận';
      if (o.status === 'sent') statusText = 'Đã gửi file / Giao hàng';
      if (o.status === 'cancelled') statusText = 'Đã hủy';

      return [
        index + 1,
        `"${o.id}"`,
        `"${(o.fullName || '').replace(/"/g, '""')}"`,
        `"${(o.phone || '').replace(/"/g, '""')}"`,
        `"${(o.email || '').replace(/"/g, '""')}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${(o.resourceTitle || '').replace(/"/g, '""')}"`,
        `"${priceOrig.replace(/"/g, '""')}"`,
        `"${priceDisc.replace(/"/g, '""')}"`,
        `"${(o.createdAt || '').replace(/"/g, '""')}"`,
        `"${statusText}"`,
        `"${(o.note || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Danh_Sach_Don_Hang_Hoc_Lieu_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('Đã xuất toàn bộ danh sách đơn hàng học liệu sang file Excel thành công!');
  };

  const getStatusBadge = (status: ResourceOrder['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="amber">Mới đăng ký</Badge>;
      case 'confirmed':
        return <Badge variant="sky">Đã thanh toán & Xác nhận</Badge>;
      case 'sent':
        return <Badge variant="emerald">Đã gửi file / Giao hàng</Badge>;
      case 'cancelled':
        return <Badge variant="slate">Đã hủy</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh Sách Đăng Ký / Đặt Mua Học Liệu</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý thông tin đăng ký nhận sách, phần mềm, file số và dụng cụ học tập của học viên.
          </p>
        </div>
        {/* NÚT XUẤT BẢNG SANG EXCEL (TẠI MŨI TÊN CHỈ ĐỊNH) */}
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all shrink-0"
          title="Xuất danh sách đăng ký học liệu ra tập tin Excel (CSV)"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất bảng sang Excel</span>
        </button>
      </div>

      {/* Sales & Revenue Stats Banner (Requirement 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Tổng Đơn Hàng Học Liệu</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{orders.length} đơn hàng</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Đã Thanh Toán / Đã Giao</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {orders.filter(o => o.status === 'confirmed' || o.status === 'sent').length} đơn hàng
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/30 shadow-sm space-y-1">
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <span>💰</span>
            <span>Tổng Doanh Số Bán Học Liệu</span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {(() => {
              const totalVnd = orders
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, o) => {
                  const targetRes = resources.find(r => r.id === o.resourceId || r.titleVi === o.resourceTitle || r.titleEn === o.resourceTitle);

                  // Công thức (Requirement 9):
                  // Nếu đơn hàng có Giá KM lưu tại ngày đăng ký -> Lấy Giá KM.
                  // Nếu đơn hàng KHÔNG có Giá KM -> Lấy Giá thông thường (o.resourcePrice hoặc targetRes.priceVi).
                  const effectivePriceStr = (o.discountPrice && o.discountPrice.trim() !== '')
                    ? o.discountPrice
                    : (o.resourcePrice && o.resourcePrice.trim() !== '')
                      ? o.resourcePrice
                      : (targetRes?.priceVi || targetRes?.priceEn || '');

                  const num = parseInt(effectivePriceStr.replace(/[^0-9]/g, ''), 10) || 0;
                  return sum + num;
                }, 0);

              return totalVnd > 0 ? `${totalVnd.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
            })()}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Khách Hàng / Học Viên</th>
                <th className="px-4 py-3">Học Liệu Yêu Cầu</th>
                <th className="px-4 py-3">Mức Giá / Học Liệu</th>
                <th className="px-4 py-3 text-rose-600 dark:text-rose-400">Mức Giá KM / Học liệu</th>
                <th className="px-4 py-3 text-sky-600 dark:text-sky-400">Ngày Đăng Ký</th>
                <th className="px-4 py-3">Liên Hệ & Địa Chỉ</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Chưa có lượt đăng ký / đặt mua học liệu nào.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const targetRes = resources.find(r => r.id === o.resourceId || r.titleVi === o.resourceTitle || r.titleEn === o.resourceTitle);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{o.fullName}</div>
                        {o.note && (
                          <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5 italic">
                            " {o.note} "
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {o.resourceTitle}
                      </td>
                      {/* Cột Mức Giá / Học Liệu (Giá thông thường lưu tại thời điểm đăng ký) */}
                      <td className="px-4 py-3">
                        {o.resourcePrice ? (
                          o.resourcePrice.includes('Miễn phí') || o.resourcePrice.includes('Free') ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[11px]">
                              <Gift className="w-3 h-3" /> {o.resourcePrice}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold text-[11px]">
                              <CreditCard className="w-3 h-3" /> {o.resourcePrice}
                            </span>
                          )
                        ) : targetRes ? (
                          targetRes.priceType === 'free' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[11px]">
                              <Gift className="w-3 h-3" /> Miễn phí
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold text-[11px]">
                              <CreditCard className="w-3 h-3" /> {targetRes.priceVi}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[11px]">
                            <Gift className="w-3 h-3" /> Miễn phí
                          </span>
                        )}
                      </td>
                      {/* Cột Mức Giá KM / Học liệu (Arrow 7 - Giá KM lưu đúng tại ngày đăng ký) */}
                      <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                        {o.discountPrice && o.discountPrice.trim() !== '' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20">
                            🔥 {o.discountPrice}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                      {/* Cột Ngày Đăng Ký (Arrow 8) */}
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{o.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <a href={`tel:${o.phone}`} className="hover:underline">{o.phone}</a>
                        </div>
                        {o.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{o.email}</span>
                          </div>
                        )}
                        {o.address && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{o.address}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(o.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value as ResourceOrder['status'])}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white cursor-pointer"
                          >
                            <option value="new">Mới đăng ký</option>
                            <option value="confirmed">Đã thanh toán & Xác nhận</option>
                            <option value="sent">Đã gửi file / Giao hàng</option>
                            <option value="cancelled">Hủy đơn</option>
                          </select>
                          <button
                            onClick={() => setDeletingId(o.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Xóa Đăng Ký Học Liệu"
        message="Bạn có chắc muốn xóa lượt đăng ký này không?"
      />
    </div>
  );
};
