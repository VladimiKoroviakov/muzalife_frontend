/**
 * @fileoverview Form for creating a new personal order from the user cabinet.
 *
 * Fetches product types and age categories from the metadata API, renders the
 * creation form matching the design spec, and POSTs the order on submission.
 *
 * @module components/cabinet/CreatePersonalOrder
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { iconPaths } from '../ui/icons/iconPaths';
import type { ProductTypeLookup, AgeCategoryLookup } from '@/types';

const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };
const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };

const inputClass = cn(
  'h-[52px] w-full rounded-[12px] border border-[#b3b3b3] px-[16px]',
  'text-[16px] text-[#0d0d0d] outline-none focus:border-[#5e89e8] transition-colors'
);

const selectClass = cn(
  'h-[52px] w-full rounded-[12px] border border-[#b3b3b3] px-[16px]',
  'text-[16px] text-[#0d0d0d] outline-none focus:border-[#5e89e8] transition-colors',
  'appearance-none cursor-pointer'
);

interface CreatePersonalOrderProps {
  /**
   * Called when the user clicks the back arrow without submitting.
   */
  onBack: () => void;
  /**
   * Called after the order has been successfully created.
   */
  onCreated: () => void;
}

/**
 * Full-screen form inside the user cabinet for creating a personal order.
 *
 * @param props.onBack - Navigate back to the orders list.
 * @param props.onCreated - Navigate back after successful creation.
 * @returns The create-order form panel.
 * @example
 * ```tsx
 * <CreatePersonalOrder onBack={() => setSection('orders')} onCreated={() => setSection('orders')} />
 * ```
 */
export function CreatePersonalOrder({ onCreated }: CreatePersonalOrderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState<number | null>(null);
  const [ageCategoryId, setAgeCategoryId] = useState<number | null>(null);
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [types, setTypes] = useState<ProductTypeLookup[]>([]);
  const [ageCategories, setAgeCategories] = useState<AgeCategoryLookup[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [t, a] = await Promise.all([
          apiService.getProductTypes(),
          apiService.getAgeCategories(),
        ]);
        setTypes(t);
        setAgeCategories(a);
      } catch {
        toast.error('Не вдалося завантажити типи контенту');
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Введіть назву замовлення');
      return;
    }
    if (!typeId) {
      toast.error('Оберіть тип контенту');
      return;
    }
    if (!ageCategoryId) {
      toast.error('Оберіть вікову групу');
      return;
    }
    if (!deadline) {
      toast.error('Вкажіть дедлайн замовлення');
      return;
    }
    if (!description.trim()) {
      toast.error('Опишіть замовлення детально');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createPersonalOrder({
        orderTitle: title.trim(),
        orderDescription: description.trim(),
        orderMaterialType: typeId,
        orderMaterialAgeCategory: ageCategoryId,
        orderDeadline: deadline || undefined,
      });
      toast.success('Замовлення успішно створено');
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не вдалося створити замовлення';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0"
      data-name="CreatePersonalOrder"
    >
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden pt-[28px] pb-[20px] px-[20px]">

          {/* 2×2 grid: Title / Content type / Age group / Deadline */}
          <div className="grid grid-cols-2 gap-[24px] w-full shrink-0">
            <div className="flex flex-col gap-[8px]">
              <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Назва замовлення</label>
              <input
                type="text"
                placeholder="Введіть назву свята"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                style={fontRegular}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Тип контенту</label>
              <div className="relative">
                <select
                  value={typeId ?? ''}
                  onChange={(e) => setTypeId(e.target.value ? Number(e.target.value) : null)}
                  className={selectClass}
                  style={fontRegular}
                  disabled={metaLoading || isSubmitting}
                >
                  <option value="" disabled>Оберіть тип контенту</option>
                  {types
                    .filter((t) => t.name !== 'Безкоштовний матеріал')
                    .map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d={iconPaths.keyboardArrowDown} fill="#4d4d4d" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Вікова група</label>
              <div className="relative">
                <select
                  value={ageCategoryId ?? ''}
                  onChange={(e) => setAgeCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className={selectClass}
                  style={fontRegular}
                  disabled={metaLoading || isSubmitting}
                >
                  <option value="" disabled>Оберіть вікову групу</option>
                  {ageCategories.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d={iconPaths.keyboardArrowDown} fill="#4d4d4d" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Дедлайн</label>
              <input
                type="date"
                placeholder="До коли потрібно зробити?"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputClass}
                style={fontRegular}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 flex flex-col min-h-[160px] w-full gap-[4px]">
            <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Опис замовлення</label>
            <textarea
              placeholder="Детально опишіть що б Ви хотіли отримати"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                'flex-1 w-full min-h-[160px] rounded-[12px] border border-[#b3b3b3]',
                'px-[16px] py-[12px] text-[16px] text-[#0d0d0d] outline-none',
                'focus:border-[#5e89e8] transition-colors resize-none'
              )}
              style={fontRegular}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || metaLoading}
            className={cn(
              'w-full h-[44px] rounded-[12px] bg-[#5e89e8] text-white text-[16px]',
              'shrink-0 cursor-pointer hover:opacity-90 transition-opacity',
              'disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]'
            )}
            style={fontBold}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d={iconPaths.bag} fill="white" />
            </svg>
            {isSubmitting ? 'Відправлення...' : 'Замовити'}
          </button>

        </div>
      </div>
    </div>
  );
}
