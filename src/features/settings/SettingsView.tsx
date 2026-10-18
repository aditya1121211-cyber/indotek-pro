import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../context/AppContext';
import { useCan } from '../../hooks/useCan';
import { Can } from '../../components/shared/Can';
import {
  INVITABLE_MEMBER_ROLES,
  InvitableMemberRole,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  UserRole,
} from '../../utils/permissions';
import { formatDateIndo } from '../../utils/format';
import {
  memberInvitationSchema,
  type MemberInvitationInput,
} from './schemas/member.schema';
import { memberMessages } from '../../i18n/id';
import {
  Building2,
  Users,
  Shield,
  FileCode,
  Activity,
  Plus,
  Mail,
  UserCheck,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Sparkles,
  Key,
} from 'lucide-react';

export const SettingsView: React.FC<{
  onOpenSupabaseModal: () => void;
}> = ({ onOpenSupabaseModal }) => {
  const {
    currentOrg,
    members,
    membersLoading,
    membersError,
    reloadMembers,
    authSession,
    currentRole,
    handleInviteMember,
    handleUpdateRole,
    handleToggleMember,
    auditLogs,
    handleResetDemo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'company' | 'team' | 'roles' | 'numbering' | 'audit'>('company');

  // Company Form state
  const [compName, setCompName] = useState(currentOrg?.name || '');
  const [compCode, setCompCode] = useState(currentOrg?.company_code || 'IKN');
  const [compNpwp, setCompNpwp] = useState(currentOrg?.npwp || '');
  const [compNib, setCompNib] = useState(currentOrg?.nib || '');
  const [compAddress, setCompAddress] = useState(currentOrg?.address || '');
  const [compCity, setCompCity] = useState(currentOrg?.city || '');
  const [compPhone, setCompPhone] = useState(currentOrg?.phone || '');
  const [compBankName, setCompBankName] = useState(currentOrg?.bank_name || 'Bank Mandiri');
  const [compBankNo, setCompBankNo] = useState(currentOrg?.bank_account_no || '127-00-1122334-5');
  const [isSaved, setIsSaved] = useState(false);

  // Invite Member Modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteNotice, setInviteNotice] = useState('');
  const [memberActionError, setMemberActionError] = useState('');
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const {
    register: registerInviteField,
    handleSubmit: handleInviteSubmit,
    setError: setInviteFieldError,
    reset: resetInviteForm,
    formState: { errors: inviteFieldErrors, isSubmitting: isInviteSubmitting },
  } = useForm<Omit<MemberInvitationInput, 'organization_id'>>({
    mode: 'onSubmit',
    defaultValues: {
      full_name: '',
      email: '',
      role: 'site_manager',
      department: 'Lapangan',
    },
  });

  useEffect(() => {
    if (!isInviteOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isInviteSubmitting) {
        setIsInviteOpen(false);
        setInviteError('');
        resetInviteForm();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isInviteOpen, isInviteSubmitting, resetInviteForm]);

  const managerRole: UserRole = currentRole;
  const canManageMembers = useCan('users', 'edit');
  const canInviteMembers = useCan('users', 'create');

  const submitInvite = handleInviteSubmit(async (values) => {
    setInviteError('');
    setInviteNotice('');
    const parsed = memberInvitationSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'full_name' || field === 'email' || field === 'role' || field === 'department') {
          setInviteFieldError(field, { type: 'manual', message: issue.message });
        }
      }
      return;
    }
    if (!currentOrg) {
      setInviteError(memberMessages.chooseOrganization);
      return;
    }
    try {
      const result = await handleInviteMember({
        ...parsed.data,
        organization_id: currentOrg.id,
      });
      setInviteNotice(result.message);
      setIsInviteOpen(false);
      resetInviteForm();
    } catch (error: unknown) {
      setInviteError(error instanceof Error ? error.message : memberMessages.inviteSendError);
    }
  });

  const changeMemberRole = async (memberId: string, role: InvitableMemberRole) => {
    setMemberActionId(memberId);
    setMemberActionError('');
    try {
      await handleUpdateRole(memberId, role);
    } catch (error: unknown) {
      setMemberActionError(error instanceof Error ? error.message : memberMessages.memberActionError);
    } finally {
      setMemberActionId(null);
    }
  };

  const changeMemberStatus = async (memberId: string, isActive: boolean) => {
    setMemberActionId(memberId);
    setMemberActionError('');
    try {
      await handleToggleMember(memberId, isActive);
    } catch (error: unknown) {
      setMemberActionError(error instanceof Error ? error.message : memberMessages.memberActionError);
    } finally {
      setMemberActionId(null);
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const modulesList = [
    { id: 'projects', label: 'Manajemen Proyek' },
    { id: 'rab', label: 'RAB & AHSP' },
    { id: 'field_reports', label: 'Laporan Lapangan' },
    { id: 'procurement', label: 'Pengadaan (PO)' },
    { id: 'warehouse', label: 'Gudang & Stok' },
    { id: 'finance', label: 'Keuangan & Kas' },
    { id: 'safety', label: 'K3 & HSE' },
    { id: 'users', label: 'Manajemen Pengguna' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Pengaturan & Administrasi Perusahaan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Profil PT, tim & hak akses (RBAC), penomoran dokumen, dan audit log kepatuhan
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'company', label: 'Profil Perusahaan', icon: Building2 },
          { id: 'team', label: `Tim & Anggota (${members.length})`, icon: Users },
          { id: 'roles', label: 'Matriks Izin Role (RBAC)', icon: Shield },
          { id: 'numbering', label: 'Format Penomoran', icon: FileCode },
          { id: 'audit', label: 'Audit Log & Aktivitas', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Identitas Badan Usaha Jasa Konstruksi (BUJK)
              </h3>
              <p className="text-xs text-slate-500">Data untuk kop surat, SPK, dan cetak PO resmi</p>
            </div>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Tersimpan!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Perusahaan
              </label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Singkat (Prefix)
              </label>
              <input
                type="text"
                value={compCode}
                onChange={(e) => setCompCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NPWP Badan
              </label>
              <input
                type="text"
                value={compNpwp}
                onChange={(e) => setCompNpwp(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Berusaha (NIB)
              </label>
              <input
                type="text"
                value={compNib}
                onChange={(e) => setCompNib(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Kantor Operasional
            </label>
            <input
              type="text"
              value={compAddress}
              onChange={(e) => setCompAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kota Kantor Pusat
              </label>
              <input
                type="text"
                value={compCity}
                onChange={(e) => setCompCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telepon Kantor
              </label>
              <input
                type="text"
                value={compPhone}
                onChange={(e) => setCompPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rekening Bank Operasional
              </label>
              <input
                type="text"
                value={compBankName}
                onChange={(e) => setCompBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={compBankNo}
                onChange={(e) => setCompBankNo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil BUJK</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: TEAM & MEMBERS */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Personil & Karyawan
              </h3>
              <p className="text-xs text-slate-500">
                Kelola hak akses dan peran tim di perusahaan {currentOrg?.name}
              </p>
            </div>
            <Can module="users" action="create">
              <button
                onClick={() => {
                  setInviteError('');
                  setInviteNotice('');
                  setIsInviteOpen(true);
                }}
                className="flex min-h-11 items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-600"
              >
                <Plus className="w-4 h-4" />
                <span>Undang Anggota</span>
              </button>
            </Can>
          </div>

          {!canManageMembers && !canInviteMembers && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {memberMessages.managerOnly}
            </p>
          )}
          {inviteNotice && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" role="status">
              {inviteNotice}
            </p>
          )}
          {memberActionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
              {memberActionError}
            </p>
          )}
          {membersError && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
              <span>{memberMessages.memberLoadError} {membersError}</span>
              <button type="button" onClick={() => void reloadMembers()} className="min-h-11 rounded-lg border border-red-300 px-3 font-semibold dark:border-red-800">
                {memberMessages.invitationRetry}
              </button>
            </div>
          )}

          {membersLoading ? (
            <div className="space-y-3" role="status" aria-busy="true" aria-label={memberMessages.loadingMembers}>
              <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : members.length === 0 && !membersError ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <Users className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-2 font-semibold text-slate-900 dark:text-white">{memberMessages.memberEmptyTitle}</p>
              <p className="mt-1 text-sm text-slate-500">{memberMessages.memberEmptyHelp}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                {members.map((member) => {
                  const canEditMember = canManageMembers
                    && member.role !== 'owner'
                    && member.user_id !== authSession?.user.id
                    && !(managerRole === 'admin' && member.role === 'admin');
                  return (
                    <li key={member.id} className="space-y-3 p-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {member.user?.full_name || 'Anggota'}
                        </p>
                        <p className="break-all text-sm text-slate-500">{member.user?.email}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {member.department || 'Operasional'} · {ROLE_LABELS[member.role]}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${member.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {member.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {member.role !== 'owner' && (
                          <div className="flex flex-wrap items-center gap-2">
                            {canEditMember && (
                              <select
                                aria-label={`${memberMessages.memberRoleAria}: ${member.user?.full_name || 'anggota'}`}
                                value={member.role}
                                disabled={memberActionId === member.id}
                                onChange={(event) => {
                                  const role = INVITABLE_MEMBER_ROLES.find((item) => item === event.target.value);
                                  if (role) void changeMemberRole(member.id, role);
                                }}
                                className="min-h-11 max-w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                              >
                                {INVITABLE_MEMBER_ROLES.filter((role) => managerRole === 'owner' || role !== 'admin').map((role) => (
                                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                ))}
                              </select>
                            )}
                            {canEditMember && (
                              <button
                                type="button"
                                disabled={memberActionId === member.id}
                                onClick={() => void changeMemberStatus(member.id, !member.is_active)}
                                className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                              >
                                {member.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-4 py-3">Nama & Email</th>
                      <th className="px-4 py-3">Departemen</th>
                      <th className="px-4 py-3">Role / Peran</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((member) => {
                      const canEditMember = canManageMembers
                        && member.role !== 'owner'
                        && member.user_id !== authSession?.user.id
                        && !(managerRole === 'admin' && member.role === 'admin');
                      return (
                        <tr key={member.id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900 dark:text-white">{member.user?.full_name || 'Anggota'}</p>
                            <p className="text-[11px] text-slate-500">{member.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{member.department || 'Operasional'}</td>
                          <td className="px-4 py-3">
                            {canEditMember ? (
                              <select
                                aria-label={`${memberMessages.memberRoleAria}: ${member.user?.full_name || 'anggota'}`}
                                value={member.role}
                                disabled={memberActionId === member.id}
                                onChange={(event) => {
                                  const role = INVITABLE_MEMBER_ROLES.find((item) => item === event.target.value);
                                  if (role) void changeMemberRole(member.id, role);
                                }}
                                className="min-h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                              >
                                {INVITABLE_MEMBER_ROLES.filter((role) => managerRole === 'owner' || role !== 'admin').map((role) => (
                                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{ROLE_LABELS[member.role]}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${member.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {member.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {canEditMember && (
                              <button
                                type="button"
                                disabled={memberActionId === member.id}
                                onClick={() => void changeMemberStatus(member.id, !member.is_active)}
                                className="min-h-10 font-semibold text-slate-600 underline disabled:opacity-50 dark:text-slate-300"
                              >
                                {member.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Matriks Izin Modul Berbasis Peran (RBAC)
            </h3>
            <p className="text-xs text-slate-500">
              Hak akses setiap jabatan terhadap fitur operasional & finansial
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800">Modul Aplikasi</th>
                  <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 text-center">Direktur / Owner</th>
                  <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 text-center">Project Manager</th>
                  <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 text-center">Site Manager</th>
                  <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 text-center">QS / Estimator</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-center">Finance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                {modulesList.map((m) => (
                  <tr key={m.id}>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                      {m.label}
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-emerald-600 font-semibold">
                      Full Akses & Approval
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      View, Create, Edit, Approval Proyek
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      Create/Edit Laporan & Permintaan
                    </td>
                    <td className="p-3 text-center border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {m.id === 'rab' ? 'Full Akses Estimasi' : 'View Proyek'}
                    </td>
                    <td className="p-3 text-center text-slate-700 dark:text-slate-300">
                      {m.id === 'finance' ? 'Full Akses Kas & Termin' : 'View Saja'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NUMBERING FORMAT */}
      {activeTab === 'numbering' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Format Penomoran Dokumen Otomatis
            </h3>
            <p className="text-xs text-slate-500">Standar penomoran surat, kode proyek, dan berkas transaksi</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Kode Proyek</p>
                <p className="font-mono text-amber-500 text-[11px]">PRJ-[ORG]-[TAHUN]-[NO_URUT]</p>
              </div>
              <span className="font-mono text-slate-500">PRJ-IKN-2026-001</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Purchase Order (PO)</p>
                <p className="font-mono text-amber-500 text-[11px]">PO-[ORG]-[TAHUN]-[NO_URUT]</p>
              </div>
              <span className="font-mono text-slate-500">PO-IKN-2026-0142</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Laporan Harian Lapangan</p>
                <p className="font-mono text-amber-500 text-[11px]">LH-[KODE_PROYEK]-[TANGGAL]</p>
              </div>
              <span className="font-mono text-slate-500">LH-001-20261017</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Log Audit & Jejak Kepatuhan
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan menyeluruh siapa yang membuat, menyetujui, dan mengubah data penting
              </p>
            </div>
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.user_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {log.action}
                    </span>
                    {log.project_name && (
                      <span className="text-[10px] text-amber-500 font-semibold">• {log.project_name}</span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDateIndo(log.created_at, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      <Can module="users" action="create">
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-member-title"
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <h3 id="invite-member-title" className="mb-3 text-base font-bold text-slate-900 dark:text-white">
              {memberMessages.inviteTitle} ke {currentOrg?.name}
            </h3>
            <form onSubmit={submitInvite} className="space-y-4" aria-labelledby="invite-member-title">
              {inviteError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
                  {inviteError}
                </p>
              )}
              <div>
                <label htmlFor="invite-full-name" className="mb-1 block text-sm font-semibold">{memberMessages.inviteFullName}</label>
                <input
                  id="invite-full-name"
                  type="text"
                  placeholder={memberMessages.inviteNamePlaceholder}
                  autoComplete="name"
                  aria-invalid={Boolean(inviteFieldErrors.full_name)}
                  aria-describedby={inviteFieldErrors.full_name ? 'invite-full-name-error' : undefined}
                  {...registerInviteField('full_name')}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-slate-800 dark:bg-slate-950"
                />
                {inviteFieldErrors.full_name && <p id="invite-full-name-error" className="mt-1 text-sm text-red-600">{inviteFieldErrors.full_name.message}</p>}
              </div>

              <div>
                <label htmlFor="invite-email" className="mb-1 block text-sm font-semibold">{memberMessages.inviteEmail}</label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder={memberMessages.inviteEmailPlaceholder}
                  autoComplete="email"
                  aria-invalid={Boolean(inviteFieldErrors.email)}
                  aria-describedby={inviteFieldErrors.email ? 'invite-email-error' : undefined}
                  {...registerInviteField('email')}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-slate-800 dark:bg-slate-950"
                />
                {inviteFieldErrors.email && <p id="invite-email-error" className="mt-1 text-sm text-red-600">{inviteFieldErrors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="invite-role" className="mb-1 block text-sm font-semibold">{memberMessages.inviteRole}</label>
                  <select
                    id="invite-role"
                    aria-invalid={Boolean(inviteFieldErrors.role)}
                    aria-describedby={inviteFieldErrors.role ? 'invite-role-error' : undefined}
                    {...registerInviteField('role')}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-slate-800 dark:bg-slate-950"
                  >
                    {INVITABLE_MEMBER_ROLES.filter((role) => managerRole === 'owner' || role !== 'admin').map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                  {inviteFieldErrors.role && <p id="invite-role-error" className="mt-1 text-sm text-red-600">{inviteFieldErrors.role.message}</p>}
                </div>

                <div>
                  <label htmlFor="invite-department" className="mb-1 block text-sm font-semibold">{memberMessages.inviteDepartment}</label>
                  <input
                    id="invite-department"
                    type="text"
                    aria-invalid={Boolean(inviteFieldErrors.department)}
                    aria-describedby={inviteFieldErrors.department ? 'invite-department-error' : undefined}
                    {...registerInviteField('department')}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-slate-800 dark:bg-slate-950"
                  />
                  {inviteFieldErrors.department && <p id="invite-department-error" className="mt-1 text-sm text-red-600">{inviteFieldErrors.department.message}</p>}
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row">
                <button
                  type="button"
                  disabled={isInviteSubmitting}
                  onClick={() => {
                    setIsInviteOpen(false);
                    setInviteError('');
                    resetInviteForm();
                  }}
                  className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
                >
                  {memberMessages.inviteCancel}
                </button>
                <button
                  type="submit"
                  disabled={isInviteSubmitting}
                  className="min-h-11 rounded-xl bg-amber-500 px-4 text-sm font-bold text-slate-950 shadow disabled:cursor-wait disabled:opacity-60"
                >
                  {isInviteSubmitting ? memberMessages.inviteSending : memberMessages.inviteSend}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </Can>
    </div>
  );
};
