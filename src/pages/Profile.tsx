import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import userPlaceholder from '../images/user/user-06.png';
import Loader from '@/common/Loader';
import { useGetAccountMeQuery } from '@/redux/api/apiSlice';
import { getProfileImageUrl } from '@/utils/apiUtils';

const Profile = () => {
  const { data: user, isLoading } = useGetAccountMeQuery();
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profile]);

  if (isLoading) return <Loader />;

  const fullName = [user?.first_name, user?.middle_name, user?.last_name].filter(Boolean).join(' ') || 'User';
  const profileSrc = profileImageError ? userPlaceholder : (getProfileImageUrl(user?.profile) || userPlaceholder);

  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="Profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <Link
              to="/dashboard/account-settings"
              className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary py-1 px-2 text-sm font-medium text-white hover:bg-opacity-80 xsm:px-4"
            >
              <span>Edit profile</span>
            </Link>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2 h-full w-full overflow-hidden rounded-full bg-gray-2 dark:bg-meta-4">
              <img
                src={profileSrc}
                alt={fullName}
                className="h-full w-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {fullName}
            </h3>
            <p className="font-medium text-gray-600 dark:text-gray-400">{user?.roles || '—'}</p>
            {user?.email && (
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            )}
            {user?.phone && (
              <p className="text-sm text-gray-500">{user.phone}</p>
            )}
            {(user?.address?.trim() || user?.gender?.trim()) && (
              <div className="mx-auto mt-6 max-w-180">
                <h4 className="font-semibold text-black dark:text-white">About</h4>
                <div className="mt-4.5 space-y-1 text-left text-gray-600 dark:text-gray-400">
                  {user?.address?.trim() && <p>{user.address}</p>}
                  {user?.gender?.trim() && <p>Gender: {user.gender}</p>}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/dashboard/account-settings"
                className="inline-flex items-center rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
              >
                Edit profile & settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
