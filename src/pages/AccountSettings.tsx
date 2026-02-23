import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Breadcrumb from '../components/Breadcrumb';
import Loader from '@/common/Loader';
import {
  useGetAccountMeQuery,
  useUpdateAccountMeMutation,
  useUpdateAccountMeWithProfileMutation,
  useChangePasswordMutation,
} from '@/redux/api/apiSlice';
import { updateUser } from '@/redux/authSlice';
import { getProfileImageUrl } from '@/utils/apiUtils';
import userPlaceholder from '../images/user/user-01.png';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { extractErrorMessage } from '@/utils/errorHandling';
import { isFetchBaseQueryError } from '@/types/ErrorType';

type ProfileForm = {
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  phone: string;
  address: string;
};

const initialProfileForm: ProfileForm = {
  email: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  phone: '',
  address: '',
};

export default function AccountSettings() {
  const dispatch = useDispatch();
  const { data: user, isLoading: loadingUser } = useGetAccountMeQuery();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateAccountMeMutation();
  const [updateProfileWithImage, { isLoading: updatingProfileWithImage }] = useUpdateAccountMeWithProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>(initialProfileForm);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email ?? '',
        first_name: user.first_name ?? '',
        middle_name: user.middle_name ?? '',
        last_name: user.last_name ?? '',
        gender: user.gender ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      });
      setProfileImageError(false);
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileError('');
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Allowed per guide: jpg, jpeg, png, gif, webp, tiff, bmp
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/bmp'];
    if (!allowed.includes(file.type)) {
      setProfileError('Please choose a valid image (JPEG, PNG, GIF, WebP, TIFF, BMP).');
      return;
    }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setProfileError('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    try {
      if (profileFile) {
        const formData = new FormData();
        formData.append('profile', profileFile);
        Object.entries(profileForm).forEach(([key, value]) => {
          if (value != null && value !== '') formData.append(key, value);
        });
        const updated = await updateProfileWithImage(formData).unwrap();
        dispatch(updateUser(updated));
        setProfileFile(null);
        setProfilePreview(null);
      } else {
        const updated = await updateProfile(profileForm).unwrap();
        dispatch(updateUser(updated));
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        setProfileError(extractErrorMessage(err));
      } else {
        setProfileError('Failed to update profile');
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        setPasswordError(extractErrorMessage(err));
      } else {
        setPasswordError('Failed to change password');
      }
    }
  };

  if (loadingUser) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumb pageName="Account Settings" />

      <div className="grid grid-cols-1 gap-6">
        {/* Profile section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">Profile</h3>
          </div>
          <div className="p-7">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                  <img
                    src={
                      profilePreview ||
                      (profileImageError ? userPlaceholder : (getProfileImageUrl(user?.profile) || userPlaceholder))
                    }
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() => setProfileImageError(true)}
                  />
                </div>
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 shadow">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H20a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                  </svg>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/tiff,image/bmp"
                    className="sr-only"
                    onChange={handleProfileImageChange}
                    aria-label="Upload profile photo"
                  />
                </label>
              </div>
              <div>
                <p className="text-lg font-medium text-black dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500">{user?.roles}</p>
                {profileFile && (
                  <p className="text-xs text-meta-5 mt-1">New photo selected — save profile to update</p>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">First name</label>
                <input
                  type="text"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Middle name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={profileForm.middle_name}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Last name</label>
                <input
                  type="text"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Gender</label>
                <select
                  name="gender"
                  value={profileForm.gender}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2.5 block text-black dark:text-white">Address</label>
                <input
                  type="text"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  className="w-full rounded border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                />
              </div>
              {profileError && (
                <p className="sm:col-span-2 text-danger text-sm">{profileError}</p>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={updatingProfile || updatingProfileWithImage}
                  className="rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {updatingProfile || updatingProfileWithImage ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change password section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">Change password</h3>
          </div>
          <div className="p-7">
            <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-xl">
              <div className="sm:col-span-2">
                <label className="mb-2.5 block text-black dark:text-white">Current password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2.5 block text-black dark:text-white">New password (min 6 characters)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2.5 block text-black dark:text-white">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => { setConfirmNewPassword(e.target.value); setPasswordError(''); }}
                    className="w-full rounded border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="sm:col-span-2 text-danger text-sm">{passwordError}</p>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {changingPassword ? 'Updating...' : 'Change password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
