'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '../../lib/utils';

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      style={{
        '--rdp-accent-color': '#5e89e8',
        '--rdp-background-color': '#dce8ff',
        '--rdp-selected-color': '#ffffff',
      } as React.CSSProperties}
      components={{
        IconLeft: ({ className: cls, ...iconProps }: React.HTMLAttributes<SVGElement>) => (
          <ChevronLeft className={cn('size-4', cls)} {...iconProps} />
        ),
        IconRight: ({ className: cls, ...iconProps }: React.HTMLAttributes<SVGElement>) => (
          <ChevronRight className={cn('size-4', cls)} {...iconProps} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
