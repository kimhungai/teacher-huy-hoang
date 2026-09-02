import type { CourseRegistration, ResourceOrder } from '../types';
import { DB } from './db';

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

/**
 * Dispatches an email using configured Provider (Direct Web Mail / EmailJS API / Custom Webhook / Simulation fallback)
 * and saves a copy to local storage history (`db_email_logs`).
 */
async function dispatchSingleEmail(
  notification: EmailNotification,
  templateId?: string
): Promise<{ success: boolean; message: string }> {
  const settings = await DB.getSiteSettings();

  // Save copy to local log history
  try {
    const existingLogs = JSON.parse(localStorage.getItem('db_email_logs') || '[]');
    existingLogs.unshift(notification);
    localStorage.setItem('db_email_logs', JSON.stringify(existingLogs.slice(0, 100)));
  } catch {
    // ignore
  }

  // 1. EmailJS Service API (Phương án Chuyên Nghiệp 100% - Gửi mail cá nhân hóa dưới nhãn Gmail Admin)
  if (settings.emailProvider === 'emailjs' || (!settings.emailProvider && settings.emailjsServiceId)) {
    if (settings.emailjsServiceId && settings.emailjsPublicKey) {
      const targetTemplateId =
        templateId ||
        (notification.to.includes('admin') || notification.to === settings.contactEmail
          ? (settings.emailjsTemplateIdAdmin || settings.emailjsTemplateIdCustomer)
          : settings.emailjsTemplateIdCustomer);

      if (targetTemplateId) {
        try {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: settings.emailjsServiceId,
              template_id: targetTemplateId,
              user_id: settings.emailjsPublicKey,
              template_params: {
                to_email: notification.to,
                to_name: notification.to.includes('admin') ? 'Admin' : 'Quý Phụ Huynh / Học Sinh',
                from_name: 'Nguyễn Trọng Huy Hoàng English',
                from_email: settings.notificationEmail || settings.contactEmail,
                sender_email: settings.notificationEmail || settings.contactEmail,
                reply_to: settings.contactEmail,
                subject: notification.subject,
                title: notification.subject,
                message: notification.body,
                message_body: notification.body,
                sent_at: notification.sentAt
              }
            })
          });

          if (response.ok) {
            console.log(`✅ [EmailJS Real Email Sent to ${notification.to}]`);
            return { success: true, message: `Đã gửi email chuyên nghiệp từ Gmail Admin đến ${notification.to}` };
          } else {
            const errText = await response.text();
            console.warn(`⚠️ [EmailJS Warning]: ${errText}`);
            return { success: false, message: `Lỗi kết nối EmailJS (${response.status}): ${errText}` };
          }
        } catch (err: any) {
          console.error('❌ [EmailJS Network Error]:', err);
          return { success: false, message: `Lỗi kết nối mạng EmailJS: ${err.message}` };
        }
      } else {
        return { success: false, message: 'Chưa điền Template ID trong cấu hình EmailJS!' };
      }
    } else {
      return { success: false, message: 'Chưa điền đủ Service ID và Public Key của EmailJS!' };
    }
  }

  // 2. Direct Web Mail Gateway (FormSubmit API - Không cần API Keys)
  if (settings.emailProvider === 'direct_web') {
    if (notification.to && notification.to.includes('@')) {
      try {
        const targetCleanEmail = notification.to.trim();
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://thaydangtu.com';

        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetCleanEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: notification.subject,
            _captcha: 'false',
            _template: 'table',
            _url: currentDomain,
            Tên_miền_Website: currentDomain,
            Nội_dung_thông_báo: notification.body,
            Thời_gian_gửi: notification.sentAt
          })
        });

        if (response.ok) {
          console.log(`✅ [Direct Web Mail Sent to ${targetCleanEmail}]`);
          return { success: true, message: `Đã gửi mail qua cổng Direct Web đến ${targetCleanEmail}` };
        }
      } catch (err) {
        console.error('❌ [Direct Web Mail Error]:', err);
      }
    }
  }

  // 3. If Custom Webhook Endpoint is set
  if (settings.emailProvider === 'custom_api' && settings.customEmailEndpoint) {
    try {
      const response = await fetch(settings.customEmailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
      if (response.ok) {
        return { success: true, message: `Đã gửi qua Webhook API đến ${notification.to}` };
      }
    } catch (err) {
      console.error('❌ [Custom Email Endpoint Error]:', err);
    }
  }

  // Fallback simulation log
  console.log(`📧 [Simulated Email Dispatched to ${notification.to}]:`, notification);
  return { success: true, message: `Đã ghi nhận & mô phỏng gửi thư đến ${notification.to}` };
}

