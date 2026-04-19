/**
 * @fileoverview Terms and Usage Policy page.
 *
 * Displays the platform's terms of use and privacy policy as plain text
 * sections. Layout mirrors the FAQs page — same top bar (Logo + CloseButton)
 * and canvas shell — but without an accordion.
 *
 * @module pages/TermsPage
 */

import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import CloseButton from '@/components/ui/icons/CloseIcon';

const FONT_SETTINGS = "'CTGR' 0, 'wdth' 100, 'wght' 400";
const FONT_FAMILY = "font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif]";

const sections = [
  {
    heading: 'Загальні положення',
    body: 'Ця сторінка містить умови використання платформи Muzalife та політику конфіденційності. Користуючись платформою, ви погоджуєтесь з усіма умовами, викладеними нижче. Адміністрація залишає за собою право вносити зміни до цього документу в будь-який час.',
  },
  {
    heading: 'Реєстрація та обліковий запис',
    body: "Для доступу до особистого кабінету та здійснення замовлень необхідна реєстрація. Ви зобов'язані надати актуальні дані та зберігати конфіденційність своїх облікових даних. У разі несанкціонованого доступу до вашого облікового запису негайно повідомте адміністрацію.",
  },
  {
    heading: "Права та обов'язки сторін",
    body: "Платформа надає користувачам доступ до цифрових творчих матеріалів для особистого використання. Копіювання, розповсюдження або комерційне використання матеріалів без письмового дозволу заборонено. Адміністрація зобов'язується забезпечити стабільну роботу сервісу та своєчасну доставку придбаних матеріалів.",
  },
  {
    heading: 'Оплата та повернення коштів',
    body: 'Оплата здійснюється через захищений платіжний шлюз LiqPay. Після успішної оплати цифровий продукт стає доступним у вашій особистій бібліотеці. Повернення коштів можливе протягом 14 днів, якщо матеріал не був завантажений або використаний.',
  },
  {
    heading: 'Персональні замовлення',
    body: 'Персональні замовлення виконуються відповідно до узгодженого технічного завдання та вказаних термінів. Після прийняття замовлення клієнтом повернення коштів не здійснюється. Усі спірні питання вирішуються шляхом переговорів між сторонами.',
  },
  {
    heading: 'Конфіденційність',
    body: "Ми збираємо лише ті персональні дані, які необхідні для надання послуг: ім'я, адресу електронної пошти та інформацію про замовлення. Ваші дані не передаються третім особам без вашої згоди, за винятком випадків, передбачених законодавством України.",
  },
  {
    heading: 'Контакти',
    body: 'З питань щодо умов використання та політики конфіденційності звертайтесь за адресою: support@muzalife.com. Ми відповідаємо на звернення протягом 2 робочих днів.',
  },
];

/**
 * Terms and Usage Policy page component.
 *
 * @returns The rendered terms page with a top bar and scrollable plain-text content.
 */
export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="Terms">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">

          {/* Top bar */}
          <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full" data-name="top bar">
            <Logo />
            <div className="basis-0 content-stretch flex gap-[24px] grow items-center justify-end min-h-px min-w-px relative self-stretch shrink-0" data-name="bar">
              <CloseButton onClick={() => navigate(-1)} />
            </div>
          </div>

          {/* Canvas */}
          <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative rounded-[12px] shrink-0 w-[1280px]" data-name="Canvas">
            <div className="basis-0 content-stretch flex flex-col gap-[28px] grow h-[728px] items-start justify-start min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Content">

              {/* Title */}
              <div
                className={`flex flex-col ${FONT_FAMILY} justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[48px] text-center w-full`}
                style={{ fontVariationSettings: FONT_SETTINGS }}
              >
                <p className="leading-[normal]">Умови та Політика</p>
              </div>

              {/* Scrollable text body */}
              <div className="basis-0 content-stretch flex flex-col gap-[32px] grow items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative rounded-tl-[16px] rounded-tr-[16px] w-full" data-name="Sections">
                {sections.map((section) => (
                  <div key={section.heading} className="flex flex-col gap-[8px] w-full">
                    <h2
                      className={`${FONT_FAMILY} text-[#0d0d0d] text-[20px] leading-[normal]`}
                      style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}
                    >
                      {section.heading}
                    </h2>
                    <p
                      className={`${FONT_FAMILY} text-[#4d4d4d] text-[16px] leading-[1.6]`}
                      style={{ fontVariationSettings: FONT_SETTINGS }}
                    >
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
