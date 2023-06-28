import SideMenu from '@/components/sideMenu';
import TopBar from '@/components/topBar';

export default function Students() {
  return (
    <div className='flex bg-white text-black w-full h-screen overflow-x-hidden'>
      <SideMenu
        userImage='/images/dummyPersonImage.webp'
        name='John'
        surname='Doe'
        role='Admin'
      />
      <main className='w-full px-6'>
        <TopBar />
        <section></section>
      </main>
    </div>
  );
}
