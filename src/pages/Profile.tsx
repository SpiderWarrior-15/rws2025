import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../types/types';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import FriendSystem from '../components/FriendSystem';
import PageNotFound from './PageNotFound';

const Profile = () => {
  const { username } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/users/${username}`);
        setProfileUser(res.data);
        setIsOwnProfile(user?.username === res.data.username);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [username, user, authLoading]);

  if (loading || authLoading) return <Loading />;

  if (error || !profileUser) return <PageNotFound />;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>{profileUser.username}'s Profile</h1>
          {isOwnProfile && <span className="profile-own-label">This is your profile</span>}
        </div>

        <div className="profile-details">
          <p><strong>Email:</strong> {profileUser.email}</p>
          <p><strong>Joined:</strong> {new Date(profileUser.createdAt).toLocaleDateString()}</p>
        </div>

        {!isOwnProfile && user && (
          <FriendSystem targetUser={profileUser} />
        )}
      </div>
    </>
  );
};

export default Profile;
