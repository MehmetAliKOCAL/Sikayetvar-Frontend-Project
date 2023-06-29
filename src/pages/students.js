import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Fuse from 'fuse.js';
import Head from 'next/head';
import TopBar from '@/components/topBar';
import SideMenu from '@/components/sideMenu';
import useSWR from 'swr';
import LoadingIcon from '@/components/icons/loading';
import EditIcon from '@/components/icons/edit';
import DeleteIcon from '@/components/icons/delete';

export default function Students() {
  const router = useRouter();

  const queries = () => {
    const path = router.asPath;
    if (path.includes('?')) {
      const queryString = path.slice(path.indexOf('?') + 1);
      const queriesArray = queryString.split('&');
      const queries = {};

      queriesArray.forEach((query) => {
        const queryKeyValue = query.split('=');
        queries[queryKeyValue[0]] = queryKeyValue[1];
      });
      return queries;
    } else return [];
  };

  const linkToBeRouted = `/students?limit=${queries().limit || 0}&skip=${queries().skip || 0}`;
  const requestLink = `/api/getStudents?limit=${queries().limit}&skip=${queries().skip}`;
  const [searchedStudents, setSearchedStudents] = useState([]);
  const tableRowTitles = ['Name', 'Email', 'Phone', 'Website', 'Company Name'];
  const inputs = ['fullName', 'email', 'phone', 'website', 'companyName'];

  function redirectIfNeeded() {
    if (!queries().limit || !queries().skip) {
      router.replace(linkToBeRouted);
    }
  }
  useEffect(() => {
    window.addEventListener('load', redirectIfNeeded());
  }, []);

  function search(query) {
    const options = {
      keys: all,
      isCaseSensitive: false,
      minMatchCharLength: 2,
      shouldSort: true,
      threshold: 0.3,
    };

    const fuse = new Fuse(data, options);
    const searchResult = fuse.search(query);
    setSearchedStudents(searchResult);

    if (searchResult.length === 0) {
      toast.info('No related results were found with the search query');
    }
  }

  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const { data, error, isLoading } = useSWR(requestLink, fetcher);

  const [users, setUsers] = useState(data);
  function updateUsers(userID, newValues) {
    const newState = users.map((user) => {
      if (user.id === userID) {
        return { ...user, ...newValues };
      } else {
        return user;
      }
    });

    setTimeout(() => {
      setUsers(newState);
    }, 1);
  }

  function handleInitialPageLoad() {
    if (!isLoading) {
      setUsers(data.users);
    }
  }

  useEffect(() => {
    handleInitialPageLoad();
  }, [isLoading]);

  return (
    <div className='flex bg-studentPageBGColor text-black w-full h-screen overflow-x-hidden'>
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
      <main className='w-full h-full flex flex-col min-h-screen'>
        <TopBar />
        <section className='px-10 py-4 w-full h-full'>
          <div className='flex justify-between items-center'>
            <p className='text-xl leading-4 font-bold'>Students List</p>
            <div className='flex gap-x-6 justify-center items-center'>
              <input
                type='text'
                placeholder='Search...'
                className='py-2.5 px-4 rounded-lg border-1 border-borderColor outline-none text-sm placeholder:text-inputPlaceholderColor'
              />
              <button className='py-3 px-8 text-xs text-white font-medium rounded-md uppercase bg-themeColor'>
                Add New Student
              </button>
            </div>
          </div>

          <hr className='my-4' />

          <div className='pl-28 flex text-xs gap-x-2 leading-4 font-semibold text-tableCaptionColor'>
            {tableRowTitles.map((title) => {
              return (
                <p
                  key={title}
                  className='w-2/12 truncate'
                >
                  {title}
                </p>
              );
            })}
          </div>

          <div className='py-4  flex flex-col gap-y-3'>
            {!isLoading && data && data.ok && users ? (
              users.map((user) => {
                updateUsers(user.id, {
                  fullName: `${user.firstName} ${user.lastName}`,
                  website: `${user.firstName}${user.lastName}.com`.toLowerCase(),
                  companyName: user.company.name,
                  isEditingDisabled: true,
                });

                return (
                  <div
                    key={user.id}
                    className='p-4 w-full flex items-center gap-x-3 bg-white rounded-lg'
                  >
                    <img
                      src={
                        user.gender === 'male'
                          ? '/images/dummyMaleImage.webp'
                          : '/images/dummyFemaleImage.webp'
                      }
                      width='70'
                      height='70'
                      className='w-[70px] h-[70px] rounded-lg object-cover object-center'
                    />
                    {inputs.map((input) => {
                      return (
                        <input
                          id={`${input}${user.id}`}
                          key={input + user.id}
                          type='text'
                          value={user[input]}
                          disabled={true}
                          className='w-2/12 px-4 py-2 truncate text-left rounded-md outline-none border-1 border-borderColor disabled:bg-white disabled:border-transparent'
                        />
                      );
                    })}
                    <div className='space-x-10'>
                      <button
                        onClick={() => {
                          updateUsers(user.id, { isEditingDisabled: false });
                          console.log('basildi');
                        }}
                        className='active:scale-75 transition-all duration-200'
                      >
                        <EditIcon />
                      </button>
                      <button className='active:scale-75 transition-all duration-200'>
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-black/40'>
                <div className='w-52 flex items-center'>
                  <LoadingIcon />
                  <p className='text-white text-2xl font-bold'>Loading...</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
