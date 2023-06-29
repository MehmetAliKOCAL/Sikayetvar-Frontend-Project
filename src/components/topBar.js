import NavigateBackIcon from './icons/navigateBack';
import BellIcon from './icons/bell';

export default function TopBar() {
  return (
    <div className='w-full py-3 px-10 bg-white flex justify-between items-center'>
      <NavigateBackIcon />
      <BellIcon />
    </div>
  );
}
