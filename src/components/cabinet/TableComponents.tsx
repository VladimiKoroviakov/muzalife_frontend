import { ReactNode } from "react";

// Reusable table cell components
interface TableCellProps {
  children: ReactNode;
  bg?: string;
  className?: string;
}

export function TableCell({ children, bg = "#f2f2f2", className = "" }: TableCellProps) {
  return (
    <div 
      className={`h-[40px] relative shrink-0 w-full ${className}`} 
      style={{ backgroundColor: bg }} 
      data-name="Cell"
    >
      <div className="flex flex-row items-center size-full">
        {children}
      </div>
    </div>
  );
}

interface TextCellProps {
  text: string;
  bg?: string;
  bold?: boolean;
  color?: string;
  centered?: boolean;
  className?: string;
}

export function TextCell({ text, bg, bold = false, color = "#0d0d0d", centered = false, className = "" }: TextCellProps) {
  return (
    <TableCell bg={bg} className={className}>
      <div className={`box-border content-stretch flex gap-[16px] h-[40px] items-center ${
        centered ? 'px-[8px]' : 'pl-[16px] pr-[8px]'
      } py-[10px] relative w-full`}>
        <p className={`${
          centered ? 'basis-0 grow min-h-px min-w-px text-center' : ''
        } font-['Atkinson_Hyperlegible:${bold ? 'Bold' : 'Regular'}','Noto_Sans:${bold ? 'Bold' : 'Regular'}',sans-serif] leading-[normal] relative shrink-0 text-[16px] text-nowrap whitespace-pre`} 
          style={{ 
            fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${bold ? 700 : 400}`,
            color 
          }}
        >
          {text}
        </p>
      </div>
    </TableCell>
  );
}

export function ActionCell({ text, bg, bold = false, color = "#5e89e8", onClick }: { 
  text: string; 
  bg?: string; 
  bold?: boolean; 
  color?: string;
  onClick?: () => void;
}) {
  return (
    <TableCell bg={bg}>
      <div className="box-border content-stretch flex gap-[16px] h-[40px] items-center px-[16px] py-[10px] relative w-full">
        <p 
          className={`[text-underline-position:from-font] decoration-solid font-['Atkinson_Hyperlegible:${bold ? 'Bold' : 'Regular'}','Noto_Sans:${bold ? 'Bold' : 'Regular'}',sans-serif] leading-[normal] relative shrink-0 text-[16px] text-nowrap underline whitespace-pre cursor-pointer hover:opacity-70 transition-opacity`} 
          style={{ 
            fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${bold ? 700 : 400}`,
            color 
          }}
          onClick={onClick}
        >
          {text}
        </p>
      </div>
    </TableCell>
  );
}

export function EmptyCell({ bg }: { bg?: string }) {
  return (
    <TableCell bg={bg}>
      <div className="h-[40px] w-full" />
    </TableCell>
  );
}

// Reusable table column component
interface TableColumnProps {
  header: string;
  width: number | string;
  minWidth?: string;
  children: ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  onResize?: (e: React.MouseEvent, index: number) => void;
  columnIndex?: number;
}

export function TableColumn({ 
  header, 
  width, 
  minWidth = '100px', 
  children, 
  isFirst = false, 
  isLast = false,
  onResize,
  columnIndex 
}: TableColumnProps) {
  return (
    <div 
      className="content-stretch flex flex-col items-start relative" 
      data-name="Column"
      style={{ 
        flexBasis: width, 
        flexGrow: typeof width === 'number' ? 1 : 0,
        flexShrink: 1, 
        minWidth 
      }}
    >
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-solid border-white bottom-0 left-0 pointer-events-none right-[-1px] top-0" />
      
      {/* Header */}
      <div className={`bg-[#5e89e8] h-[40px] shrink-0 sticky top-0 w-full z-10 ${
        isFirst ? 'rounded-tl-[12px]' : isLast ? 'rounded-tr-[12px]' : ''
      }`} data-name="Column header">
        <div className="flex flex-row items-center justify-center size-full relative">
          <div className="box-border content-stretch flex gap-[10px] h-[40px] items-center justify-center p-[10px] relative w-full">
            <p className="capitalize font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] leading-[normal] relative shrink-0 text-[18px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
              {header}
            </p>
          </div>
          {onResize && columnIndex !== undefined && (
            <div
              className="absolute right-0 top-0 w-[4px] h-full cursor-col-resize hover:bg-white/30 z-20"
              onMouseDown={(e) => onResize(e, columnIndex)}
            />
          )}
        </div>
      </div>
      
      {/* Cells */}
      {children}
    </div>
  );
}

// Reusable table component
interface TableProps {
  columns: Array<{
    header: string;
    width: number | string;
    minWidth?: string;
    cells: ReactNode[];
  }>;
  onColumnResize?: (columnIndex: number, newWidth: number) => void;
}

export function Table({ columns, onColumnResize }: TableProps) {
  return (
    <div className="content-stretch flex gap-[2px] items-start relative rounded-[12px] w-full">
      {columns.map((column, index) => (
        <TableColumn
          key={index}
          header={column.header}
          width={column.width}
          minWidth={column.minWidth}
          isFirst={index === 0}
          isLast={index === columns.length - 1}
          onResize={onColumnResize ? (e, colIndex) => onColumnResize(colIndex, 0) : undefined}
          columnIndex={index}
        >
          {column.cells}
        </TableColumn>
      ))}
    </div>
  );
}