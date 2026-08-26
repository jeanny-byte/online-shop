import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Upload, Globe, Mail, Phone, MapPin, Newspaper, DollarSign, Truck } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const API_URL = import.meta.env.VITE_API_URL;

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  whatsapp_number: string;
  store_address: string;
  logo_url: string;
  newsletter_enabled: boolean;
  newsletter_title: string;
  newsletter_description: string;
  currency: string;
  shipping_fee: number;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: '',
    store_email: '',
    store_phone: '',
    whatsapp_number: '',
    store_address: '',
    logo_url: '',
    newsletter_enabled: true,
    newsletter_title: '',
    newsletter_description: '',
    currency: 'GHS',
    shipping_fee: 0,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      if (data) {
        // Sanitize null values to empty strings to prevent React warnings
        const sanitizedData = {
          ...data,
          store_email: data.store_email || '',
          store_phone: data.store_phone || '',
          whatsapp_number: data.whatsapp_number || '',
          store_address: data.store_address || '',
          newsletter_title: data.newsletter_title || '',
          newsletter_description: data.newsletter_description || '',
        };
        setSettings(sanitizedData);
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, newsletter_enabled: checked }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData();
      
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== 'logo_url' && value !== null) {
          // Convert booleans to 1/0 for Laravel compatibility in FormData
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST', // Using POST for multipart form data
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      toast({
        title: 'Success',
        description: 'Store settings updated successfully',
      });
      
      await fetchSettings(); // Refresh local form data
      await refreshSettings(); // Refresh global context data
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Store Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <CardTitle>General Information</CardTitle>
                </div>
                <CardDescription>Configure your store's basic identification and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store_name">Store Name</Label>
                    <Input 
                      id="store_name" 
                      name="store_name" 
                      value={settings.store_name} 
                      onChange={handleChange} 
                      placeholder="e.g. Nelysah Royal Care"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store_email">Support Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="store_email" 
                        name="store_email" 
                        value={settings.store_email} 
                        onChange={handleChange} 
                        className="pl-8"
                        placeholder="info@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store_phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="store_phone" 
                        name="store_phone" 
                        value={settings.store_phone} 
                        onChange={handleChange} 
                        className="pl-8"
                        placeholder="+233 ..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="whatsapp_number" 
                        name="whatsapp_number" 
                        value={settings.whatsapp_number} 
                        onChange={handleChange} 
                        className="pl-8"
                        placeholder="+233 ..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency Code</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="currency" 
                        name="currency" 
                        value={settings.currency} 
                        onChange={handleChange} 
                        className="pl-8"
                        placeholder="GHS"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_address">Physical Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="store_address" 
                      name="store_address" 
                      value={settings.store_address} 
                      onChange={handleChange} 
                      className="pl-8 min-h-[100px]"
                      placeholder="123 Street Name, City, Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary" />
                  <CardTitle>Newsletter Configuration</CardTitle>
                </div>
                <CardDescription>Manage how customers interact with your newsletter subscription.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Newsletter Popup</Label>
                    <p className="text-sm text-muted-foreground">Show a subscription modal to new visitors.</p>
                  </div>
                  <Switch 
                    checked={settings.newsletter_enabled} 
                    onCheckedChange={handleSwitchChange} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter_title">Newsletter Title</Label>
                  <Input 
                    id="newsletter_title" 
                    name="newsletter_title" 
                    value={settings.newsletter_title} 
                    onChange={handleChange} 
                    placeholder="e.g. Join Our Newsletter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter_description">Newsletter Description</Label>
                  <Textarea 
                    id="newsletter_description" 
                    name="newsletter_description" 
                    value={settings.newsletter_description} 
                    onChange={handleChange} 
                    placeholder="Describe why customers should subscribe..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <CardTitle>Shipping & Logistics</CardTitle>
                </div>
                <CardDescription>Set default shipping parameters for your orders.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="shipping_fee">Default Shipping Fee ({settings.currency})</Label>
                  <Input 
                    id="shipping_fee" 
                    name="shipping_fee" 
                    type="number"
                    step="0.01"
                    value={settings.shipping_fee} 
                    onChange={handleChange} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logo & Branding */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Logo</CardTitle>
                <CardDescription>Upload your brand's primary logo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full aspect-square relative rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/20">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                  <Label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer w-full"
                  >
                    <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4" />
                      Choose Logo
                    </div>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoChange} 
                    />
                  </Label>
                  <p className="text-xs text-center text-muted-foreground">
                    Recommended: Square PNG or SVG with transparent background.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={fetchSettings} disabled={saving}>
                Cancel & Reset
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
