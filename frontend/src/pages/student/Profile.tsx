import { useState } from 'react';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileDetails from '../../components/profile/ProfileDetails';
import ProfileCompletion from '../../components/profile/ProfileCompletion';
import EditProfileDialog from '../../components/profile/EditProfileDialog';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '../../components/layout/AuthProvider';

export default function Profile() {
  const { profile, setProfile, loading, refreshProfile, completionPercentage } = useAuthContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSaveProfile = async (formData: FormData) => {
    try {
      const res = await api.put('/student/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile(res.data.data);
      toastSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-8 backdrop-blur-xl text-center space-y-4">
        <p className="text-slate-400 font-medium">Unable to load profile data.</p>
        <button
          onClick={refreshProfile}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ProfileHeader
        profile={profile}
        completionPercentage={completionPercentage}
        onEditClick={() => setIsEditDialogOpen(true)}
      />

      {/* Grid details and completion */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start">
        {/* Profile Details */}
        <div className="xl:col-span-8">
          <ProfileDetails profile={profile} />
        </div>

        {/* Completion Setup Checklist */}
        <div className="xl:col-span-4">
          <ProfileCompletion profile={profile} />
        </div>
      </div>

      {/* Edit Dialog */}
      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
