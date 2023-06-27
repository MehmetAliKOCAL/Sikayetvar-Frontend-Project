import { useState } from 'react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/router';
import Visibility from '../components/icons/visibility';

const montserrat = Montserrat({
  subsets: ['latin'],
});

const inputs = [
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
  },
  {
    id: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
  },
];

export default function Home() {
const router = useRouter();

  const [
    isPasswordVisible,
    setIsPasswordVisible,
  ] = useState(false);

  return (
    <main
      className={`w-screen h-screen flex justify-center items-center bg-gradient-49deg from-themeColor to-themeColor-lighter ${montserrat.className}`}
    >
      <form
        onSubmit={() => {
          event.preventDefault();
        }}
        className='w-[475px] h-[550px] bg-white text-black rounded-[20px] flex flex-col justify-center items-center shadow-loginForm flex-shrink-0'
      >
        <h1 className='pl-2 text-3.5xl h-10 flex justify-center items-center font-bold uppercase border-l-6 border-themeColor-lighter'>
          Manage Courses
        </h1>
        <h2 className='mt-12 text-2xl font-semibold uppercase'>
          Sign In
        </h2>
        <p className='mt-1 text-sm text-fadedTextColor font-medium'>
          Enter your credentials to access your
          account
        </p>
        <div className='px-8 mt-10 w-full flex flex-col gap-y-4'>
          {inputs.map((input) => (
            <div key={input.id}>
              <label
                htmlFor={input.id}
                className='text-sm font-medium text-fadedTextColor'
              >
                {input.label}
              </label>
              <div className='flex w-full mt-1.5 relative items-center border-1 rounded-md hover:border-themeColor-lighter/60 border-loginFormBorderColor'>
                <input
                  id={input.id}
                  type={
                    input.id === 'password' &&
                    !isPasswordVisible
                      ? input.type
                      : 'text'
                  }
                  placeholder={input.placeholder}
                  className={`p-4 h-11 flex-shrink-0 rounded-md outline-none text-sm transition-all duration-200 placeholder:text-xs placeholder:text-inputPlaceholderColor ${
                    input.id === 'password'
                      ? 'w-5/6'
                      : 'w-full'
                  }`}
                />
                {input.id === 'password' && (
                  <div
                    className='w-full'
                    onClick={() => {
                      setIsPasswordVisible(
                        !isPasswordVisible
                      );
                    }}
                  >
                    <Visibility className='z-10 h-11 right-0 w-full flex justify-center items-center cursor-pointer border-l-1 border-loginFormBorderColor transition-all duration-200 hover:bg-themeColor rounded-r-md' />
                  </div>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => { router.push('/dashboard') }} className='p-3.5 w-full mt-2 text-sm uppercase font-medium text-white rounded-[4px] bg-themeColor flex-shrink-0 transition-all duration-200 active:scale-95 hover:bg-themeColor/80'>
            Sign In
          </button>
          <p className='mt-2 text-sm text-center text-fadedTextColor'>Forgot your password? <button className='text-themeColor underline hover:text-themeColor/80 transition-all duration-200 active:scale-95'>Reset Password</button></p>
        </div>
      </form>
    </main>
  );
}
