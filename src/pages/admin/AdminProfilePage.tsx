import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { Profile, EducationItem } from '../../types';
import { Save, Plus, Trash2, BookOpen, Heart, GraduationCap, User, Edit2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { Toast } from '../../components/common/Toast';

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillsText, setSkillsText] = useState<string>('');
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Hồ sơ — Admin CMS';
    DB.getProfile().then((data) => {
      if (data) {
        const defaultPhilosophyVi = `Học Qua Thực Hành: Học sinh áp dụng ngữ liệu vào hội thoại, đóng vai và nhiệm vụ thực tế.
Học Qua Trò Chơi: Trò chơi rèn luyện ngữ pháp & từ vựng giúp tiếp thu tự nhiên.
Học Qua Khám Phá: Khơi gợi trí tò mò qua sách truyện, khám phá tự nhiên và văn hóa.
Học Qua Sáng Tạo: Thiết kế áp phích, tranh vẽ và bài thuyết trình số bằng tiếng Anh.
Học Cùng Đồng Đội: Xây dựng tinh thần đồng đội, lắng nghe và hợp tác trong nhóm nhỏ.`;

        const defaultPhilosophyEn = `Learn by Doing: Students apply language in role-play, dialogues, and real-life tasks.
Learn by Playing: Gamified drills and challenges make vocabulary acquisition effortless.
Learn by Exploring: Encouraging curiosity through storybooks, culture, and nature topics.
Learn by Creating: Designing posters, drawings, and digital presentations in English.
Learn Together: Building empathy, teamwork, and active listening skills in small groups.`;

        const updatedData = {
          ...data,
          philosophyTextVi: data.philosophyTextVi || defaultPhilosophyVi,
          philosophyTextEn: data.philosophyTextEn || defaultPhilosophyEn
        };

        setProfile(updatedData);
        setSkillsText((data.skills || []).join('\n'));
        setEducationList(data.educationHistory || [
          {
            id: 'edu1',
            titleVi: 'Trường TH Dương Minh Châu — Quận 10',
            titleEn: 'Duong Minh Chau Primary School',
            detailVi: 'Giáo viên Tiếng Anh Chính thức (2020 - Nay)',
            detailEn: 'Full-time English Educator (2020 - Present)'
          },
          {
            id: 'edu2',
            titleVi: 'Cử nhân Sư phạm Tiếng Anh',
            titleEn: 'Bachelor of English Education',
            detailVi: 'Trường Đại học Sư phạm TP.HCM',
            detailEn: 'HCMC University of Education'
          }
        ]);
      }
    });
  }, []);

  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      {
        id: 'edu_' + Date.now(),
        titleVi: '',
        titleEn: '',
        detailVi: '',
        detailEn: ''
      }
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    const updated = [...educationList];
    updated.splice(index, 1);
    setEducationList(updated);
  };

  const handleUpdateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    setEducationList(updated);
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === educationList.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...educationList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setEducationList(updated);
  };

  const handleDuplicateEducation = (index: number) => {
    const itemToCopy = educationList[index];
    const duplicated: EducationItem = {
      ...itemToCopy,
      id: 'edu_' + Date.now(),
      titleVi: itemToCopy.titleVi ? `${itemToCopy.titleVi} (Bản sao)` : '',
      titleEn: itemToCopy.titleEn ? `${itemToCopy.titleEn} (Copy)` : ''
    };
    const updated = [...educationList];
    updated.splice(index + 1, 0, duplicated);
    setEducationList(updated);
    setToast({ msg: 'Đã nhân bản mục Học vấn / Công tác!', type: 'success' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const parsedSkills = skillsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedProfile: Profile = {
      ...profile,
      skills: parsedSkills,
      educationHistory: educationList
    };

    setSaving(true);
    await DB.updateProfile(updatedProfile);
    setProfile(updatedProfile);
    setSaving(false);
    setToast({ msg: 'Cập nhật thông tin hồ sơ & trang Giới thiệu thành công!', type: 'success' });
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 text-left max-w-4xl pb-10">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quản Lý Hồ Sơ & Trang Giới Thiệu</h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Chỉnh sửa 4 mục nội dung trang Giới thiệu (About) và thông tin cá nhân thầy Huy Hoàng hiển thị trên website.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">1. Thông Tin Cơ Bản & Chức Danh</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Họ và tên (Tiếng Việt)</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Họ và tên (Tiếng Anh)</label>
              <input
                type="text"
                value={profile.fullNameEn || ''}
                onChange={(e) => setProfile({ ...profile, fullNameEn: e.target.value })}
                placeholder="Nguyen Trong Huy Hoang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">URL Ảnh Đại Diện (Avatar Image)</label>
              <input
                type="text"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Số Điện Thoại Liên Hệ</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="0987654321"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Chức danh (Tiếng Việt)</label>
              <input
                type="text"
                value={profile.titleVi}
                onChange={(e) => setProfile({ ...profile, titleVi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Chức danh (Tiếng Anh)</label>
              <input
                type="text"
                value={profile.titleEn}
                onChange={(e) => setProfile({ ...profile, titleEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Đơn vị công tác (Tiếng Việt)</label>
              <input
                type="text"
                value={profile.schoolVi || ''}
                onChange={(e) => setProfile({ ...profile, schoolVi: e.target.value })}
                placeholder="Trường TH Dương Minh Châu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Đơn vị công tác (Tiếng Anh)</label>
              <input
                type="text"
                value={profile.schoolEn || ''}
                onChange={(e) => setProfile({ ...profile, schoolEn: e.target.value })}
                placeholder="Duong Minh Chau Primary School"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Địa chỉ liên hệ (Tiếng Việt)</label>
              <input
                type="text"
                value={profile.locationVi || ''}
                onChange={(e) => setProfile({ ...profile, locationVi: e.target.value })}
                placeholder="Quận 10, Thành phố Hồ Chí Minh, Việt Nam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Địa chỉ liên hệ (Tiếng Anh)</label>
              <input
                type="text"
                value={profile.locationEn || ''}
                onChange={(e) => setProfile({ ...profile, locationEn: e.target.value })}
                placeholder="District 10, Ho Chi Minh City, Vietnam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Mục 1: Đoạn Tiểu Sử / Giới Thiệu Bản Thân (Bio) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">2. Đoạn Tiểu Sử & Giới Thiệu (Mục 1 Trang About)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Nội Dung Tiểu Sử (Tiếng Việt)</label>
              <textarea
                rows={4}
                value={profile.bioVi || ''}
                onChange={(e) => setProfile({ ...profile, bioVi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Nội Dung Tiểu Sử (Tiếng Anh)</label>
              <textarea
                rows={4}
                value={profile.bioEn || ''}
                onChange={(e) => setProfile({ ...profile, bioEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Mục 2: Kỹ Năng Sư Phạm & Công Nghệ */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">3. Kỹ Năng Sư Phạm & Công Nghệ (Mục 2 Trang About)</h2>
          </div>

          <div className="space-y-1.5">
            <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">
              Danh Sách Kỹ Năng (Nhập mỗi kỹ năng trên 1 dòng)
            </label>
            <textarea
              rows={5}
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder={"English Teaching\nLesson Planning\nClassroom Management\nProject-Based Learning"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500">Mỗi dòng tương ứng với 1 thẻ kỹ năng hiển thị ở phần Kỹ Năng Sư Phạm & Công Nghệ.</p>
          </div>
        </div>

        {/* Mục 3: Triết Lý Giáo Dục */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">4. Triết Lý Giáo Dục (Mục 3 Trang About)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Trích Dẫn Triết Lý Nổi Bật (Tiếng Việt)</label>
              <textarea
                rows={2}
                value={profile.brandMessageVi || ''}
                onChange={(e) => setProfile({ ...profile, brandMessageVi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Trích Dẫn Triết Lý Nổi Bật (Tiếng Anh)</label>
              <textarea
                rows={2}
                value={profile.brandMessageEn || ''}
                onChange={(e) => setProfile({ ...profile, brandMessageEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Diễn Giải Chi Tiết Triết Lý (Tiếng Việt)</label>
              <textarea
                rows={6}
                value={profile.philosophyTextVi || ''}
                onChange={(e) => setProfile({ ...profile, philosophyTextVi: e.target.value })}
                placeholder={"Học Qua Thực Hành: Học sinh áp dụng ngữ liệu vào hội thoại...\nHọc Qua Trò Chơi: Trò chơi rèn luyện ngữ pháp..."}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Diễn Giải Chi Tiết Triết Lý (Tiếng Anh)</label>
              <textarea
                rows={6}
                value={profile.philosophyTextEn || ''}
                onChange={(e) => setProfile({ ...profile, philosophyTextEn: e.target.value })}
                placeholder={"Learn by Doing: Students apply language in role-play...\nLearn by Playing: Gamified drills and challenges..."}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 text-xs text-sky-800 dark:text-sky-300 leading-relaxed font-medium">
              💡 <strong>Quy tắc nhập dữ liệu:</strong> Mỗi dòng xuống hàng (<code className="font-bold">Enter</code>) tương ứng 1 ý nhỏ ở trang <strong>Giới Thiệu</strong> và 1 ô vuông card ở <strong>Trang Chủ</strong>. Cú pháp: <code className="font-bold text-amber-700 dark:text-amber-300">Tiêu đề: Diễn giải ý nhỏ</code>.
            </div>
          </div>
        </div>

        {/* Mục 4: Học Vấn & Quá Trình Công Tác */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">5. Học Vấn & Quá Trình Công Tác (Mục 4 Trang About)</h2>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mục Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {educationList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-sky-600 dark:text-sky-400">Mục #{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Nút Sắp xếp Lên */}
                    <button
                      type="button"
                      onClick={() => handleMoveEducation(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Sắp xếp di chuyển lên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Nút Sắp xếp Xuống */}
                    <button
                      type="button"
                      onClick={() => handleMoveEducation(idx, 'down')}
                      disabled={idx === educationList.length - 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Sắp xếp di chuyển xuống"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Nút Sửa */}
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`edu-input-vi-${idx}`);
                        if (el) el.focus();
                      }}
                      className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-950/60 transition-colors"
                      title="Chỉnh sửa mục này"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Nút Nhân bản */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateEducation(idx)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
                      title="Nhân bản mục này"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Nút Xóa */}
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                      title="Xóa mục này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">Tên Trường / Bằng Cấp (Tiếng Việt)</label>
                    <input
                      id={`edu-input-vi-${idx}`}
                      type="text"
                      value={item.titleVi || ''}
                      onChange={(e) => handleUpdateEducation(idx, 'titleVi', e.target.value)}
                      placeholder="Trường TH Dương Minh Châu — Quận 10"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">Tên Trường / Bằng Cấp (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={item.titleEn || ''}
                      onChange={(e) => handleUpdateEducation(idx, 'titleEn', e.target.value)}
                      placeholder="Duong Minh Chau Primary School"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">Chức Vụ / Chi Tiết (Tiếng Việt)</label>
                    <input
                      type="text"
                      value={item.detailVi || ''}
                      onChange={(e) => handleUpdateEducation(idx, 'detailVi', e.target.value)}
                      placeholder="Giáo viên Tiếng Anh Chính thức (2020 - Nay)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">Chức Vụ / Chi Tiết (Tiếng Anh)</label>
                    <input
                      type="text"
                      value={item.detailEn || ''}
                      onChange={(e) => handleUpdateEducation(idx, 'detailEn', e.target.value)}
                      placeholder="Full-time English Educator (2020 - Present)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Chỉ Số Thống Kê Trang Chủ */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">6. Quản Lý 4 Chỉ Số Thống Kê (Trang Chủ)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chỉnh sửa các con số thống kê hiển thị ở thanh chỉ số nổi bật trên Trang chủ.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Năm kinh nghiệm</label>
              <input
                type="number"
                value={profile.experienceYears ?? 25}
                onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Dự án đã triển khai</label>
              <input
                type="number"
                value={profile.completedProjectsCount ?? 15}
                onChange={(e) => setProfile({ ...profile, completedProjectsCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Bộ tài nguyên học liệu</label>
              <input
                type="number"
                value={profile.teachingResourcesCount ?? 50}
                onChange={(e) => setProfile({ ...profile, teachingResourcesCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs md:text-sm">Học sinh truyền cảm hứng</label>
              <input
                type="number"
                value={profile.happyStudentsCount ?? 4500}
                onChange={(e) => setProfile({ ...profile, happyStudentsCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Đang lưu...' : 'Lưu Tất Cả Thay Đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
