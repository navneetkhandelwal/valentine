import React, { useEffect, useState } from 'react';
import { Shield, Star, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface AdminPanelProps {
  onClose?: () => void;
}

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const { getAdminSettings, updateFeaturedUsername } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featuredUsername, setFeaturedUsername] = useState('');
  const [users, setUsers] = useState<Array<{ username: string; role: 'admin' | 'member'; partnerName: string }>>([]);

  const loadSettings = async () => {
    setLoading(true);
    const settings = await getAdminSettings();
    if (settings) {
      setUsers(settings.users || []);
      setFeaturedUsername(settings.featuredUsername || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!featuredUsername) {
      toast.error('Select a featured creator first');
      return;
    }
    setSaving(true);
    const result = await updateFeaturedUsername(featuredUsername);
    setSaving(false);

    if (result.success) {
      toast.success(`Featured creator set to @${featuredUsername}`);
    } else {
      toast.error(result.error || 'Failed to update featured creator');
    }
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-lg border-rose-100">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl text-gray-800 flex items-center gap-2">
          <Shield size={20} className="text-rose-500" />
          Admin Console
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={loadSettings} size="sm" variant="outline" className="border-rose-200">
            <RefreshCcw size={14} className="mr-2" /> Refresh
          </Button>
          {onClose && (
            <Button onClick={onClose} size="sm" variant="outline" className="border-rose-200">
              Close
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading admin settings...</p>
      ) : (
        <div className="space-y-5">
          <div>
            <Label className="text-gray-700">Featured creator for short URLs</Label>
            <div className="flex gap-2 mt-2">
              <Select value={featuredUsername} onValueChange={setFeaturedUsername}>
                <SelectTrigger className="border-rose-200">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.username} value={user.username}>
                      @{user.username} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
              >
                <Star size={14} className="mr-2" />
                {saving ? 'Saving...' : 'Set'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              After setting this, `happyvalentine.in/rose` and other day routes open that creator's page.
            </p>
          </div>

          <div>
            <Label className="text-gray-700">Registered users</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {users.map((user) => (
                <div key={user.username} className="rounded-lg border border-rose-100 bg-rose-50/40 px-3 py-2 text-sm">
                  <div className="font-medium text-gray-800">@{user.username}</div>
                  <div className="text-gray-600">{user.role} {user.partnerName ? `• ${user.partnerName}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
