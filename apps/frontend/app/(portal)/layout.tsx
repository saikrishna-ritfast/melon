import Sidebar from '../../components/Sidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Shared Sidebar */}
      <Sidebar />

      {/* Main content body */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
