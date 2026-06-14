import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import GlobalServices from './GlobalServices';

export default function Shell() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)', position: 'relative', zIndex: 1 }}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
              />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <GlobalServices />
    </div>
  );
}
