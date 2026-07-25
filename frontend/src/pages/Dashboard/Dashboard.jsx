import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Users,
  MessageSquare,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentDocuments from "../../components/dashboard/RecentDocuments";
import OrganizationCard from "../../components/dashboard/OrganizationCard";

import { getDashboardData } from "../../services/dashboard";

function Dashboard() {
  const [data, setData] = useState({
    documents: [],
    users: [],
    sessions: [],
    currentUser: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const recentDocuments = useMemo(() => {
    return [...data.documents]
      .sort(
        (a, b) =>
          new Date(b.uploaded_at) -
          new Date(a.uploaded_at)
      )
      .slice(0, 3);
  }, [data.documents]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-gray-500">
            Loading Dashboard...
          </p>
        </div>
      </Layout>
    );
  }

  const isAdmin = data.currentUser?.role === "admin";

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {isAdmin
            ? "Enterprise AI Dashboard"
            : "My Dashboard"}
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, {data.currentUser?.name} 👋
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={isAdmin ? "Documents" : "My Documents"}
          value={data.documents.length}
          icon={<FileText className="text-white" />}
          color="bg-blue-600"
        />

        <StatCard
          title={isAdmin ? "Team Members" : "My Role"}
          value={
            isAdmin
              ? data.users.length
              : data.currentUser?.role?.toUpperCase()
          }
          icon={<Users className="text-white" />}
          color="bg-green-600"
        />

        <StatCard
          title={isAdmin ? "AI Chats" : "My AI Chats"}
          value={data.sessions.length}
          icon={<MessageSquare className="text-white" />}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        <div className="lg:col-span-7">
        <RecentDocuments
            documents={recentDocuments}
        />
        </div>

        <div className="lg:col-span-5">
        <QuickActions
            isAdmin={isAdmin}
        />
        </div>

        </div>

      <OrganizationCard
        user={data.currentUser}
      />
    </Layout>
  );
}

export default Dashboard;