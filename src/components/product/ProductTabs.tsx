import { Product, Review } from "../../types";

function Tab({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div 
      onClick={onClick}
      className="content-stretch flex flex-col items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity" 
      data-name="Tabs"
    >
      <div className="box-border content-stretch flex items-center justify-center pb-[12px] pt-[16px] px-[28px] relative shrink-0">
        <div className={`flex flex-col justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap ${isActive ? "font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] text-[#5e89e8]" : "font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] text-[#4d4d4d]"}`} style={{ fontVariationSettings: isActive ? "'CTGR' 0, 'wdth' 100, 'wght' 700" : "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          <p className="leading-[normal] whitespace-pre">{children}</p>
        </div>
      </div>
      {isActive && <div className="bg-[#5e89e8] h-[4px] rounded-[4px] shrink-0 w-full" data-name="line" />}
    </div>
  );
}

function TabNavigation({ activeTab, setActiveTab, reviews }: { activeTab: string; setActiveTab: (tab: string) => void; reviews: Review[] }) {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="Tabs">
      <Tab isActive={activeTab === "description"} onClick={() => setActiveTab("description")}>
        Опис
      </Tab>
      <Tab isActive={activeTab === "reviews"} onClick={() => setActiveTab("reviews")}>
        Відгуки ({reviews.length})
      </Tab>
      <Tab isActive={activeTab === "policy"} onClick={() => setActiveTab("policy")}>
        Політика використання
      </Tab>
    </div>
  );
}

function DescriptionContent({ product }: { product: Product }) {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[10px] grow items-start max-h-[415px] min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0" data-name="Scroll">
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-justify w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[32px] whitespace-pre-wrap">{product.description}</p>
      </div>
    </div>
  );
}

function ReviewStars({ count }: { count: number }) {
  const starPath = "M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"; // your star icon
  const fullStars = Math.floor(count);
  const fraction = count - fullStars;

  return (
    <div className="flex gap-[4px] items-end justify-end">
      {[...Array(5)].map((_, i) => {
        let fillPercentage = 0;

        if (i < fullStars) {
          fillPercentage = 1;
        } else if (i === fullStars) {
          fillPercentage = fraction; 
        }

        return (
          <div key={i} className="relative size-[24px]">
            <svg viewBox="0 0 24 24" className="block size-full">
              <path d={starPath} fill="#E6E6E6" />

              {fillPercentage > 0 && (
                <path
                  d={starPath}
                  fill="#E9CF0C"
                  style={{
                    clipPath: `inset(0 ${100 - fillPercentage * 100}% 0 0)`,
                  }}
                />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] shrink-0 w-full" data-name="Review">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start justify-center px-[24px] py-[20px] relative w-full">
          <ReviewStars count={review.rating} />
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[#0d0d0d] text-[16px] w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="leading-[28px]">{review.comment}</p>
          </div>
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Person">
            <div className="bg-[#e6e6e6] content-stretch flex gap-[8px] items-center justify-center relative rounded-[48px] shrink-0 size-[48px]" data-name="Image">
              <div
                className="flex flex-col justify-end leading-[0] relative shrink-0 text-[16px] text-black text-justify text-nowrap"
                style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
              >
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName || "User avatar"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <p className="leading-[normal] whitespace-pre">
                    {review.userName?.split(' ').slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('')}
                  </p>
                )}
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start justify-center leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-justify" data-name="Sign">
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] h-[15px] justify-end relative shrink-0 w-[222px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
                <p className="leading-[normal]">{review.userName}</p>
              </div>
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] h-[15px] justify-end relative shrink-0 w-[222px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal]">Користувач</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsContent({ reviews }: { reviews: Review[] }) {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[12px] grow items-start max-h-[415px] min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0" data-name="Scroll">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))
      ) : (
        <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-center w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          <p className="leading-[32px]">Ще немає відгуків</p>
        </div>
      )}
    </div>
  );
}

function PolicyContent() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[10px] grow items-start max-h-[415px] min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0" data-name="Scroll">
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-justify w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif] leading-[32px] mb-0" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
          Політика використання сценаріїв
        </p>
        <ol className="list-decimal">
          <li className="leading-[32px] mb-0 ms-[24px] whitespace-pre-wrap">
            <span className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
              Авторські права:
            </span>
            <span>{`  Усі сценарії, матеріали та додаткові ресурси є результатом авторської роботи. Вони захищені законом про авторське право і не можуть бути розповсюджені чи перепродані без дозволу автора.`}</span>
          </li>
          <li className="leading-[32px] mb-0 ms-[24px]">
            <span className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
              Особисте використання:
            </span>
            <span>{` Придбаний сценарій можна використовувати лише у власній педагогічній діяльності (наприклад, у школі, дитячому садку, літньому таборі чи гуртку).`}</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif] leading-[32px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
              Заборонено:
            </span>
          </li>
          <ul className="list-disc mb-0">
            <li className="mb-0 ms-[48px]">
              <span className="leading-[32px]">Викладати матеріали у вільний доступ (соцмережі, форуми, сайти для завантаження).</span>
            </li>
            <li className="mb-0 ms-[48px]">
              <span className="leading-[32px]">Передавати сценарій іншим педагогам чи організаціям без погодження з автором.</span>
            </li>
            <li className="ms-[48px]">
              <span className="leading-[32px]">Використовувати сценарій для комерційного тиражування чи продажу.</span>
            </li>
          </ul>
          <li className="mb-0 ms-[24px]">
            <span className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif] leading-[32px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
              Дозволено:
            </span>
          </li>
          <ul className="list-disc mb-0">
            <li className="mb-0 ms-[48px]">
              <span className="leading-[32px]">Вносити незначні зміни (адаптацію під вік дітей, специфіку заходу).</span>
            </li>
            <li className="mb-0 ms-[48px]">
              <span className="leading-[32px]">Використовувати сценарій кілька разів у межах однієї установи.</span>
            </li>
            <li className="ms-[48px]">
              <span className="leading-[32px]">Ділитися враженнями чи відгуками про сценарій у соцмережах (без публікації самого тексту).</span>
            </li>
          </ul>
          <li className="leading-[32px] ms-[24px]">
            <span className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold','Noto_Sans:Regular',sans-serif]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>{`Відповідальність: `}</span>Використовуючи сценарій, ви погоджуєтеся з цією політикою. У випадку порушення авторських прав автор залишає за собою право вжити необхідні заходи.
          </li>
        </ol>
      </div>
    </div>
  );
}

function TabContent({ activeTab, product, reviews }: { activeTab: string; product: Product; reviews: Review[] }) {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="Scrolling">
      {activeTab === "description" && <DescriptionContent product={product} />}
      {activeTab === "reviews" && <ReviewsContent reviews={reviews} />}
      {activeTab === "policy" && <PolicyContent />}
    </div>
  );
}

interface ProductTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  product: Product;
  reviews: Review[];
}

export function ProductTabs({ activeTab, setActiveTab, product, reviews }: ProductTabsProps) {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Tabs">
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} reviews={reviews} />
      <TabContent activeTab={activeTab} product={product} reviews={reviews} />
    </div>
  );
}