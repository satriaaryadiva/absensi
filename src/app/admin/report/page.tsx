/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// src/app/(admin)/admin/reports/page.tsx
'use client';
import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';

interface ReportStats {
  total: number;
  hadir: number;
  pulang: number;
  belumPulang: number;
}

interface ReportData {
  success: boolean;
  stats: ReportStats;
  data: any[];
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const date = reportType === 'daily' ? selectedDate : selectedMonth;
      const res = await fetch(`/api/attendance/report?type=${reportType}&date=${date}`);
      const data = await res.json();
      
      if (data.success) {
        setReportData(data);
        toast.success('Laporan berhasil dibuat');
      }
    } catch (error) {
      toast.error('Gagal membuat laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Laporan Absensi</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">Harian</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>

          {reportType === 'daily' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulan
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Memuat...' : 'Generate Laporan'}
            </button>
          </div>
        </div>

        {reportData && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-700">{reportData.stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Hadir</p>
                <p className="text-2xl font-bold text-green-700">{reportData.stats.hadir}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Pulang</p>
                <p className="text-2xl font-bold text-purple-700">{reportData.stats.pulang}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Belum Pulang</p>
                <p className="text-2xl font-bold text-yellow-700">{reportData.stats.belumPulang}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}