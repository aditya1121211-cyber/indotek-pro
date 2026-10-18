import React, { useState } from 'react';
import { Building2, CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/permissions';
import { memberMessages } from '../../i18n/id';

export const OrganizationInvitationInbox: React.FC<{
  standalone?: boolean;
  onContinueWithoutInvitations?: () => void;
}> = ({ standalone = false, onContinueWithoutInvitations }) => {
  const {
    pendingInvitations,
    pendingInvitationsLoading,
    pendingInvitationsError,
    reloadPendingInvitations,
    handleAcceptInvitation,
  } = useApp();
  const [acceptingInvitationId, setAcceptingInvitationId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState('');

  if (!standalone && !pendingInvitationsLoading && !pendingInvitationsError && pendingInvitations.length === 0) {
    return null;
  }

  const containerClass = standalone
    ? 'mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7'
    : 'mx-3 mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mx-6 lg:mx-8 dark:border-slate-800 dark:bg-slate-900';

  const accept = async (invitationId: string) => {
    setAcceptingInvitationId(invitationId);
    setAcceptError('');
    try {
      await handleAcceptInvitation(invitationId);
    } catch (error: unknown) {
      setAcceptError(error instanceof Error ? error.message : memberMessages.invitationAcceptError);
    } finally {
      setAcceptingInvitationId(null);
    }
  };

  return (
    <section className={containerClass} aria-labelledby="invitation-inbox-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="invitation-inbox-title" className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Mail className="h-5 w-5 text-amber-600" aria-hidden="true" />
            {memberMessages.invitationTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {memberMessages.invitationDescription}
          </p>
        </div>
        {pendingInvitationsError && (
          <button
            type="button"
            onClick={() => void reloadPendingInvitations()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {memberMessages.invitationRetry}
          </button>
        )}
      </div>

      {pendingInvitationsLoading && (
        <div className="mt-4 space-y-3" role="status" aria-busy="true" aria-label={memberMessages.invitationLoading}>
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      )}

      {pendingInvitationsError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {memberMessages.invitationLoadError} {pendingInvitationsError}
        </p>
      )}

      {acceptError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {acceptError}
        </p>
      )}

      {!pendingInvitationsLoading && pendingInvitations.length > 0 && (
        <ul className="mt-4 space-y-3">
          {pendingInvitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <span className="truncate">{invitation.organization_name}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {invitation.full_name} · {ROLE_LABELS[invitation.role]}
                  {invitation.department ? ` · ${invitation.department}` : ''}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {memberMessages.invitationExpires} {formatDateIndo(invitation.expires_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void accept(invitation.id)}
                disabled={acceptingInvitationId !== null}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-950 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acceptingInvitationId === invitation.id ? (
                  memberMessages.invitationAccepting
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {memberMessages.invitationAccept}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {standalone && !pendingInvitationsLoading && pendingInvitations.length === 0 && !pendingInvitationsError && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {memberMessages.noInvitations}
        </p>
      )}

      {standalone && onContinueWithoutInvitations && (
        <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onContinueWithoutInvitations}
            className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {memberMessages.createOwnOrganization}
          </button>
        </div>
      )}
    </section>
  );
};
