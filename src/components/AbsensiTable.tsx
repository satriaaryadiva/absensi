/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AbsensiTable.tsx
'use client'

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender
} from '@tanstack/react-table'
import { useMemo } from 'react'

export default function AbsensiTable({ data }: { data: any[] }) {
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      { accessorKey: 'nama', header: 'Nama' },
      { accessorKey: 'jabatan', header: 'Jabatan' },
      { accessorKey: 'tanggal', header: 'Tanggal' },
      {
        accessorKey: 'datang',
        header: 'Datang',
        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
      },
      {
        accessorKey: 'pulang',
        header: 'Pulang',
        cell: ({ getValue }) =>
          getValue()
            ? new Date(getValue()).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : '-'
      }
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="overflow-x-auto border rounded-md mt-6">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="p-2 text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
