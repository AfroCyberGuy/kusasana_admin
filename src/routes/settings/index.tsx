import { createFileRoute } from "@tanstack/react-router";
import { Settings, Bell, Shield, Globe } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-rose-500 peer-focus:ring-2 peer-focus:ring-rose-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-4xl">
        <Section
          icon={Settings}
          title="General"
          description="App-wide configuration"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              App Name
            </label>
            <input
              type="text"
              defaultValue="Kusasana Dating"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@kusasana.app"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Max Daily Swipes (free tier)
            </label>
            <input
              type="number"
              defaultValue={20}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </Section>

        <Section
          icon={Bell}
          title="Notifications"
          description="Push & email notification settings"
        >
          <Toggle label="New match notifications" defaultChecked />
          <Toggle label="Message notifications" defaultChecked />
          <Toggle label="Weekly digest email" defaultChecked />
          <Toggle label="Promotional emails" />
          <Toggle label="Admin alerts" defaultChecked />
        </Section>

        <Section
          icon={Shield}
          title="Moderation"
          description="Content and safety controls"
        >
          <Toggle
            label="Auto-flag suspicious profiles"
            description="ML-based detection"
            defaultChecked
          />
          <Toggle
            label="Require photo verification"
            description="New user onboarding"
            defaultChecked
          />
          <Toggle
            label="Content filtering"
            description="Block explicit messages"
            defaultChecked
          />
          <Toggle label="Manual report review" defaultChecked />
        </Section>

        <Section
          icon={Globe}
          title="Regions"
          description="Geographic availability"
        >
          <Toggle label="Africa" defaultChecked />
          <Toggle label="Europe" defaultChecked />
          <Toggle label="North America" />
          <Toggle label="Asia Pacific" />
          <Toggle
            label="Restrict to verified regions only"
            description="Limits access by IP"
          />
        </Section>
      </div>

      <div className="mt-4 max-w-4xl flex justify-end">
        <button
          type="button"
          className="px-5 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </AdminLayout>
  );
}
