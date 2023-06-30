import { useRef } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Head from 'next/head';
import PasswordVisibility from '../components/icons/passwordVisibility';

const inputs = [
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    regexp: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  {
    id: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    regexp: /^[\w\W]+$/,
  },
];

export default function Home() {
  const router = useRouter();
  const email = useRef(null);
  const password = useRef(null);

  function isEmailValid() {
    const isValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.current.value);

    if (!isValid) {
      toast.error('Please enter a valid email adress');
    }
    return isValid;
  }

  function isPasswordValid() {
    const isValid = /^[\w\W]+$/.test(password.current.value);

    if (!isValid) {
      toast.error('Your password is incorrect');
    }
    return isValid;
  }

  function login() {
    if (isEmailValid() && isPasswordValid()) {
      toast.success("You've successfully logged in");
      router.push('/dashboard');
    }
  }

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div>
      <Head>
        <title>Login | SVFP</title>
        <meta
          property='og:title'
          content='Login | SVFP'
        />
        <meta
          property='twitter:title'
          content='Login | SVFP'
        />
      </Head>
      <main className='w-screen h-screen flex py-20 justify-center items-center overflow-x-hidden bg-gradient-49deg from-themeColor to-themeColor-lighter'>
        <form
          onSubmit={() => {
            event.preventDefault();
          }}
          className='w-[475px] h-[550px] max-xs:px-4 px-8 bg-white text-black xs:rounded-[20px] flex flex-col justify-center items-center shadow-form'
        >
          <h1 className='pl-3 text-3.5xl max-xs:text-2xl h-10 flex justify-center items-center font-bold uppercase border-l-6 border-themeColor-lighter text-center'>
            Manage Courses
          </h1>
          <h2 className='mt-12 max-xs:mt-8 text-2xl max-xs:text-lg font-semibold uppercase text-center'>
            Sign In
          </h2>
          <p className='mt-1 text-sm max-xs:text-xs text-fadedTextColor font-medium text-center'>
            Enter your credentials to access your account
          </p>
          <div className='mt-10 max-xs:mt-6 w-full flex flex-col gap-y-4'>
            {inputs.map((input) => (
              <div key={input.id}>
                <label
                  htmlFor={input.id}
                  className='text-sm max-xs:text-xs font-medium text-fadedTextColor'
                >
                  {input.label}
                </label>
                <div className='flex w-full mt-1.5 relative items-center border-1 rounded-md hover:border-themeColor-lighter/60 border-borderColor'>
                  <input
                    id={input.id}
                    ref={input.id === 'password' ? password : email}
                    type={input.id === 'password' && !isPasswordVisible ? input.type : 'text'}
                    placeholder={input.placeholder}
                    autoComplete='on'
                    className={`p-4 h-11 flex-shrink-0 rounded-md outline-none text-sm transition-all duration-200 placeholder:text-xs placeholder:text-inputPlaceholderColor ${
                      input.id === 'password' ? 'w-5/6' : 'w-full'
                    }`}
                  />
                  {input.id === 'password' && (
                    <div
                      className='w-full'
                      onClick={() => {
                        setIsPasswordVisible(!isPasswordVisible);
                      }}
                    >
                      <PasswordVisibility
                        isVisible={isPasswordVisible}
                        className='z-10 h-11 right-0 w-full flex justify-center items-center cursor-pointer border-l-1 border-borderColor transition-all duration-200 hover:bg-themeColor rounded-r-md'
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                login();
              }}
              className='p-3.5 w-full mt-2 text-sm max-xs:text-xs uppercase font-medium text-white rounded-[4px] bg-themeColor flex-shrink-0 transition-all duration-200 active:scale-95 hover:bg-themeColor/80'
            >
              Sign In
            </button>
            <p className='mt-2 text-sm max-xs:text-xs text-center text-fadedTextColor'>
              Forgot your password?{' '}
              <button className='text-themeColor underline hover:text-themeColor/80 transition-all duration-200 active:scale-95'>
                Reset Password
              </button>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
