import Layout from "../../components/layout/Layout";
import ProfileCard from "../../components/settings/ProfileCard";
import PasswordCard from "../../components/settings/PasswordCard";

function Settings() {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account settings and security.
          </p>
        </div>

        <div className="space-y-8">
          <ProfileCard />

          <PasswordCard />
        </div>

      </div>
    </Layout>
  );
}

export default Settings;