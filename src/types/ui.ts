/**
 * @fileoverview Shared UI primitive component prop types.
 * @module types/ui
 */

export interface ErrorStateProps {
  error: string;
}

export interface IconBookmarksProps {
  isBookmarked: boolean;
}

export interface LocalMallProps {
  count: number;
}

export interface HelpProps {
  onClick?: () => void;
}

export interface CloseButtonProps {
  onClick?: () => void;
}

export interface DashboardCard {
  /** Unique section identifier passed back to onSectionChange on click. */
  id: string;
  /** Display label rendered below the icon. */
  label: string;
  /** SVG <path> d-attribute string for the card icon. */
  path: string;
  /** SVG viewBox for the icon, e.g. "0 0 70 70". */
  viewBox: string;
  /** Icon width/height in pixels. Defaults to 80. */
  iconSize?: number;
  /** Tailwind padding classes for the card. Defaults to "px-[24px] py-[16px]". */
  padding?: string;
}

export interface TabItem {
  id: string;
  label: string;
  path: string;
  viewBox: string;
  iconSize?: 'size-[16px]';
}
