import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Fuse from 'fuse.js';
import Head from 'next/head';
import Swal from 'sweetalert2';
import TopBar from '@/components/topBar';
import SideMenu from '@/components/sideMenu';
import EditIcon from '@/components/icons/edit';
import DeleteIcon from '@/components/icons/delete';
import DynamicForm from '@/components/dynamicForm';
import SearchIcon from '@/components/icons/search';
import LoadingIcon from '@/components/icons/loading';

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
  const requestLink = `/api/getUsers?limit=${queries().limit}&skip=${queries().skip}`;
  const [searchedStudents, setSearchedStudents] = useState([]);
  const tableTitles = ['Name', 'Email', 'Phone', 'Website', 'Company Name'];
  const userProperties = ['fullName', 'email', 'phone', 'domain', 'companyName'];
  const [isEditable, setIsEditable] = useState(false);
  const [initialUserData, setInitialUserData] = useState({});
  const [editedUserData, setEditedUserData] = useState({
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

  const searchInput = useRef(null);
  function search(query) {
    const options = {
      keys: ['firstName', 'lastName', 'email', 'domain', 'phone', 'companyName'],
      isCaseSensitive: false,
      minMatchCharLength: 2,
      shouldSort: true,
      threshold: 0.2,
    };

    const fuse = new Fuse(usersData.users, options);
    const searchResult = fuse.search(query);
    setSearchedStudents(searchResult);

    if (searchResult.length === 0) {
      toast.info('No related results were found with the search query');
    } else console.log(searchedStudents);
  }

  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const { data: usersData, error, isLoading: areUsersFetched } = useSWR(requestLink, fetcher);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(areUsersFetched);
  }, [areUsersFetched]);
  const [cachedUser, setCachedUser] = useState({});
  function prepareForEditing(userID) {
    usersData.users.forEach((user) => {
      if (user.id === userID) {
        setInitialUserData(user);
        setEditedUserData(user);
      }
    });
    setIsEditable(true);
    setFormType('forEditing');
  }

  function isFirstNameValid(fistName) {
    const isValid = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\ ]+$/.test(fistName);
    if (!isValid) {
      toast.error('Please enter a valid first name');
    }
    return isValid;
  }

  function isLastNameValid(lastName) {
    const isValid = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\ ]+$/.test(lastName);
    if (!isValid) {
      toast.error('Please enter a valid last name');
    }
    return isValid;
  }

  function areThereEmptyInputs(data) {
    const dataToValidate = [
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.domain,
      data.companyName,
    ];
    const isValid = dataToValidate.includes('');
    if (isValid) {
      toast.error('Please fill out all input-fields');
    }
    return isValid;
  }

  function isEmailValid(email) {
    const isValid = /^[\w]+[\w\-\_\.]+[\w]+\@[\w]+[\w\.]+[\w]{2,}$/.test(email);
    if (!isValid) {
      toast.error('Please enter a valid email adress');
    }
    return isValid;
  }

  function isWebsiteValid(website) {
    const isValid = /^[\w]+[\.\w\-]{0,}[\w]\.[\w]{2,}$/.test(website);
    if (!isValid) {
      toast.error('Please enter a valid domain adress');
    }
    return isValid;
  }

  function isPhoneValid(phone) {
    const isValid = /^[\+]{0,1}[\d\ ]+$/.test(phone);
    if (!isValid) {
      toast.error('Please enter a valid phone number');
    }
    return isValid;
  }

  function showMessageOnError(userData) {
    isFirstNameValid(userData.firstName);
    isLastNameValid(userData.lastName);
    isEmailValid(userData.email);
    isPhoneValid(userData.phone);
    isWebsiteValid(userData.domain);
    areThereEmptyInputs(userData);
  }

  function isFormDataValid(userData) {
    showMessageOnError(userData);

    return (
      isFirstNameValid(userData.firstName) &&
      isLastNameValid(userData.lastName) &&
      isEmailValid(userData.email) &&
      isPhoneValid(userData.phone) &&
      isWebsiteValid(userData.domain) &&
      !areThereEmptyInputs(userData)
    );
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

  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    domain: '',
    companyName: '',
  });
  const [formType, setFormType] = useState('forEditing');
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

  function updateStudents(editedUser, updatingMethod) {
    setIsEditable(false);
    if (updatingMethod === 'change') {
      editedUser.id = editedUserData.id;
      usersData.users = usersData.users.map((user) => {
        if (user.id === editedUser.id) {
          return editedUser;
        } else return user;
      });
    } else if (updatingMethod === 'delete') {
      usersData.users.forEach((user) => {
        if (user.id === editedUser.id) {
          usersData.users.splice(usersData.users.indexOf(user), 1);
        }
      });
    } else if (updatingMethod === 'create') {
      usersData.users.unshift({ ...editedUser, id: usersData.users.length + 1 });
    }
  }

  function showResult(response, updatingMethod, successMessage) {
    setIsLoading(false);
    if (response.ok) {
      toast.success(successMessage);
      updateStudents(response.data, updatingMethod);
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
              <div className='bg-white rounded-md flex justify-center items-center flex-shrink-0 border-1 border-borderColor'>
                <input
                  ref={searchInput}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      search(searchInput.current.value);
                    }
                  }}
                  type='text'
                  placeholder='Search...'
                  className='py-2.5 px-4 rounded-lg outline-none text-sm placeholder:text-inputPlaceholderColor'
                />
                <button
                  onClick={() => {
                    search(searchInput.current.value);
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
                className='py-3 px-8 text-xs text-white font-medium rounded-md uppercase bg-themeColor transition-all duration-200 active:scale-95'
              >
                Add New Student
              </button>
            </div>
          </div>

          <hr className='my-4' />

          <div className='pl-28 flex text-xs gap-x-7 leading-4 font-semibold text-tableCaptionColor'>
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
            {!isLoading &&
              usersData?.ok &&
              searchedStudents.length < 1 &&
              usersData.users.map((user) => {
                user.fullName = `${user.firstName} ${user.lastName}`;
                user.companyName = user.company.name;

                return (
                  <div
                    key={user.id + user.phone}
                    className='p-4 w-full flex items-center gap-x-3 bg-white rounded-lg'
                  >
                    <img
                      src={user.image || '/images/dummyPersonImage.webp'}
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
                    <div className='pr-4 space-x-10 flex justify-center items-center'>
                      <button
                        onClick={() => {
                          prepareForEditing(user.id);
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
            {isLoading && (
              <div className='w-screen h-screen absolute top-0 left-0 z-20 flex items-center justify-center bg-black/40'>
                <div className='w-44 flex items-center'>
                  <LoadingIcon />
                </div>
              </div>
            )}
            {searchedStudents.length > 0 &&
              searchedStudents.map((user) => {
                return (
                  <div
                    key={user.item.id + user.item.phone}
                    className='p-4 w-full flex items-center gap-x-3 bg-white rounded-lg'
                  >
                    <img
                      src={user.item.image || '/images/dummyPersonImage.webp'}
                      alt={user.item.fullName}
                      width='70'
                      height='70'
                      className='w-[70px] h-[70px] rounded-lg object-cover object-center'
                    />
                    {userProperties.map((property) => {
                      return (
                        <div
                          key={property + user.item.id}
                          className='w-2/12 px-4 py-2 truncate text-left rounded-md'
                        >
                          {user.item[property]}
                        </div>
                      );
                    })}
                    <div className='pr-4 space-x-10 flex justify-center items-center'>
                      <button
                        onClick={() => {
                          prepareForEditing(user.item.id);
                        }}
                        className='active:scale-75 transition-all duration-200'
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => {
                          deleteUser(user.item);
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
        </section>

        <div
          className={`w-screen h-screen absolute top-0 right-0 flex flex-col py-10 justify-center items-center bg-black/40 transform-all duration-300 overflow-x-hidden overflow-y-auto ${
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
      </main>
    </div>
  );
}
