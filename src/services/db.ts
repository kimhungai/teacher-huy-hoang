import type {
  Profile,
  HeroSettings,
  TeachingApproach,
  Project,
  Course,
  CourseRegistration,
  StudentWork,
  TeachingResource,
  ResourceOrder,
  BlogPost,
  Achievement,
  GalleryItem,
  ContactMessage,
  MediaFile,
  SiteSettings
} from '../types';
import { applyPrimaryColor } from '../utils/themeUtils';
import initialDiskDb from '../data/db_backup.json';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// INITIAL SAMPLE DATA FOR PRIMARY ENGLISH TEACHER
const INITIAL_PROFILE: Profile = {
  id: 'p1',
  fullName: 'Nguyễn Trọng Huy Hoàng',
  fullNameEn: 'Nguyen Trong Huy Hoang',
  titleEn: 'English Teacher | Education',
  titleVi: 'Giáo viên Tiếng Anh | Giáo dục',
  schoolEn: 'Duong Minh Chau Primary School',
  schoolVi: 'Trường Tiểu học Dương Minh Châu',
  locationEn: 'District 10, Ho Chi Minh City, Vietnam',
  locationVi: 'Quận 10, Thành phố Hồ Chí Minh, Việt Nam',
  adminEmail: 'huynhkimhungabmthaydangtu@gmail.com',
  brandMessageEn: 'Making English fun, meaningful and memorable for every young learner.',
  brandMessageVi: 'Biến việc học tiếng Anh thành một hành trình vui vẻ, ý nghĩa và đáng nhớ cho mỗi học sinh.',
  avatarUrl: 'https://ik.imagekit.io/hkh/OK_0.jpg?updatedAt=1787823395930',
  bioEn: 'With over 25 years of teaching experience, I specialise in Project-Based Learning, gamified vocabulary acquisition, and integrating modern educational technology into classrooms. My mission is to build students confidence and intrinsic love for communication.',
  bioVi: 'Với hơn 25 năm kinh nghiệm giảng dạy tiếng Anh, tôi chuyên sâu về phương pháp Học theo dự án (PBL), học qua trò chơi và ứng dụng công nghệ giáo dục EdTech trong nhà trường. Sứ mệnh của tôi là mang lại sự tự tin và niềm say mê ngôn ngữ tự nhiên cho học viên.',
  skills: [
    'English Teaching',
    'Lesson Planning',
    'Classroom Management',
    'Communication',
    'Presentation',
    'Educational Technology',
    'Project-Based Learning',
    'Creative Learning'
  ],
  philosophyTextVi: `Học Qua Thực Hành: Học sinh áp dụng ngữ liệu vào hội thoại, đóng vai và nhiệm vụ thực tế.
Học Qua Trò Chơi: Trò chơi rèn luyện ngữ pháp & từ vựng giúp tiếp thu tự nhiên.
Học Qua Khám Phá: Khơi gợi trí tò mò qua sách truyện, khám phá tự nhiên và văn hóa.
Học Qua Sáng Tạo: Thiết kế áp phích, tranh vẽ và bài thuyết trình số bằng tiếng Anh.
Học Cùng Đồng Đội: Xây dựng tinh thần đồng đội, lắng nghe và hợp tác trong nhóm nhỏ.`,
  philosophyTextEn: `Learn by Doing: Students apply language in role-play, dialogues, and real-life tasks.
Learn by Playing: Gamified drills and challenges make vocabulary acquisition effortless.
Learn by Exploring: Encouraging curiosity through storybooks, culture, and nature topics.
Learn by Creating: Designing posters, drawings, and digital presentations in English.
Learn Together: Building empathy, teamwork, and active listening skills in small groups.`,
  educationHistory: [
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
  ],
  experienceYears: 25,
  completedProjectsCount: 15,
  teachingResourcesCount: 50,
  happyStudentsCount: 4500
};

const INITIAL_HERO: HeroSettings = {
  headlineEn: 'Making English Fun, Meaningful & Memorable',
  headlineVi: 'Biến Tiếng Anh Thành Hành Trình Vui Vẻ, Ý Nghĩa & Đáng Nhớ',
  subtitleEn: 'Welcome to the digital corner of Teacher Huy Hoang — English Educator & EdTech Innovator at Duong Minh Chau Primary School.',
  subtitleVi: 'Chào mừng đến với không gian số của Thầy Nguyễn Trọng Huy Hoàng — Giáo viên Tiếng Anh & Sáng tạo EdTech tại Trường TH Dương Minh Châu.',
  avatarUrl: 'https://ik.imagekit.io/hkh/OK_2.jpg?updatedAt=1787823395938',
  backgroundUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1600'
};

