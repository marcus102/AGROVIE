import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Target,
  FileText,
  PenTool,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Calendar,
  Zap,
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { format } from "date-fns";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function Dashboard() {
  const { users, missions, documents, blogPosts, payments } = useAdminStore();

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const totalMissions = missions.length;
    const activeMissions = missions.filter((m) => m.status === "online").length;
    const totalDocuments = documents.length;
    const approuvedDocs = documents.filter(
      (d) => d.status === "approved"
    ).length;
    const totalPosts = blogPosts.length;
    const publishedPosts = blogPosts.filter(
      (p) => p.status === "online"
    ).length;
    const totalRevenue = payments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);
    const monthlyRevenue = payments
      .filter((p) => {
        const paymentDate = new Date(p.date);
        const now = new Date();
        return (
          p.status === "Completed" &&
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
      ...payments.map((p) => ({
        type: "payment",
        date: new Date(p.date),
        title: `New payment of $${p.amount}`,
        status: p.status,
        icon: DollarSign,
      })),
      ...missions.map((m) => ({
        type: "mission",
        date: new Date(m.created_at),
        title: m.mission_title,
        status: m.status,
        icon: Target,
      })),
      ...documents.map((d) => ({
        type: "document",
        date: new Date(d.created_at),
        status: d.status,
        title: `Document ${d.identification_type}`,
        icon: FileText,
      })),
      ...blogPosts.map((p) => ({
        type: "post",
        date: new Date(p.created_at),
        title: p.title,
        status: p.status,
        icon: PenTool,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);

    return allActivities;
  }, [payments, missions, documents, blogPosts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
      case "Published":
      case "online":
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending":
      case "In Review":
      case "Under Review":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Failed":
      case "Rejected":
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: Math.round((stats.activeUsers / stats.totalUsers) * 100),
      icon: Users,
      color: "from-blue-500 to-blue-600",
      link: "/admin/users",
    },
    {
      title: "Active Missions",
      value: stats.activeMissions,
      change: Math.round((stats.activeMissions / stats.totalMissions) * 100),
      icon: Target,
      color: "from-green-500 to-green-600",
      link: "/admin/missions",
    },
    {
      title: "Monthly Revenue",
      value: `XOF ${stats.monthlyRevenue.toFixed(2)}`,
      change: Math.round((stats.monthlyRevenue / stats.totalRevenue) * 100),
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      link: "/admin/payments",
    },
    {
      title: "Published Posts",
      value: stats.publishedPosts,
      change: Math.round((stats.publishedPosts / stats.totalPosts) * 100),
      icon: PenTool,
      color: "from-orange-500 to-orange-600",
      link: "/admin/blog",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Welcome back! Here's what's happening with your platform today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  System Healthy
                </span>
              </div>
              <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {format(new Date(), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`${stat.title}-${index}`}
                variants={fadeIn}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative bg-white dark:bg-gray-900 overflow-hidden shadow-xl rounded-3xl border border-gray-100 dark:border-gray-800 transition-all duration-300"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>

                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {stat.change}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      to={stat.link}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 flex items-center group"
                    >
                      View Details
                      <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Stats
                </h3>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Active Users
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Last 30 days
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {stats.activeUsers}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Approved Docs
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total approved
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {stats.approuvedDocs}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500 rounded-xl">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Total Revenue
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        All time
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    ${stats.totalRevenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <Zap className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(activity.date, "MMM dd, HH:mm")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                          {activity.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
