import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const TestAdmin: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
        
        <div className="space-y-2">
          <p>User ID: {user?.id || 'Not logged in'}</p>
          <p>Email: {user?.email || 'Not logged in'}</p>
          <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/admin')}>
            Go to Admin Panel
          </Button>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestAdmin;
