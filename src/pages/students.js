import SideMenu from '@/components/sideMenu';
import TopBar from '@/components/topBar';
import Head from 'next/head';

export default function Students() {
  return (
    <div className='flex bg-white text-black w-full h-screen overflow-x-hidden'>
      <Head>
        <title>Students | SVFP</title>
        <meta
          property='og:title'
          content='Students | SVFP'
        />
        <meta
          property='twitter:title'
          content='Students | SVFP'
        />
      </Head>
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