const INITIAL_TEACHING_APPROACHES: TeachingApproach[] = [
  {
    id: 'ta1',
    titleEn: 'Communicative English',
    titleVi: 'Giao tiếp Ngôn ngữ Tự nhiên',
    descriptionEn: 'Focusing on real-life speaking situations, role-playing, and interactive dialogues to build natural fluency and confidence.',
    descriptionVi: 'Tập trung vào các tình huống thực tế, đóng vai và hội thoại tương tác để xây dựng sự tự tin và phản xạ tự nhiên.',
    icon: 'MessageSquare',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600',
    orderIndex: 1
  },
  {
    id: 'ta2',
    titleEn: 'Learning Through Games',
    titleVi: 'Học Qua Trò Chơi (Gamification)',
    descriptionEn: 'Transforming grammar and vocabulary drills into exciting games, physical challenges, and digital quizzes.',
    descriptionVi: 'Chuyển hóa bài tập từ vựng và ngữ pháp thành các trò chơi vận động, thử thách đồng đội và quiz tương tác.',
    icon: 'Gamepad2',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600',
    orderIndex: 2
  },
  {
    id: 'ta3',
    titleEn: 'Project-Based Learning (PBL)',
    titleVi: 'Học Theo Dự Án (PBL)',
    descriptionEn: 'Encouraging young learners to research, design posters, and present creative projects in small collaborative teams.',
    descriptionVi: 'Khuyến khích học sinh tìm hiểu, thiết kế áp phích và thuyết trình dự án sáng tạo theo nhóm nhỏ.',
    icon: 'FolderKanban',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
    orderIndex: 3
  },
  {
    id: 'ta4',
    titleEn: 'Interactive Storytelling',
    titleVi: 'Kể Chuyện Tương Tác',
    descriptionEn: 'Using rich picture storybooks, drama puppets, and audio tales to kindle imagination and listening comprehension.',
    descriptionVi: 'Sử dụng truyện tranh thiếu nhi, rối tay nghệ thuật và sách nói giúp học sinh phát triển tư duy và kỹ năng nghe.',
    icon: 'BookOpen',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
    orderIndex: 4
  },
  {
    id: 'ta5',
    titleEn: 'Interactive Activities & Stations',
    titleVi: 'Góc Học Tập Tương Tác',
    descriptionEn: 'Organizing classroom rotation stations for reading, listening, phonics practice, and peer review.',
    descriptionVi: 'Tổ chức các trạm xoay vòng bài học để luyện tập kỹ năng đọc, nghe, phát âm chuẩn phonics và nhận xét nhóm.',
    icon: 'Layers',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
    orderIndex: 5
  },
  {
    id: 'ta6',
    titleEn: 'Student-Centered Learning',
    titleVi: 'Lấy Học Sinh Làm Trung Tâm',
    descriptionEn: 'Adapting tasks according to mixed-ability learning styles and giving children autonomy over their choices.',
    descriptionVi: 'Điều chỉnh bài học phù hợp với từng năng lực của học sinh và trao cho các em quyền lựa chọn hình thức thể hiện.',
    icon: 'HeartHandshake',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600',
    orderIndex: 6
  },
  {
    id: 'ta7',
    titleEn: 'Technology-Enhanced Learning',
    titleVi: 'Tích Hợp Công Nghệ Giáo Dục',
    descriptionEn: 'Integrating interactive whiteboards, Wordwall games, Kahoot, and Canva for immersive visual English lessons.',
    descriptionVi: 'Ứng dụng bảng tương tác, game Wordwall, Kahoot và Canva tạo nên trải nghiệm học tiếng Anh sinh động.',
    icon: 'Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    orderIndex: 7
  },
  {
    id: 'ta8',
    titleEn: 'Creative Learning & Arts',
    titleVi: 'Sáng Tạo & Nghệ Thuật',
    descriptionEn: 'Combining English with singing, drawing, crafting, and mini-skits to make language retention effortless.',
    descriptionVi: 'Kết hợp học tiếng Anh với ca hát, vẽ tranh, làm thủ công và kịch ngắn giúp ghi nhớ ngữ liệu nhẹ nhàng.',
    icon: 'Palette',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
    orderIndex: 8
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj1',
    slug: 'my-green-planet-project',
    titleEn: 'Project: "My Green Planet & Environmental Heroes"',
    titleVi: 'Dự án: "Hành Tinh Xanh & Hiệp Sĩ Môi Trường"',
    categoryName: 'English Projects',
    grade: 'Grade 4 & 5',
    year: '2025-2026',
    descriptionEn: 'A 4-week integrated PBL project where students learned vocabulary about nature, recycled materials, and presented solutions in English.',
    descriptionVi: 'Dự án PBL kéo dài 4 tuần giúp học sinh tiếp thu từ vựng về môi trường, vật liệu tái chế và thuyết trình giải pháp bằng tiếng Anh.',
    objectivesEn: [
      'Master 30+ vocabulary terms related to environment and recycling.',
      'Practice present continuous and modal verbs (should/shouldnt).',
      'Boost team collaboration and public speaking skills.'
    ],
    objectivesVi: [
      'Làm chủ 30+ từ vựng về môi trường và phân loại rác thải.',
      'Thực hành thì hiện tại tiếp diễn và động từ khuyết thiếu (should/shouldnt).',
      'Nâng cao kỹ năng làm việc nhóm và thuyết trình trước lớp.'
    ],
    activitiesEn: [
      'Week 1: Environmental vocabulary discovery with flashcards and songs.',
      'Week 2: Poster creation using recycled paper and colored markers.',
      'Week 3: Group presentation rehearsal with peer evaluation rubric.',
      'Week 4: Exhibition day for parents and school teachers.'
    ],
    activitiesVi: [
      'Tuần 1: Khám phá từ vựng môi trường qua tranh ảnh và bài hát.',
      'Tuần 2: Thiết kế áp phích từ giấy tái chế và màu vẽ.',
      'Tuần 3: Luyện tập thuyết trình nhóm và đánh giá chéo.',
      'Tuần 4: Ngày hội triển lãm dành cho phụ huynh và thầy cô.'
    ],
    methodsEn: ['Project-Based Learning', 'Collaborative Group Work', 'Visual Art Integration'],
    methodsVi: ['Học theo dự án', 'Thảo luận nhóm', 'Tích hợp nghệ thuật trực quan'],
    outcomesEn: ['120 student posters created', '95% student confidence increase in public speaking'],
    outcomesVi: ['120 áp phích được học sinh hoàn thiện', '95% học sinh tự tin hơn khi phát biểu tiếng Anh'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['PBL', 'Environment', 'Speaking', 'Poster'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'proj2',
    slug: 'english-phonics-fair',
    titleEn: 'Interactive Phonics Fair & Word Games',
    titleVi: 'Ngày Hội Phonics & Trò Chơi Từ Vựng Sinh Động',
    categoryName: 'Classroom Activities',
    grade: 'Grade 1 & 2',
    year: '2025',
    descriptionEn: 'A joyful day filled with phonics games, sound matching stations, and mini-certificates for young beginners.',
    descriptionVi: 'Ngày hội vui học ngữ âm với các trạm ghép âm, phát âm chuẩn và trao chứng chỉ nhí cho học sinh lớp 1 và 2.',
    objectivesEn: ['Improve letter-sound recognition', 'Enhance pronunciation accuracy'],
    objectivesVi: ['Củng cố khả năng nhận biết âm tiết và chữ cái', 'Phát âm chuẩn xác hơn'],
    activitiesEn: ['Station 1: Phonics Bingo', 'Station 2: Jump on the Sound', 'Station 3: Sing along Phonics'],
    activitiesVi: ['Trạm 1: Bingo Ngữ Âm', 'Trạm 2: Nhảy Theo Âm Tiết', 'Trạm 3: Ca Hát Phonics'],
    methodsEn: ['Gamification', 'Kinesthetic Learning'],
    methodsVi: ['Gamification', 'Học qua vận động'],
    outcomesEn: ['200+ grade 1 & 2 students participated enthusiastically'],
    outcomesVi: ['Hơn 200 học sinh khối 1 & 2 tham gia hào hứng'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    galleryUrls: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'],
    tags: ['Phonics', 'Grade 1', 'Games'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2025-11-20'
  },
  {
    id: 'proj3',
    slug: 'digital-storytelling-with-canva',
    titleEn: 'Digital Storytelling: "My Dream Career"',
    titleVi: 'Kể Chuyện Số: "Ước Mơ Nghề Nghiệp Của Em"',
    categoryName: 'Technology in Education',
    grade: 'Grade 5',
    year: '2025',
    descriptionEn: 'Students created digital comic strips and short presentations introducing their future career aspirations using Canva.',
    descriptionVi: 'Học sinh thiết kế truyện tranh số và bài thuyết trình giới thiệu ước mơ nghề nghiệp tương lai bằng phần mềm Canva.',
    objectivesEn: ['Master job vocabulary', 'Learn basic digital design skills'],
    objectivesVi: ['Thuộc từ vựng về nghề nghiệp', 'Học kỹ năng thiết kế đồ họa cơ bản'],
    activitiesEn: ['Canva digital template tutorial', 'Voice recording in English'],
    activitiesVi: ['Hướng dẫn mẫu thiết kế Canva', 'Thu âm giọng đọc tiếng Anh'],
    methodsEn: ['EdTech Integration', 'Digital Literacy'],
    methodsVi: ['Tích hợp công nghệ', 'Kỹ năng số'],
    outcomesEn: ['60 digital stories compiled into an eBook'],
    outcomesVi: ['60 câu chuyện số được tổng hợp thành sách điện tử'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    galleryUrls: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'],
    tags: ['EdTech', 'Canva', 'Storytelling'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2025-10-10'
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    slug: 'khoa-anh-van-tre-em-sang-tao',
    titleEn: 'Creative English for Young Learners',
    titleVi: 'Khóa Anh Văn Trẻ Em Sáng Tạo & Tương Tác',
    categoryName: 'Anh văn trẻ em',
    categoryEn: 'Young Learners English',
    priceType: 'free',
    priceEn: 'Free',
    priceVi: 'Miễn phí',
    gradeLevel: 'Grade 1 - 3 (6-9 tuổi)',
    gradeLevelEn: 'Grade 1 - 3 (Ages 6-9)',
    durationEn: '8 Sessions (4 Weeks)',
    durationVi: '8 Buổi (4 Tuần)',
    scheduleEn: 'Sat & Sun Morning (9:00 - 10:30 AM)',
    scheduleVi: 'Sáng Thứ 7 & Chủ Nhật (9:00 - 10:30)',
    descriptionEn: 'An engaging foundational English course combining singing, crafts, and interactive games for young beginners.',
    descriptionVi: 'Khóa học tiếng Anh nền tảng sinh động kết hợp hát múa, làm thủ công và trò chơi vận động dành cho trẻ mầm non & tiểu học.',
    objectivesEn: [
      'Master 50+ basic sight words and daily greetings.',
      'Build confidence in simple English Q&A.',
      'Develop natural pronunciation through Phonics songs.'
    ],
    objectivesVi: [
      'Làm chủ 50+ từ vựng giao tiếp cơ bản và câu chào hỏi hàng ngày.',
      'Tạo sự tự tin phản xạ các câu hỏi - đáp tiếng Anh đơn giản.',
      'Phát triển ngữ âm chuẩn qua các bài hát Phonics sôi động.'
    ],
    curriculumEn: [
      'Session 1: Hello Friends & Family Vocabulary',
      'Session 2: Phonics Letters A-D Sound Practice',
      'Session 3: Colors & Shapes Crafting Project',
      'Session 4: Animals & Action Verbs Game',
      'Session 5: My Body Parts & Song Rotation',
      'Session 6: Food & Preferences Dialogue',
      'Session 7: Show and Tell Rehearsal',
      'Session 8: Graduation Showcase & Presentation'
    ],
    curriculumVi: [
      'Buổi 1: Chào hỏi & Từ vựng Gia đình thân thương',
      'Buổi 2: Luyện phát âm Phonics Bảng chữ cái A-D',
      'Buổi 3: Dự án làm thủ công Màu sắc & Hình khối',
      'Buổi 4: Game tương tác Động vật & Động từ chỉ hành động',
      'Buổi 5: Học từ vựng Các bộ phận cơ thể qua âm nhạc',
      'Buổi 6: Hội thoại Món ăn yêu thích & Sở thích',
      'Buổi 7: Luyện tập thuyết trình Show and Tell nhí',
      'Buổi 8: Báo cáo tốt nghiệp & Trao chứng chỉ nhí'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'c2',
    slug: 'khoa-luyen-van-pham-sinh-dong',
    titleEn: 'Dynamic Grammar & Sentence Building',
    titleVi: 'Khóa Luyện Văn Phạm & Cấu Trúc Câu Sinh Động',
    categoryName: 'Luyện văn phạm',
    categoryEn: 'Grammar Mastery',
    priceType: 'paid',
    priceEn: '$20 / Course',
    priceVi: '450.000 VNĐ / Khóa',
    gradeLevel: 'Grade 3 - 5 (8-11 tuổi)',
    gradeLevelEn: 'Grade 3 - 5 (Ages 8-11)',
    durationEn: '12 Sessions (6 Weeks)',
    durationVi: '12 Buổi (6 Tuần)',
    scheduleEn: 'Mon & Wed Evening (6:00 - 7:30 PM)',
    scheduleVi: 'Tối Thứ 2 & Thứ 4 (18:00 - 19:30)',
    descriptionEn: 'Transform boring grammar rules into clear visual maps, sentence puzzles, and interactive quizzes.',
    descriptionVi: 'Biến ngữ pháp khô khan thành sơ đồ tư duy trực quan, trò chơi ghép câu và quiz tương tác chuẩn thi tiểu học.',
    objectivesEn: [
      'Master Present Simple, Present Continuous, and Past Tense.',
      'Construct complete, grammatically accurate English sentences.',
      'Score high in school semester English exams.'
    ],
    objectivesVi: [
      'Nắm vững Thì Hiện tại đơn, Hiện tại tiếp diễn và Quá quá đơn.',
      'Viết câu tiếng Anh đúng ngữ pháp và diễn đạt ý tưởng hoàn chỉnh.',
      'Đạt điểm cao trong các bài kiểm tra tiếng Anh định kỳ tại trường.'
    ],
    curriculumEn: [
      'Module 1: Nouns, Verbs & Adjectives Building Blocks',
      'Module 2: Tenses Mastery (Present & Past)',
      'Module 3: Prepositions & Question Words (Wh-questions)',
      'Module 4: Writing Short English Essays & Peer Correction'
    ],
    curriculumVi: [
      'Chương 1: Phân loại Danh từ, Động từ & Tính từ trực quan',
      'Chương 2: Làm chủ các thì ngữ pháp cốt lõi khối 3-4-5',
      'Chương 3: Giới từ chỉ nơi chốn & Cấu trúc câu hỏi Wh-words',
      'Chương 4: Thực hành viết đoạn văn ngắn & Nhận xét nhóm'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-01-20'
  },
  {
    id: 'c3',
    slug: 'khoa-luyen-phan-xa-game-tuong-tac',
    titleEn: 'Gamified English Fluency & Speed Quiz',
    titleVi: 'Khóa Luyện Phản Xạ Tiếng Anh Qua Game Tương Tác',
    categoryName: 'Luyện phản xạ game',
    categoryEn: 'Gamified Fluency',
    priceType: 'free',
    priceEn: 'Free',
    priceVi: 'Miễn phí',
    gradeLevel: 'Grade 2 - 5',
    gradeLevelEn: 'Grade 2 - 5',
    durationEn: '6 Sessions (3 Weeks)',
    durationVi: '6 Buổi (3 Tuần)',
    scheduleEn: 'Sun Afternoon (2:00 - 4:00 PM)',
    scheduleVi: 'Chiều Chủ Nhật (14:00 - 16:00)',
    descriptionEn: 'Speed up listening comprehension and oral response using Wordwall, Kahoot, and live team games.',
    descriptionVi: 'Tăng tốc độ phản xạ nghe - nói tiếng Anh thông qua đấu trí Wordwall, Kahoot và thử thách vận động đồng đội.',
    objectivesEn: [
      'Accelerate English oral response time under 3 seconds.',
      'Expand vocabulary retention through interactive game loops.',
      'Enhance focus, listening speed, and stage presence.'
    ],
    objectivesVi: [
      'Rút ngắn thời gian phản xạ trả lời tiếng Anh dưới 3 giây.',
      'Mở rộng vốn từ vựng tự nhiên qua các vòng lặp trò chơi.',
      'Nâng cao sự tập trung, tốc độ nghe và sự tự tin phát biểu.'
    ],
    curriculumEn: [
      'Session 1: Fast Word Matching Challenge',
      'Session 2: Listening & Action Relay Games',
      'Session 3: Kahoot Vocabulary Showdown',
      'Session 4: Roleplay Dialogue Speed Run',
      'Session 5: Mystery Puzzle Team Battle',
      'Session 6: Champion Tournament & Certificate'
    ],
    curriculumVi: [
      'Buổi 1: Thử thách Ghép từ nhanh theo chủ đề',
      'Buổi 2: Trò chơi tiếp sức Nghe & Thực hiện hành động',
      'Buổi 3: Đấu trí Kahoot từ vựng theo khối lớp',
      'Buổi 4: Đóng vai thoại nhanh phản xạ tình huống',
      'Buổi 5: Giải mã ô chữ bí ẩn đồng đội',
      'Buổi 6: Giải đấu vô địch phản xạ & Trao quà'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-01-10'
  },
  {
    id: 'c4',
    slug: 'khoa-luyen-nghe-noi-giao-tiep',
    titleEn: 'Confident Speaking & Everyday Listening',
    titleVi: 'Khóa Luyện Nghe Nói & Giao Tiếp Tự Tin',
    categoryName: 'Luyện nghe nói',
    categoryEn: 'Listening & Speaking',
    priceType: 'paid',
    priceEn: '$25 / Course',
    priceVi: '600.000 VNĐ / Khóa',
    discountPriceVi: '499.000 VNĐ / Khóa',
    discountPriceEn: '$20 / Course',
    gradeLevel: 'Grade 3 - 5',
    gradeLevelEn: 'Grade 3 - 5',
    durationEn: '10 Sessions (5 Weeks)',
    durationVi: '10 Buổi (5 Tuần)',
    scheduleEn: 'Tue & Thu Evening (6:30 - 8:00 PM)',
    scheduleVi: 'Tối Thứ 3 & Thứ 5 (18:30 - 20:00)',
    descriptionEn: 'Intensive speaking course helping primary students overcome fear of speaking through real scenarios.',
    descriptionVi: 'Khóa học chuyên sâu rèn kỹ năng phát âm, nối âm và xử lý tình huống giao tiếp tiếng Anh hàng ngày.',
    objectivesEn: ['Speak with correct intonation and fluency', 'Improve listening for main ideas'],
    objectivesVi: ['Phát âm chuẩn ngữ điệu và biểu cảm', 'Lắng nghe tốt ý chính bài hội thoại'],
    curriculumEn: ['Week 1: Intonation & Linking Sounds', 'Week 2: Shopping & Order Food Roleplay'],
    curriculumVi: ['Tuần 1: Ngữ điệu & Kỹ thuật nối âm chuẩn', 'Tuần 2: Đóng vai Mua sắm & Gọi món ăn'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    galleryUrls: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isFeatured: false,
    isPublished: true,
    createdAt: '2025-12-15'
  }
];

const INITIAL_COURSE_REGS: CourseRegistration[] = [
  {
    id: 'reg1',
    courseId: 'c1',
    courseTitle: 'Khóa Anh Văn Trẻ Em Sáng Tạo & Tương Tác',
    fullName: 'Trần Thị Thu Hà (Phụ huynh bé Bảo Minh)',
    phone: '0908123456',
    email: 'ha.tran@gmail.com',
    gradeLevel: 'Lớp 2 (Trường TH Dương Minh Châu)',
    note: 'Bé hơi rụt rè nhờ thầy Hoàng hỗ trợ động viên giúp bé tự tin hơn.',
    coursePrice: 'Miễn phí',
    discountPrice: '',
    status: 'new',
    createdAt: '2026-02-06 10:15'
  },
  {
    id: 'reg2',
    courseId: 'c2',
    courseTitle: 'Khóa Luyện Văn Phạm & Cấu Trúc Câu Sinh Động',
    fullName: 'Nguyen Van Thanh',
    phone: '0912987654',
    email: 'thanh.nguyen@yahoo.com',
    gradeLevel: 'Lớp 4',
    note: 'Đã hoàn tất chuyển khoản học phí.',
    coursePrice: '450.000 VNĐ / Khóa',
    discountPrice: '',
    status: 'confirmed',
    createdAt: '2026-02-04 15:30'
  }
];

const INITIAL_RESOURCES: TeachingResource[] = [
  {
    id: 'res1',
    slug: 'bo-sach-truyen-tranh-phonics-fun',
    titleEn: 'Phonics Fun Storybook Collection (Volumes 1 - 3)',
    titleVi: 'Bộ Sách Truyện Tranh Ngữ Âm Phonics Fun (Tập 1 - 3)',
    descriptionEn: 'Illustrated storybooks built specifically for primary students to master letter sounds, blending, and vocabulary.',
    descriptionVi: 'Bộ sách truyện tranh hình minh họa rực rỡ thiết kế chuẩn sư phạm tiểu học giúp trẻ làm chủ âm tiết, nối âm và từ vựng.',
    categoryName: 'Sách & Giáo trình',
    resourceType: 'book',
    priceType: 'paid',
    priceEn: '$8 / Set',
    priceVi: '180.000 VNĐ / Bộ',
    discountPriceVi: '140.000 VNĐ / Bộ',
    discountPriceEn: '$6 / Set',
    grade: 'Grade 1 - 3',
    fileType: 'In bản cứng / Sách giấy',
    previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    downloadCount: 0,
    specificationsEn: ['Includes 3 storybooks', 'Full color 48 pages each', 'Audio QR codes included for audiobooks'],
    specificationsVi: ['Bao gồm 3 cuốn sách truyện', 'In màu toàn bộ 48 trang/cuốn', 'Mã QR quét nghe audio giọng đọc chuẩn'],
    tags: ['Phonics', 'Storybook', 'Books'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-01-10'
  },
  {
    id: 'res2',
    slug: 'phan-mem-word-games-pro',
    titleEn: 'Word Games Pro Interactive Desktop App',
    titleVi: 'Phần Mềm Đấu Trí Từ Vựng Tiếng Anh Word Games Pro',
    descriptionEn: 'Interactive educational software with over 500 English vocabulary games, quizzes, and speed relays for Windows & Mac.',
    descriptionVi: 'Phần mềm học tập tương tác chứa hơn 500 mini-game từ vựng, quiz đấu trí và thử thách tốc độ dành cho máy tính.',
    categoryName: 'Phần mềm & App',
    resourceType: 'software',
    priceType: 'paid',
    priceEn: '$12 / License',
    priceVi: '250.000 VNĐ / Bản quyền',
    discountPriceVi: '190.000 VNĐ / Bản quyền',
    discountPriceEn: '$9 / License',
    grade: 'Grade 1 - 5',
    fileType: 'Phần mềm Windows / macOS',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    downloadCount: 0,
    specificationsEn: ['Lifetime offline license', 'Compatible with Windows 10/11 & macOS', '500+ interactive games'],
    specificationsVi: ['Kích hoạt bản quyền vĩnh viễn offline', 'Tương thích Windows 10/11 và macOS', 'Hơn 500 trò chơi sinh động'],
    tags: ['Software', 'EdTech', 'Gamification'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'res3',
    slug: 'bo-the-thuc-hanh-phonics-tu-vung-3',
    titleEn: 'Grade 3 Phonics & Sight Words Practice Cards',
    titleVi: 'Bộ Thẻ Thực Hành Phonics & Từ Vựng Lớp 3 (Printable Flashcards)',
    descriptionEn: 'Printable flashcard set featuring 50 core sight words with colorful illustrations and phonics sound markers.',
    descriptionVi: 'Bộ thẻ từ in ấn chứa 50 từ vựng cốt lõi đi kèm hình ảnh sinh động và ký hiệu phiên âm chuẩn cho giáo viên và phụ huynh.',
    categoryName: 'File Học liệu Số',
    resourceType: 'digital_file',
    priceType: 'free',
    priceEn: 'Free',
    priceVi: 'Miễn phí',
    grade: 'Grade 3',
    fileType: 'File PDF In Ấn',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
    ],
    downloadCount: 0,
    specificationsEn: ['High resolution PDF file', 'Ready for A4 double-sided printing', '50 vocabulary cards'],
    specificationsVi: ['File PDF độ phân giải cao', 'Sẵn sàng in ấn A4 2 mặt', '50 thẻ từ vựng thiết kế đẹp mắt'],
    tags: ['Phonics', 'Flashcards', 'Grade 3'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-01-05'
  },
  {
    id: 'res4',
    slug: 'bo-roi-tay-con-vat-ke-chuyen',
    titleEn: 'English Storytelling Animal Hand Puppet Kit',
    titleVi: 'Bộ Rối Tay & Mô Hình Con Vật Kể Chuyện Tiếng Anh',
    descriptionEn: 'Hand puppet set crafted with soft fabric to make English roleplaying and storytelling interactive for young learners.',
    descriptionVi: 'Bộ rối tay nhân vật động vật ngộ nghĩnh bằng vải nỉ cao cấp phục vụ đóng vai kịch ngắn và kể chuyện trong giờ học.',
    categoryName: 'Dụng cụ & Giáo cụ',
    resourceType: 'teaching_tool',
    priceType: 'paid',
    priceEn: '$15 / Set',
    priceVi: '320.000 VNĐ / Bộ 6 con',
    grade: 'Grade 1 - 3',
    fileType: 'Giáo cụ vải & gỗ',
    previewUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
    ],
    downloadCount: 0,
    specificationsEn: ['Set of 6 animal puppets', 'Soft velvet fabric', 'Safe for young children'],
    specificationsVi: ['Bộ gồm 6 con rối tay khác nhau', 'Chất liệu nung nhung mềm mại an toàn', 'Kèm kịch bản hội thoại mẫu'],
    tags: ['Puppets', 'Storytelling', 'Teaching Tools'],
    isFeatured: false,
    isPublished: true,
    createdAt: '2025-12-20'
  },
  {
    id: 'res5',
    slug: 'loa-nghe-noi-tieng-anh-nhis-smart-audio-kit',
    titleEn: 'Smart Audio Kit & Sound Card Speaker for Children',
    titleVi: 'Bộ Loa Nghe Nói Tiếng Anh Nhí Kèm Thẻ Âm Thanh Smart Audio Kit',
    descriptionEn: 'Compact speaker device playing correct English phonics audio files when matching cards are inserted.',
    descriptionVi: 'Thiết bị loa rèn phản xạ nghe - phát âm nhí, tự động đọc từ vựng và câu khi cắm thẻ bài tương ứng.',
    categoryName: 'Thiết bị Nghe nhìn',
    resourceType: 'audio_visual',
    priceType: 'paid',
    priceEn: '$22 / Unit',
    priceVi: '490.000 VNĐ / Bộ',
    grade: 'Grade 1 - 4',
    fileType: 'Thiết bị điện tử',
    previewUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    downloadCount: 0,
    specificationsEn: ['Rechargeable battery via Type-C', 'Includes 112 double-sided cards (224 words)', 'Native accent speaker'],
    specificationsVi: ['Pin sạc cổng Type-C tiện lợi', 'Kèm 112 thẻ 2 mặt (224 từ vựng)', 'Giọng phát âm chuẩn bản ngữ'],
    tags: ['Audio', 'Devices', 'Phonics'],
    isFeatured: true,
    isPublished: true,
    createdAt: '2025-12-05'
  }
];

const INITIAL_RESOURCE_ORDERS: ResourceOrder[] = [
  {
    id: 'ro1',
    resourceId: 'res1',
    resourceTitle: 'Bộ Sách Truyện Tranh Ngữ Âm Phonics Fun (Tập 1 - 3)',
    fullName: 'Lê Minh Hoàng (Phụ huynh bé Khánh An)',
    phone: '0987654321',
    email: 'hoang.le@gmail.com',
    address: '123 Ba Tháng Hai, Phường 11, Quận 10, TP.HCM',
    note: 'Giao hàng giờ hành chính giúp mình.',
    resourcePrice: '180.000 VNĐ / Bộ',
    discountPrice: '',
    status: 'new',
    createdAt: '2026-02-07 11:20'
  }
];

const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog1',
    slug: '5-effective-gamification-strategies-primary-english',
    titleEn: '5 Proven Gamification Strategies to Boost Primary English Engagement',
    titleVi: '5 Chiến Lược Học Qua Trò Chơi Giúp Học Sinh Tiểu Học Hào Hứng Học Tiếng Anh',
    excerptEn: 'Discover practical, low-prep games that instantly transform passive classrooms into active language learning environments.',
    excerptVi: 'Khám phá các trò chơi lớp học dễ chuẩn bị giúp biến giờ học thụ động thành môi trường tương tác sôi nổi.',
    contentEn: 'Gamification is about creating meaningful motivation in language learning.',
    contentVi: 'Gamification giúp tạo động lực học tập tự nhiên và hào hứng cho học sinh.',
    featuredImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    galleryUrls: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    categoryName: 'Teaching Tips',
    tags: ['Gamification', 'Classroom Management'],
    author: 'Nguyễn Trọng Huy Hoàng',
    readingTimeEn: '5 min read',
    readingTimeVi: '5 phút đọc',
    status: 'published',
    isFeatured: true,
    publishedAt: '2026-02-01',
    createdAt: '2026-02-01'
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach1',
    titleEn: 'Excellent Teacher Award (District Level)',
    titleVi: 'Danh Hiệu Giáo Viên Dạy Giỏi Cấp Quận 10',
    organizationEn: 'People’s Committee & Department of Education, District 10, HCMC',
    organizationVi: 'Ủy ban Nhân dân & Phòng Giáo dục và Đào tạo Quận 10, TP.HCM',
    date: '2025',
    category: 'Awards',
    certificateUrl: 'https://images.unsplash.com/photo-1589330694653-aded6fac0244?auto=format&fit=crop&q=80&w=600',
    descriptionEn: 'Awarded for outstanding innovation in primary English teaching methods and EdTech application.',
    descriptionVi: 'Khen thưởng cho thành tích xuất sắc trong đổi mới phương pháp dạy tiếng Anh tiểu học và ứng dụng CNTT.'
  }
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal1',
    titleEn: 'Interactive English Speaking Station in Class 4B',
    titleVi: 'Góc Luyện Nói Tiếng Anh Tương Tác Lớp 4B',
    category: 'Classroom',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    descriptionEn: 'Students enthusiastically recording voice roleplay at classroom stations.',
    descriptionVi: 'Học sinh hào hứng thu âm bài hội thoại đóng vai tại trạm học tập.',
    isPublished: true,
    createdAt: '2026-01-15'
  }
];

const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteTitleEn: 'Nguyen Trong Huy Hoang - Digital Teacher Portfolio',
  siteTitleVi: 'Nguyễn Trọng Huy Hoàng - Digital Teacher Portfolio',
  logoText: 'Huy Hoang English',
  primaryColor: '#0284C7',
  secondaryColor: '#0F172A',
  contactEmail: 'teacherhuyhoang@gmail.com',
  contactPhone: '0987654321',
  websiteUrl: 'https://teacherhuyhoang.com',
  notificationEmail: 'teacherhuyhoang@gmail.com',
  defaultLanguage: 'vi',
  defaultTheme: 'dark',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  linkedinUrl: 'https://linkedin.com',
  footerTextEn: '© 2026 Teacher Nguyen Trong Huy Hoang. Duong Minh Chau Primary School.',
  footerTextVi: '© 2026 Thầy giáo Nguyễn Trọng Huy Hoàng. Trường TH Dương Minh Châu.',
  footerCopyrightEn: '© 2026 Teacher Nguyen Trong Huy Hoang. Duong Minh Chau Primary School.',
  footerCopyrightVi: '© 2026 Thầy giáo Nguyễn Trọng Huy Hoàng. Trường TH Dương Minh Châu.',
  footerTaglineEn: 'Crafted with ❤️ for Primary Education',
  footerTaglineVi: 'Được tạo với ❤️ cho Giáo Dục',
  showBlogMenu: true,
  showGalleryMenu: true,
  showProjectsMenu: true,
  showAchievementsMenu: true,
  adminPassword: 'Admin@123',
  superAdminPassword: 'Admin@2020',
  clientAdminAccounts: [
    {
      id: 'ca_default',
      email: 'teacherhuyhoang@gmail.com',
      password: 'Admin@123',
      name: 'Tài khoản bàn giao Khách hàng',
      role: 'client_admin',
      createdAt: '2026-01-01'
    }
  ],
  enableEmailNotification: true,
  emailProvider: 'direct_web',
  emailjsServiceId: '',
  emailjsTemplateIdCustomer: '',
  emailjsTemplateIdAdmin: '',
  emailjsPublicKey: '',
  bankName: 'Ngân hàng VPBank',
  bankAccountNo: '268330518',
  bankAccountHolder: 'HUỲNH KIM HƯNG',
  bankCode: 'VPB'
};

// STORAGE & DISK PERSISTENCE HELPERS
let diskHydrated = false;

const hydrateFromDisk = async (): Promise<boolean> => {
  if (diskHydrated || typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/db-load');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (key.startsWith('db_')) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        diskHydrated = true;
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
};

const syncToDisk = () => {
  if (typeof window !== 'undefined') {
    try {
      const fullSnapshot = {
        db_profile: getStorageItem('db_profile', INITIAL_PROFILE),
        db_hero: getStorageItem('db_hero', INITIAL_HERO),
        db_settings: getStorageItem('db_settings', INITIAL_SITE_SETTINGS),
        db_teaching: getStorageItem('db_teaching', INITIAL_TEACHING_APPROACHES),
        db_projects: getStorageItem('db_projects', INITIAL_PROJECTS),
        db_courses: getStorageItem('db_courses', INITIAL_COURSES),
        db_resources: getStorageItem('db_resources_v3', INITIAL_RESOURCES),
        db_blog: getStorageItem('db_blog', INITIAL_BLOG_POSTS),
        db_achievements: getStorageItem('db_achievements', INITIAL_ACHIEVEMENTS),
        db_gallery: getStorageItem('db_gallery', INITIAL_GALLERY)
      };
      fetch('/api/db-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullSnapshot)
      }).catch(() => {});
    } catch {
      // ignore network error
    }
  }
};

const getStorageItem = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    const diskVal = (initialDiskDb as Record<string, any>)[key];
    const valToUse = diskVal !== undefined ? diskVal : defaultVal;
    localStorage.setItem(key, JSON.stringify(valToUse));
    return valToUse as T;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultVal;
  }
};

const isValidUUID = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const SETTINGS_ROW_ID = '00000000-0000-0000-0000-000000000001';
const PROFILE_ROW_ID  = '00000000-0000-0000-0000-000000000002';
const HERO_ROW_ID     = '00000000-0000-0000-0000-000000000003';

const syncToSupabase = async (key: string, val: any) => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    if (key === 'db_profile') {
      const p = val as Profile;
      let targetId = PROFILE_ROW_ID;
      try {
        const existing = await supabase.from('profiles').select('id').order('updated_at', { ascending: false }).limit(1).maybeSingle();
        if (existing?.data?.id) {
          targetId = existing.data.id;
        }
      } catch (e) {
        console.warn('Could not query existing profile id:', e);
      }

      const payload = {
        id: targetId,
        full_name: p.fullName,
        full_name_en: p.fullNameEn || p.fullName,
        title_en: p.titleEn || '',
        title_vi: p.titleVi || '',
        school_en: p.schoolEn || '',
        school_vi: p.schoolVi || '',
        location_en: p.locationEn || '',
        location_vi: p.locationVi || '',
        admin_email: p.adminEmail || '',
        phone: p.phone || '',
        brand_message_en: p.brandMessageEn || '',
        brand_message_vi: p.brandMessageVi || '',
        avatar_url: p.avatarUrl || '',
        bio_en: p.bioEn || '',
        bio_vi: p.bioVi || '',
        skills: p.skills || [],
        philosophy_text_vi: p.philosophyTextVi || '',
        philosophy_text_en: p.philosophyTextEn || '',
        education_history: p.educationHistory || [],
        experience_years: p.experienceYears ?? 25,
        completed_projects_count: p.completedProjectsCount ?? 15,
        teaching_resources_count: p.teachingResourcesCount ?? 50,
        happy_students_count: p.happyStudentsCount ?? 4500,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Full profile upsert failed, retrying with core columns:', error.message);
        const { philosophy_text_vi, philosophy_text_en, education_history, phone, completed_projects_count, teaching_resources_count, happy_students_count, ...corePayload } = payload;
        await supabase.from('profiles').upsert(corePayload, { onConflict: 'id' });
      }
    } else if (key === 'db_hero') {
      const h = val as HeroSettings;
      let targetId = HERO_ROW_ID;
      try {
        const existing = await supabase.from('hero_settings').select('id').limit(1).maybeSingle();
        if (existing?.data?.id) {
          targetId = existing.data.id;
        }
      } catch (e) {
        console.warn('Could not query existing hero id:', e);
      }

      await supabase.from('hero_settings').upsert({
        id: targetId,
        headline_en: h.headlineEn || '',
        headline_vi: h.headlineVi || '',
        subtitle_en: h.subtitleEn || '',
        subtitle_vi: h.subtitleVi || '',
        avatar_url: h.avatarUrl || '',
        background_url: h.backgroundUrl || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } else if (key === 'db_teaching' || key === 'db_teaching_approaches') {
      const list = val as TeachingApproach[];
      if (list && Array.isArray(list)) {
        const rows = list.map((ap, i) => ({
          ...(isValidUUID(ap.id) ? { id: ap.id } : {}),
          title_en: ap.titleEn || '',
          title_vi: ap.titleVi || '',
          description_en: ap.descriptionEn || '',
          description_vi: ap.descriptionVi || '',
          icon: ap.icon || 'Sparkles',
          image_url: ap.imageUrl || '',
          order_index: ap.orderIndex ?? (i + 1),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('teaching_approaches').upsert(rows);
      }
    } else if (key === 'db_projects') {
      const list = val as Project[];
      if (list && Array.isArray(list)) {
        const rows = list.map(p => ({
          ...(isValidUUID(p.id) ? { id: p.id } : {}),
          slug: p.slug,
          title_en: p.titleEn || '',
          title_vi: p.titleVi || '',
          category_name: p.categoryName || '',
          grade: p.grade || '',
          year: p.year || '',
          description_en: p.descriptionEn || '',
          description_vi: p.descriptionVi || '',
          objectives_en: p.objectivesEn || [],
          objectives_vi: p.objectivesVi || [],
          activities_en: p.activitiesEn || [],
          activities_vi: p.activitiesVi || [],
          methods_en: p.methodsEn || [],
          methods_vi: p.methodsVi || [],
          outcomes_en: p.outcomesEn || [],
          outcomes_vi: p.outcomesVi || [],
          thumbnail_url: p.thumbnailUrl || '',
          gallery_urls: p.galleryUrls || [],
          video_url: p.videoUrl || '',
          attachments: p.attachments || [],
          tags: p.tags || [],
          is_featured: p.isFeatured !== false,
          is_published: p.isPublished !== false,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('projects').upsert(rows, { onConflict: 'slug' });
      }
    } else if (key === 'db_courses') {
      const list = val as Course[];
      if (list && Array.isArray(list)) {
        const rows = list.map(c => ({
          ...(isValidUUID(c.id) ? { id: c.id } : {}),
          slug: c.slug,
          title_en: c.titleEn || '',
          title_vi: c.titleVi || '',
          category_name: c.categoryName || '',
          price_type: c.priceType || 'free',
          price_en: c.priceEn || 'Free',
          price_vi: c.priceVi || 'Miễn phí',
          discount_price_en: c.discountPriceEn || '',
          discount_price_vi: c.discountPriceVi || '',
          grade_level: c.gradeLevel || '',
          duration_en: c.durationEn || '',
          duration_vi: c.durationVi || '',
          schedule_en: c.scheduleEn || '',
          schedule_vi: c.scheduleVi || '',
          description_en: c.descriptionEn || '',
          description_vi: c.descriptionVi || '',
          objectives_en: c.objectivesEn || [],
          objectives_vi: c.objectivesVi || [],
          curriculum_en: c.curriculumEn || [],
          curriculum_vi: c.curriculumVi || [],
          thumbnail_url: c.thumbnailUrl || '',
          video_url: c.videoUrl || '',
          registration_form_url: c.registrationFormUrl || '',
          is_featured: c.isFeatured !== false,
          is_published: c.isPublished !== false,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('courses').upsert(rows, { onConflict: 'slug' });
        if (error) {
          console.warn('Full courses upsert failed, retrying without optional schema columns:', error.message);
          const coreRows = rows.map(({ discount_price_en, discount_price_vi, grade_level_en, category_en, registration_form_url, updated_at, ...core }: any) => core);
          await supabase.from('courses').upsert(coreRows, { onConflict: 'slug' });
        }
      }
    } else if (key === 'db_resources_v3' || key === 'db_resources') {
      const list = val as TeachingResource[];
      if (list && Array.isArray(list)) {
        const rows = list.map(r => ({
          ...(isValidUUID(r.id) ? { id: r.id } : {}),
          slug: r.slug,
          title_en: r.titleEn || '',
          title_vi: r.titleVi || '',
          description_en: r.descriptionEn || '',
          description_vi: r.descriptionVi || '',
          category_name: r.categoryName || '',
          category_en: r.categoryEn || r.categoryName || '',
          resource_type: r.resourceType || 'digital_file',
          price_type: r.priceType || 'free',
          price_en: r.priceEn || 'Free',
          price_vi: r.priceVi || 'Miễn phí',
          discount_price_en: r.discountPriceEn || '',
          discount_price_vi: r.discountPriceVi || '',
          grade: r.grade || '',
          grade_en: r.gradeEn || r.grade || '',
          file_type: r.fileType || 'PDF',
          file_type_en: r.fileTypeEn || r.fileType || 'PDF',
          file_url: r.fileUrl || '',
          preview_url: r.previewUrl || '',
          gallery_urls: r.galleryUrls || [],
          video_url: r.videoUrl || '',
          download_count: r.downloadCount || 0,
          specifications_en: r.specificationsEn || [],
          specifications_vi: r.specificationsVi || [],
          tags: r.tags || [],
          is_featured: r.isFeatured ?? false,
          is_published: r.isPublished !== false,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('resources').upsert(rows, { onConflict: 'slug' });
        if (error) {
          console.warn('Full resources upsert failed, retrying without optional schema columns:', error.message);
          const coreRows = rows.map(({ file_type_en, specifications_en, specifications_vi, category_en, grade_en, discount_price_en, discount_price_vi, updated_at, ...core }: any) => core);
          await supabase.from('resources').upsert(coreRows, { onConflict: 'slug' });
        }
      }
    } else if (key === 'db_blog' || key === 'db_posts') {
      const list = val as BlogPost[];
      if (list && Array.isArray(list)) {
        const rows = list.map(b => ({
          ...(isValidUUID(b.id) ? { id: b.id } : {}),
          slug: b.slug,
          title_en: b.titleEn || '',
          title_vi: b.titleVi || '',
          excerpt_en: b.excerptEn || '',
          excerpt_vi: b.excerptVi || '',
          content_en: b.contentEn || '',
          content_vi: b.contentVi || '',
          featured_image: b.featuredImage || '',
          category_name: b.categoryName || '',
          tags: b.tags || [],
          author: b.author || 'Nguyễn Trọng Huy Hoàng',
          reading_time_en: b.readingTimeEn || '5 min read',
          reading_time_vi: b.readingTimeVi || '5 phút đọc',
          status: b.status || 'published',
          is_featured: b.isFeatured !== false,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('blog_posts').upsert(rows, { onConflict: 'slug' });
      }
    } else if (key === 'db_achievements') {
      const list = val as Achievement[];
      if (list && Array.isArray(list)) {
        const rows = list.map((ac, i) => ({
          ...(isValidUUID(ac.id) ? { id: ac.id } : {}),
          title_en: ac.titleEn || '',
          title_vi: ac.titleVi || '',
          organization_en: ac.organizationEn || '',
          organization_vi: ac.organizationVi || '',
          date: ac.date || '',
          category: ac.category || '',
          certificate_url: ac.certificateUrl || '',
          description_en: ac.descriptionEn || '',
          description_vi: ac.descriptionVi || '',
          order_index: ac.orderIndex ?? (i + 1),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('achievements').upsert(rows);
      }
    } else if (key === 'db_gallery') {
      const list = val as GalleryItem[];
      if (list && Array.isArray(list)) {
        const rows = list.map((g, i) => ({
          ...(isValidUUID(g.id) ? { id: g.id } : {}),
          title_en: g.titleEn || '',
          title_vi: g.titleVi || '',
          category: g.category || '',
          media_type: g.mediaType || 'image',
          media_url: g.mediaUrl || '',
          thumbnail_url: g.thumbnailUrl || '',
          description_en: g.descriptionEn || '',
          description_vi: g.descriptionVi || '',
          is_published: g.isPublished !== false,
          order_index: g.orderIndex ?? (i + 1),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('gallery_items').upsert(rows);
      }
    } else if (key === 'db_student_works') {
      const list = val as StudentWork[];
      if (list && Array.isArray(list)) {
        const rows = list.map(sw => ({
          ...(isValidUUID(sw.id) ? { id: sw.id } : {}),
          title_en: sw.titleEn || '',
          title_vi: sw.titleVi || '',
          student_name: sw.studentName || '',
          description_en: sw.descriptionEn || '',
          description_vi: sw.descriptionVi || '',
          objective_en: sw.objectiveEn || '',
          objective_vi: sw.objectiveVi || '',
          image_url: sw.imageUrl || sw.mediaUrl || '',
          privacy_mode: sw.privacyMode || 'public',
          is_published: sw.isPublished !== false,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('student_works').upsert(rows);
      }
    } else if (key === 'db_media') {
      const list = val as MediaFile[];
      if (list && Array.isArray(list)) {
        const rows = list.map((m: any) => {
          let rawSize = 0;
          if (typeof m.size === 'number') {
            rawSize = m.size;
          } else if (typeof m.fileSize === 'number') {
            rawSize = m.fileSize;
          } else if (typeof m.size === 'string') {
            const num = parseFloat(m.size.replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) {
              if (m.size.toLowerCase().includes('mb')) rawSize = Math.round(num * 1024 * 1024);
              else if (m.size.toLowerCase().includes('kb')) rawSize = Math.round(num * 1024);
              else rawSize = Math.round(num);
            }
          }

          return {
            ...(isValidUUID(m.id) ? { id: m.id } : {}),
            filename: m.name || m.filename || 'media-file.jpg',
            file_url: m.url || m.fileUrl || 'https://example.com/media.jpg',
            file_type: m.type || m.fileType || 'image',
            file_size: rawSize,
            bucket_name: 'media',
            updated_at: new Date().toISOString()
          };
        });
        await supabase.from('media_library').upsert(rows);
      }
    } else if (key === 'db_settings' || key === 'db_site_settings') {
      const s = val as SiteSettings;
      let targetId = SETTINGS_ROW_ID;
      try {
        const existing = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
        if (existing?.data?.id) {
          targetId = existing.data.id;
        }
      } catch (e) {
        console.warn('Could not query existing settings id:', e);
      }

      await supabase.from('site_settings').upsert({
        id: targetId,
        site_title_en: s.siteTitleEn || '',
        site_title_vi: s.siteTitleVi || '',
        logo_text: s.logoText || '',
        logo_url: s.logoUrl || '',
        favicon_url: s.faviconUrl || '',
        primary_color: s.primaryColor || '',
        secondary_color: s.secondaryColor || '',
        contact_email: s.contactEmail || '',
        contact_phone: s.contactPhone || '',
        website_url: s.websiteUrl || '',
        notification_email: s.notificationEmail || '',
        default_language: s.defaultLanguage || 'vi',
        default_theme: s.defaultTheme || 'light',
        facebook_url: s.facebookUrl || '',
        youtube_url: s.youtubeUrl || '',
        tiktok_url: s.tiktokUrl || '',
        instagram_url: s.instagramUrl || '',
        linkedin_url: s.linkedinUrl || '',
        footer_text_en: s.footerTextEn || '',
        footer_text_vi: s.footerTextVi || '',
        client_admin_accounts: s.clientAdminAccounts || [],
        enable_email_notification: s.enableEmailNotification,
        email_provider: s.emailProvider || '',
        emailjs_service_id: s.emailjsServiceId || '',
        emailjs_template_id_customer: s.emailjsTemplateIdCustomer || '',
        emailjs_template_id_admin: s.emailjsTemplateIdAdmin || '',
        emailjs_public_key: s.emailjsPublicKey || '',
        bank_name: s.bankName || '',
        bank_account_no: s.bankAccountNo || '',
        bank_account_holder: s.bankAccountHolder || '',
        bank_code: s.bankCode || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } else if (key === 'db_course_regs') {
      const list = val as CourseRegistration[];
      if (list && list.length > 0) {
        const item = list[0];
        await supabase.from('course_registrations').insert({
          course_title: item.courseTitle,
          full_name: item.fullName,
          phone: item.phone,
          email: item.email,
          grade_level: item.gradeLevel,
          note: item.note || '',
          status: item.status || 'new',
          created_at: new Date().toISOString()
        });
      }
    } else if (key === 'db_resource_orders_v2' || key === 'db_resource_orders') {
      const list = val as ResourceOrder[];
      if (list && list.length > 0) {
        const item = list[0];
        await supabase.from('resource_orders').insert({
          resource_title: item.resourceTitle,
          full_name: item.fullName,
          phone: item.phone,
          email: item.email,
          address: item.address || '',
          note: item.note || '',
          status: item.status || 'new',
          created_at: new Date().toISOString()
        });
      }
    } else if (key === 'db_contact_messages' || key === 'db_messages') {
      const list = val as ContactMessage[];
      if (list && list.length > 0) {
        const item = list[0];
        await supabase.from('contact_messages').insert({
          full_name: item.fullName,
          email: item.email,
          subject: item.subject,
          message: item.message,
          status: item.status || 'new',
          created_at: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error('Supabase Cloud Sync Exception:', err);
  }
};

const setStorageItem = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
  if (key === 'db_resources_v3') {
    localStorage.setItem('db_resources', JSON.stringify(val));
  } else if (key === 'db_resources') {
    localStorage.setItem('db_resources_v3', JSON.stringify(val));
  } else if (key === 'db_blog') {
    localStorage.setItem('db_posts', JSON.stringify(val));
  } else if (key === 'db_posts') {
    localStorage.setItem('db_blog', JSON.stringify(val));
  } else if (key === 'db_teaching') {
    localStorage.setItem('db_teaching_approaches', JSON.stringify(val));
  } else if (key === 'db_teaching_approaches') {
    localStorage.setItem('db_teaching', JSON.stringify(val));
  } else if (key === 'db_settings') {
    localStorage.setItem('db_site_settings', JSON.stringify(val));
  } else if (key === 'db_site_settings') {
    localStorage.setItem('db_settings', JSON.stringify(val));
  }
  syncToDisk();
  syncToSupabase(key, val);
};

export const DB = {
  async syncAllDataToSupabase(): Promise<{ success: boolean; count: number; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, count: 0, message: 'Chưa cấu hình VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY trong file .env.local!' };
    }

    try {
      let totalSynced = 0;

      // 1. Profile
      try {
        const prof = await this.getProfile();
        if (prof) {
          await syncToSupabase('db_profile', prof);
          totalSynced += 1;
        }
      } catch (err) {
        console.error('Profiles Sync Error:', err);
      }

      // 2. Hero Settings
      try {
        const hero = await this.getHeroSettings();
        if (hero) {
          await syncToSupabase('db_hero', hero);
          totalSynced += 1;
        }
      } catch (err) {
        console.error('Hero Sync Error:', err);
      }

      // 3. Teaching Approaches
      try {
        const approaches = await this.getTeachingApproaches();
        if (approaches && approaches.length > 0) {
          await syncToSupabase('db_teaching', approaches);
          totalSynced += approaches.length;
        }
      } catch (err) {
        console.error('Teaching Approaches Sync Error:', err);
      }

      // 4. Projects
      try {
        const projects = await this.getProjects();
        if (projects && projects.length > 0) {
          await syncToSupabase('db_projects', projects);
          totalSynced += projects.length;
        }
      } catch (err) {
        console.error('Projects Sync Error:', err);
      }

      // 5. Courses
      try {
        const courses = await this.getCourses();
        if (courses && courses.length > 0) {
          await syncToSupabase('db_courses', courses);
          totalSynced += courses.length;
        }
      } catch (err) {
        console.error('Courses Sync Error:', err);
      }

      // 6. Course Registrations
      try {
        const courseRegs = await this.getCourseRegistrations();
        if (courseRegs && courseRegs.length > 0) {
          totalSynced += courseRegs.length;
        }
      } catch (err) {
        console.error('Course Registrations Sync Error:', err);
      }

      // 7. Student Works
      try {
        const studentWorks = await this.getStudentWorks();
        if (studentWorks && studentWorks.length > 0) {
          await syncToSupabase('db_student_works', studentWorks);
          totalSynced += studentWorks.length;
        }
      } catch (err) {
        console.error('Student Works Sync Error:', err);
      }

      // 8. Resources
      try {
        const resources = await this.getResources();
        if (resources && resources.length > 0) {
          await syncToSupabase('db_resources_v3', resources);
          totalSynced += resources.length;
        }
      } catch (err) {
        console.error('Resources Sync Error:', err);
      }

      // 9. Resource Orders
      try {
        const resourceOrders = await this.getResourceOrders();
        if (resourceOrders && resourceOrders.length > 0) {
          totalSynced += resourceOrders.length;
        }
      } catch (err) {
        console.error('Resource Orders Sync Exception:', err);
      }

      // 10. Blog Posts
      try {
        const blogs = await this.getBlogPosts();
        if (blogs && blogs.length > 0) {
          await syncToSupabase('db_blog', blogs);
          totalSynced += blogs.length;
        }
      } catch (err) {
        console.error('Blog Posts Sync Error:', err);
      }

      // 11. Achievements
      try {
        const achievements = await this.getAchievements();
        if (achievements && achievements.length > 0) {
          await syncToSupabase('db_achievements', achievements);
          totalSynced += achievements.length;
        }
      } catch (err) {
        console.error('Achievements Sync Error:', err);
      }

      // 12. Gallery Items
      try {
        const gallery = await this.getGalleryItems();
        if (gallery && gallery.length > 0) {
          await syncToSupabase('db_gallery', gallery);
          totalSynced += gallery.length;
        }
      } catch (err) {
        console.error('Gallery Sync Error:', err);
      }

      // 13. Contact Messages
      try {
        const contactMsgs = await this.getContactMessages();
        if (contactMsgs && contactMsgs.length > 0) {
          totalSynced += contactMsgs.length;
        }
      } catch (err) {
        console.error('Contact Messages Sync Error:', err);
      }

      // 14. Site Settings
      try {
        const settings = await this.getSiteSettings();
        await supabase.from('site_settings').delete().neq('id', SETTINGS_ROW_ID);
        await syncToSupabase('db_settings', settings);
        totalSynced += 1;
      } catch (err) {
        console.error('Site Settings Sync Error:', err);
      }

      return {
        success: true,
        count: totalSynced,
        message: `Đã đồng bộ thành công tất cả dữ liệu lên Supabase Cloud Database!`
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: `Lỗi đồng bộ Supabase: ${err?.message || 'Không thể kết nối'}`
      };
    }
  },

  async initDiskSync(): Promise<void> {
    const hydrated = await hydrateFromDisk();
    if (hydrated && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('site-settings-updated'));
      window.dispatchEvent(new Event('profile-updated'));
    }
  },

  // PROFILE
  // PROFILE
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      try {
        let { data, error } = await supabase.from('profiles').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle();
        if (data && !error) {
          const cachedProf = (() => {
            try {
              const p = localStorage.getItem('db_profile');
              return p ? JSON.parse(p) : null;
            } catch { return null; }
          })();
          const prof: Profile = {
            id: data.id || cachedProf?.id || 'p1',
            fullName: data.full_name || cachedProf?.fullName || INITIAL_PROFILE.fullName,
            fullNameEn: data.full_name_en || cachedProf?.fullNameEn || INITIAL_PROFILE.fullNameEn,
            titleEn: data.title_en || cachedProf?.titleEn || INITIAL_PROFILE.titleEn,
            titleVi: data.title_vi || cachedProf?.titleVi || INITIAL_PROFILE.titleVi,
            schoolEn: (data.school_en !== null && data.school_en !== undefined) ? data.school_en : (cachedProf?.schoolEn ?? INITIAL_PROFILE.schoolEn),
            schoolVi: (data.school_vi !== null && data.school_vi !== undefined) ? data.school_vi : (cachedProf?.schoolVi ?? INITIAL_PROFILE.schoolVi),
            locationEn: data.location_en || cachedProf?.locationEn || INITIAL_PROFILE.locationEn,
            locationVi: data.location_vi || cachedProf?.locationVi || INITIAL_PROFILE.locationVi,
            adminEmail: data.admin_email || cachedProf?.adminEmail || INITIAL_PROFILE.adminEmail,
            phone: data.phone || cachedProf?.phone || INITIAL_PROFILE.phone || '0987654321',
            brandMessageEn: data.brand_message_en || cachedProf?.brandMessageEn || INITIAL_PROFILE.brandMessageEn,
            brandMessageVi: data.brand_message_vi || cachedProf?.brandMessageVi || INITIAL_PROFILE.brandMessageVi,
            avatarUrl: data.avatar_url || cachedProf?.avatarUrl || INITIAL_PROFILE.avatarUrl,
            bioEn: data.bio_en || cachedProf?.bioEn || INITIAL_PROFILE.bioEn,
            bioVi: data.bio_vi || cachedProf?.bioVi || INITIAL_PROFILE.bioVi,
            skills: (data.skills && data.skills.length > 0) ? data.skills : (cachedProf?.skills || INITIAL_PROFILE.skills),
            philosophyTextVi: data.philosophy_text_vi || cachedProf?.philosophyTextVi || INITIAL_PROFILE.philosophyTextVi,
            philosophyTextEn: data.philosophy_text_en || cachedProf?.philosophyTextEn || INITIAL_PROFILE.philosophyTextEn,
            educationHistory: (data.education_history && data.education_history.length > 0) ? data.education_history : (cachedProf?.educationHistory || INITIAL_PROFILE.educationHistory),
            experienceYears: data.experience_years ?? (cachedProf?.experienceYears ?? INITIAL_PROFILE.experienceYears),
            completedProjectsCount: data.completed_projects_count ?? (cachedProf?.completedProjectsCount ?? INITIAL_PROFILE.completedProjectsCount),
            teachingResourcesCount: data.teaching_resources_count ?? (cachedProf?.teachingResourcesCount ?? INITIAL_PROFILE.teachingResourcesCount),
            happyStudentsCount: data.happy_students_count ?? (cachedProf?.happyStudentsCount ?? INITIAL_PROFILE.happyStudentsCount)
          };
          localStorage.setItem('db_profile', JSON.stringify(prof));
          return prof;
        }
      } catch (err) {
        console.error('Failed to load profile from Supabase:', err);
      }
    }
    const prof = getStorageItem('db_profile', INITIAL_PROFILE);
    let updated = false;
    if (!prof.avatarUrl) {
      prof.avatarUrl = INITIAL_PROFILE.avatarUrl;
      updated = true;
    }
    if (updated) {
      setStorageItem('db_profile', prof);
    }
    return prof;
  },

  async updateProfile(profile: Profile): Promise<Profile> {
    setStorageItem('db_profile', profile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profile-updated'));
    }
    return profile;
  },

  // HERO SETTINGS
  async getHeroSettings(): Promise<HeroSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        let { data, error } = await supabase.from('hero_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle();
        if (data && !error) {
          const cachedHero = (() => {
            try {
              const h = localStorage.getItem('db_hero');
              return h ? JSON.parse(h) : null;
            } catch { return null; }
          })();
          const hero: HeroSettings = {
            headlineEn: data.headline_en || cachedHero?.headlineEn || INITIAL_HERO.headlineEn,
            headlineVi: data.headline_vi || cachedHero?.headlineVi || INITIAL_HERO.headlineVi,
            subtitleEn: data.subtitle_en || cachedHero?.subtitleEn || INITIAL_HERO.subtitleEn,
            subtitleVi: data.subtitle_vi || cachedHero?.subtitleVi || INITIAL_HERO.subtitleVi,
            avatarUrl: data.avatar_url || cachedHero?.avatarUrl || INITIAL_HERO.avatarUrl,
            backgroundUrl: data.background_url || cachedHero?.backgroundUrl || INITIAL_HERO.backgroundUrl
          };
          localStorage.setItem('db_hero', JSON.stringify(hero));
          return hero;
        }
      } catch (err) {
        console.error('Failed to load hero settings from Supabase:', err);
      }
    }
    const hero = getStorageItem('db_hero', INITIAL_HERO);
    let updated = false;
    if (!hero.avatarUrl) {
      hero.avatarUrl = INITIAL_HERO.avatarUrl;
      updated = true;
    }
    if (updated) {
      setStorageItem('db_hero', hero);
    }
    return hero;
  },

  async updateHeroSettings(hero: HeroSettings): Promise<HeroSettings> {
    setStorageItem('db_hero', hero);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profile-updated'));
    }
    return hero;
  },

  // TEACHING APPROACHES
  async getTeachingApproaches(): Promise<TeachingApproach[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('teaching_approaches').select('*').order('order_index', { ascending: true });
        if (data && !error && data.length > 0) {
          const cachedApproaches: TeachingApproach[] = (() => {
            try {
              const ta = localStorage.getItem('db_teaching');
              return ta ? JSON.parse(ta) : [];
            } catch { return []; }
          })();

          const list: TeachingApproach[] = data.map((item, idx) => {
            const cachedMatch = cachedApproaches.find(x => x.id === item.id);
            return {
              id: item.id,
              titleEn: cachedMatch?.titleEn || item.title_en,
              titleVi: cachedMatch?.titleVi || item.title_vi,
              descriptionEn: cachedMatch?.descriptionEn || item.description_en,
              descriptionVi: cachedMatch?.descriptionVi || item.description_vi,
              icon: cachedMatch?.icon || item.icon || 'Sparkles',
              imageUrl: cachedMatch?.imageUrl || item.image_url || '',
              orderIndex: item.order_index ?? (cachedMatch?.orderIndex ?? (idx + 1))
            };
          });

          cachedApproaches.forEach(cached => {
            if (!list.some(x => x.id === cached.id)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_teaching', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load teaching approaches from Supabase:', err);
      }
    }
    const list = getStorageItem('db_teaching', INITIAL_TEACHING_APPROACHES);
    return list
      .map((item, idx) => ({
        ...item,
        orderIndex: item.orderIndex ?? (idx + 1),
        titleEn: item.titleEn && item.titleEn.trim() ? item.titleEn : item.titleVi,
        descriptionEn: item.descriptionEn && item.descriptionEn.trim() ? item.descriptionEn : item.descriptionVi
      }))
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async saveTeachingApproach(item: TeachingApproach): Promise<TeachingApproach[]> {
    const list = getStorageItem('db_teaching', INITIAL_TEACHING_APPROACHES);
    const index = list.findIndex(x => x.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push({ ...item, id: 'ta_' + Date.now(), orderIndex: list.length + 1 });
    }
    setStorageItem('db_teaching', list);
    return this.getTeachingApproaches();
  },

  async duplicateTeachingApproach(id: string): Promise<TeachingApproach[]> {
    const list = getStorageItem('db_teaching', INITIAL_TEACHING_APPROACHES);
    const target = list.find(x => x.id === id);
    if (target) {
      const copy: TeachingApproach = {
        ...target,
        id: 'ta_' + Date.now(),
        titleVi: target.titleVi + ' (Bản sao)',
        titleEn: target.titleEn + ' (Copy)',
        orderIndex: list.length + 1
      };
      list.push(copy);
      setStorageItem('db_teaching', list);
    }
    return this.getTeachingApproaches();
  },

  async reorderTeachingApproaches(id: string, direction: 'up' | 'down'): Promise<TeachingApproach[]> {
    const list = await this.getTeachingApproaches();
    const index = list.findIndex(x => x.id === id);
    if (index < 0) return list;

    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }

    list.forEach((item, idx) => {
      item.orderIndex = idx + 1;
    });

    setStorageItem('db_teaching', list);
    return list;
  },

  async deleteTeachingApproach(id: string): Promise<TeachingApproach[]> {
    let list = getStorageItem('db_teaching', INITIAL_TEACHING_APPROACHES);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_teaching', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('teaching_approaches').delete().eq('id', id);
    }
    return this.getTeachingApproaches();
  },

  // PROJECTS
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedProjects: Project[] = (() => {
            try {
              const p = localStorage.getItem('db_projects');
              return p ? JSON.parse(p) : [];
            } catch { return []; }
          })();

          const list: Project[] = data.map((p) => {
            const cachedMatch = cachedProjects.find(x => x.id === p.id || x.slug === p.slug);
            return {
              id: p.id,
              slug: cachedMatch?.slug || p.slug,
              titleEn: cachedMatch?.titleEn || p.title_en || '',
              titleVi: cachedMatch?.titleVi || p.title_vi || '',
              categoryName: cachedMatch?.categoryName || p.category_name || '',
              categoryEn: cachedMatch?.categoryEn || p.category_en || p.category_name || '',
              grade: cachedMatch?.grade || p.grade || '',
              gradeEn: cachedMatch?.gradeEn || p.grade_en || p.grade || '',
              year: cachedMatch?.year || p.year || '',
              descriptionEn: cachedMatch?.descriptionEn || p.description_en || '',
              descriptionVi: cachedMatch?.descriptionVi || p.description_vi || '',
              objectivesEn: (cachedMatch?.objectivesEn && cachedMatch.objectivesEn.length > 0) ? cachedMatch.objectivesEn : ((p.objectives_en && p.objectives_en.length > 0) ? p.objectives_en : []),
              objectivesVi: (cachedMatch?.objectivesVi && cachedMatch.objectivesVi.length > 0) ? cachedMatch.objectivesVi : ((p.objectives_vi && p.objectives_vi.length > 0) ? p.objectives_vi : []),
              activitiesEn: (cachedMatch?.activitiesEn && cachedMatch.activitiesEn.length > 0) ? cachedMatch.activitiesEn : ((p.activities_en && p.activities_en.length > 0) ? p.activities_en : []),
              activitiesVi: (cachedMatch?.activitiesVi && cachedMatch.activitiesVi.length > 0) ? cachedMatch.activitiesVi : ((p.activities_vi && p.activities_vi.length > 0) ? p.activities_vi : []),
              methodsEn: (cachedMatch?.methodsEn && cachedMatch.methodsEn.length > 0) ? cachedMatch.methodsEn : ((p.methods_en && p.methods_en.length > 0) ? p.methods_en : []),
              methodsVi: (cachedMatch?.methodsVi && cachedMatch.methodsVi.length > 0) ? cachedMatch.methodsVi : ((p.methods_vi && p.methods_vi.length > 0) ? p.methods_vi : []),
              outcomesEn: (cachedMatch?.outcomesEn && cachedMatch.outcomesEn.length > 0) ? cachedMatch.outcomesEn : ((p.outcomes_en && p.outcomes_en.length > 0) ? p.outcomes_en : []),
              outcomesVi: (cachedMatch?.outcomesVi && cachedMatch.outcomesVi.length > 0) ? cachedMatch.outcomesVi : ((p.outcomes_vi && p.outcomes_vi.length > 0) ? p.outcomes_vi : []),
              thumbnailUrl: cachedMatch?.thumbnailUrl || p.thumbnail_url || '',
              galleryUrls: (cachedMatch?.galleryUrls && cachedMatch.galleryUrls.length > 0) ? cachedMatch.galleryUrls : ((p.gallery_urls && p.gallery_urls.length > 0) ? p.gallery_urls : []),
              videoUrl: cachedMatch?.videoUrl || p.video_url || '',
              attachments: (cachedMatch?.attachments && cachedMatch.attachments.length > 0) ? cachedMatch.attachments : ((p.attachments && p.attachments.length > 0) ? p.attachments : []),
              tags: (cachedMatch?.tags && cachedMatch.tags.length > 0) ? cachedMatch.tags : ((p.tags && p.tags.length > 0) ? p.tags : []),
              isFeatured: cachedMatch?.isFeatured ?? (p.is_featured !== false),
              isPublished: cachedMatch?.isPublished ?? (p.is_published !== false),
              createdAt: cachedMatch?.createdAt || (p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            };
          });

          cachedProjects.forEach(cached => {
            if (!list.some(x => x.id === cached.id || x.slug === cached.slug)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_projects', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load projects from Supabase:', err);
      }
    }
    const list = getStorageItem('db_projects', INITIAL_PROJECTS);
    const categoryMap: Record<string, string> = {
      'Dự án Học tập': 'Learning Projects',
      'English Projects': 'Learning Projects',
      'Classroom Activities': 'Classroom Activities',
      'Hoạt động Lớp học': 'Classroom Activities',
      'Dự án Sáng tạo': 'Creative Projects',
      'Đổi mới Phương pháp': 'Methodology Innovations',
      'Ứng dụng EdTech': 'EdTech Applications',
      'Khác': 'Other'
    };

    return list.map((p) => {
      const catEn = p.categoryEn && p.categoryEn.trim()
        ? p.categoryEn
        : (categoryMap[p.categoryName] || p.categoryName);

      const gradeEn = p.gradeEn && p.gradeEn.trim()
        ? p.gradeEn
        : p.grade
            .replace(/\(([0-9]+)\s*-\s*([0-9]+)\s*tuổi\)/gi, '(Ages $1-$2)')
            .replace(/([0-9]+)\s*tuổi/gi, '$1 years old')
            .replace(/tuổi/gi, 'years old');

      return {
        ...p,
        categoryEn: catEn,
        gradeEn: gradeEn
      };
    });
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.slug === slug) || null;
  },

  async saveProject(proj: Project): Promise<Project[]> {
    const list = getStorageItem('db_projects', INITIAL_PROJECTS);
    const index = list.findIndex(x => x.id === proj.id);
    if (index >= 0) {
      list[index] = { ...proj };
    } else {
      const newId = 'proj_' + Date.now();
      const slug = proj.slug || proj.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      list.unshift({ ...proj, id: newId, slug, createdAt: new Date().toISOString().split('T')[0] });
    }
    setStorageItem('db_projects', list);
    return list;
  },

  async deleteProject(id: string): Promise<Project[]> {
    let list = getStorageItem('db_projects', INITIAL_PROJECTS);
    const target = list.find(x => x.id === id);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_projects', list);

    if (isSupabaseConfigured && supabase) {
      if (isValidUUID(id)) {
        await supabase.from('projects').delete().eq('id', id);
      } else if (target?.slug) {
        await supabase.from('projects').delete().eq('slug', target.slug);
      } else {
        await supabase.from('projects').delete().eq('slug', id);
      }
    }
    return list;
  },

  async duplicateProject(id: string): Promise<Project[]> {
    const list = getStorageItem('db_projects', INITIAL_PROJECTS);
    const target = list.find(x => x.id === id);
    if (target) {
      const dup: Project = {
        ...target,
        id: 'proj_' + Date.now(),
        slug: target.slug + '-copy-' + Date.now(),
        titleEn: target.titleEn + ' (Copy)',
        titleVi: target.titleVi + ' (Bản sao)',
        isPublished: false
      };
      list.unshift(dup);
      setStorageItem('db_projects', list);
    }
    return list;
  },

  // COURSES
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedCourses: Course[] = (() => {
            try {
              const c = localStorage.getItem('db_courses');
              return c ? JSON.parse(c) : [];
            } catch { return []; }
          })();

          const list: Course[] = data.map((c) => {
            const cachedMatch = cachedCourses.find(x => x.id === c.id || x.slug === c.slug);

            const priceType = cachedMatch?.priceType || (c.price_type || 'free');
            const priceVi = cachedMatch?.priceVi || c.price_vi || (priceType === 'paid' ? 'Có phí' : 'Miễn phí');
            const priceEn = cachedMatch?.priceEn || c.price_en || (priceType === 'paid' ? 'Paid' : 'Free');
            const discVi = cachedMatch?.discountPriceVi !== undefined ? cachedMatch.discountPriceVi : (c.discount_price_vi || '');
            const discEn = cachedMatch?.discountPriceEn !== undefined ? cachedMatch.discountPriceEn : (c.discount_price_en || '');
            const gradeLevel = cachedMatch?.gradeLevel || c.grade_level || '';
            const gradeLevelEn = cachedMatch?.gradeLevelEn || c.grade_level_en || gradeLevel;

            return {
              id: c.id,
              slug: cachedMatch?.slug || c.slug,
              titleEn: cachedMatch?.titleEn || c.title_en || '',
              titleVi: cachedMatch?.titleVi || c.title_vi || '',
              categoryName: cachedMatch?.categoryName || c.category_name || '',
              categoryEn: cachedMatch?.categoryEn || c.category_en || c.category_name || '',
              priceType: priceType,
              priceEn: priceEn,
              priceVi: priceVi,
              discountPriceEn: discEn,
              discountPriceVi: discVi,
              gradeLevel: gradeLevel,
              gradeLevelEn: gradeLevelEn,
              durationEn: cachedMatch?.durationEn || c.duration_en || '',
              durationVi: cachedMatch?.durationVi || c.duration_vi || '',
              scheduleEn: cachedMatch?.scheduleEn || c.schedule_en || '',
              scheduleVi: cachedMatch?.scheduleVi || c.schedule_vi || '',
              descriptionEn: cachedMatch?.descriptionEn || c.description_en || '',
              descriptionVi: cachedMatch?.descriptionVi || c.description_vi || '',
              objectivesEn: (cachedMatch?.objectivesEn && cachedMatch.objectivesEn.length > 0) ? cachedMatch.objectivesEn : ((c.objectives_en && c.objectives_en.length > 0) ? c.objectives_en : []),
              objectivesVi: (cachedMatch?.objectivesVi && cachedMatch.objectivesVi.length > 0) ? cachedMatch.objectivesVi : ((c.objectives_vi && c.objectives_vi.length > 0) ? c.objectives_vi : []),
              curriculumEn: (cachedMatch?.curriculumEn && cachedMatch.curriculumEn.length > 0) ? cachedMatch.curriculumEn : ((c.curriculum_en && c.curriculum_en.length > 0) ? c.curriculum_en : []),
              curriculumVi: (cachedMatch?.curriculumVi && cachedMatch.curriculumVi.length > 0) ? cachedMatch.curriculumVi : ((c.curriculum_vi && c.curriculum_vi.length > 0) ? c.curriculum_vi : []),
              thumbnailUrl: cachedMatch?.thumbnailUrl || c.thumbnail_url || '',
              galleryUrls: (cachedMatch?.galleryUrls && cachedMatch.galleryUrls.length > 0) ? cachedMatch.galleryUrls : ((c.gallery_urls && c.gallery_urls.length > 0) ? c.gallery_urls : []),
              videoUrl: cachedMatch?.videoUrl || c.video_url || '',
              registrationFormUrl: cachedMatch?.registrationFormUrl || c.registration_form_url || '',
              isFeatured: cachedMatch?.isFeatured ?? (c.is_featured !== false),
              isPublished: cachedMatch?.isPublished ?? (c.is_published !== false),
              createdAt: cachedMatch?.createdAt || (c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            };
          });

          // Merge any locally added courses that are not in Supabase yet
          cachedCourses.forEach(cached => {
            if (!list.some(x => x.id === cached.id || x.slug === cached.slug)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_courses', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load courses from Supabase:', err);
      }
    }
    const list = getStorageItem('db_courses', INITIAL_COURSES);
    const categoryMap: Record<string, string> = {
      'Anh văn trẻ em': 'Young Learners English',
      'Luyện văn phạm': 'Grammar Mastery',
      'Luyện phản xạ game': 'Gamified Fluency',
      'Luyện nghe nói': 'Listening & Speaking',
      'Khác': 'Other'
    };

    return list.map((c) => {
      const catEn = c.categoryEn && c.categoryEn.trim()
        ? c.categoryEn
        : (categoryMap[c.categoryName] || c.categoryName);

      const gradeEn = c.gradeLevelEn && c.gradeLevelEn.trim()
        ? c.gradeLevelEn
        : c.gradeLevel
            .replace(/\(([0-9]+)\s*-\s*([0-9]+)\s*tuổi\)/gi, '(Ages $1-$2)')
            .replace(/([0-9]+)\s*tuổi/gi, '$1 years old')
            .replace(/tuổi/gi, 'years old');

      const priceEn = c.priceType === 'free' ? 'Free' : (c.priceVi || c.priceEn);

      return {
        ...c,
        categoryEn: catEn,
        gradeLevelEn: gradeEn,
        priceEn: priceEn
      };
    });
  },

  async getCourseBySlug(slug: string): Promise<Course | null> {
    const courses = await this.getCourses();
    return courses.find(c => c.slug === slug) || null;
  },

  async saveCourse(course: Course): Promise<Course[]> {
    const list = getStorageItem('db_courses', INITIAL_COURSES);
    const index = list.findIndex(x => x.id === course.id);
    if (index >= 0) {
      list[index] = { ...course };
    } else {
      const newId = 'c_' + Date.now();
      const slug = course.slug || course.titleVi.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      list.unshift({ ...course, id: newId, slug, createdAt: new Date().toISOString().split('T')[0] });
    }
    setStorageItem('db_courses', list);
    return list;
  },

  async deleteCourse(id: string): Promise<Course[]> {
    let list = getStorageItem('db_courses', INITIAL_COURSES);
    const target = list.find(x => x.id === id);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_courses', list);

    if (isSupabaseConfigured && supabase) {
      if (isValidUUID(id)) {
        await supabase.from('courses').delete().eq('id', id);
      } else if (target?.slug) {
        await supabase.from('courses').delete().eq('slug', target.slug);
      } else {
        await supabase.from('courses').delete().eq('slug', id);
      }
    }
    return list;
  },

  async duplicateCourse(id: string): Promise<Course[]> {
    const list = getStorageItem('db_courses', INITIAL_COURSES);
    const target = list.find(x => x.id === id);
    if (target) {
      const dup: Course = {
        ...target,
        id: 'c_' + Date.now(),
        slug: target.slug + '-copy-' + Date.now(),
        titleEn: target.titleEn + ' (Copy)',
        titleVi: target.titleVi + ' (Bản sao)',
        isPublished: false
      };
      list.unshift(dup);
      setStorageItem('db_courses', list);
    }
    return list;
  },

  // COURSE REGISTRATIONS
  async getCourseRegistrations(): Promise<CourseRegistration[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('course_registrations').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const list: CourseRegistration[] = data.map((r) => ({
            id: r.id,
            courseId: r.course_id || '',
            courseTitle: r.course_title,
            fullName: r.full_name,
            phone: r.phone,
            email: r.email,
            gradeLevel: r.grade_level,
            note: r.note || '',
            status: r.status || 'new',
            createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : new Date().toLocaleString()
          }));
          localStorage.setItem('db_course_regs', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load course registrations from Supabase:', err);
      }
    }
    return getStorageItem('db_course_regs', INITIAL_COURSE_REGS);
  },

  async createCourseRegistration(reg: Omit<CourseRegistration, 'id' | 'status' | 'createdAt'>): Promise<CourseRegistration> {
    const list = await this.getCourseRegistrations();
    const newReg: CourseRegistration = {
      ...reg,
      id: 'reg_' + Date.now(),
      status: 'new',
      createdAt: new Date().toLocaleString()
    };
    list.unshift(newReg);
    setStorageItem('db_course_regs', list);
    return newReg;
  },

  async updateCourseRegistrationStatus(id: string, status: CourseRegistration['status']): Promise<CourseRegistration[]> {
    const list = await this.getCourseRegistrations();
    const target = list.find(x => x.id === id);
    if (target) {
      target.status = status;
      setStorageItem('db_course_regs', list);
      if (isSupabaseConfigured && supabase && isValidUUID(id)) {
        await supabase.from('course_registrations').update({ status }).eq('id', id);
      }
    }
    return list;
  },

  async deleteCourseRegistration(id: string): Promise<CourseRegistration[]> {
    let list = await this.getCourseRegistrations();
    list = list.filter(x => x.id !== id);
    setStorageItem('db_course_regs', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('course_registrations').delete().eq('id', id);
    }
    return list;
  },

  // STUDENT WORKS
  async getStudentWorks(): Promise<StudentWork[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('student_works').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedStudentWorks: StudentWork[] = (() => {
            try {
              const sw = localStorage.getItem('db_student_works');
              return sw ? JSON.parse(sw) : [];
            } catch { return []; }
          })();

          const list: StudentWork[] = data.map((sw) => {
            const cachedMatch = cachedStudentWorks.find(x => x.id === sw.id);
            return {
              id: sw.id,
              titleEn: cachedMatch?.titleEn || sw.title_en || '',
              titleVi: cachedMatch?.titleVi || sw.title_vi || '',
              category: cachedMatch?.category || sw.category || 'Classroom Work',
              grade: cachedMatch?.grade || sw.grade || 'Primary',
              studentName: cachedMatch?.studentName || sw.student_name || '',
              descriptionEn: cachedMatch?.descriptionEn || sw.description_en || '',
              descriptionVi: cachedMatch?.descriptionVi || sw.description_vi || '',
              objectiveEn: cachedMatch?.objectiveEn || sw.objective_en || '',
              objectiveVi: cachedMatch?.objectiveVi || sw.objective_vi || '',
              privacyMode: cachedMatch?.privacyMode || sw.privacy_mode || 'public',
              mediaType: cachedMatch?.mediaType || sw.media_type || 'image',
              imageUrl: cachedMatch?.imageUrl || sw.image_url || '',
              mediaUrl: cachedMatch?.mediaUrl || sw.image_url || '',
              isPublished: cachedMatch?.isPublished ?? (sw.is_published !== false),
              createdAt: cachedMatch?.createdAt || (sw.created_at ? sw.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            };
          });

          cachedStudentWorks.forEach(cached => {
            if (!list.some(x => x.id === cached.id)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_student_works', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load student works from Supabase:', err);
      }
    }
    return getStorageItem<StudentWork[]>('db_student_works', []);
  },

  async saveStudentWork(sw: StudentWork): Promise<StudentWork[]> {
    const list = getStorageItem<StudentWork[]>('db_student_works', []);
    const index = list.findIndex(x => x.id === sw.id);
    if (index >= 0) {
      list[index] = sw;
    } else {
      list.unshift({ ...sw, id: 'sw_' + Date.now() });
    }
    setStorageItem('db_student_works', list);
    return list;
  },

  async deleteStudentWork(id: string): Promise<StudentWork[]> {
    let list = getStorageItem<StudentWork[]>('db_student_works', []);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_student_works', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('student_works').delete().eq('id', id);
    }
    return list;
  },

  // TEACHING RESOURCES
  async getResources(): Promise<TeachingResource[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedResources: TeachingResource[] = (() => {
            try {
              const r = localStorage.getItem('db_resources_v3') || localStorage.getItem('db_resources');
              return r ? JSON.parse(r) : [];
            } catch { return []; }
          })();

          const list: TeachingResource[] = data.map((r) => {
            const cachedMatch = cachedResources.find(x => x.id === r.id || x.slug === r.slug);
            const priceType = cachedMatch?.priceType || (r.price_type || 'free');
            const priceVi = cachedMatch?.priceVi || r.price_vi || (priceType === 'paid' ? 'Có phí' : 'Miễn phí');
            const priceEn = cachedMatch?.priceEn || r.price_en || (priceType === 'paid' ? 'Paid' : 'Free');
            const discVi = cachedMatch?.discountPriceVi !== undefined ? cachedMatch.discountPriceVi : (r.discount_price_vi || '');
            const discEn = cachedMatch?.discountPriceEn !== undefined ? cachedMatch.discountPriceEn : (r.discount_price_en || '');
            const fileType = cachedMatch?.fileType || r.file_type || 'PDF';
            const fileTypeEn = cachedMatch?.fileTypeEn || r.file_type_en || fileType;

            return {
              id: r.id,
              slug: cachedMatch?.slug || r.slug || r.id,
              titleEn: cachedMatch?.titleEn || r.title_en || '',
              titleVi: cachedMatch?.titleVi || r.title_vi || '',
              descriptionEn: cachedMatch?.descriptionEn || r.description_en || '',
              descriptionVi: cachedMatch?.descriptionVi || r.description_vi || '',
              categoryName: cachedMatch?.categoryName || r.category_name || '',
              categoryEn: cachedMatch?.categoryEn || r.category_en || r.category_name || '',
              resourceType: cachedMatch?.resourceType || r.resource_type || 'digital_file',
              priceType: priceType,
              priceEn: priceEn,
              priceVi: priceVi,
              discountPriceEn: discEn,
              discountPriceVi: discVi,
              grade: cachedMatch?.grade || r.grade || '',
              gradeEn: cachedMatch?.gradeEn || r.grade_en || r.grade || '',
              fileType: fileType,
              fileTypeEn: fileTypeEn,
              fileUrl: cachedMatch?.fileUrl || r.file_url || '',
              previewUrl: cachedMatch?.previewUrl || r.preview_url || '',
              galleryUrls: (cachedMatch?.galleryUrls && cachedMatch.galleryUrls.length > 0) ? cachedMatch.galleryUrls : ((r.gallery_urls && r.gallery_urls.length > 0) ? r.gallery_urls : []),
              videoUrl: cachedMatch?.videoUrl || r.video_url || '',
              downloadCount: cachedMatch?.downloadCount ?? (r.download_count || 0),
              specificationsEn: (cachedMatch?.specificationsEn && cachedMatch.specificationsEn.length > 0) ? cachedMatch.specificationsEn : ((r.specifications_en && r.specifications_en.length > 0) ? r.specifications_en : []),
              specificationsVi: (cachedMatch?.specificationsVi && cachedMatch.specificationsVi.length > 0) ? cachedMatch.specificationsVi : ((r.specifications_vi && r.specifications_vi.length > 0) ? r.specifications_vi : []),
              tags: (cachedMatch?.tags && cachedMatch.tags.length > 0) ? cachedMatch.tags : ((r.tags && r.tags.length > 0) ? r.tags : []),
              isFeatured: cachedMatch?.isFeatured ?? (r.is_featured !== false),
              isPublished: cachedMatch?.isPublished ?? (r.is_published !== false),
              createdAt: cachedMatch?.createdAt || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            };
          });

          // Merge any locally added resources that are not in Supabase yet
          cachedResources.forEach(cached => {
            if (!list.some(x => x.id === cached.id || x.slug === cached.slug)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_resources_v3', JSON.stringify(list));
          localStorage.setItem('db_resources', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load resources from Supabase:', err);
      }
    }
    const rawList = getStorageItem<TeachingResource[]>('db_resources_v3', INITIAL_RESOURCES);
    let list = (!rawList || rawList.length === 0 || !rawList[0].priceType)
      ? INITIAL_RESOURCES
      : rawList;

    const oldCounts = [185, 420, 612, 614, 94, 156];
    list = list.map(r => ({
      ...r,
      downloadCount: (r.downloadCount && !oldCounts.includes(r.downloadCount)) ? r.downloadCount : 0
    }));

    const categoryMap: Record<string, string> = {
      'Sách & Giáo trình': 'Books & Curricula',
      'Phần mềm & App': 'Software & Apps',
      'Phần mềm & App Học tập': 'Software & Apps',
      'File Học liệu Số': 'Digital Files',
      'File Học liệu Số (Worksheets, Flashcards, PPTX)': 'Digital Files',
      'Dụng cụ & Giáo cụ': 'Teaching Tools',
      'Dụng cụ & Giáo cụ Học tập': 'Teaching Tools',
      'Thiết bị Nghe nhìn': 'Audio-Visual Equipment',
      'Thiết bị Nghe nhìn & Sound Kit': 'Audio-Visual Equipment',
      'Khác': 'Other'
    };

    const fileTypeMap: Record<string, string> = {
      'In bản cứng / Sách giấy': 'Physical Print / Book',
      'Phần mềm Windows / macOS': 'Windows / macOS App',
      'Link web': 'Web Link',
      'File PDF / Word / PowerPoint': 'PDF / Word / PPT File'
    };

    return list.map((r) => {
      const catEn = r.categoryEn && r.categoryEn.trim()
        ? r.categoryEn
        : (categoryMap[r.categoryName] || r.categoryName);

      const gradeEn = r.gradeEn && r.gradeEn.trim()
        ? r.gradeEn
        : r.grade
            .replace(/\(([0-9]+)\s*-\s*([0-9]+)\s*tuổi\)/gi, '(Ages $1-$2)')
            .replace(/([0-9]+)\s*tuổi/gi, '$1 years old')
            .replace(/tuổi/gi, 'years old');

      const fileTypeEn = r.fileTypeEn && r.fileTypeEn.trim()
        ? r.fileTypeEn
        : (fileTypeMap[r.fileType] || r.fileType);

      const priceEn = r.priceType === 'free' ? 'Free' : (r.priceVi || r.priceEn);

      return {
        ...r,
        categoryEn: catEn,
        gradeEn: gradeEn,
        fileTypeEn: fileTypeEn,
        priceEn: priceEn
      };
    });
  },

  async getResourceBySlug(slug: string): Promise<TeachingResource | null> {
    const resources = await this.getResources();
    return resources.find(r => r.slug === slug) || null;
  },

  async saveResource(res: TeachingResource): Promise<TeachingResource[]> {
    const list = await this.getResources();
    const index = list.findIndex(x => x.id === res.id);
    if (index >= 0) {
      list[index] = { ...res };
    } else {
      const newId = 'res_' + Date.now();
      const slug = res.slug || res.titleVi.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      list.unshift({ ...res, id: newId, slug, downloadCount: 0, createdAt: new Date().toISOString().split('T')[0] });
    }
    setStorageItem('db_resources_v3', list);
    return list;
  },

  async deleteResource(id: string): Promise<TeachingResource[]> {
    let list = await this.getResources();
    list = list.filter(x => x.id !== id);
    setStorageItem('db_resources_v3', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('resources').delete().eq('id', id);
    }
    return list;
  },

  async duplicateResource(id: string): Promise<TeachingResource[]> {
    const list = await this.getResources();
    const target = list.find(x => x.id === id);
    if (target) {
      const dup: TeachingResource = {
        ...target,
        id: 'res_' + Date.now(),
        slug: target.slug + '-copy-' + Date.now(),
        titleEn: target.titleEn + ' (Copy)',
        titleVi: target.titleVi + ' (Bản sao)',
        isPublished: false
      };
      list.unshift(dup);
      setStorageItem('db_resources_v3', list);
    }
    return list;
  },

  async incrementResourceDownload(id: string): Promise<number> {
    const list = await this.getResources();
    const target = list.find(x => x.id === id);
    if (target) {
      target.downloadCount = (target.downloadCount || 0) + 1;
      setStorageItem('db_resources_v3', list);
      return target.downloadCount;
    }
    return 0;
  },

  // RESOURCE ORDERS & REQUESTS
  async getResourceOrders(): Promise<ResourceOrder[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('resource_orders').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const list: ResourceOrder[] = data.map((ro) => ({
            id: ro.id,
            resourceId: ro.resource_id || '',
            resourceTitle: ro.resource_title,
            fullName: ro.full_name,
            phone: ro.phone,
            email: ro.email,
            address: ro.address || '',
            note: ro.note || '',
            status: ro.status || 'new',
            createdAt: ro.created_at ? new Date(ro.created_at).toLocaleString() : new Date().toLocaleString()
          }));
          localStorage.setItem('db_resource_orders_v2', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load resource orders from Supabase:', err);
      }
    }
    return getStorageItem('db_resource_orders_v2', INITIAL_RESOURCE_ORDERS);
  },

  async createResourceOrder(order: Omit<ResourceOrder, 'id' | 'status' | 'createdAt'>): Promise<ResourceOrder> {
    const list = await this.getResourceOrders();
    const newOrder: ResourceOrder = {
      ...order,
      id: 'ro_' + Date.now(),
      status: 'new',
      createdAt: new Date().toLocaleString()
    };
    list.unshift(newOrder);
    setStorageItem('db_resource_orders_v2', list);
    return newOrder;
  },

  async updateResourceOrderStatus(id: string, status: ResourceOrder['status']): Promise<ResourceOrder[]> {
    const list = await this.getResourceOrders();
    const target = list.find(x => x.id === id);
    if (target) {
      target.status = status;
      setStorageItem('db_resource_orders_v2', list);
      if (isSupabaseConfigured && supabase && isValidUUID(id)) {
        await supabase.from('resource_orders').update({ status }).eq('id', id);
      }
    }
    return list;
  },

  async deleteResourceOrder(id: string): Promise<ResourceOrder[]> {
    let list = await this.getResourceOrders();
    list = list.filter(x => x.id !== id);
    setStorageItem('db_resource_orders_v2', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('resource_orders').delete().eq('id', id);
    }
    return list;
  },

  // BLOG POSTS
  async getBlogPosts(): Promise<BlogPost[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedBlog: BlogPost[] = (() => {
            try {
              const b = localStorage.getItem('db_blog');
              return b ? JSON.parse(b) : [];
            } catch { return []; }
          })();

          const list: BlogPost[] = data.map((b) => {
            const cachedMatch = cachedBlog.find(x => x.id === b.id || x.slug === b.slug);
            return {
              id: b.id,
              slug: cachedMatch?.slug || b.slug,
              titleEn: cachedMatch?.titleEn || b.title_en || '',
              titleVi: cachedMatch?.titleVi || b.title_vi || '',
              excerptEn: cachedMatch?.excerptEn || b.excerpt_en || '',
              excerptVi: cachedMatch?.excerptVi || b.excerpt_vi || '',
              contentEn: cachedMatch?.contentEn || b.content_en || '',
              contentVi: cachedMatch?.contentVi || b.content_vi || '',
              featuredImage: cachedMatch?.featuredImage || b.featured_image || '',
              galleryUrls: (cachedMatch?.galleryUrls && cachedMatch.galleryUrls.length > 0) ? cachedMatch.galleryUrls : ((b.gallery_urls && b.gallery_urls.length > 0) ? b.gallery_urls : []),
              videoUrl: cachedMatch?.videoUrl || b.video_url || '',
              categoryName: cachedMatch?.categoryName || b.category_name || '',
              categoryEn: cachedMatch?.categoryEn || b.category_en || b.category_name || '',
              tags: (cachedMatch?.tags && cachedMatch.tags.length > 0) ? cachedMatch.tags : ((b.tags && b.tags.length > 0) ? b.tags : []),
              author: cachedMatch?.author || b.author || 'Nguyễn Trọng Huy Hoàng',
              readingTimeEn: cachedMatch?.readingTimeEn || b.reading_time_en || '5 min read',
              readingTimeVi: cachedMatch?.readingTimeVi || b.reading_time_vi || '5 phút đọc',
              status: cachedMatch?.status || b.status || 'published',
              isFeatured: cachedMatch?.isFeatured ?? (b.is_featured !== false),
              publishedAt: cachedMatch?.publishedAt || (b.published_at ? b.published_at.split('T')[0] : new Date().toISOString().split('T')[0]),
              createdAt: cachedMatch?.createdAt || (b.created_at ? b.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            };
          });

          cachedBlog.forEach(cached => {
            if (!list.some(x => x.id === cached.id || x.slug === cached.slug)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_blog', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load blog posts from Supabase:', err);
      }
    }
    return getStorageItem('db_blog', INITIAL_BLOG_POSTS);
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getBlogPosts();
    return posts.find(p => p.slug === slug) || null;
  },

  async saveBlogPost(post: BlogPost): Promise<BlogPost[]> {
    const list = getStorageItem('db_blog', INITIAL_BLOG_POSTS);
    const index = list.findIndex(x => x.id === post.id);
    if (index >= 0) {
      list[index] = post;
    } else {
      const slug = post.slug || post.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      list.unshift({
        ...post,
        id: 'blog_' + Date.now(),
        slug,
        createdAt: new Date().toISOString().split('T')[0],
        publishedAt: new Date().toISOString().split('T')[0]
      });
    }
    setStorageItem('db_blog', list);
    return list;
  },

  async deleteBlogPost(id: string): Promise<BlogPost[]> {
    let list = getStorageItem('db_blog', INITIAL_BLOG_POSTS);
    const target = list.find(x => x.id === id);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_blog', list);

    if (isSupabaseConfigured && supabase) {
      if (isValidUUID(id)) {
        await supabase.from('blog_posts').delete().eq('id', id);
      } else if (target?.slug) {
        await supabase.from('blog_posts').delete().eq('slug', target.slug);
      } else {
        await supabase.from('blog_posts').delete().eq('slug', id);
      }
    }
    return list;
  },

  async duplicateBlogPost(id: string): Promise<BlogPost[]> {
    const list = getStorageItem('db_blog', INITIAL_BLOG_POSTS);
    const target = list.find(x => x.id === id);
    if (target) {
      const dup: BlogPost = {
        ...target,
        id: 'blog_' + Date.now(),
        slug: target.slug + '-copy-' + Date.now(),
        titleEn: target.titleEn + ' (Copy)',
        titleVi: target.titleVi + ' (Bản sao)',
        status: 'draft'
      };
      list.unshift(dup);
      setStorageItem('db_blog', list);
    }
    return list;
  },

  // ACHIEVEMENTS
  async getAchievements(): Promise<Achievement[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedAchievements: Achievement[] = (() => {
            try {
              const a = localStorage.getItem('db_achievements');
              return a ? JSON.parse(a) : [];
            } catch { return []; }
          })();

          const list: Achievement[] = data.map((a, idx) => {
            const cachedMatch = cachedAchievements.find(x => x.id === a.id);
            return {
              id: a.id,
              titleEn: cachedMatch?.titleEn || a.title_en || '',
              titleVi: cachedMatch?.titleVi || a.title_vi || '',
              organizationEn: cachedMatch?.organizationEn || a.organization_en || '',
              organizationVi: cachedMatch?.organizationVi || a.organization_vi || '',
              date: cachedMatch?.date || a.date || '',
              category: cachedMatch?.category || a.category || '',
              certificateUrl: cachedMatch?.certificateUrl || a.certificate_url || '',
              galleryUrls: (cachedMatch?.galleryUrls && cachedMatch.galleryUrls.length > 0) ? cachedMatch.galleryUrls : ((a.gallery_urls && a.gallery_urls.length > 0) ? a.gallery_urls : []),
              descriptionEn: cachedMatch?.descriptionEn || a.description_en || '',
              descriptionVi: cachedMatch?.descriptionVi || a.description_vi || '',
              orderIndex: cachedMatch?.orderIndex ?? (a.order_index ?? (idx + 1))
            };
          });

          cachedAchievements.forEach(cached => {
            if (!list.some(x => x.id === cached.id)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_achievements', JSON.stringify(list));
          return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        }
      } catch (err) {
        console.error('Failed to load achievements from Supabase:', err);
      }
    }
    const list = getStorageItem('db_achievements', INITIAL_ACHIEVEMENTS);
    list.forEach((item, i) => {
      if (item.orderIndex === undefined) item.orderIndex = i + 1;
    });
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async saveAchievement(ach: Achievement): Promise<Achievement[]> {
    const list = getStorageItem('db_achievements', INITIAL_ACHIEVEMENTS);
    const index = list.findIndex(x => x.id === ach.id);
    if (index >= 0) {
      list[index] = ach;
    } else {
      const maxOrder = list.reduce((max, x) => Math.max(max, x.orderIndex || 0), 0);
      list.push({ ...ach, id: 'ach_' + Date.now(), orderIndex: maxOrder + 1 });
    }
    setStorageItem('db_achievements', list);
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async deleteAchievement(id: string): Promise<Achievement[]> {
    let list = getStorageItem('db_achievements', INITIAL_ACHIEVEMENTS);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_achievements', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('achievements').delete().eq('id', id);
    }
    return list;
  },

  async duplicateAchievement(id: string): Promise<Achievement[]> {
    const list = getStorageItem('db_achievements', INITIAL_ACHIEVEMENTS);
    const target = list.find(x => x.id === id);
    if (target) {
      const maxOrder = list.reduce((max, x) => Math.max(max, x.orderIndex || 0), 0);
      const dup: Achievement = {
        ...target,
        id: 'ach_' + Date.now(),
        titleEn: target.titleEn + ' (Copy)',
        titleVi: target.titleVi + ' (Bản sao)',
        orderIndex: maxOrder + 1
      };
      list.push(dup);
      setStorageItem('db_achievements', list);
    }
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async reorderAchievements(id: string, direction: 'up' | 'down'): Promise<Achievement[]> {
    const list = getStorageItem('db_achievements', INITIAL_ACHIEVEMENTS);
    list.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
    list.forEach((item, i) => {
      item.orderIndex = i + 1;
    });

    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return list;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < list.length) {
      const temp = list[idx].orderIndex;
      list[idx].orderIndex = list[targetIdx].orderIndex;
      list[targetIdx].orderIndex = temp;
    }

    list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    setStorageItem('db_achievements', list);
    return list;
  },

  // GALLERY ITEMS
  async getGalleryItems(): Promise<GalleryItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const cachedGallery: GalleryItem[] = (() => {
            try {
              const g = localStorage.getItem('db_gallery');
              return g ? JSON.parse(g) : [];
            } catch { return []; }
          })();

          const list: GalleryItem[] = data.map((g, idx) => {
            const cachedMatch = cachedGallery.find(x => x.id === g.id);
            return {
              id: g.id,
              titleEn: cachedMatch?.titleEn || g.title_en || '',
              titleVi: cachedMatch?.titleVi || g.title_vi || '',
              category: cachedMatch?.category || g.category || '',
              categoryEn: cachedMatch?.categoryEn || g.category_en || g.category || '',
              mediaType: cachedMatch?.mediaType || g.media_type || 'image',
              mediaUrl: cachedMatch?.mediaUrl || g.media_url || '',
              galleryUrls: (cachedMatch?.galleryUrls && cachedMatch.galleryUrls.length > 0) ? cachedMatch.galleryUrls : ((g.gallery_urls && g.gallery_urls.length > 0) ? g.gallery_urls : []),
              thumbnailUrl: cachedMatch?.thumbnailUrl || g.thumbnail_url || '',
              descriptionEn: cachedMatch?.descriptionEn || g.description_en || '',
              descriptionVi: cachedMatch?.descriptionVi || g.description_vi || '',
              isPublished: cachedMatch?.isPublished ?? (g.is_published !== false),
              orderIndex: cachedMatch?.orderIndex ?? (g.order_index ?? (idx + 1)),
              createdAt: cachedMatch?.createdAt || (g.created_at ? g.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
            };
          });

          cachedGallery.forEach(cached => {
            if (!list.some(x => x.id === cached.id)) {
              list.push(cached);
            }
          });

          localStorage.setItem('db_gallery', JSON.stringify(list));
          return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        }
      } catch (err) {
        console.error('Failed to load gallery items from Supabase:', err);
      }
    }
    const list = getStorageItem('db_gallery', INITIAL_GALLERY);
    list.forEach((item, i) => {
      if (item.orderIndex === undefined) item.orderIndex = i + 1;
    });
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
    const list = getStorageItem('db_gallery', INITIAL_GALLERY);
    const index = list.findIndex(x => x.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      const maxOrder = list.reduce((max, x) => Math.max(max, x.orderIndex || 0), 0);
      list.push({ ...item, id: 'gal_' + Date.now(), orderIndex: maxOrder + 1, createdAt: new Date().toISOString().split('T')[0] });
    }
    setStorageItem('db_gallery', list);
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async deleteGalleryItem(id: string): Promise<GalleryItem[]> {
    let list = getStorageItem('db_gallery', INITIAL_GALLERY);
    list = list.filter(x => x.id !== id);
    setStorageItem('db_gallery', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('gallery_items').delete().eq('id', id);
    }
    return list;
  },

  async duplicateGalleryItem(id: string): Promise<GalleryItem[]> {
    const list = getStorageItem('db_gallery', INITIAL_GALLERY);
    const target = list.find(x => x.id === id);
    if (target) {
      const maxOrder = list.reduce((max, x) => Math.max(max, x.orderIndex || 0), 0);
      const dup: GalleryItem = {
        ...target,
        id: 'gal_' + Date.now(),
        titleEn: target.titleEn + ' (Copy)',
        titleVi: target.titleVi + ' (Bản sao)',
        orderIndex: maxOrder + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      list.push(dup);
      setStorageItem('db_gallery', list);
    }
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  async reorderGalleryItems(id: string, direction: 'up' | 'down'): Promise<GalleryItem[]> {
    const list = getStorageItem('db_gallery', INITIAL_GALLERY);
    list.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
    list.forEach((item, i) => {
      item.orderIndex = i + 1;
    });

    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return list;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < list.length) {
      const temp = list[idx].orderIndex;
      list[idx].orderIndex = list[targetIdx].orderIndex;
      list[targetIdx].orderIndex = temp;
    }

    list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    setStorageItem('db_gallery', list);
    return list;
  },

  // CONTACT MESSAGES
  async getContactMessages(): Promise<ContactMessage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const list: ContactMessage[] = data.map((m) => ({
            id: m.id,
            fullName: m.full_name,
            email: m.email,
            phone: m.phone || '',
            subject: m.subject,
            message: m.message,
            status: m.status || 'new',
            isStarred: m.is_starred || false,
            replyNote: m.reply_note || '',
            createdAt: m.created_at ? new Date(m.created_at).toLocaleString() : new Date().toLocaleString()
          }));
          localStorage.setItem('db_messages', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load contact messages from Supabase:', err);
      }
    }
    return getStorageItem<ContactMessage[]>('db_messages', [
      {
        id: 'msg1',
        fullName: 'Lê Quang Hải',
        email: 'haile2002@gmail.com',
        phone: '0972154781',
        subject: 'Trao đổi tài liệu giáo án',
        message: 'Tôi muốn trao đổi tài liệu giáo án với Thầy Hoàng để tham khảo giảng dạy cho học sinh lớp 3.',
        status: 'new',
        isStarred: true,
        createdAt: '01:32:08 1/9/2026'
      },
      {
        id: 'msg2',
        fullName: 'Nguyễn Văn Nam',
        email: 'nam.nguyen@gmail.com',
        phone: '0912345678',
        subject: 'Hợp tác tổ chức tập huấn tiếng Anh tiểu học',
        message: 'Chào thầy Hoàng, bên trường chúng tôi muốn mời thầy tham gia chia sẻ kinh nghiệm ứng dụng EdTech cho giáo viên khối 4-5.',
        status: 'replied',
        replyNote: 'Đã gửi Email phản hồi đồng ý tham gia tập huấn vào sáng 10/2.',
        createdAt: '2026-02-05 09:30'
      },
      {
        id: 'msg3',
        fullName: 'Trần Thị Mai',
        email: 'maitran.edu@gmail.com',
        phone: '0908889999',
        subject: 'Hỏi thông tin khóa học tiếng Anh hè cho bé lớp 2',
        message: 'Xin chào thầy Hoàng, tôi muốn tìm hiểu lịch học và học phí khóa học Phonics cho bé 7 tuổi vào các buổi tối cuối tuần.',
        status: 'new',
        createdAt: '2026-02-08 14:15'
      },
      {
        id: 'msg4',
        fullName: 'Vũ Minh Đức',
        email: 'duc.vu@yahoo.com',
        subject: 'Đóng góp ý kiến bộ phần mềm Word Games Pro',
        message: 'Phần mềm Word Games Pro rất hay, bé nhà mình thích chơi trò đoán từ vựng lắm. Cảm ơn thầy Hoàng!',
        status: 'read',
        isStarred: true,
        createdAt: '2026-02-03 16:45'
      }
    ]);
  },

  async createContactMessage(msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): Promise<ContactMessage> {
    const list = await this.getContactMessages();
    const newMsg: ContactMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      status: 'new',
      createdAt: new Date().toLocaleString()
    };
    list.unshift(newMsg);
    setStorageItem('db_messages', list);
    return newMsg;
  },

  async updateMessageStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage[]> {
    const list = await this.getContactMessages();
    const target = list.find(x => x.id === id);
    if (target) {
      target.status = status;
      setStorageItem('db_messages', list);
      if (isSupabaseConfigured && supabase && isValidUUID(id)) {
        await supabase.from('contact_messages').update({ status }).eq('id', id);
      }
    }
    return list;
  },

  async toggleStarMessage(id: string): Promise<ContactMessage[]> {
    const list = await this.getContactMessages();
    const target = list.find(x => x.id === id);
    if (target) {
      target.isStarred = !target.isStarred;
      setStorageItem('db_messages', list);
    }
    return list;
  },

  async replyToMessage(id: string, replyNote: string): Promise<ContactMessage[]> {
    const list = await this.getContactMessages();
    const target = list.find(x => x.id === id);
    if (target) {
      target.status = 'replied';
      target.replyNote = replyNote;
      setStorageItem('db_messages', list);
      if (isSupabaseConfigured && supabase && isValidUUID(id)) {
        await supabase.from('contact_messages').update({ status: 'replied' }).eq('id', id);
      }
    }
    return list;
  },

  async bulkUpdateMessageStatus(ids: string[], status: ContactMessage['status']): Promise<ContactMessage[]> {
    const list = await this.getContactMessages();
    list.forEach(item => {
      if (ids.includes(item.id)) {
        item.status = status;
      }
    });
    setStorageItem('db_messages', list);
    if (isSupabaseConfigured && supabase) {
      const validUuids = ids.filter(id => isValidUUID(id));
      if (validUuids.length > 0) {
        await supabase.from('contact_messages').update({ status }).in('id', validUuids);
      }
    }
    return list;
  },

  async bulkDeleteMessages(ids: string[]): Promise<ContactMessage[]> {
    let list = await this.getContactMessages();
    list = list.filter(x => !ids.includes(x.id));
    setStorageItem('db_messages', list);
    if (isSupabaseConfigured && supabase) {
      const validUuids = ids.filter(id => isValidUUID(id));
      if (validUuids.length > 0) {
        await supabase.from('contact_messages').delete().in('id', validUuids);
      }
    }
    return list;
  },

  async deleteMessage(id: string): Promise<ContactMessage[]> {
    let list = await this.getContactMessages();
    list = list.filter(x => x.id !== id);
    setStorageItem('db_messages', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('contact_messages').delete().eq('id', id);
    }
    return list;
  },

  // MEDIA LIBRARY
  async getMediaFiles(): Promise<MediaFile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          const list: MediaFile[] = data.map((m) => ({
            id: m.id,
            filename: m.filename,
            fileUrl: m.file_url,
            fileType: m.file_type,
            fileSize: m.file_size || 0,
            createdAt: m.created_at ? m.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          }));
          localStorage.setItem('db_media', JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.error('Failed to load media files from Supabase:', err);
      }
    }
    return getStorageItem<MediaFile[]>('db_media', [
      {
        id: 'm1',
        filename: 'teacher-portrait.jpg',
        fileUrl: 'https://ik.imagekit.io/hkh/OK_0.jpg?updatedAt=1787823395930',
        fileType: 'image/jpeg',
        fileSize: 1024 * 450,
        createdAt: '2026-01-01'
      }
    ]);
  },

  async addMediaFile(file: MediaFile): Promise<MediaFile[]> {
    const list = await this.getMediaFiles();
    list.unshift(file);
    setStorageItem('db_media', list);
    return list;
  },

  async deleteMediaFile(id: string): Promise<MediaFile[]> {
    let list = await this.getMediaFiles();
    list = list.filter(x => x.id !== id);
    setStorageItem('db_media', list);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('media_library').delete().eq('id', id);
    }
    return list;
  },

  // SITE SETTINGS
  async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        let { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();

        if (!data || error) {
          const res = await supabase
            .from('site_settings')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          data = res.data;
        }

        if (data) {
          const localSettings = getStorageItem('db_settings', INITIAL_SITE_SETTINGS);
          const cloudAccounts = Array.isArray(data.client_admin_accounts) && data.client_admin_accounts.length > 0
            ? data.client_admin_accounts
            : null;
          const localAccounts = Array.isArray(localSettings.clientAdminAccounts) && localSettings.clientAdminAccounts.length > 0
            ? localSettings.clientAdminAccounts
            : null;

          const s: SiteSettings = {
            siteTitleEn: localSettings.siteTitleEn || data.site_title_en || INITIAL_SITE_SETTINGS.siteTitleEn,
            siteTitleVi: localSettings.siteTitleVi || data.site_title_vi || INITIAL_SITE_SETTINGS.siteTitleVi,
            logoText: localSettings.logoText || data.logo_text || INITIAL_SITE_SETTINGS.logoText,
            logoUrl: localSettings.logoUrl || data.logo_url || INITIAL_SITE_SETTINGS.logoUrl,
            faviconUrl: localSettings.faviconUrl || data.favicon_url || INITIAL_SITE_SETTINGS.faviconUrl,
            primaryColor: localSettings.primaryColor || data.primary_color || INITIAL_SITE_SETTINGS.primaryColor,
            secondaryColor: localSettings.secondaryColor || data.secondary_color || INITIAL_SITE_SETTINGS.secondaryColor,
            contactEmail: localSettings.contactEmail || data.contact_email || INITIAL_SITE_SETTINGS.contactEmail,
            contactPhone: localSettings.contactPhone || data.contact_phone || INITIAL_SITE_SETTINGS.contactPhone,
            websiteUrl: localSettings.websiteUrl || data.website_url || INITIAL_SITE_SETTINGS.websiteUrl,
            notificationEmail: localSettings.notificationEmail || data.notification_email || INITIAL_SITE_SETTINGS.notificationEmail,
            defaultLanguage: localSettings.defaultLanguage || data.default_language || INITIAL_SITE_SETTINGS.defaultLanguage,
            defaultTheme: localSettings.defaultTheme || data.default_theme || INITIAL_SITE_SETTINGS.defaultTheme,
            facebookUrl: localSettings.facebookUrl || data.facebook_url || INITIAL_SITE_SETTINGS.facebookUrl,
            youtubeUrl: localSettings.youtubeUrl || data.youtube_url || INITIAL_SITE_SETTINGS.youtubeUrl,
            tiktokUrl: localSettings.tiktokUrl || data.tiktok_url || INITIAL_SITE_SETTINGS.tiktokUrl,
            instagramUrl: localSettings.instagramUrl || data.instagram_url || INITIAL_SITE_SETTINGS.instagramUrl,
            linkedinUrl: localSettings.linkedinUrl || data.linkedin_url || INITIAL_SITE_SETTINGS.linkedinUrl,
            footerTextEn: localSettings.footerTextEn || data.footer_text_en || INITIAL_SITE_SETTINGS.footerTextEn,
            footerTextVi: localSettings.footerTextVi || data.footer_text_vi || INITIAL_SITE_SETTINGS.footerTextVi,
            clientAdminAccounts: localAccounts || cloudAccounts || INITIAL_SITE_SETTINGS.clientAdminAccounts,
            enableEmailNotification: localSettings.enableEmailNotification !== undefined ? localSettings.enableEmailNotification : (data.enable_email_notification !== false),
            emailProvider: localSettings.emailProvider || data.email_provider || INITIAL_SITE_SETTINGS.emailProvider,
            emailjsServiceId: localSettings.emailjsServiceId || data.emailjs_service_id || '',
            emailjsTemplateIdCustomer: localSettings.emailjsTemplateIdCustomer || data.emailjs_template_id_customer || '',
            emailjsTemplateIdAdmin: localSettings.emailjsTemplateIdAdmin || data.emailjs_template_id_admin || '',
            emailjsPublicKey: localSettings.emailjsPublicKey || data.emailjs_public_key || '',
            bankName: localSettings.bankName || data.bank_name || INITIAL_SITE_SETTINGS.bankName,
            bankAccountNo: localSettings.bankAccountNo || data.bank_account_no || INITIAL_SITE_SETTINGS.bankAccountNo,
            bankAccountHolder: localSettings.bankAccountHolder || data.bank_account_holder || INITIAL_SITE_SETTINGS.bankAccountHolder,
            bankCode: localSettings.bankCode || data.bank_code || INITIAL_SITE_SETTINGS.bankCode,
            adminPassword: localSettings.adminPassword || INITIAL_SITE_SETTINGS.adminPassword,
            superAdminPassword: localSettings.superAdminPassword || INITIAL_SITE_SETTINGS.superAdminPassword
          };
          localStorage.setItem('db_settings', JSON.stringify(s));
          applyPrimaryColor(s.primaryColor);
          return s;
        }
      } catch (err) {
        console.error('Failed to load settings from Supabase:', err);
      }
    }
    return getStorageItem('db_settings', INITIAL_SITE_SETTINGS);
  },

  async updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
    setStorageItem('db_settings', settings);
    applyPrimaryColor(settings.primaryColor);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('site-settings-updated'));
    }
    syncToDisk();
    syncToSupabase('db_settings', settings);
    return settings;
  },

  // EXPORT & IMPORT BACKUP SYSTEM
  async exportFullDatabase(): Promise<string> {
    const snapshot = {
      db_profile: await this.getProfile(),
      db_hero: await this.getHeroSettings(),
      db_settings: await this.getSiteSettings(),
      db_teaching: await this.getTeachingApproaches(),
      db_projects: await this.getProjects(),
      db_courses: await this.getCourses(),
      db_resources: await this.getResources(),
      db_blog: await this.getBlogPosts(),
      db_achievements: await this.getAchievements(),
      db_gallery: await this.getGalleryItems()
    };
    return JSON.stringify(snapshot, null, 2);
  },

  async importFullDatabase(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      Object.keys(parsed).forEach(key => {
        setStorageItem(key, parsed[key]);
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile-updated'));
        window.dispatchEvent(new Event('site-settings-updated'));
      }
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  }
};
