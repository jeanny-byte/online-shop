import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Upload, Globe, Mail, Phone, MapPin, Newspaper, DollarSign, Truck, MessageCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { processImageOptimization, normalizeImageUrl, handleImageError } from '@/lib/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '';

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
  const [optimizingLogo, setOptimizingLogo] = useState(false);
  const [logoStats, setLogoStats] = useState<{ originalSize: number; optimizedSize: number } | null>(null);
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
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
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
        const normalizedLogo = normalizeImageUrl(data.logo_url);
        const sanitizedData = {
          ...data,
          store_name: data.store_name || '',
          store_email: data.store_email || '',
          store_phone: data.store_phone || '',
          whatsapp_number: data.whatsapp_number || '',
          store_address: data.store_address || '',
          newsletter_title: data.newsletter_title || '',
          newsletter_description: data.newsletter_description || '',
          logo_url: normalizedLogo,
        };
        setSettings(sanitizedData);
        setLogoPreview(normalizedLogo || null);
        setLogoFile(null);
        setLogoBase64(null);
        setLogoStats(null);
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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOptimizingLogo(true);
    try {
      // Progressively compress and downscale logo to guarantee file stays well below server limits (under 300KB)
      const result = await processImageOptimization(file, 800, 300 * 1024, 0.85);
      
      setLogoFile(result.file);
      setLogoBase64(result.dataUrl);
      setLogoPreview(result.dataUrl);
      setLogoStats({
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
      });

      const optKb = (result.optimizedSize / 1024).toFixed(0);
      if (result.originalSize > 500 * 1024) {
        const origMb = (result.originalSize / (1024 * 1024)).toFixed(1);
        toast({
          title: 'Logo Ready & Optimized',
          description: `Optimized from ${origMb} MB down to ${optKb} KB for fast, error-free uploading.`,
        });
      }
    } catch (err) {
      console.error('Error optimizing logo:', err);
      // Fallback
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setOptimizingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoBase64(null);
    setLogoPreview(null);
    setLogoStats(null);
    setSettings(prev => ({ ...prev, logo_url: '' }));
  };

  const cleanWhatsapp = settings.whatsapp_number.replace(/[^\d]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData();
      
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== 'logo_url' && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (logoFile) {
        formData.append('logo', logoFile);
        if (logoBase64 && logoBase64.startsWith('data:image')) {
          formData.append('logo_base64', logoBase64);
        }
      } else if (!logoPreview) {
        // Logo was removed
        formData.append('logo_url', '');
      }

      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.status === 413) {
        throw new Error('Upload rejected by server: Request entity too large. The logo file was compressed further to resolve this.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = errorData.message || 'Failed to update settings';
        if (errorData.errors) {
          const firstErr = Object.values(errorData.errors).flat()[0];
          if (firstErr) errorMsg = String(firstErr);
        }
        throw new Error(errorMsg);
      }

      toast({
        title: 'Settings Saved',
        description: 'Store branding, logo, and configuration updated successfully.',
      });
      
      await fetchSettings();
      await refreshSettings();
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error Saving Settings',
        description: error.message || 'Failed to update settings',
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
                  <CardTitle>Branding & Contact Information</CardTitle>
                </div>
                <CardDescription>Configure your store identification, WhatsApp order recipient, and public contacts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store_name">Store Name *</Label>
                    <Input 
                      id="store_name" 
                      name="store_name" 
                      value={settings.store_name} 
                      onChange={handleChange} 
                      placeholder="e.g. Nelysah Cosmetics"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">Admin WhatsApp Number *</Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-[#25D366]" />
                      <Input 
                        id="whatsapp_number" 
                        name="whatsapp_number" 
                        value={settings.whatsapp_number} 
                        onChange={handleChange} 
                        className="pl-8"
                        placeholder="e.g. 233557246424 or 0557246424"
                        required
                      />
                    </div>
                    {cleanWhatsapp && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>Format: +{cleanWhatsapp}</span>
                        <a
                          href={`https://wa.me/${cleanWhatsapp}?text=Test%20message%20from%20admin%20panel`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <ExternalLink size={12} /> Test Link
                        </a>
                      </div>
                    )}
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
                        placeholder="info@nelysah.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store_phone">Public Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="store_phone" 
                        name="store_phone" 
                        value={settings.store_phone} 
                        onChange={handleChange} 
                        className="pl-8"
                        placeholder="+233 55 724 6424"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Store Currency</Label>
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
                      className="pl-8 min-h-[80px]"
                      placeholder="Accra, Ghana"
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
                    <Label className="text-base">Enable Newsletter Section</Label>
                    <p className="text-sm text-muted-foreground">Show subscription form across footer & home.</p>
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
                    placeholder="e.g. Join the Royal Family"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter_description">Newsletter Description</Label>
                  <Textarea 
                    id="newsletter_description" 
                    name="newsletter_description" 
                    value={settings.newsletter_description} 
                    onChange={handleChange} 
                    placeholder="Subscribe for exclusive offers and skincare advice..."
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
                <CardDescription>Set default standard delivery fee applied at checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="shipping_fee">Default Shipping Fee ({settings.currency})</Label>
                  <Input 
                    id="shipping_fee" 
                    name="shipping_fee" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shipping_fee} 
                    onChange={handleChange} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logo & Branding Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Logo</CardTitle>
                <CardDescription>Upload your brand's primary logo for the header, footer, and invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full aspect-video relative rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/20 p-4">
                    {logoPreview ? (
                      <div className="relative group w-full h-full flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Store Logo Preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={handleImageError}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md opacity-90 transition-opacity"
                          title="Remove logo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">{settings.store_name || 'Typography Logo'}</p>
                        <p className="text-xs text-muted-foreground mt-1">No custom logo uploaded. Store name will be displayed as styled text.</p>
                      </div>
                    )}
                  </div>

                  {logoStats && (
                    <div className="w-full bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between font-medium">
                      <span>✓ Ready to upload: {(logoStats.optimizedSize / 1024).toFixed(0)} KB</span>
                      {logoStats.originalSize > logoStats.optimizedSize && (
                        <span className="text-emerald-600">Saved -{(((logoStats.originalSize - logoStats.optimizedSize) / logoStats.originalSize) * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  )}

                  <Label 
                    htmlFor="logo-upload" 
                    className={`w-full ${optimizingLogo ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium border border-border">
                      {optimizingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Optimizing Image...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {logoPreview ? 'Replace Logo' : 'Upload Store Logo'}
                        </>
                      )}
                    </div>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                      className="hidden" 
                      disabled={optimizingLogo || saving}
                      onChange={handleLogoChange} 
                    />
                  </Label>
                  <p className="text-xs text-center text-muted-foreground">
                    Recommended: PNG, WebP or SVG with transparent background (Large images auto-compressed).
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full py-2.5 text-sm font-medium" disabled={saving}>
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
                Reset Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
