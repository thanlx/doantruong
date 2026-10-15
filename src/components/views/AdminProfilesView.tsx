'use client';

// ==============================================================================
// QUẢN LÝ HỒ SƠ CÁN BỘ (ADMIN PROFILES VIEW - FULL CRUD & EXCEL IMPORT/EXPORT)
// Hỗ trợ tìm kiếm, lọc, xem chi tiết 3 tab, chỉnh sửa hồ sơ, quản lý kiêm nhiệm,
// tải file mẫu Excel, nhập danh sách cán bộ từ file Excel (.xlsx/.xls/.csv) và xuất Excel.
// ==============================================================================

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Lock,
  Upload,
  Download,
  Edit,
  Trash2,
  X,
  Briefcase,
  History,
  UserCheck,
} from 'lucide-react';
import { OfficerProfile, SubsystemId } from '@/types';

interface ParsedExcelRow {
  rowIndex: number;
  full_name: string;
  student_id: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'Nam' | 'Nữ';
  unit_name: string;
  position_title: string;
  subsystem_id: string;
  term: string;
  major: string;
  qualification: string;
  political_theory: string;
  is_party_member: string;
  hometown: string;
  current_residence: string;
  ethnicity: string;
  religion: string;
  password?: string;
  status: 'valid' | 'duplicate' | 'invalid';
  statusNote: string;
  raw: any;
}

