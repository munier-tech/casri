import { useUserStore } from "@/store/useUserStore";
import { Loader } from "lucide-react";
import { useEffect } from "react";

const Profile = () => {
  const { user, getUserProfile, isLoading } = useUserStore();

  useEffect(() => {
    if (!user) {
      getUserProfile();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center space-y-4">
          <Loader className="animate-spin text-blue-500 mx-auto" size={48} />
          <p className="text-blue-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-md space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">No user data available</h3>
          <p className="text-gray-500">
            We couldn't find your profile information. Please try refreshing the page.
          </p>
          <button
            onClick={() => getUserProfile()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-lg text-gray-600">
            Welcome back, <span className="text-blue-500">{user.username}</span>
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all hover:shadow-xl animate-fade-in-up">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar Placeholder */}
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden animate-fade-in-up delay-100">
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="text-gray-800 font-medium">{user.username}</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Account Type</label>
                <p className="text-gray-800 font-medium capitalize">{user.role}</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Registration Date</label>
                <p className="text-gray-800 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: Action Buttons */}
      
      </div>
    </div>
  );
};

export default Profile;