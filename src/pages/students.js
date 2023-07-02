import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Fuse from 'fuse.js';
import Head from 'next/head';
import Image from 'next/image';
import Swal from 'sweetalert2';
import TopBar from '@/components/topBar';
import SideMenu from '@/components/sideMenu';
import EditIcon from '@/components/icons/edit';
import DeleteIcon from '@/components/icons/delete';
import DynamicForm from '@/components/dynamicForm';
import SearchIcon from '@/components/icons/search';
import LoadingIcon from '@/components/icons/loading';
import DropdownIcon from '@/components/icons/dropdown';
import LeftArrowIcon from '@/components/icons/arrowLeft';
import RightArrowIcon from '@/components/icons/arrowLeft';
import AdditionIcon from '@/components/icons/additionIcon';

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

  function handleInitialPageLoad() {
    const areQueriesNotProvided = !queries().page || !queries().pageSize;
    const studentsToList = currentPage * currentPageSize;
    const maxStudentsAPIcanReturn = 100;
    const isLastPage = Math.ceil(maxStudentsAPIcanReturn / currentPageSize) === currentPage;

    if (areQueriesNotProvided) {
      router.replace(routeWithValidQueries('1', '6'));
    }
    if (studentsToList > maxStudentsAPIcanReturn && !isLastPage && !isInitialLoadAlreadyHandled) {
      toast.info('The page you were looking for was not found. The list is reset');
      router.replace(routeWithValidQueries('1', '6'));
    }
    isInitialLoadAlreadyHandled = true;
  }

  const routeWithValidQueries = (desiredPage, desiredPageSize, search) =>
    `/students?page=${desiredPage || currentPage}&pageSize=${desiredPageSize || currentPageSize}${
      search ? '&search=' + encodeURIComponent(search) : ''
    }`;
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const { data, isLoading: isFetching } = useSWR('/api/getUsers', fetcher);
  const currentPage = parseInt(queries().page);
  const currentPageSize = parseInt(queries().pageSize);
  let isInitialLoadAlreadyHandled = false;
  const tableTitles = ['Name', 'Email', 'Phone', 'Website', 'Company Name'];
  const userProperties = ['fullName', 'email', 'phone', 'domain', 'companyName'];
  const searchInput = useRef(null);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [initialUserData, setInitialUserData] = useState({});
  const [paginationText, setPaginationText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [usersData, setUsersData] = useState({});
  const isAtTheFirstPage = currentPage < 2;
  const isAtTheLastPage = Math.floor(100 / currentPageSize < currentPage);
  const [formType, setFormType] = useState('forEditing');
  const [editedUserData, setEditedUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    domain: '',
    companyName: '',
  });
  const [newUserData, setNewUserData] = useState({
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
      placeholder: 'John',
    },
    { type: 'text', property: 'lastName', label: 'Last Name', placeholder: 'Doe' },
    {
      type: 'email',
      property: 'email',
      label: 'Email',
      placeholder: 'john_doe@sikayetvar.com',
    },
    {
      type: 'tel',
      property: 'phone',
      label: 'Phone',
      placeholder: '+1 303 205 19 24',
    },
    {
      type: 'text',
      property: 'domain',
      label: 'Website',
      placeholder: 'johndoe.com',
    },
    {
      type: 'text',
      property: 'companyName',
      label: 'Company Name',
      placeholder: 'Doe Transportation',
    },
  ];
  const dynamicFormProps = {
    forEditing: {
      formTitle: 'Edit The Student',
      inputsArray: inputsForEditingUsers,
      placeholderData: initialUserData,
      editableData: editedUserData,
      submitButtonText: 'Save Changes',
      inputOnChangeFunction: () =>
        setEditedUserData({
          ...editedUserData,
          [event.target.id]: event.target.value,
        }),
      submitButtonFunction: () => editUser(editedUserData),
    },
    forCreating: {
      formTitle: 'Add New Student',
      inputsArray: inputsForEditingUsers,
      placeholderData: '',
      editableData: newUserData,
      submitButtonText: 'Create Student',
      inputOnChangeFunction: () =>
        setNewUserData({
          ...newUserData,
          [event.target.id]: event.target.value,
        }),
      submitButtonFunction: () => createUser(newUserData),
    },
  };

  useEffect(() => {
    window.addEventListener('load', handleInitialPageLoad());
  }, []);
  useEffect(() => {
    if (!isFetching) {
      setUsersData(data);
    }
  }, [isFetching]);
  useEffect(() => {
    if (queries().search && usersData.ok) {
      searchUsers(queries().search);
    } else if (!queries().search) {
      paginateTheList(usersData.users);
    }
  }, [usersData]);
  useEffect(() => {
    if (paginatedUsers.length > 0) {
      setIsLoading(false);
    }
  }, [paginatedUsers]);
  useEffect(() => {
    handlePaginationText(paginatedUsers);
  }, [paginatedUsers]);

  function handlePageIfEmpty(pageItemsCount) {
    const page = parseInt(queries()?.page);
    const pageSize = parseInt(queries()?.pageSize);
    const isLastPage = Math.ceil(pageItemsCount / pageSize) === page;
    const studentsToList = page * pageSize;
    if (studentsToList > pageItemsCount && !isLastPage) {
      toast.warning('The page you were looking for was not found. The list is reset');
      router.replace(routeWithValidQueries('1', '6', ''));
      return false;
    } else {
      return true;
    }
  }

  function paginateTheList(list) {
    if (usersData?.users?.length > 0) {
      let singlePage = [];
      const allPages = [];
      const allItemsCount = list.length;
      const pageCount = Math.floor(allItemsCount / currentPageSize);
      const leftoverItemsCount = allItemsCount % currentPageSize;

      if (handlePageIfEmpty(allItemsCount)) {
        for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
          for (let item = 0; item < currentPageSize; item++) {
            const itemIndex = item + pageNumber * currentPageSize;

            singlePage.push(...list.slice(itemIndex, itemIndex + 1));
          }
          allPages.push(singlePage);
          singlePage = [];
        }

        if (leftoverItemsCount !== 0) {
          singlePage.push(...list.slice(allItemsCount - leftoverItemsCount, allItemsCount));
          allPages.push(singlePage);
        }
        setPaginatedUsers(allPages);
      }
    }
  }

  function prepareForEditing(userToEdit) {
    usersData.users.forEach((user) => {
      if (user === userToEdit) {
        setInitialUserData(user);
        setEditedUserData(user);
      }
    });
    setIsEditable(true);
    setFormType('forEditing');
  }

  async function createUser(userData) {
    if (isFormDataValid(userData)) {
      setIsLoading(true);

      const query = encodeURIComponent(
        JSON.stringify({ ...userData, company: { name: userData.companyName } })
      );
      const response = await fetch(`/api/createUser?userData=${query}`, {
        method: 'POST',
      }).then((res) => {
        return res.json();
      });

      showResult(response, 'create', 'User created successfully');
    }
  }

  async function editUser(user) {
    if (isFormDataValid(user)) {
      setIsLoading(true);
      const userQuery = () => {
        const queryObject = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          domain: user.domain,
          company: { name: user.companyName },
        };

        if (user.id >= 101) {
          queryObject.id = Math.ceil(Math.random() * 100);
        } else {
          queryObject.id = editedUserData.id;
        }
        return encodeURIComponent(JSON.stringify(queryObject));
      };

      const response = await fetch(`/api/updateUser?id=${user.id}&user=${userQuery()}`).then(
        (res) => res.json()
      );
      showResult(response, 'change', 'User updated successfully');
    }
  }

  async function deleteUser(userData) {
    const isDecisionCertain = await areYouSure();
    if (isDecisionCertain && userData.id < 101) {
      setIsLoading(true);
      const response = await fetch(`/api/deleteUser?id=${userData.id}`).then((res) => {
        return res.json();
      });
      showResult(response, 'delete', 'User deleted successfully');
    } else if (isDecisionCertain) {
      setIsLoading(true);
      setTimeout(() => {
        showResult({ ok: true, data: userData }, 'delete', 'User deleted successfully');
      }, 500);
    }
  }

  function searchUsers(query) {
    const decodedQuery = decodeURIComponent(query);
    const options = {
      keys: ['firstName', 'lastName', 'fullName', 'email', 'domain', 'phone', 'companyName'],
      isCaseSensitive: false,
      minMatchCharLength: 2,
      shouldSort: true,
      threshold: 0.1,
    };

    const fuse = new Fuse(usersData.users, options);
    const searchResult = fuse.search(decodedQuery).map((result) => {
      return result.item;
    });
    paginateTheList(searchResult);

    if (searchResult.length === 0) {
      toast.info('No related results were found with the search query');
    }
    return searchResult;
  }

  function updateUsersArray(cachedUser, updatingMethod) {
    let updatedUsersData;
    setIsEditable(false);

    if (updatingMethod === 'change') {
      cachedUser.id = editedUserData.id;
      updatedUsersData = usersData.users.map((user) => {
        if (user.id === cachedUser.id) {
          return cachedUser;
        } else return user;
      });
      setUsersData({ ...usersData, users: updatedUsersData });
    } else if (updatingMethod === 'delete') {
      usersData.users.every((user) => {
        if (user.id === cachedUser.id) {
          updatedUsersData = usersData.users.toSpliced(usersData.users.indexOf(user), 1);
          setUsersData({ ...usersData, users: updatedUsersData });
          return false;
        }
        return true;
      });
    } else if (updatingMethod === 'create') {
      const id = usersData.users.length + 1;
      updatedUsersData = [{ ...cachedUser, id }].concat(usersData.users);
      setUsersData({ ...usersData, users: updatedUsersData });
    }
  }

  function showResult(response, updatingMethod, successMessage) {
    setIsLoading(false);
    if (response.ok) {
      toast.success(successMessage);
      updateUsersArray(response.data, updatingMethod);
    } else {
      toast.error(response.message || response.data.message);
    }
  }

  async function areYouSure() {
    return await Swal.fire({
      icon: 'question',
      title: 'Are You Sure?',
      text: "This action will delete the user data and can't be reverted.",
      focusConfirm: true,
      showDenyButton: true,
      confirmButtonText: 'Yes, delete it',
      denyButtonText: 'Cancel',
    }).then(async (result) => {
      return await result.value;
    });
  }

  function handlePageSwitching(direction) {
    if (direction === 'back' && currentPage > 1) {
      router.push(routeWithValidQueries(currentPage - 1));
    } else if (direction === 'forward' && !isAtTheLastPage) {
      router.push(routeWithValidQueries(currentPage + 1));
    }
  }

  function handlePaginationText(paginatedItemsList) {
    if (paginatedItemsList.length > 0) {
      let itemsCount = 0;
      paginatedItemsList.forEach((array) => {
        array.forEach(() => {
          itemsCount++;
        });
      });

      const firstNumber =
        (currentPage - 1) * currentPageSize +
        paginatedItemsList[currentPage - 1].length -
        paginatedItemsList[currentPage - 1].length;
      const secondNumber =
        (currentPage - 1) * currentPageSize + paginatedItemsList[currentPage - 1].length;
      const text = `${firstNumber}-${secondNumber} of ${itemsCount}`;

      setPaginationText(text);
    }
  }

  function isFirstNameValid(fistName, willShowMessage) {
    const isValid = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\ ]+$/.test(fistName);
    if (!isValid && willShowMessage) {
      toast.error('Please enter a valid first name');
    }
    return isValid;
  }

  function isLastNameValid(lastName, willShowMessage) {
    const isValid = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\ ]+$/.test(lastName);
    if (!isValid && willShowMessage) {
      toast.error('Please enter a valid last name');
    }
    return isValid;
  }

  function areThereEmptyInputs(data, willShowMessage) {
    const dataToValidate = [
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.domain,
      data.companyName,
    ];
    const isValid = dataToValidate.includes('');
    if (isValid && willShowMessage) {
      toast.error('Please fill out all input-fields');
    }
    return isValid;
  }

  function isEmailValid(email, willShowMessage) {
    const isValid = /^[\w]+[\w\-\_\.]+[\w]+\@[\w]+[\w\.]+[\w]{2,}$/.test(email);
    if (!isValid && willShowMessage) {
      toast.error('Please enter a valid email adress');
    }
    return isValid;
  }

  function isWebsiteValid(website, willShowMessage) {
    const isValid = /^[\w]+[\.\w\-]{0,}[\w]\.[\w]{2,}$/.test(website);
    if (!isValid && willShowMessage) {
      toast.error('Please enter a valid domain adress');
    }
    return isValid;
  }

  function isPhoneValid(phone, willShowMessage) {
    const isValid = /^[\+]{0,1}[\d\ ]+$/.test(phone);
    if (!isValid && willShowMessage) {
      toast.error('Please enter a valid phone number');
    }
    return isValid;
  }

  function showMessageOnValidationError(userData) {
    isFirstNameValid(userData.firstName, true);
    isLastNameValid(userData.lastName, true);
    isEmailValid(userData.email, true);
    isPhoneValid(userData.phone, true);
    isWebsiteValid(userData.domain, true);
    areThereEmptyInputs(userData, true);
  }

  function isFormDataValid(userData) {
    showMessageOnValidationError(userData);

    return (
      isFirstNameValid(userData.firstName, false) &&
      isLastNameValid(userData.lastName, false) &&
      isEmailValid(userData.email, false) &&
      isPhoneValid(userData.phone, false) &&
      isWebsiteValid(userData.domain, false) &&
      !areThereEmptyInputs(userData, false)
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
        userImage='/images/dummyAvatar.webp'
        placeholder='empty'
        name='John'
        surname='Doe'
        role='Admin'
      />
      <main className='w-full h-full min-h-screen'>
        <TopBar />
        <section className='px-10 py-4 w-full h-full'>
          <div className='flex justify-between items-center max-sm:flex-col max-sm:gap-y-4 max-sm:py-4 max-xs:gap-y-2'>
            <div className='max-xs:w-full max-xs:flex max-xs:justify-between max-xs:items-center'>
              <p className='text-xl leading-4 font-bold'>Students List</p>
              <button
                onClick={() => {
                  setIsEditable(true);
                  setFormType('forCreating');
                }}
                className='py-0.5 px-3 text-white font-medium rounded-md uppercase bg-themeColor transition-all duration-200 active:scale-95 xs:hidden'
              >
                <AdditionIcon className='w-6 h-6' />
              </button>
            </div>
            <div className='flex gap-x-6 justify-center items-center max-lg:gap-x-3 max-xs:w-full'>
              <div className='bg-white rounded-md flex justify-center items-center flex-shrink-0 border-1 border-borderColor max-xs:w-full'>
                <input
                  ref={searchInput}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      router.push(routeWithValidQueries('', '', searchInput.current.value));
                    }
                  }}
                  type='text'
                  placeholder='Search...'
                  className='py-2.5 px-4 rounded-lg outline-none text-sm placeholder:text-inputPlaceholderColor max-xs:w-full'
                />
                <button
                  onClick={() => {
                    router.push(routeWithValidQueries('', '', searchInput.current.value));
                  }}
                  className='px-4 border-l-2 border-borderColor'
                >
                  <SearchIcon />
                </button>
              </div>
              <button
                onClick={() => {
                  setIsEditable(true);
                  setFormType('forCreating');
                }}
                className='py-3 px-8 text-xs text-white font-medium rounded-md uppercase bg-themeColor transition-all duration-200 active:scale-95 max-lg:py-2 max-lg:px-4 max-xs:hidden'
              >
                <p className='max-lg:hidden'>Add New Student</p>
                <AdditionIcon className='w-6 h-6 lg:hidden' />
              </button>
            </div>
          </div>
          <hr className='my-4' />
          <div className='pl-28 flex text-xs gap-x-7 leading-4 font-semibold text-tableCaptionColor max-lg/xl:hidden'>
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
          <div className='py-4 flex flex-col gap-y-3'>
            {!isLoading &&
              usersData?.ok &&
              paginatedUsers[currentPage - 1].map((user) => {
                user.fullName = `${user.firstName} ${user.lastName}`;
                user.companyName = user.company.name;

                return (
                  <div
                    key={JSON.stringify(user)}
                    className='p-4 max-lg/xl:px-0 relative max-lg/xl:pt-0 w-full flex justify-between items-center gap-x-3 bg-white rounded-lg shadow-form  max-lg/xl:flex-col'
                  >
                    <div className='w-full flex justify-center items-center max-lg/xl:flex-col'>
                      <div className='overflow-hidden max-lg/xl:w-full max-lg/xl:h-[200px] max-lg/xl:flex max-lg/xl:mb-3'>
                        <Image
                          src={user.image || '/images/dummyPersonImage.webp'}
                          alt={user.fullName}
                          width={300}
                          height={300}
                          placeholder='blur'
                          blurDataURL='/images/dummyPersonImage.webp'
                          className='w-[70px] h-[70px] rounded-lg object-cover object-center bg-white max-lg/xl:bg-gradient-134deg max-lg/xl:from-orange-500/90 max-lg/xl:to-yellow-400/60 max-lg/xl:rounded-b-none max-lg/xl:w-full max-lg/xl:h-auto'
                        />
                      </div>
                      <div className='w-full grid grid-flow-col grid-cols-5 grid-rows-1 max-lg/xl:grid-flow-row max-lg/xl:grid-rows-5 max-lg/xl:grid-cols-1 max-lg/xl:px-4'>
                        {userProperties.map((property) => {
                          return (
                            <div
                              key={property}
                              className='w-full max-lg/xl:mt-5'
                            >
                              <p className='truncate px-4 text-xs leading-4 font-semibold text-tableCaptionColor lg/xl:hidden'>
                                {tableTitles[userProperties.indexOf(property)]}
                              </p>
                              <p
                                key={property + user.id}
                                className='w-full px-4 py-2 max-lg/xl:pt-0 truncate text-left'
                              >
                                {user[property]}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className='pr-4 w-24 space-x-10 flex justify-center items-center max-lg/xl:flex-col max-lg/xl:absolute max-lg/xl:top-[240px] max-lg/xl:space-x-0 max-lg/xl:right-0 max-lg/xl:w-16 max-lg/xl:space-y-8'>
                      <button
                        onClick={() => {
                          prepareForEditing(user);
                        }}
                        className='active:scale-75 transition-all duration-200'
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => {
                          deleteUser(user);
                        }}
                        className='active:scale-75 transition-all duration-200'
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className='mt-4 flex justify-end max-sm:flex-col-reverse max-sm:gap-y-4 max-sm:w-fit max-sm:mx-auto max-sm:items-center'>
            <div className='flex'>
              <p className='text-sm text-fadedTextColor-darker'>Rows per page:</p>
              <label
                htmlFor='pageSizeSelectMenu'
                className='relative -mt-0.5'
              >
                <select
                  id='pageSizeSelectMenu'
                  onChange={(event) => {
                    {
                      router.push(
                        routeWithValidQueries('', event.target.value, searchInput.current.value)
                      );
                    }
                  }}
                  className='w-10 z-10 relative text-sm outline-none text-center bg-transparent appearance-none text-selectMenuColor cursor-pointer'
                  value={router.query.pageSize}
                >
                  {[...Array(10)].map((elementInArray, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      {index + 1}
                    </option>
                  ))}
                </select>
                <div className='absolute right-0 z-0 top-[5px]'>
                  <DropdownIcon />
                </div>
              </label>
            </div>

            <div className='flex'>
              <p className='ml-14 mr-4 text-sm text-fadedTextColor-darker max-sm:ml-0'>
                {paginationText}
              </p>
              <div className='flex justify-center items-center'>
                <button
                  onClick={() => {
                    handlePageSwitching('back');
                  }}
                  className={`transition-all duration-200 active:scale-75 ${
                    isAtTheFirstPage
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-100 cursor-pointer'
                  }`}
                >
                  <LeftArrowIcon />
                </button>
                <button
                  onClick={() => {
                    handlePageSwitching('forward');
                  }}
                  className={`ml-4 rotate-180 transition-all duration-300 active:scale-75 ${
                    isAtTheLastPage ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                  }`}
                >
                  <RightArrowIcon />
                </button>
              </div>
            </div>
          </div>
          <div className='h-8 bg-transparent' />
        </section>

        <div
          className={`z-40 w-screen h-screen absolute top-0 right-0 flex flex-col py-10 justify-center items-center bg-black/40 transform-all duration-300 overflow-x-hidden overflow-y-auto ${
            isEditable ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <button
            onClick={() => {
              setIsEditable(false);
            }}
            className='w-full h-full absolute top-0 right-0'
          />
          <DynamicForm
            formTitle={dynamicFormProps[formType].formTitle}
            inputsArray={dynamicFormProps[formType].inputsArray}
            placeholderData={dynamicFormProps[formType].placeholderData}
            editableData={dynamicFormProps[formType].editableData}
            submitButtonText={dynamicFormProps[formType].submitButtonText}
            inputOnChangeFunction={dynamicFormProps[formType].inputOnChangeFunction}
            submitButtonFunction={dynamicFormProps[formType].submitButtonFunction}
          />
          <p className='px-8 py-1 rounded-b-md bg-black/50 text-white text-xs shadow-form'>
            Click outside of the form to close it
          </p>
        </div>

        <div
          className={`w-screen h-screen absolute top-0 left-0 z-50 flex items-center justify-center bg-black/40 transition-all duration-300 ${
            isLoading ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className='w-44 flex items-center'>
            <LoadingIcon />
          </div>
        </div>
      </main>
    </div>
  );
}
