import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HomeIcon from './icons/home';
import ReportIcon from './icons/report';
import LogoutIcon from './icons/logout';
import PaymentIcon from './icons/payment';
import BookmarkIcon from './icons/bookmark';
import SettingsIcon from './icons/settings';
import GraduationIcon from './icons/graduation';
import HamburgerMenuIcon from './icons/hamburgerMenu';

export default function SideMenu({ userImage, name, surname, role }) {
  const router = useRouter();
  const currentRoute = router.pathname;
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const buttons = [
    {
      text: 'Home',
      redirectTo: '/dashboard',
      icon: <HomeIcon />,
    },
    {
      text: 'Course',
      redirectTo: '',
      icon: <BookmarkIcon />,
    },
    {
      text: 'Students',
      redirectTo: '/students',
      icon: <GraduationIcon />,
    },
    {
      text: 'Payment',
      redirectTo: '',
      icon: <PaymentIcon />,
    },
    {
      text: 'Report',
      redirectTo: '',
      icon: <ReportIcon />,
    },
    {
      text: 'Settings',
      redirectTo: '',
      icon: <SettingsIcon />,
    },
  ];

  const capitalize = (string) => {
    if (string) {
      return string.at(0).toUpperCase() + string.slice(1);
    }
  };

  return (
    <div className='flex sticky top-0 left-0'>
      <aside
        className={`px-3 py-5 w-68 z-10 flex-shrink-0 h-screen overflow-y-auto flex flex-col items-center justify-center transition-all duration-300 bg-themeColor-faded max-md:absolute ${
          isMenuVisible ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        }`}
      >
        <h1 className='pl-2 h-6 flex justify-center items-center uppercase text-xl font-bold text-center border-l-4 border-themeColor-lighter'>
          Manage Courses
        </h1>
        <img
          width='150'
          height='150'
          src={userImage || ''}
          className='w-[150px] h-[150px] mt-14 rounded-full object-cover object-center'
        />
        <p className='mt-4 text-lg font-bold'>{`${capitalize(name)} ${capitalize(surname)}`}</p>
        <p className='text-sm font-medium text-themeColor'>{role}</p>
        <nav className='w-full mt-20 flex flex-col gap-y-4 justify-center items-center'>
          {buttons.map((button) => {
            return (
              <Link
                key={button.text}
                href={{
                  pathname: button.redirectTo,
                }}
                className={`py-3 w-5/6 flex gap-x-5 px-10 rounded-md transition-colors duration-200 hover:bg-themeColor-lighter/30 active:bg-themeColor ${
                  currentRoute === button.redirectTo ? 'bg-themeColor' : 'bg-themeColor-faded'
                }`}
              >
                <div className='w-5 flex justify-center items-center'>{button.icon}</div>
                <p className='text-sm font-medium'>{button.text}</p>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            router.push('/');
          }}
          className='mt-28 py-3 w-5/6 flex justify-center items-center gap-x-5 px-10 rounded-md transition-colors duration-200 hover:bg-themeColor-lighter/30 active:bg-themeColor'
        >
          <p className='text-sm font-medium'>Logout</p>
          <div className='w-5 flex justify-center items-center'>
            <LogoutIcon />
          </div>
        </button>
      </aside>
      <button
        onClick={() => {
          setIsMenuVisible(!isMenuVisible);
        }}
        className={`w-fit z-10 flex md:hidden border-l-1 border-black/5 bg-themeColor-faded items-start transition-all duration-300 ${
          isMenuVisible ? 'max-md:translate-x-[270px]' : 'max-md:-translate-x-0'
        }`}
      >
        <div className='p-3 bg-themeColor/80'>
          <HamburgerMenuIcon isMenuOpened={isMenuVisible} />
        </div>{' '}
      </button>
      <div
        className={`w-full h-screen p-4 z-0 absolute md:hidden bg-black/40 transition-all duration-300 ${
          isMenuVisible ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      />
    </div>
  );
}
