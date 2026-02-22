// =============================================================================
// THE A 5995 - Admin Layout
// =============================================================================
// This layout wraps ALL /admin/* routes including /admin/login.
// When unauthenticated, it renders just the children (login page) with a
// minimal wrapper. When authenticated, it renders the full admin shell with
// sidebar and top bar. The middleware handles redirecting unauthenticated
// users to /admin/login for protected routes.
// =============================================================================

import { auth } from '@/lib/auth';
import { playfairDisplay, inter } from '@/app/layout';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '../globals.css';

export const metadata = {
  title: 'Admin | THE A 5995',
  description: 'THE A 5995 Admin Panel',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated, render a minimal wrapper (for the login page)
  if (!session) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  // Authenticated: render the full admin shell
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
        <div className="min-h-screen bg-luxury-50">
          <AdminSidebar
            userName={session.user?.name}
            userEmail={session.user?.email}
          />

          {/* Main content area */}
          <main className="min-h-screen lg:pl-64">
            {/* Top bar */}
            <header className="sticky top-0 z-20 border-b border-luxury-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between pl-12 lg:pl-0">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-primary-700">
                    Admin Panel
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-700">
                      {session.user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-luxury-500">
                      {session.user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700">
                    <span className="text-sm font-medium text-white">
                      {(session.user?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Page content */}
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
