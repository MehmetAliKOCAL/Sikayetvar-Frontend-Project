import Head from 'next/head';
import { useRouter } from 'next/router';
import { Montserrat } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

const montserrat = Montserrat({
  subsets: ['latin'],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <div className={`${montserrat.className}`}>
      <Head>
        <meta
          name='description'
          content='This website is a before-interview task, given by Sikayetvar company for my front-end developer job application. Made with NextJS and DummyJSON API.'
        />
        <meta
          property='og:description'
          content='This website is a before-interview task, given by Sikayetvar company for my front-end developer job application. Made with NextJS and DummyJSON API.'
        />
        <meta
          property='twitter:description'
          content='This website is a before-interview task, given by Sikayetvar company for my front-end developer job application. Made with NextJS and DummyJSON API.'
        />
        <meta
          property='og:url'
          content='https://sikayetvarfp.vercel.app/'
        />
        <meta
          property='twitter:url'
          content='https://sikayetvarfp.vercel.app/'
        />
        <meta
          property='og:image'
          content='https://sikayetvarfp.vercel.app/images/logo.png'
        />
        <meta
          property='twitter:image'
          content='https://sikayetvarfp.vercel.app/images/logo.png'
        />
        <meta
          property='twitter:domain'
          content='sikayetvarfp.vercel.app'
        />
        <meta
          name='twitter:card'
          content='summary_large_image'
        />
        <meta
          property='og:type'
          content='website'
        />
      </Head>
      <Component
        key={router.query?.page + router.query.pageSize + router.query?.search}
        {...pageProps}
      />
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