/**
 * Sends a Test Email to verify Email configuration in Backend CMS.
 */
export async function sendTestEmail(targetEmail: string): Promise<{ success: boolean; message: string }> {
  const settings = await DB.getSiteSettings();
  const configuredSender = (settings.notificationEmail || settings.contactEmail || 'huynhkimhung2023@gmail.com').trim();
  const configuredReceiver = targetEmail || settings.contactEmail;

  const testNotice: EmailNotification = {
    to: configuredReceiver,
    subject: '[Huy Hoang English] 📧 THƯ KIỂM TRA CẤU HÌNH EMAIL THÀNH CÔNG',
    body: `
Kính gửi Admin / Quý Khách,

Đây là email thử nghiệm từ hệ thống Website Nguyễn Trọng Huy Hoàng English.

🎉 CẤU HÌNH DỊCH VỤ EMAIL TRÊN CMS ĐÃ HOẠT ĐỘNG THÀNH CÔNG!
--------------------------------------------------
📋 THÔNG TIN CẤU HÌNH KIỂM TRA:
• Email Admin Nhận Thư Thông Báo: ${configuredReceiver}
• Email Gmail Admin Đăng Ký Gửi (CMS): ${configuredSender}
• Mã Service ID (EmailJS): ${settings.emailjsServiceId || 'Direct Web'}
• Thời gian kiểm tra: ${new Date().toLocaleString('vi-VN')}

📌 LƯU Ý BẢO MẬT & XÁC THỰC EMAILJS:
Hòm thư "Từ" (From) thực tế hiển thị trong hộp thư Gmail được quy định bởi tài khoản Gmail đã được ủy quyền kết nối trực tiếp trong Service ID trên trang EmailJS.com. Nếu bạn đổi sang Gmail gửi mới, vui lòng cập nhật lại Service ID tương ứng từ EmailJS.
--------------------------------------------------
Trân trọng,
Nguyễn Trọng Huy Hoàng English
    `.trim(),
    sentAt: new Date().toLocaleString('vi-VN')
  };

  return await dispatchSingleEmail(testNotice);
}

/**
 * Dynamically sends confirmation email to student & notification email to Client Admin for Course Registrations.
 * Reads real-time Site Settings & Teacher Profile from Backend CMS so all notification fields automatically sync
 * whenever settings/contact info/admin email are updated in Backend CMS.
 */
