import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { CourseRegistration, Course } from '../../types';
import { Trash2, Mail, Phone, Gift, CreditCard, Calendar, FileSpreadsheet } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

export const AdminCourseRegsPage: React.FC = () => {
  const [regs, setRegs] = useState<CourseRegistration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Danh Sách Học Viên Đăng Ký — Admin CMS';
    loadData();
  }, []);

  const loadData = async () => {
    const [regsData, coursesData] = await Promise.all([
      DB.getCourseRegistrations(),
      DB.getCourses()
    ]);
    setRegs(regsData);
    setCourses(coursesData);
  };

  const handleUpdateStatus = async (id: string, status: CourseRegistration['status']) => {
    const updated = await DB.updateCourseRegistrationStatus(id, status);
    setRegs(updated);
    setToastMessage('Đã cập nhật trạng thái học viên.');
  };

  const handleDelete = async () => {
    if (deletingId) {
      const updated = await DB.deleteCourseRegistration(deletingId);
      setRegs(updated);
      setDeletingId(null);
      setToastMessage('Đã xóa thông tin đăng ký.');
    }
  };

  const handleExportExcel = () => {
    if (regs.length === 0) {
      setToastMessage('Không có dữ liệu học viên đăng ký để xuất Excel.');
      return;
    }

    // CSV Headers
    const headers = [
      'STT',
      'Mã Đăng Ký (ID)',
      'Họ và Tên Học Viên / Phụ Huynh',
      'Số Điện Thoại',
      'Email',
      'Khối Lớp / Độ Tuổi',
      'Khóa Học Đăng Ký',
      'Mức Học Phí Gốc (khi Đăng ký)',
      'Mức Học Phí KM (khi Đăng ký)',
      'Ngày Đăng Ký',
      'Trạng Thái',
      'Ghi Chú Phụ Huynh'
    ];

    // CSV Rows
    const rows = regs.map((r, index) => {
      const targetCourse = courses.find(c => c.id === r.courseId || c.titleVi === r.courseTitle || c.titleEn === r.courseTitle);
      const priceOrig = r.coursePrice || targetCourse?.priceVi || targetCourse?.priceEn || '';
      const priceDisc = (r.discountPrice && r.discountPrice.trim() !== '') ? r.discountPrice : (targetCourse?.discountPriceVi || targetCourse?.discountPriceEn || '');

      let statusText: string = r.status;
      if (r.status === 'new') statusText = 'Mới đăng ký';
      if (r.status === 'confirmed') statusText = 'Đã tư vấn (Chờ học phí)';
      if (r.status === 'enrolled') statusText = 'Đã thanh toán & Nhập học';
      if (r.status === 'cancelled') statusText = 'Đã hủy';

      return [
        index + 1,
        `"${r.id}"`,
        `"${(r.fullName || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.gradeLevel || '').replace(/"/g, '""')}"`,
        `"${(r.courseTitle || '').replace(/"/g, '""')}"`,
        `"${priceOrig.replace(/"/g, '""')}"`,
        `"${priceDisc.replace(/"/g, '""')}"`,
        `"${(r.createdAt || '').replace(/"/g, '""')}"`,
        `"${statusText}"`,
        `"${(r.note || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Danh_Sach_Hoc_Vien_Dang_Ky_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('Đã xuất toàn bộ danh sách học viên đăng ký sang file Excel thành công!');
  };

  const getStatusBadge = (status: CourseRegistration['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="amber">Mới đăng ký</Badge>;
      case 'confirmed':
        return <Badge variant="sky">Đã tư vấn (Chờ học phí)</Badge>;
      case 'enrolled':
        return <Badge variant="emerald">Đã thanh toán & Nhập học</Badge>;
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh Sách Học Viên Đăng Ký Khóa Học</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi, liên hệ và quản lý trạng thái tư vấn/nhập học của học sinh và phụ huynh.
          </p>
        </div>
        {/* NÚT XUẤT BẢNG SANG EXCEL (TẠI MŨI TÊN CHỈ ĐỊNH) */}
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all shrink-0"
          title="Xuất danh sách học viên đăng ký ra tập tin Excel (CSV)"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất bảng sang Excel</span>
        </button>
      </div>

      {/* Sales & Revenue Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Tổng Lượt Đăng Ký</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{regs.length} học viên</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Đã Tư Vấn & Nhập Học</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {regs.filter(r => r.status === 'confirmed' || r.status === 'enrolled').length} học viên
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/30 shadow-sm space-y-1">
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <span>💰</span>
            <span>Tổng Doanh Số Bán Hàng</span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {(() => {
              const totalVnd = regs
                .filter(r => r.status !== 'cancelled')
                .reduce((sum, r) => {
                  const targetCourse = courses.find(c => c.id === r.courseId || c.titleVi === r.courseTitle || c.titleEn === r.courseTitle);
                  const priceOrig = r.coursePrice || targetCourse?.priceVi || targetCourse?.priceEn || '';
                  const priceDisc = (r.discountPrice && r.discountPrice.trim() !== '') ? r.discountPrice : (targetCourse?.discountPriceVi || targetCourse?.discountPriceEn || '');

                  const effectivePriceStr = (priceDisc && priceDisc.trim() !== '')
                    ? priceDisc
                    : priceOrig;

                  const num = parseInt(effectivePriceStr.replace(/[^0-9]/g, ''), 10) || 0;
                  return sum + num;
                }, 0);

              return totalVnd > 0 ? `${totalVnd.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
            })()}
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Học Viên / Phụ Huynh</th>
                <th className="px-4 py-3">Khóa Học Đăng Ký</th>
                <th className="px-4 py-3">Mức Giá / Khóa Học</th>
                <th className="px-4 py-3 text-rose-600 dark:text-rose-400">Mức Giá KM / Khóa Học</th>
                <th className="px-4 py-3 text-sky-600 dark:text-sky-400">Ngày Đăng Ký</th>
                <th className="px-4 py-3">Liên Hệ</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {regs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Chưa có lượt đăng ký khóa học nào.
                  </td>
                </tr>
              ) : (
                regs.map((r) => {
                  const targetCourse = courses.find(c => c.id === r.courseId || c.titleVi === r.courseTitle || c.titleEn === r.courseTitle);
                  const priceOrig = r.coursePrice || targetCourse?.priceVi || targetCourse?.priceEn || '';
                  const priceDisc = (r.discountPrice && r.discountPrice.trim() !== '') ? r.discountPrice : (targetCourse?.discountPriceVi || targetCourse?.discountPriceEn || '');

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{r.fullName}</div>
                        <div className="text-[11px] text-slate-400">{r.gradeLevel}</div>
                        {r.note && (
                          <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5 italic">
                            " {r.note} "
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {r.courseTitle}
                      </td>
                      {/* Cột Mức Giá / Khóa Học */}
                      <td className="px-4 py-3">
                        {priceOrig ? (
                          priceOrig.includes('Miễn phí') || priceOrig.includes('Free') ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[11px]">
                              <Gift className="w-3 h-3" /> {priceOrig}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold text-[11px]">
                              <CreditCard className="w-3 h-3" /> {priceOrig}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[11px]">
                            <Gift className="w-3 h-3" /> Miễn phí (Free)
                          </span>
                        )}
                      </td>
                      {/* Cột Mức Giá KM / Khóa Học */}
                      <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                        {priceDisc && priceDisc.trim() !== '' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20">
                            🔥 {priceDisc}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                      {/* Cột Ngày Đăng Ký */}
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{r.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <a href={`tel:${r.phone}`} className="hover:underline">{r.phone}</a>
                        </div>
                        {r.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{r.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={r.status}
                            onChange={(e) => handleUpdateStatus(r.id, e.target.value as CourseRegistration['status'])}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white cursor-pointer"
                          >
                            <option value="new">Mới đăng ký</option>
                            <option value="confirmed">Đã tư vấn (Chờ học phí)</option>
                            <option value="enrolled">Đã thanh toán & Nhập học</option>
                            <option value="cancelled">Hủy đăng ký</option>
                          </select>
                          <button
                            onClick={() => setDeletingId(r.id)}
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
        title="Xóa Đăng Ký"
        message="Bạn có chắc muốn xóa lượt đăng ký này không?"
      />
    </div>
  );
};
