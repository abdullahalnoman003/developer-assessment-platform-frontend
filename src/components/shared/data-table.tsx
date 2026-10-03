import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  // label for the stacked mobile card; inferred from header when it is text
  mobileLabel?: string;
  cell: (row: T) => ReactNode;
}

function mobileLabelOf(
  header: ReactNode,
  explicit: string | undefined,
): string | null {
  if (explicit) return explicit;
  if (typeof header === "string" || typeof header === "number") {
    return String(header);
  }
  return null;
}

// a cell sized for a table column does not fit a stacked card
function mobileCellClass(className: string | undefined): string | undefined {
  return className
    ?.replace(/\btext-(?:right|center)\b/g, "text-left")
    .replace(/\bwhitespace-nowrap\b/g, "whitespace-normal")
    .replace(/\b(?:w|min-w)-[\w./[\]-]+\b/g, "")
    .trim();
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  className,
  empty,
}: {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string;
  caption: string;
  className?: string;
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <>
      {/* display:none keeps the hidden branch out of the accessibility tree */}
      <div className={cn("hidden w-full overflow-x-auto md:block", className)}>
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  className={column.headerClassName}
                  key={column.key}
                  scope="col"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell className={column.className} key={column.key}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul aria-label={caption} className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <li className="border border-border bg-card p-3" key={getRowKey(row)}>
            <dl className="flex flex-col gap-2">
              {columns.map((column) => {
                const label = mobileLabelOf(column.header, column.mobileLabel);
                return (
                  <div
                    className={
                      label
                        ? "grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-start gap-2"
                        : undefined
                    }
                    key={column.key}
                  >
                    {label ? (
                      <dt className="text-xs font-medium text-muted-foreground">
                        {label}
                      </dt>
                    ) : null}
                    <dd
                      className={cn(
                        "min-w-0 text-xs break-words",
                        label ? "min-w-0" : "col-span-2",
                        mobileCellClass(column.className),
                      )}
                    >
                      {column.cell(row)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
