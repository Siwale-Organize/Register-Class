import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F6FB]">
      <Sidebar />
      <Header />
      <main className="ml-[260px] pt-16 p-6">
        {children}
      </main>
    </div>
  );
}