export default function AdminProfilesView() {
  const {
    profiles,
    subsystems,
    units,
    auditLogs,
    updateRequests,
    addProfile,
    updateProfile,
    deleteProfile,
    importProfilesFromExcel,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [subsystemFilter, setSubsystemFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected profile for right-side drawer
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || 'prof_thanlx');
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const [activeDetailTab, setActiveDetailTab] = useState<'ca_nhan' | 'chuc_vu' | 'lich_su'>('ca_nhan');
  const [notice, setNotice] = useState<string | null>(null);

  // Create Profile Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDob, setNewDob] = useState('2004-01-01');
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newHometown, setNewHometown] = useState('TP. Hồ Chí Minh');
  const [newResidence, setNewResidence] = useState('TP. Hồ Chí Minh');
  const [newMajor, setNewMajor] = useState('');
  const [newQualification, setNewQualification] = useState('Sinh viên');
  const [newPolitical, setNewPolitical] = useState('Sơ cấp');
  const [newUnitId, setNewUnitId] = useState('unit_doan_truong');
  const [newPosition, setNewPosition] = useState('Ủy viên BCH');
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<OfficerProfile>>({});

  // Add Concurrent Role (Kiêm nhiệm) Modal
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [roleUnitId, setRoleUnitId] = useState('unit_doan_truong');
  const [roleTitle, setRoleTitle] = useState('Ủy viên BCH');
  const [roleTerm, setRoleTerm] = useState('2025 - 2027');
  const [roleDecisionNo, setRoleDecisionNo] = useState('');

  // Excel Import State
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState<'update' | 'skip'>('update');

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 5000);
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.full_name.toLowerCase().includes(q);
      const matchMssv = p.student_id?.toLowerCase().includes(q) || p.staff_id?.toLowerCase().includes(q);
      const matchEmail = p.email?.toLowerCase().includes(q);
      const matchCode = p.profile_code?.toLowerCase().includes(q);
      if (!matchName && !matchMssv && !matchEmail && !matchCode) return false;
    }
    if (subsystemFilter !== 'all' && p.primary_subsystem_id !== subsystemFilter) return false;
    if (unitFilter !== 'all' && p.primary_unit_id !== unitFilter && !p.roles.some((r) => r.unit_id === unitFilter))
      return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified' && p.verification_status !== 'verified') return false;
      if (statusFilter === 'pending' && p.verification_status !== 'pending_update') return false;
    }
    return true;
  });

  // 1. Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Họ và tên': 'Nguyễn Văn Minh',
        MSSV: '22110101',
        Email: '22110101@student.hcmute.edu.vn',
        'Số điện thoại': '0901234567',
        'Ngày sinh': '2004-05-15',
        'Giới tính': 'Nam',
        'Đơn vị': 'Đoàn cơ sở',
        'Chức vụ': 'Bí thư Đoàn cơ sở',
        'Phân hệ': 'P03',
        'Nhiệm kỳ': '2025 - 2027',
        'Ngành học': 'Công nghệ thông tin',
        'Trình độ chuyên môn': 'Sinh viên',
        'Lý luận chính trị': 'Sơ cấp',
        'Đảng viên': 'Có',
        'Quê quán': 'TP. Hồ Chí Minh',
        'Nơi ở hiện nay': 'TP. Thủ Đức, TP. Hồ Chí Minh',
        'Dân tộc': 'Kinh',
        'Tôn giáo': 'Không',
        'Mật khẩu': 'Hcmute@123',
      },
      {
        'Họ và tên': 'Trần Thị Thu Hà',
        MSSV: '23110205',
        Email: '23110205@student.hcmute.edu.vn',
        'Số điện thoại': '0912345678',
        'Ngày sinh': '2005-08-20',
        'Giới tính': 'Nữ',
        'Đơn vị': 'CLB Truyền thông',
        'Chức vụ': 'Chủ nhiệm',
        'Phân hệ': 'P06',
        'Nhiệm kỳ': '2025 - 2026',
        'Ngành học': 'Truyền thông đa phương tiện',
        'Trình độ chuyên môn': 'Sinh viên',
        'Lý luận chính trị': 'Sơ cấp',
        'Đảng viên': 'Không',
        'Quê quán': 'Đồng Nai',
        'Nơi ở hiện nay': 'TP. Thủ Đức, TP. Hồ Chí Minh',
        'Dân tộc': 'Kinh',
        'Tôn giáo': 'Không',
        'Mật khẩu': 'Hcmute@123',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Can_Bo');
    XLSX.writeFile(wb, 'Mau_Nhap_Can_Bo_Doan_Hoi_HCMUTE.xlsx');
    showNotice('Đã tải xuống file mẫu Mau_Nhap_Can_Bo_Doan_Hoi_HCMUTE.xlsx thành công!');
  };

  // 2. Export Filtered Profiles to Excel
  const handleExportExcel = () => {
    const exportData = filteredProfiles.map((p, idx) => ({
      STT: idx + 1,
      'Mã cán bộ': p.profile_code,
      'Họ và tên': p.full_name,
      'MSSV / Mã CB': p.student_id || p.staff_id || '',
      Email: p.email,
      'Số điện thoại': p.phone,
      'Ngày sinh': p.date_of_birth,
      'Giới tính': p.gender,
      'Đơn vị chính': units.find((u) => u.id === p.primary_unit_id)?.name || p.roles[0]?.unit_name || '',
      'Chức vụ đảm nhiệm': p.roles.map((r) => `${r.position_title} (${r.unit_name})`).join('; '),
      'Phân hệ': p.primary_subsystem_id,
      'Ngành học': p.major || '',
      'Trình độ chuyên môn': p.qualification || '',
      'Lý luận chính trị': p.political_theory || '',
      'Đoàn viên': p.is_union_member ? 'Có' : 'Không',
      'Đảng viên': p.is_party_member ? 'Có' : 'Không',
      'Quê quán': p.hometown,
      'Nơi ở hiện nay': p.current_residence,
      'Trạng thái': p.verification_status === 'verified' ? 'Đã xác thực' : 'Chờ bổ sung',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Can_Bo_Doan_Hoi');
    XLSX.writeFile(wb, `Danh_Sach_Can_Bo_Doan_Hoi_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotice(`Đã xuất ${exportData.length} hồ sơ cán bộ ra file Excel thành công!`);
  };

  // 3. Parse Uploaded Excel File
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        const analyzed: ParsedExcelRow[] = rawJson.map((row, idx) => {
          const fullName = String(
            row['Họ và tên'] || row['Ho va ten'] || row.full_name || row['HỌ VÀ TÊN'] || ''
          ).trim();
          const studentId = String(
            row['MSSV'] || row['Mã số SV/CB'] || row['Mã cán bộ'] || row.student_id || ''
          ).trim();
          const email = String(
            row['Email'] ||
              row.email ||
              (studentId ? `${studentId.toLowerCase()}@student.hcmute.edu.vn` : '')
          ).trim();
          const phone = String(row['Số điện thoại'] || row['SĐT'] || row.phone || '').trim();
          const dob = String(row['Ngày sinh'] || row.date_of_birth || '2004-01-01').trim();
          const genderRaw = String(row['Giới tính'] || row.gender || 'Nam').trim();
          const gender: 'Nam' | 'Nữ' =
            genderRaw.toLowerCase().includes('nữ') || genderRaw.toLowerCase() === 'nu' ? 'Nữ' : 'Nam';
          const unitName = String(row['Đơn vị'] || row.unit_name || 'Đoàn cơ sở').trim();
          const positionTitle = String(row['Chức vụ'] || row.position_title || 'Ủy viên BCH').trim();
          const subsystemId = String(row['Phân hệ'] || row.subsystem_id || 'P03').trim();
          const term = String(row['Nhiệm kỳ'] || row.term || '2025 - 2027').trim();
          const major = String(row['Ngành học'] || row.major || '').trim();
          const qualification = String(row['Trình độ chuyên môn'] || row.qualification || 'Sinh viên').trim();
          const politicalTheory = String(row['Lý luận chính trị'] || row.political_theory || 'Sơ cấp').trim();
          const isParty = String(row['Đảng viên'] || row.is_party_member || 'Không').trim();
          const hometown = String(row['Quê quán'] || row.hometown || 'TP. Hồ Chí Minh').trim();
          const currentResidence = String(row['Nơi ở hiện nay'] || row.current_residence || hometown).trim();
          const ethnicity = String(row['Dân tộc'] || row.ethnicity || 'Kinh').trim();
          const religion = String(row['Tôn giáo'] || row.religion || 'Không').trim();
          const password = String(row['Mật khẩu'] || row.password || studentId || 'Hcmute@123').trim();

          let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
          let statusNote = 'Hợp lệ - Sẵn sàng thêm mới';

          if (!fullName || (!studentId && !email)) {
            status = 'invalid';
            statusNote = 'Thiếu Họ tên hoặc MSSV/Email';
          } else {
            const isDup = profiles.some(
              (p) =>
                (studentId && p.student_id?.toLowerCase() === studentId.toLowerCase()) ||
                (email && p.email?.toLowerCase() === email.toLowerCase())
            );
            if (isDup) {
              status = 'duplicate';
              statusNote = 'Trùng MSSV/Email trên hệ thống';
            }
          }

          return {
            rowIndex: idx + 1,
            full_name: fullName,
            student_id: studentId,
            email,
            phone,
            date_of_birth: dob,
            gender,
            unit_name: unitName,
            position_title: positionTitle,
            subsystem_id: subsystemId,
            term,
            major,
            qualification,
            political_theory: politicalTheory,
            is_party_member: isParty,
            hometown,
            current_residence: currentResidence,
            ethnicity,
            religion,
            password,
            status,
            statusNote,
            raw: row,
          };
        });

        setParsedRows(analyzed);
        setIsExcelPreviewOpen(true);
      } catch (err) {
        alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file (.xlsx, .xls, .csv).');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleConfirmExcelImport = () => {
    const validAndDupRows = parsedRows.filter((r) => r.status !== 'invalid');
    if (validAndDupRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nhập!');
      return;
    }
    const res = importProfilesFromExcel(validAndDupRows, duplicateMode);
    setIsExcelPreviewOpen(false);
    showNotice(res.message);
  };

  // Create Profile Submit
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newFullName.trim() || !newStudentId.trim()) {
      setCreateError('Vui lòng nhập Họ tên và MSSV/Mã cán bộ.');
      return;
    }

    const selectedUnitObj = units.find((u) => u.id === newUnitId);

    const res = addProfile({
      profile_code: '',
      full_name: newFullName.trim(),
      officer_type: newStudentId.toUpperCase().startsWith('CB') ? 'can_bo_giang_vien' : 'sinh_vien',
      student_id: newStudentId.trim(),
      date_of_birth: newDob,
      gender: newGender,
      hometown: newHometown,
      current_residence: newResidence,
      ethnicity: 'Kinh',
      religion: 'Không',
      major: newMajor,
      qualification: newQualification,
      political_theory: newPolitical,
      email: newEmail.trim() || `${newStudentId.trim().toLowerCase()}@student.hcmute.edu.vn`,
      phone: newPhone.trim() || '0901234567',
      verification_status: 'verified',
      primary_subsystem_id: selectedUnitObj?.subsystem_id || 'P03',
      primary_unit_id: newUnitId,
      is_union_member: true,
      is_party_member: false,
      roles: [
        {
          id: 'role_' + Date.now(),
          profile_id: '',
          unit_id: newUnitId,
          unit_name: selectedUnitObj?.name || 'Đoàn cơ sở',
          subsystem_id: selectedUnitObj?.subsystem_id || 'P03',
          position_title: newPosition,
          term: '2025 - 2027',
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          status: 'active',
        },
      ],
    });

    if (!res.success) {
      setCreateError(res.message);
    } else {
      setIsCreateModalOpen(false);
      setNewFullName('');
      setNewStudentId('');
      setNewEmail('');
      setNewPhone('');
      showNotice(res.message);
    }
  };

  // Open Edit Profile Modal
  const handleOpenEditModal = (prof: OfficerProfile) => {
    setEditForm({ ...prof });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    const res = updateProfile(selectedProfile.id, editForm);
    if (res.success) {
      setIsEditModalOpen(false);
      showNotice(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleDeleteProfile = (prof: OfficerProfile) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ cán bộ ${prof.full_name} (${prof.student_id})?`)) return;
    const res = deleteProfile(prof.id);
    if (res.success) {
      showNotice(res.message);
    } else {
      alert(res.message);
    }
  };

  // Add Concurrent Role (Kiêm nhiệm)
  const handleAddRoleToProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    const unitObj = units.find((u) => u.id === roleUnitId) || units[0];
    const newRole = {
      id: `role_${Date.now()}`,
      profile_id: selectedProfile.id,
      unit_id: roleUnitId,
      unit_name: unitObj?.name || 'Đoàn trường',
      subsystem_id: (unitObj?.subsystem_id || 'P03') as SubsystemId,
      position_title: roleTitle.trim() || 'Ủy viên BCH',
      term: roleTerm.trim() || '2025 - 2027',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      decision_number: roleDecisionNo.trim() || 'QĐ-ĐTN',
      status: 'active' as const,
    };
    const res = updateProfile(selectedProfile.id, {
      roles: [...selectedProfile.roles, newRole],
    });
    if (res.success) {
      setIsAddRoleOpen(false);
      setRoleDecisionNo('');
      showNotice(`Đã thêm chức vụ kiêm nhiệm "${newRole.position_title}" cho ${selectedProfile.full_name}!`);
    }
  };

  const handleRemoveRole = (roleId: string) => {
    if (!selectedProfile) return;
    if (selectedProfile.roles.length <= 1) {
      alert('Cán bộ cần có ít nhất 1 chức vụ trong hồ sơ.');
      return;
    }
    const nextRoles = selectedProfile.roles.filter((r) => r.id !== roleId);
    updateProfile(selectedProfile.id, { roles: nextRoles });
    showNotice('Đã xóa chức vụ khỏi hồ sơ cán bộ.');
  };

  const validCount = parsedRows.filter((r) => r.status === 'valid').length;
  const dupCount = parsedRows.filter((r) => r.status === 'duplicate').length;
  const invalidCount = parsedRows.filter((r) => r.status === 'invalid').length;

  const profileLogs = auditLogs.filter(
    (l) =>
      l.target_id === selectedProfile?.id ||
      l.target_name?.toLowerCase().includes(selectedProfile?.full_name?.toLowerCase() || '')
  );
  const profileRequests = updateRequests.filter((r) => r.profile_id === selectedProfile?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hidden File Input for Excel Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelFileUpload}
        className="hidden"
      />

      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Quản lý hồ sơ cán bộ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách nhân sự toàn trường, nhập/xuất file Excel (.xlsx), chỉnh sửa lý lịch và quản lý chức vụ kiêm nhiệm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            title="Tải file mẫu Excel chuẩn để nhập danh sách cán bộ"
          >
            <Download className="h-4 w-4 text-primary" />
            <span>Tải file mẫu Excel</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Nhập từ Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Xuất Excel ({filteredProfiles.length})</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm cán bộ</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. FILTERS BAR */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm Họ tên, MSSV, Email, Mã CB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Phân hệ: Tất cả</option>
              {subsystems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Đơn vị: Tất cả</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="verified">Đã xác thực</option>
              <option value="pending">Chờ bổ sung</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (TABLE 7 COLS + DETAIL DRAWER 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: STAFF TABLE + IMPORT EXCEL CARD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                    <th className="py-3 px-3">Họ tên</th>
                    <th className="py-3 px-3">MSSV / Mã CB</th>
                    <th className="py-3 px-3">Đơn vị</th>
                    <th className="py-3 px-3">Chức vụ</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProfiles.map((p) => {
                    const isSelected = selectedProfile?.id === p.id;
                    const primaryRole = p.roles[0]?.position_title || 'Thành viên';
                    const unitName = p.roles[0]?.unit_name || 'Đoàn trường';

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground block">{p.full_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {p.profile_code} • {p.email}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{p.student_id || p.staff_id}</td>
                        <td className="py-3 px-3 text-muted-foreground">{unitName}</td>
                        <td className="py-3 px-3 font-medium text-foreground">
                          <span>{primaryRole}</span>
                          {p.roles.length > 1 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                              +{p.roles.length - 1} kiêm nhiệm
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.verification_status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-700'
                                : 'bg-amber-500/10 text-amber-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                p.verification_status === 'verified' ? 'bg-emerald-600' : 'bg-amber-600'
                              }`}
                            />
                            {p.verification_status === 'verified' ? 'Đã xác thực' : 'Chờ bổ sung'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedProfileId(p.id);
                                handleOpenEditModal(p);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Sửa
                            </button>
                            {p.id !== 'prof_thanlx' && (
                              <button
                                onClick={() => handleDeleteProfile(p)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
              <span>
                Hiển thị {filteredProfiles.length} / {profiles.length} cán bộ
              </span>
              <span className="text-[11px]">Bấm vào một dòng để xem và quản lý chi tiết bên phải</span>
            </div>
          </div>

          {/* CARD: NHẬP DANH SÁCH CÁN BỘ TỪ EXCEL (INTERACTIVE UPLOAD & PREVIEW) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Nhập danh sách cán bộ hàng loạt từ file Excel (.xlsx, .xls, .csv)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Tải file mẫu chuẩn</span>
                </button>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-foreground block">
                    {excelFileName || 'Bấm vào đây để chọn tệp Excel (.xlsx, .xls, .csv) từ máy tính'}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">
                    Hệ thống tự động đọc danh sách, kiểm tra trùng MSSV/Email và tạo tài khoản đăng nhập cho cán bộ mới
                  </span>
                </div>
              </div>

              <span className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 shadow-2xs">
                Chọn file Excel
              </span>
            </div>

            {parsedRows.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <span className="font-black text-sm">+ {validCount}</span>
                      <span className="text-xs font-bold">hợp lệ (mới)</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Sẵn sàng thêm mới</p>
                  </div>

                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <span className="font-black text-sm">{dupCount}</span>
                      <span className="text-xs font-bold">trùng MSSV/Email</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Có thể cập nhật hoặc bỏ qua</p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-black text-sm">{invalidCount}</span>
                      <span className="text-xs font-bold">thiếu thông tin</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Thiếu Họ tên hoặc MSSV</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsExcelPreviewOpen(true)}
                    className="px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Xem trước & Xác nhận nhập ({parsedRows.length} dòng)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL PROFILE DRAWER */}
        <div className="lg:col-span-5">
          {selectedProfile ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 sticky top-20">
              {/* Header of Drawer */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-3.5">
                  {selectedProfile.avatar_url ? (
                    <img
                      src={selectedProfile.avatar_url}
                      alt={selectedProfile.full_name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-black shadow-xs">
                      {selectedProfile.full_name.split(' ').slice(-1)[0][0]}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-foreground">{selectedProfile.full_name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                        {selectedProfile.verification_status === 'verified' ? 'Đã xác thực' : 'Chờ bổ sung'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">
                      MSSV / Mã CB: {selectedProfile.student_id || selectedProfile.staff_id} ({selectedProfile.profile_code})
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {selectedProfile.roles[0]?.position_title} • {selectedProfile.roles[0]?.unit_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-border text-xs font-bold">
                {[
                  { id: 'ca_nhan', label: 'Cá nhân & Lý lịch' },
                  { id: 'chuc_vu', label: `Chức vụ (${selectedProfile.roles.length})` },
                  { id: 'lich_su', label: 'Lịch sử' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
                      activeDetailTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: CÁ NHÂN */}
              {activeDetailTab === 'ca_nhan' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Mã cán bộ:</span>
                      <strong className="font-mono text-foreground">{selectedProfile.profile_code}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Họ và tên:</span>
                      <span className="text-foreground font-semibold">{selectedProfile.full_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">MSSV / Mã CB:</span>
                      <span className="font-mono text-foreground">{selectedProfile.student_id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Ngày sinh / Giới tính:</span>
                      <span className="text-foreground">
                        {selectedProfile.date_of_birth} ({selectedProfile.gender})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{selectedProfile.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Số điện thoại:</span>
                      <span className="text-foreground">{selectedProfile.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Quê quán:</span>
                      <span className="text-foreground">{selectedProfile.hometown}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Nơi ở hiện nay:</span>
                      <span className="text-foreground">{selectedProfile.current_residence}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Dân tộc / Tôn giáo:</span>
                      <span className="text-foreground">
                        {selectedProfile.ethnicity} / {selectedProfile.religion}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Chuyên môn / Ngành:</span>
                      <span className="text-foreground">
                        {selectedProfile.qualification || 'Đại học'} - {selectedProfile.major || 'Kỹ thuật'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Lý luận chính trị / Đảng:</span>
                      <span className="text-foreground">
                        {selectedProfile.political_theory || 'Sơ cấp'} •{' '}
                        {selectedProfile.is_party_member ? 'Đảng viên' : 'Đoàn viên'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHỨC VỤ & KIÊM NHIỆM */}
              {activeDetailTab === 'chuc_vu' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span>Danh sách chức vụ đảm nhiệm ({selectedProfile.roles.length})</span>
                    </h4>
                    <button
                      onClick={() => setIsAddRoleOpen(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm kiêm nhiệm
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedProfile.roles.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl border border-border bg-muted/20 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-foreground">
                            {r.position_title} — <span className="text-primary">{r.unit_name}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Nhiệm kỳ: {r.term} • Từ {r.start_date} đến {r.end_date || 'nay'}
                          </p>
                          {r.decision_number && (
                            <p className="text-[10px] text-muted-foreground">Số QĐ: {r.decision_number}</p>
                          )}
                        </div>
                        {selectedProfile.roles.length > 1 && (
                          <button
                            onClick={() => handleRemoveRole(r.id)}
                            className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                            title="Gỡ chức vụ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LỊCH SỬ */}
              {activeDetailTab === 'lich_su' && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-primary" />
                    <span>Nhật ký thay đổi & Yêu cầu cập nhật</span>
                  </h4>
                  {profileRequests.length === 0 && profileLogs.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      Chưa có lịch sử biến động cho hồ sơ này (Phiên bản v{selectedProfile.version}.0).
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {profileRequests.map((req) => (
                        <div key={req.id} className="p-2.5 rounded-xl border border-border bg-muted/20 text-xs">
                          <div className="flex justify-between font-bold">
                            <span>Yêu cầu {req.id}</span>
                            <span className="text-[10px] text-primary">{req.created_at}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{req.reason}</p>
                        </div>
                      ))}
                      {profileLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-xl border border-border bg-background text-xs">
                          <div className="flex justify-between font-bold">
                            <span>{log.action_label}</span>
                            <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-border">
                <button
                  onClick={() => handleOpenEditModal(selectedProfile)}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
                <button
                  onClick={() => setIsAddRoleOpen(true)}
                  className="py-2.5 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
                >
                  + Kiêm nhiệm
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
              Chọn một cán bộ từ danh sách để xem chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CREATE PROFILE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Thêm mới hồ sơ cán bộ</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Họ và tên cán bộ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">MSSV / Mã cán bộ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 23110999"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Email (@hcmute.edu.vn)</label>
                  <input
                    type="email"
                    placeholder="23110999@student.hcmute.edu.vn"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0901234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Ngày sinh</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Giới tính</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'Nam' | 'Nữ')}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Đơn vị quản lý</label>
                  <select
                    value={newUnitId}
                    onChange={(e) => setNewUnitId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground">Chức danh đảm nhiệm</label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-foreground">Khoa / Ngành học</label>
                  <input
                    type="text"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    placeholder="VD: CNTT"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Trình độ chuyên môn</label>
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Lý luận chính trị</label>
                  <input
                    type="text"
                    value={newPolitical}
                    onChange={(e) => setNewPolitical(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Quê quán</label>
                  <input
                    type="text"
                    value={newHometown}
                    onChange={(e) => setNewHometown(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Nơi ở hiện nay</label>
                  <input
                    type="text"
                    value={newResidence}
                    onChange={(e) => setNewResidence(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Lưu hồ sơ & Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROFILE */}
      {isEditModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">
                Chỉnh sửa hồ sơ: {selectedProfile.full_name} ({selectedProfile.profile_code})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">MSSV / Mã CB *</label>
                  <input
                    type="text"
                    required
                    value={editForm.student_id || ''}
                    onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Số điện thoại</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Ngày sinh</label>
                  <input
                    type="date"
                    value={editForm.date_of_birth || ''}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Giới tính</label>
                  <select
                    value={editForm.gender || 'Nam'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'Nam' | 'Nữ' })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Quê quán</label>
                  <input
                    type="text"
                    value={editForm.hometown || ''}
                    onChange={(e) => setEditForm({ ...editForm, hometown: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Nơi ở hiện nay</label>
                  <input
                    type="text"
                    value={editForm.current_residence || ''}
                    onChange={(e) => setEditForm({ ...editForm, current_residence: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-foreground">Ngành học</label>
                  <input
                    type="text"
                    value={editForm.major || ''}
                    onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Trình độ chuyên môn</label>
                  <input
                    type="text"
                    value={editForm.qualification || ''}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Lý luận chính trị</label>
                  <input
                    type="text"
                    value={editForm.political_theory || ''}
                    onChange={(e) => setEditForm({ ...editForm, political_theory: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Trạng thái xác thực</label>
                  <select
                    value={editForm.verification_status || 'verified'}
                    onChange={(e) =>
                      setEditForm({ ...editForm, verification_status: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value="verified">Đã xác thực</option>
                    <option value="pending_update">Chờ bổ sung</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editForm.is_party_member)}
                      onChange={(e) => setEditForm({ ...editForm, is_party_member: e.target.checked })}
                      className="rounded text-primary"
                    />
                    <span className="font-bold">Là Đảng viên</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CONCURRENT ROLE (KIÊM NHIỆM) */}
      {isAddRoleOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">
                Thêm chức vụ kiêm nhiệm ({selectedProfile.full_name})
              </h3>
              <button
                onClick={() => setIsAddRoleOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddRoleToProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Đơn vị đảm nhiệm *</label>
                <select
                  value={roleUnitId}
                  onChange={(e) => setRoleUnitId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-foreground">Chức danh đảm nhiệm *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="VD: Chủ nhiệm CLB, Bí thư..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Nhiệm kỳ</label>
                  <input
                    type="text"
                    value={roleTerm}
                    onChange={(e) => setRoleTerm(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Số quyết định</label>
                  <input
                    type="text"
                    value={roleDecisionNo}
                    onChange={(e) => setRoleDecisionNo(e.target.value)}
                    placeholder="VD: 15-QĐ/ĐTN"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold cursor-pointer"
                >
                  Thêm chức vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EXCEL PREVIEW & BATCH IMPORT */}
      {isExcelPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Xem trước dữ liệu nhập từ Excel: {excelFileName}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tổng cộng {parsedRows.length} dòng: <b className="text-emerald-600">{validCount} hợp lệ mới</b>,{' '}
                  <b className="text-amber-600">{dupCount} trùng MSSV/Email</b>,{' '}
                  <b className="text-rose-600">{invalidCount} lỗi thiếu dữ liệu</b>.
                </p>
              </div>
              <button
                onClick={() => setIsExcelPreviewOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dupCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-amber-900">
                  Phát hiện {dupCount} cán bộ trùng MSSV hoặc Email đã có trong hệ thống. Chọn cách xử lý:
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold text-amber-900 cursor-pointer">
                    <input
                      type="radio"
                      name="dupMode"
                      checked={duplicateMode === 'update'}
                      onChange={() => setDuplicateMode('update')}
                    />
                    <span>Cập nhật thông tin & thêm kiêm nhiệm</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-amber-900 cursor-pointer">
                    <input
                      type="radio"
                      name="dupMode"
                      checked={duplicateMode === 'skip'}
                      onChange={() => setDuplicateMode('skip')}
                    />
                    <span>Bỏ qua dòng trùng</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Họ và tên</th>
                    <th className="p-2.5">MSSV</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Đơn vị</th>
                    <th className="p-2.5">Chức vụ</th>
                    <th className="p-2.5">Trạng thái kiểm tra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedRows.map((r) => (
                    <tr key={r.rowIndex} className="hover:bg-muted/30">
                      <td className="p-2.5 font-mono text-muted-foreground">{r.rowIndex}</td>
                      <td className="p-2.5 font-bold text-foreground">{r.full_name || '—'}</td>
                      <td className="p-2.5 font-mono">{r.student_id || '—'}</td>
                      <td className="p-2.5 text-muted-foreground">{r.email || '—'}</td>
                      <td className="p-2.5">{r.unit_name}</td>
                      <td className="p-2.5 font-medium">{r.position_title}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'valid'
                              ? 'bg-emerald-500/10 text-emerald-700'
                              : r.status === 'duplicate'
                              ? 'bg-amber-500/10 text-amber-700'
                              : 'bg-rose-500/10 text-rose-700'
                          }`}
                        >
                          {r.statusNote}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted cursor-pointer"
              >
                Chọn file khác
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExcelPreviewOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExcelImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận nhập vào hệ thống ({validCount + (duplicateMode === 'update' ? dupCount : 0)} cán bộ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
