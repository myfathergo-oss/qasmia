import { format, parseISO } from 'date-fns'
import { AttendanceStatus } from '../types'

export const formatDate = (iso: string) => {
  try { return format(parseISO(iso), 'dd MMM yyyy') } catch { return iso }
}

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const attendanceLabel: Record<AttendanceStatus, { en: string; ur: string; color: string }> = {
  present:       { en: 'Present',       ur: 'حاضر',       color: 'badge-present' },
  absent:        { en: 'Absent',        ur: 'غیر حاضر',   color: 'badge-absent'  },
  late:          { en: 'Late',          ur: 'دیر سے',     color: 'badge-late'    },
  approved_leave:{ en: 'Approved Leave',ur: 'منظور شدہ چھٹی', color: 'badge-leave' },
  not_marked:    { en: 'Not Marked',    ur: 'غیر نشان زد', color: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full' },
}

export const gradeFromMarks = (obtained: number, total: number): string => {
  const pct = (obtained / total) * 100
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

export const clsx = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ')
