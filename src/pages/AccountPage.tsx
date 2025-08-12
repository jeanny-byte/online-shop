import React, { useEffect, useState } from 'react';

// Use API URL from .env
const API_URL = "https://nelysah-server.onrender.com";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Mail, LockKeyhole } from 'lucide-react';

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
  website?: string;
  display_name?: string;
  phone?: string;
  shipping_address?: string;
} 

const AccountPage = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isLoading, navigate]);

  const fetchProfile = async () => {
    if (!user || !user.email) return;
    try {
      setLoadingProfile(true);
      const res = await fetch(`${API_URL}/api/profile/email/${encodeURIComponent(user.email)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      setProfile(data);
      setUserId(data.id || null);
      setFullName(data.full_name || '');
      setWebsite(data.website || '');
      setDisplayName(data.display_name || '');
      setPhone(data.phone || '');
      setShippingAddress(data.shipping_address || '');
      setAvatarUrl(data.avatar_url || null);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      toast({
        title: 'Error fetching profile',
        description: 'Could not load your profile information.',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };


  const updateProfile = async () => {
    if (!user || !user.email) return;
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append('id', userId ?? '');
      formData.append('email', user.email);
      formData.append('full_name', fullName);
      formData.append('website', website);
      formData.append('display_name', displayName);
      formData.append('phone', phone);
      formData.append('shipping_address', shippingAddress);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (avatarUrl) {
        formData.append('avatar_url', avatarUrl);
      }
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      const result = await res.json();
      if (result.avatar_url) {
        setAvatarUrl(result.avatar_url);
      }
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      fetchProfile(); // Refresh profile after update
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };



  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container-custom py-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading account information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container-custom py-8">
  <div className="flex justify-end mb-6">
    <Button variant="outline" onClick={() => navigate('/user-orders')}>
      My Orders
    </Button>
  </div>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-medium mb-8">My Account</h1>
          
          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.full_name || profile?.display_name || user?.email || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <LockKeyhole className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">••••••••</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
            
            {/* Profile Edit Card */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar upload and preview */}
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl} // Use the full Cloudinary URL directly
                        alt="User avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="text-muted-foreground w-8 h-8" />
                      </div>
                    )}
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setAvatarFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Upload a profile picture (optional)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Enter your full name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="Enter your display name" 
                  />
                </div>
                
                {/* <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    placeholder="https://example.com" 
                  />
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your phone number" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Input 
                    id="shippingAddress" 
                    value={shippingAddress} 
                    onChange={(e) => setShippingAddress(e.target.value)} 
                    placeholder="Enter your shipping address" 
                  />
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    readOnly 
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={updateProfile} 
                  className="w-full"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
