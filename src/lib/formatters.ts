// ==============================================================================
// VIETNAMESE ENUM FORMATTERS & STYLING UTILITIES
// ==============================================================================

import { MemberRole, TaskStatus, TaskPriority, RatingGrade } from '@/types';

export function formatRole(role?: MemberRole | string): string {
  switch (role) {
    case 'bi_thu':
      return 'Bí thư';
    case 'pho_bi_thu':
      return 'Phó Bí thư';
    case 'chanh_van_phong':
      return 'Chánh Văn phòng';
    case 'uy_vien':
      return 'Ủy viên BTV';
    default:
      return role || 'Thành viên';
  }
}

export function formatStatus(status?: TaskStatus | string): string {
  switch (status) {
    case 'moi':
      return 'Mới giao';
    case 'dang_lam':
      return 'Đang làm';
    case 'cho_duyet':
    case 'pending_review':
      return 'Chờ duyệt';
    case 'hoan_thanh':
      return 'Hoàn thành';
    case 'tam_dung':
      return 'Tạm dừng';
    case 'huy':
      return 'Đã hủy';
    default:
      return status || 'Chưa rõ';
  }
}

export function formatPriority(priority?: TaskPriority | string): string {
  switch (priority) {
    case 'khan':
      return 'Khẩn cấp';
    case 'cao':
      return 'Ưu tiên cao';
    case 'binh_thuong':
      return 'Bình thường';
    case 'thap':
      return 'Ưu tiên thấp';
    default:
      return priority || 'Thường';
  }
}

export function formatRatingGrade(grade?: RatingGrade | string): { label: string; color: string; bg: string } {
  switch (grade) {
    case 'A':
      return { label: 'Loại A - Xuất sắc', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' };
    case 'B':
      return { label: 'Loại B - Tốt', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800' };
    case 'C':
      return { label: 'Loại C - Hoàn thành', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' };
    case 'D':
      return { label: 'Loại D - Cần cải thiện', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' };
    default:
      return { label: 'Chưa xếp loại', color: 'text-muted-foreground', bg: 'bg-muted border-border' };
  }
}

export function getStatusBadgeProps(status?: TaskStatus | string): { label: string; className: string } {
  switch (status) {
    case 'moi':
      return {
        label: 'Mới giao',
        className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      };
    case 'dang_lam':
      return {
        label: 'Đang làm',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      };
    case 'cho_duyet':
    case 'pending_review':
      return {
        label: 'Chờ duyệt',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-semibold',
      };
    case 'hoan_thanh':
      return {
        label: 'Hoàn thành',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    case 'tam_dung':
      return {
        label: 'Tạm dừng',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      };
    case 'huy':
      return {
        label: 'Đã hủy',
        className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      };
    default:
      return {
        label: status || 'Chưa rõ',
        className: 'bg-muted text-muted-foreground border-border',
      };
  }
}
