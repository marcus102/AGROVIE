import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  FileText,
  PenTool,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  // ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { format } from 'date-fns';

export function Dashboard() {
  const { users, missions, documents, blogPosts, payments } = useAdminStore();

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalMissions = missions.length;
    const activeMissions = missions.filter(m => m.status === 'online').length;
    const totalDocuments = documents.length;
    const approuvedDocs = documents.filter(d => d.status === 'approved').length;
    const totalPosts = blogPosts.length;
    const publishedPosts = blogPosts.filter(p => p.status === 'online').length;
    const totalRevenue = payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const monthlyRevenue = payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        const now = new Date();
        return (
          p.status === 'Completed' &&
          paymentDate.getMonth() === now.getMonth() &&
          paymentDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers,
      activeUsers,
      totalMissions,
      activeMissions,
      totalDocuments,
      approuvedDocs,
      totalPosts,
      publishedPosts,
      totalRevenue,
      monthlyRevenue,
    };
  }, [users, missions, documents, blogPosts, payments]);

  const recentActivity = useMemo(() => {
    const allActivities = [
      ...payments.map(p => ({
        type: 'payment',
        date: new Date(p.date), // Ensure this is a Date object
        title: `New payment of $${p.amount}`,
        status: p.status,
        icon: DollarSign,
      })),
      ...missions.map(m => ({
        type: 'mission',
        date: new Date(m.created_at), // Convert to Date object
        title: m.mission_title,
        status: m.status,
        icon: Target,
      })),
      ...documents.map(d => ({
        type: 'document',
        date: new Date(d.created_at), // Convert to Date object
        status: d.status,
        title: '',
        icon: FileText,
      })),
      ...blogPosts.map(p => ({
        type: 'post',
        date: new Date(p.created_at), // Convert to Date object
        title: p.title,
        status: p.status,
        icon: PenTool,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by date
      .slice(0, 5); // Limit to 5 items
  
    return allActivities;
  }, [payments, missions, documents, blogPosts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Published':
      case 'Online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Pending':
      case 'In Review':
      case 'Under Review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Failed':
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
          Welcome to your admin dashboard. Here's an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">Total Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalUsers}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-5 w-5" />
                      <span className="sr-only">Increased by</span>
                      {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className=" px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-primary hover:text-primary-dark">
                View all users
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">Active Missions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeMissions}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-5 w-5" />
                      <span className="sr-only">Increased by</span>
                      {Math.round((stats.activeMissions / stats.totalMissions) * 100)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/missions" className="font-medium text-primary hover:text-primary-dark">
                View all missions
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">Monthly Revenue</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ${stats.monthlyRevenue.toFixed(2)}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="self-center flex-shrink-0 h-5 w-5" />
                      <span className="sr-only">Increased by</span>
                      {Math.round((stats.monthlyRevenue / stats.totalRevenue) * 100)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className=" px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/payments" className="font-medium text-primary hover:text-primary-dark">
                View all payments
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PenTool className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">Published Posts</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.publishedPosts}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-5 w-5" />
                      <span className="sr-only">Increased by</span>
                      {Math.round((stats.publishedPosts / stats.totalPosts) * 100)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/blog" className="font-medium text-primary hover:text-primary-dark">
                View all posts
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-200">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <li key={index}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-primary mr-3" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                            {activity.title}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          {getStatusIcon(activity.status)}
                          <p className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            {format(activity.date, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}