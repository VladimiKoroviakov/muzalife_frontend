import { useState } from 'react';
import { iconPaths } from '../ui/icons/iconPaths';

interface AdminAnalyticsContentProps {
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

const MATERIALS = [
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
  'День вчителя - Концерт',
  '1 Вересня - День знань',
];

interface ReviewData {
  name: string;
  role: string;
  initials: string;
  rating: number;
  text: string;
}

const MOCK_REVIEWS: ReviewData[] = [
  {
    name: 'Яна Коваленко',
    role: 'Вчитель музики',
    initials: 'ЯК',
    rating: 5,
    text: 'Чудовий сценарій для Дня вчителя! Діти були в захваті, все пройшло на ура. Дуже вдячна за матеріали.',
  },
  {
    name: 'Оксана Івершко',
    role: 'Вчитель музики',
    initials: 'ОІ',
    rating: 4,
    text: 'Квест для літнього табору — просто знахідка. Єдине, хотілося б більше варіантів для молодших класів.',
  },
  {
    name: 'Наталія Верещагіна',
    role: 'Вчитель музики',
    initials: 'НВ',
    rating: 5,
    text: 'Використовую матеріали регулярно. Якість на висоті, завжди актуальні теми.',
  },
  {
    name: 'Марина Литвин',
    role: 'Вчитель музики',
    initials: 'МЛ',
    rating: 4,
    text: 'Дуже зручний формат, легко адаптувати під свої потреби. Рекомендую колегам!',
  },
  {
    name: 'Ірина Кравченко',
    role: 'Вчитель музики',
    initials: 'ІК',
    rating: 5,
    text: 'Матеріали допомагають зробити уроки цікавішими. Дякую за вашу працю!',
  },
];

type TimeFilter = 'week' | 'month' | 'year' | 'custom';

export function AdminAnalyticsContent({ onSectionChange: _onSectionChange }: AdminAnalyticsContentProps) {
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const filters: { id: TimeFilter; label: string }[] = [
    { id: 'week', label: 'Тиждень' },
    { id: 'month', label: 'Місяць' },
    { id: 'year', label: 'Рік' },
    { id: 'custom', label: 'Обрати' },
  ];

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-row p-[24px] gap-[12px] h-full"
      data-name="AdminAnalyticsContent"
    >
      {/* LEFT PANEL */}
      <div className="w-[440px] h-[680px] flex flex-col shrink-0">
        <h2
          className="text-[20px] text-[#0d0d0d] m-0 mb-[12px]"
          style={fontBold}
        >
          Назва матеріалу
        </h2>
        <div className="flex-1 overflow-y-auto">
          {MATERIALS.map((material, index) => (
            <div
              key={index}
              onClick={() => setSelectedMaterial(index)}
              className={`h-[40px] flex items-center px-[12px] cursor-pointer transition-all ${
                selectedMaterial === index
                  ? 'bg-white border border-[#4d4d4d] rounded-[12px]'
                  : ''
              }`}
            >
              <span
                className="text-[16px] text-[#0d0d0d] truncate"
                style={selectedMaterial === index ? fontBold : fontRegular}
              >
                {material}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col gap-[28px]">
        {/* Time filters */}
        <div className="flex flex-col gap-[12px]">
          <span className="text-[20px] text-[#0d0d0d]" style={fontRegular}>
            Фільтри за часом
          </span>
          <div className="flex flex-row gap-[8px]">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`flex-1 h-[40px] rounded-[16px] cursor-pointer text-[16px] transition-all border ${
                  timeFilter === filter.id
                    ? 'bg-[#5e89e8] text-white border-[#5e89e8]'
                    : 'bg-transparent text-[#4d4d4d] border-[#5e89e8]'
                }`}
                style={timeFilter === filter.id ? fontBold : fontRegular}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics cards */}
        <div className="flex flex-wrap gap-[16px]">
          {/* Downloads */}
          <div className="bg-white rounded-[16px] p-[20px] flex items-center gap-[12px] flex-1">
            <span className="text-[48px] text-[#0d0d0d]" style={fontBold}>78</span>
            <svg width="28" height="28" viewBox="0 0 18.6667 18.6667" fill="none">
              <path d={iconPaths.downloadAdmin} fill="#5E89E8" />
            </svg>
          </div>
          {/* Bookmarks */}
          <div className="bg-white rounded-[16px] p-[20px] flex items-center gap-[12px] flex-1">
            <span className="text-[48px] text-[#0d0d0d]" style={fontBold}>25</span>
            <svg width="28" height="28" viewBox="0 0 18.6667 23.3333" fill="none">
              <path d={iconPaths.bookmarkAdmin} fill="#5E89E8" />
            </svg>
          </div>
          {/* Views */}
          <div className="bg-white rounded-[16px] p-[20px] flex items-center gap-[12px] flex-1">
            <span className="text-[48px] text-[#0d0d0d]" style={fontBold}>2482</span>
            <svg width="28" height="28" viewBox="0 0 25.6667 17.5" fill="none">
              <path d={iconPaths.eye} fill="#4D4D4D" />
            </svg>
          </div>
        </div>

        {/* Reviews section */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[12px]">
          {MOCK_REVIEWS.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-[16px] px-[24px] py-[20px] flex flex-col gap-[12px]"
            >
              {/* Star rating */}
              <div className="flex gap-[2px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d={iconPaths.star}
                      fill={star <= review.rating ? '#E9CF0C' : '#D9D9D9'}
                    />
                  </svg>
                ))}
              </div>
              {/* Review text */}
              <p
                className="text-[16px] leading-[28px] text-[#0d0d0d] m-0"
                style={fontRegular}
              >
                {review.text}
              </p>
              {/* Author */}
              <div className="flex items-center gap-[12px]">
                <div
                  className="w-[48px] h-[48px] rounded-full bg-[#e6e6e6] flex items-center justify-center text-[16px] text-[#4d4d4d] shrink-0"
                  style={fontBold}
                >
                  {review.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-[16px] text-[#0d0d0d]" style={fontBold}>
                    {review.name}
                  </span>
                  <span className="text-[14px] text-[#4d4d4d]" style={fontRegular}>
                    {review.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
