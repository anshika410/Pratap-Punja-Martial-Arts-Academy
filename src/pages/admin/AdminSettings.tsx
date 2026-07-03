import { useState } from 'react';
import { FiSave, FiLock } from 'react-icons/fi';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { siteSettings, setSiteSettings } = useData();
  const { updatePassword, adminEmail } = useAuth();
  const [settings, setSettings] = useState(siteSettings);
  const [saved, setSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleSave = () => {
    setSiteSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setUpdatingPassword(true);
    const result = await updatePassword(passwordForm.newPassword);
    setUpdatingPassword(false);

    if (result.success) {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMessage(null);
      }, 2000);
    } else {
      setPasswordMessage({ type: 'error', text: result.error || 'Failed to update password' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500">Manage site settings and contact information</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition-colors">
          <FiSave /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Academy Information</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Academy Name</label><input type="text" value={settings.academyName} onChange={(e) => setSettings({ ...settings, academyName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label><input type="text" value={settings.logo} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label><input type="text" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={settings.contactInfo.phone} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label><input type="text" value={settings.contactInfo.whatsapp} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, whatsapp: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="text" value={settings.contactInfo.email} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label><input type="text" value={settings.contactInfo.openingHours} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, openingHours: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea rows={2} value={settings.contactInfo.address} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })} className="w-full px-4 py-2 border rounded-lg resize-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label><input type="text" value={settings.contactInfo.mapEmbedUrl} onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, mapEmbedUrl: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Social Media Links</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label><input type="text" value={settings.socialLinks.facebook || ''} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label><input type="text" value={settings.socialLinks.instagram || ''} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label><input type="text" value={settings.socialLinks.youtube || ''} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label><input type="text" value={settings.socialLinks.twitter || ''} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiLock className="text-royal-blue" />
              <h3 className="font-bold text-gray-800">Security</h3>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">Logged in as: <span className="font-medium">{adminEmail}</span></p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    />
                  </div>

                  {passwordMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={updatingPassword}
                      className="flex-1 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition-colors disabled:opacity-60"
                    >
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ newPassword: '', confirmPassword: '' });
                        setPasswordMessage(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