export async function sendRegistrationEmails(
  reg: CourseRegistration,
  lang: 'vi' | 'en' = 'vi'
): Promise<{ studentEmail: EmailNotification; adminEmail: EmailNotification }> {
  // Dynamically fetch current Settings and Profile configured in Backend CMS
  const [settings, profile] = await Promise.all([
    DB.getSiteSettings(),
    DB.getProfile()
  ]);

  const teacherName = lang === 'vi' ? (profile.fullName || 'Nguyễn Trọng Huy Hoàng') : (profile.fullNameEn || profile.fullName || 'Nguyen Trong Huy Hoang');
  const logoText = settings.logoText || 'Huy Hoang English';
  const adminEmailTarget = (settings.contactEmail || profile.adminEmail || 'huynhkimhung2023@gmail.com').trim();
  const hotline = settings.contactPhone || '0987.654.321';
  const schoolLocation = lang === 'vi'
    ? `${profile.schoolVi || 'Trường TH Dương Minh Châu'}, ${profile.locationVi || 'Quận 10, TP.HCM'}`
    : `${profile.schoolEn || profile.schoolVi || 'Duong Minh Chau Primary School'}, ${profile.locationEn || profile.locationVi || 'District 10, Ho Chi Minh City'}`;

  const hasDiscount = Boolean(reg.discountPrice && reg.discountPrice.trim() !== '');
  const effectivePrice = hasDiscount ? reg.discountPrice : (reg.coursePrice || (lang === 'vi' ? 'Miễn phí' : 'Free'));

  const now = new Date().toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');

  const websiteUrl = (settings.websiteUrl || '').trim();

  // Email to Student / Parent (Khách hàng)
  const studentBody = lang === 'vi' ? `
Kính gửi Quý Phụ Huynh / Học Sinh ${reg.fullName},

${teacherName} xin trân trọng cảm ơn bạn đã quan tâm và đăng ký khóa học "${reg.courseTitle}".

🎉 XÁC NHẬN ĐĂNG KÝ KHÓA HỌC THÀNH CÔNG 🎉
--------------------------------------------------
📋 THÔNG TIN ĐĂNG KÝ CHI TIẾT:
• Họ và tên Phụ huynh / Học sinh: ${reg.fullName}
• Số điện thoại liên hệ: ${reg.phone}
• Địa chỉ Email: ${reg.email || 'N/A'}
• Khối lớp / Độ tuổi: ${reg.gradeLevel}
• Tên khóa học: ${reg.courseTitle}
${reg.coursePrice ? `• Mức học phí niêm yết: ${reg.coursePrice}` : ''}
${hasDiscount ? `• 🔥 Mức giá khuyến mãi áp dụng: ${reg.discountPrice}` : ''}
• 💰 TỔNG HỌC PHÍ THANH TOÁN TÍNH: ${effectivePrice}
${reg.note ? `• Yêu cầu / Ghi chú thêm: ${reg.note}` : ''}
• Thời gian đăng ký: ${now}
--------------------------------------------------

📌 BƯỚC TIẾP THEO:
Giáo viên sẽ liên hệ trực tiếp tới Quý Phụ huynh qua Số điện thoại ${reg.phone} trong thời gian sớm nhất để tư vấn kiểm tra đầu vào, xếp lịch học phù hợp và hướng dẫn thủ tục nhập học cho em.

Mọi thắc mắc cần hỗ trợ gấp, Quý Phụ huynh vui lòng liên hệ:
- Hotline / Zalo tư vấn: ${hotline}
- Email liên hệ: ${adminEmailTarget}
${websiteUrl ? `- Website chính thức: ${websiteUrl}\n` : ''}- Địa chỉ: ${schoolLocation}

Kính chúc em học sinh luôn hào hứng và gặt hái nhiều kết quả tốt đẹp cùng Tiếng Anh!

Trân trọng,
${teacherName}
${profile.titleVi || 'Giáo viên Tiếng Anh | Giáo dục'}
  `.trim() : `
Dear Parent / Student ${reg.fullName},

Teacher ${teacherName} would like to sincerely thank you for your interest and registration for the course "${reg.courseTitle}".

🎉 COURSE REGISTRATION SUCCESSFUL 🎉
--------------------------------------------------
📋 DETAILED REGISTRATION INFORMATION:
• Parent / Student Name: ${reg.fullName}
• Contact Phone Number: ${reg.phone}
• Email Address: ${reg.email || 'N/A'}
• Grade / Age Group: ${reg.gradeLevel}
• Course Title: ${reg.courseTitle}
${reg.coursePrice ? `• Listed Tuition: ${reg.coursePrice}` : ''}
${hasDiscount ? `• 🔥 Promotional Price: ${reg.discountPrice}` : ''}
• 💰 TOTAL TUITION TO PAY: ${effectivePrice}
${reg.note ? `• Additional Notes: ${reg.note}` : ''}
• Registration Time: ${now}
--------------------------------------------------

📌 NEXT STEPS:
Teacher ${teacherName} will contact you directly via Phone Number ${reg.phone} as soon as possible to advise on schedule placement and guide enrollment procedures.

For urgent assistance, please contact:
- Hotline / Zalo: ${hotline}
- Contact Email: ${adminEmailTarget}
${websiteUrl ? `- Official Website: ${websiteUrl}\n` : ''}- Address: ${schoolLocation}

Wishing the student an inspiring learning journey with English!

Best regards,
${teacherName}
${profile.titleEn || profile.titleVi || 'English Teacher | Education'}
  `.trim();

  // Email to Client Admin
  const adminBody = lang === 'vi' ? `
🔔 THÔNG BÁO HỆ THỐNG: LƯỢT ĐĂNG KÝ KHÓA HỌC MỚI

Kính gửi Admin (${adminEmailTarget}),

Hệ thống Website vừa ghi nhận 01 lượt đăng ký khóa học mới thành công từ học viên / phụ huynh:

--------------------------------------------------
📋 THÔNG TIN HỌC VIÊN ĐĂNG KÝ:
• Họ tên Phụ huynh / Học sinh: ${reg.fullName}
• Số điện thoại: ${reg.phone}
• Email liên hệ: ${reg.email || 'N/A'}
• Khối lớp / Độ tuổi: ${reg.gradeLevel}
• Khóa học đăng ký: ${reg.courseTitle}
${reg.coursePrice ? `• Mức học phí gốc: ${reg.coursePrice}` : ''}
${hasDiscount ? `• 🔥 Mức giá khuyến mãi áp dụng: ${reg.discountPrice}` : ''}
• 💰 DOANH SỐ TÍNH CHO ĐƠN HÀNG: ${effectivePrice}
${reg.note ? `• Ghi chú của khách hàng: ${reg.note}` : ''}
• Thời gian gửi đăng ký: ${now}
--------------------------------------------------

⚙️ THAO TÁC CẦN THỰC HIỆN:
Vui lòng truy cập trang Quản lý Đăng ký Khóa học tại CMS (http://localhost:5173/admin/course-registrations) để cập nhật trạng thái tư vấn và nhập học cho học viên này.
  `.trim() : `
🔔 SYSTEM NOTIFICATION: NEW COURSE REGISTRATION

Dear Admin (${adminEmailTarget}),

The Website system has recorded 01 new course registration:

--------------------------------------------------
📋 REGISTRATION DETAILS:
• Parent / Student Name: ${reg.fullName}
• Contact Phone: ${reg.phone}
• Contact Email: ${reg.email || 'N/A'}
• Grade / Age Group: ${reg.gradeLevel}
• Registered Course: ${reg.courseTitle}
${reg.coursePrice ? `• Original Tuition: ${reg.coursePrice}` : ''}
${hasDiscount ? `• 🔥 Promotional Price: ${reg.discountPrice}` : ''}
• 💰 REVENUE CALCULATED: ${effectivePrice}
${reg.note ? `• Customer Notes: ${reg.note}` : ''}
• Registration Time: ${now}
--------------------------------------------------

⚙️ REQUIRED ACTION:
Please access the Course Registrations management page in CMS (http://localhost:5173/admin/course-registrations) to update student status.
  `.trim();

  const studentEmail: EmailNotification = {
    to: reg.email || reg.phone,
    subject: lang === 'vi'
      ? `[${logoText}] 🎉 Xác nhận đăng ký khóa học thành công: ${reg.courseTitle}`
      : `[${logoText}] 🎉 Course Registration Confirmed: ${reg.courseTitle}`,
    body: studentBody,
    sentAt: now
  };

  const adminEmail: EmailNotification = {
    to: adminEmailTarget,
    subject: lang === 'vi'
      ? `[ADMIN NOTIFICATION] 🔔 Đăng ký khóa học mới: ${reg.fullName} - ${reg.courseTitle} (${effectivePrice})`
      : `[ADMIN NOTIFICATION] 🔔 New Course Registration: ${reg.fullName} - ${reg.courseTitle} (${effectivePrice})`,
    body: adminBody,
    sentAt: now
  };

  // Dispatch both emails if enabled
  if (settings.enableEmailNotification !== false) {
    if (reg.email && reg.email.includes('@')) {
      await dispatchSingleEmail(studentEmail, settings.emailjsTemplateIdCustomer);
    }
    await dispatchSingleEmail(adminEmail, settings.emailjsTemplateIdAdmin);
  }

  return { studentEmail, adminEmail };
}

