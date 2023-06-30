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

  function redirectIfNeeded() {
    if (!queries().limit || !queries().skip) {
      router.replace(linkToBeRouted);
    }
  }
  useEffect(() => {
    window.addEventListener('load', redirectIfNeeded());
  }, []);

  const linkToBeRouted = `/students?limit=${queries().limit || 0}&skip=${queries().skip || 0}`;
  const requestLink = `/api/getStudents?limit=${queries().limit}&skip=${queries().skip}`;
  const [searchedStudents, setSearchedStudents] = useState([]);
  const tableTitles = ['Name', 'Email', 'Phone', 'Website', 'Company Name'];
  const userProperties = ['fullName', 'email', 'phone', 'domain', 'companyName'];
  const [isEditable, setIsEditable] = useState(false);
  const [userBeingEdited, setUserBeingEdited] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    domain: '',
    companyName: '',
  });
  const inputsForEditingUsers = [
    {
      type: 'text',
      property: 'firstName',
      label: 'First Name',
    },
    { type: 'text', property: 'lastName', label: 'Last Name' },
    {
      type: 'email',
      property: 'email',
      label: 'Email',
    },
    {
      type: 'tel',
      property: 'phone',
      label: 'Phone',
    },
    {
      type: 'text',
      property: 'domain',
      label: 'Website',
    },
    {
      type: 'text',
      property: 'companyName',
      label: 'Company Name',
    },
  ];

  function search(query) {
    const options = {
      keys: all,
      isCaseSensitive: false,
      minMatchCharLength: 2,
      shouldSort: true,
      threshold: 0.3,
    };

    const fuse = new Fuse(fetchUsers, options);
    const searchResult = fuse.search(query);
    setSearchedStudents(searchResult);

    if (searchResult.length === 0) {
      toast.info('No related results were found with the search query');
    }
  }

  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const { data: users, error, isLoading: areUsersFetched } = useSWR(requestLink, fetcher);

  function allowEditing(userID) {
    users.users.forEach((user) => {
      if (user.id === userID) {
        setUserBeingEdited(user);
      }
    });
    setIsEditable(true);
  }

  async function editUser(user) {
    const userQuery = encodeURIComponent(
      JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        domain: user.domain,
        company: { name: user.companyName },
      })
    );

    const response = await fetch(`/api/updateStudent?id=${user.id}&user=${userQuery}`).then((res) =>
      res.json()
    );
  }

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
            {tableTitles.map((title) => {
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
            {!areUsersFetched && users?.ok ? (
              users.users.map((user) => {
                user.fullName = `${user.firstName} ${user.lastName}`;
                user.companyName = user.company.name;

                return (
                  <div
                    key={user.id}
                    className='p-4 w-full flex items-center gap-x-3 bg-white rounded-lg'
                  >
                    <img
                      src={user.image}
                      alt={user.fullName}
                      width='70'
                      height='70'
                      className='w-[70px] h-[70px] rounded-lg object-cover object-center'
                    />
                    {userProperties.map((property) => {
                      return (
                        <div
                          key={property + user.id}
                          className='w-2/12 px-4 py-2 truncate text-left rounded-md'
                        >
                          {user[property]}
                        </div>
                      );
                    })}
                    <div className='space-x-10'>
                      <button
                        onClick={() => {
                          allowEditing(user.id);
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
                <div className='w-44 flex items-center'>
                  <LoadingIcon />
                </div>
              </div>
            )}
          </div>
        </section>

        <div
          className={`w-screen h-screen absolute top-0 right-0 flex flex-col justify-center items-center bg-black/40 transform-all duration-300 overflow-x-hidden ${
            isEditable ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <button
            onClick={() => {
              setIsEditable(false);
            }}
            className='w-full h-full absolute top-0 right-0'
          />
          <form
            onClick={() => {
              event.preventDefault();
            }}
            className='z-10 p-8 max-xs:p-4 w-1/4 relative flex flex-col gap-y-2 bg-white text-black shadow-form xs:rounded-[20px]'
          >
            <h1 className='pl-3 mb-6 w-fit mx-auto text-2xl h-8 flex justify-center items-center font-bold uppercase border-l-6 border-themeColor-lighter text-center'>
              Edit The Student
            </h1>
            {inputsForEditingUsers.map((input) => {
              return (
                <div
                  className='flex flex-col gap-y-1'
                  key={input.property}
                >
                  <label
                    htmlFor={input.property}
                    className='text-sm max-xs:text-xs font-medium text-fadedTextColor'
                  >
                    {input.label}
                  </label>
                  <input
                    id={input.property}
                    type={input.type}
                    placeholder={userBeingEdited[input.property]}
                    value={userBeingEdited[input.property]}
                    onChange={() => {
                      setUserBeingEdited({
                        ...userBeingEdited,
                        [input.property]: event.target.value,
                      });
                    }}
                    className='p-4 w-full h-11 flex-shrink-0 rounded-md outline-none text-sm transition-all duration-200 border-1 hover:border-themeColor-lighter focus:border-themeColor border-borderColor placeholder:text-xs placeholder:text-inputPlaceholderColor'
                  />
                </div>
              );
            })}
            <button
              onClick={() => {
                editUser(userBeingEdited);
              }}
              type='submit'
              className='py-3 px-16 mt-5 mb-2 text-xs text-white font-medium rounded-md uppercase bg-themeColor transition-all duration-200 hover:bg-themeColor/80 active:scale-95'
            >
              Save Changes
            </button>
          </form>
          <p className='px-8 py-1 rounded-b-md bg-black/50 text-white text-xs shadow-form'>
            Click outside of the form to close it
          </p>
        </div>
      </main>
    </div>
  );
}
