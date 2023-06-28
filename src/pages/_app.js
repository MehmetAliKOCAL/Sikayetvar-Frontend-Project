import '@/styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({
  subsets: ['latin'],
});

export default function App({
  Component,
  pageProps,
}) {
  return (
    <div className={`${montserrat.className}`}>
      <Component {...pageProps} />{' '}
      <ToastContainer
        position='bottom-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </div>
  );
}