/**
 * Dynamically sends confirmation email to customer & notification email to Client Admin for Resource Orders.
 * Reads real-time Site Settings & Teacher Profile from Backend CMS so all notification fields automatically sync
 * whenever settings/contact info/admin email are updated in Backend CMS.
 * Explicitly targets Client Admin and excludes Super Admin Master.
 */
export async function sendResourceOrderEmails(
  ord: ResourceOrder,
  lang: 'vi' | 'en' = 'vi'
): Promise<{ customerEmail: EmailNotification; adminEmail: EmailNotification }> {
  // Dynamically fetch current Settings and Profile configured in Backend CMS
  const [settings, profile] = await Promise.all([
    DB.getSiteSettings(),
    DB.getProfile()
  ]);

  const teacherName = lang === 'vi' ? (profile.fullName || 'Nguyễn Trọng Huy Hoàng') : (profile.fullNameEn || profile.fullName || 'Nguyen Trong Huy Hoang');
  const logoText = settings.logoText || 'Huy Hoang English';
  const adminEmailTarget = (settings.contactEmail || profile.adminEmail || 'huynhkimhung2023@gmail.com').trim();
  const hotline = settings.contactPhone || '0987.654.321';
  const schoolLocation = lang === 'vi'
    ? `${profile.schoolVi || 'Trường TH Dương Minh Châu'}, ${profile.locationVi || 'Quận 10, TP.HCM'}`
    : `${profile.schoolEn || profile.schoolVi || 'Duong Minh Chau Primary School'}, ${profile.locationEn || profile.locationVi || 'District 10, Ho Chi Minh City'}`;

  const hasDiscount = Boolean(ord.discountPrice && ord.discountPrice.trim() !== '');
  const effectivePrice = hasDiscount ? ord.discountPrice : (ord.resourcePrice || (lang === 'vi' ? 'Miễn phí' : 'Free'));

  const now = new Date().toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US');

  const websiteUrl = (settings.websiteUrl || '').trim();

  // Email to Customer / Parent
  const customerBody = lang === 'vi' ? `
Kính gửi Quý Phụ Huynh / Học Sinh ${ord.fullName},

${teacherName} xin trân trọng cảm ơn bạn đã đăng ký nhận / đặt mua học liệu "${ord.resourceTitle}".

🎉 XÁC NHẬN ĐĂNG KÝ HỌC LIỆU THÀNH CÔNG 🎉
--------------------------------------------------
📋 THÔNG TIN ĐƠN HÀNG HỌC LIỆU CHI TIẾT:
• Họ và tên Phụ huynh / Học sinh: ${ord.fullName}
• Số điện thoại liên hệ: ${ord.phone}
• Địa chỉ Email: ${ord.email || 'N/A'}
• Địa chỉ giao hàng: ${ord.address || 'Gửi trực tiếp qua Email / Link tải số'}
• Tên học liệu / Thiết bị: ${ord.resourceTitle}
${ord.resourcePrice ? `• Mức giá niêm yết: ${ord.resourcePrice}` : ''}
${hasDiscount ? `• 🔥 Mức giá khuyến mãi áp dụng: ${ord.discountPrice}` : ''}
• 💰 TỔNG TIỀN THANH TOÁN TÍNH: ${effectivePrice}
${ord.note ? `• Yêu cầu / Ghi chú thêm: ${ord.note}` : ''}
• Thời gian đăng ký: ${now}
--------------------------------------------------

📌 BƯỚC TIẾP THEO:
Giáo viên sẽ kiểm tra và liên hệ trực tiếp tới Quý Phụ huynh qua Số điện thoại ${ord.phone} để hướng dẫn tải file học liệu số hoặc tiến hành giao sản phẩm tận nơi cho bạn trong thời gian sớm nhất.

Mọi thắc mắc cần hỗ trợ gấp, Quý Phụ huynh vui lòng liên hệ:
- Hotline / Zalo hỗ trợ: ${hotline}
- Email liên hệ: ${adminEmailTarget}
${websiteUrl ? `- Website chính thức: ${websiteUrl}\n` : ''}- Địa chỉ: ${schoolLocation}

Trân trọng,
${teacherName}
${profile.titleVi || 'Giáo viên Tiếng Anh | Giáo dục'}
  `.trim() : `
Dear Parent / Student ${ord.fullName},

Teacher ${teacherName} would like to sincerely thank you for ordering the learning resource "${ord.resourceTitle}".

🎉 LEARNING RESOURCE ORDER CONFIRMED 🎉
--------------------------------------------------
📋 DETAILED RESOURCE ORDER INFORMATION:
• Parent / Student Name: ${ord.fullName}
• Contact Phone Number: ${ord.phone}
• Email Address: ${ord.email || 'N/A'}
• Delivery Address: ${ord.address || 'Direct Digital File Download / Email Link'}
• Resource Title: ${ord.resourceTitle}
${ord.resourcePrice ? `• Listed Price: ${ord.resourcePrice}` : ''}
${hasDiscount ? `• 🔥 Promotional Price: ${ord.discountPrice}` : ''}
• 💰 TOTAL PAYMENT AMOUNT: ${effectivePrice}
${ord.note ? `• Additional Notes: ${ord.note}` : ''}
• Order Time: ${now}
--------------------------------------------------

📌 NEXT STEPS:
Teacher ${teacherName} will contact you directly via Phone Number ${ord.phone} as soon as possible to guide digital file download or deliver the material to your address.

For urgent assistance, please contact:
- Hotline / Zalo: ${hotline}
- Contact Email: ${adminEmailTarget}
${websiteUrl ? `- Official Website: ${websiteUrl}\n` : ''}- Address: ${schoolLocation}

Best regards,
${teacherName}
${profile.titleEn || profile.titleVi || 'English Teacher | Education'}
  `.trim();

  // Email to Client Admin
  const adminBody = lang === 'vi' ? `
🔔 THÔNG BÁO HỆ THỐNG: ĐƠN HÀNG ĐẶT MUA HỌC LIỆU MỚI

Kính gửi Admin (${adminEmailTarget}),

Hệ thống Website vừa ghi nhận 01 lượt đăng ký nhận / đặt mua học liệu mới từ khách hàng:

--------------------------------------------------
📋 THÔNG TIN ĐƠN HÀNG HỌC LIỆU:
• Tên Học liệu / Thiết bị: ${ord.resourceTitle}
• Họ tên Phụ huynh / Học sinh: ${ord.fullName}
• Số điện thoại liên hệ: ${ord.phone}
• Email khách hàng: ${ord.email || 'N/A'}
• Địa chỉ giao hàng: ${ord.address || 'N/A (Tải qua file số)'}
${ord.resourcePrice ? `• Mức giá gốc: ${ord.resourcePrice}` : ''}
${hasDiscount ? `• 🔥 Mức giá khuyến mãi áp dụng: ${ord.discountPrice}` : ''}
• 💰 DOANH SỐ ĐƠN HÀNG TÍNH: ${effectivePrice}
${ord.note ? `• Ghi chú của khách hàng: ${ord.note}` : ''}
• Thời gian đăng ký: ${now}
--------------------------------------------------

⚙️ THAO TÁC CẦN THỰC HIỆN:
Vui lòng truy cập trang Quản lý Đăng ký Học liệu tại CMS (http://localhost:5173/admin/resource-orders) để cập nhật trạng thái xử lý và giao hàng cho khách hàng này.
  `.trim() : `
🔔 SYSTEM NOTIFICATION: NEW RESOURCE ORDER

Dear Admin (${adminEmailTarget}),

The Website system has recorded 01 new learning resource order:

--------------------------------------------------
📋 RESOURCE ORDER DETAILS:
• Resource Title: ${ord.resourceTitle}
• Parent / Student Name: ${ord.fullName}
• Contact Phone: ${ord.phone}
• Customer Email: ${ord.email || 'N/A'}
• Delivery Address: ${ord.address || 'N/A (Digital Download)'}
${ord.resourcePrice ? `• Original Price: ${ord.resourcePrice}` : ''}
${hasDiscount ? `• 🔥 Promotional Price: ${ord.discountPrice}` : ''}
• 💰 REVENUE CALCULATED: ${effectivePrice}
${ord.note ? `• Customer Notes: ${ord.note}` : ''}
• Order Time: ${now}
--------------------------------------------------

⚙️ REQUIRED ACTION:
Please access the Resource Orders management page in CMS (http://localhost:5173/admin/resource-orders) to process and arrange delivery.
  `.trim();

  const customerEmail: EmailNotification = {
    to: ord.email || ord.phone,
    subject: lang === 'vi'
      ? `[${logoText}] 🎉 Xác nhận đăng ký / đặt mua học liệu thành công: ${ord.resourceTitle}`
      : `[${logoText}] 🎉 Resource Order Confirmed: ${ord.resourceTitle}`,
    body: customerBody,
    sentAt: now
  };

  const adminEmail: EmailNotification = {
    to: adminEmailTarget,
    subject: lang === 'vi'
      ? `[ADMIN NOTIFICATION] 🔔 Đơn hàng học liệu mới: ${ord.fullName} - ${ord.resourceTitle} (${effectivePrice})`
      : `[ADMIN NOTIFICATION] 🔔 New Resource Order: ${ord.fullName} - ${ord.resourceTitle} (${effectivePrice})`,
    body: adminBody,
    sentAt: now
  };

  // Dispatch both emails if enabled
  if (settings.enableEmailNotification !== false) {
    if (ord.email && ord.email.includes('@')) {
      await dispatchSingleEmail(customerEmail, settings.emailjsTemplateIdCustomer);
    }
    await dispatchSingleEmail(adminEmail, settings.emailjsTemplateIdAdmin);
  }

  return { customerEmail, adminEmail };
}
