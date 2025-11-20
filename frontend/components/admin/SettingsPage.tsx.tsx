// components/admin/SettingsPage.tsx

'use client';

import { useState } from 'react';
import { useToast } from '@/components/admin/common/Toast';
import { Save } from 'lucide-react';

export function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    model: 'gemini-2.5-flash',
    temperature: 0.75,
    systemPrompt: 'You are a helpful and concise AI assistant.',
    botName: 'ZenBot',
    webhookUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'range' ? parseFloat(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Replace with actual API call
      // await settingsApi.updateSettings(settings);
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      addToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Parameters */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-700">AI Model Parameters</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              name="model"
              value={settings.model}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
              <option value="gemini-2.0-ultra">Gemini 2.0 Ultra (Legacy)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Temperature ({settings.temperature.toFixed(2)})</label>
            <input
              type="range"
              name="temperature"
              min="0"
              max="1"
              step="0.01"
              value={settings.temperature}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Controls randomness. Lower is more deterministic.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">System Prompt</label>
            <textarea
              name="systemPrompt"
              value={settings.systemPrompt}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Integration & Identity */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-700">Integration & Identity</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Bot Name</label>
            <input
              type="text"
              name="botName"
              value={settings.botName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Webhook URL</label>
            <input
              type="text"
              name="webhookUrl"
              value={settings.webhookUrl}
              onChange={handleChange}
              placeholder="e.g. https://api.integration.com/hook"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Setup for external notifications.</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}