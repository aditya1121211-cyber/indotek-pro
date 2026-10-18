const indonesianMessages = {
  common: {
    retry: 'Coba lagi',
    cancel: 'Batal',
    save: 'Simpan',
    close: 'Tutup',
    unexpectedErrorTitle: 'Terjadi kendala',
    unexpectedErrorDescription: 'Aplikasi mengalami kendala tak terduga. Muat ulang aplikasi dan coba lagi.',
    reloadApp: 'Muat ulang aplikasi',
  },
  shell: {
    home: 'Beranda',
    projects: 'Proyek',
    approvals: 'Tugas',
    menu: 'Menu',
    openMenu: 'Buka menu navigasi',
    closeMenu: 'Tutup navigasi',
    sidebarNavigation: 'Navigasi aplikasi',
    quickActions: 'Aksi cepat',
    primaryNavigation: 'Navigasi utama',
    projectContext: 'Konteks proyek',
    allProjects: (count: number) => `Semua Proyek (${count})`,
  },
} as const;

const englishMessages = {
  common: {
    retry: 'Try again',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    unexpectedErrorTitle: 'Something went wrong',
    unexpectedErrorDescription: 'The application encountered an unexpected issue. Reload the app and try again.',
    reloadApp: 'Reload app',
  },
  shell: {
    home: 'Home',
    projects: 'Projects',
    approvals: 'Tasks',
    menu: 'Menu',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation',
    sidebarNavigation: 'Application navigation',
    quickActions: 'Quick actions',
    primaryNavigation: 'Main navigation',
    projectContext: 'Project context',
    allProjects: (count: number) => `All Projects (${count})`,
  },
} as const;

export const messagesByLocale = {
  id: indonesianMessages,
  en: englishMessages,
} as const;

export type Locale = keyof typeof messagesByLocale;
