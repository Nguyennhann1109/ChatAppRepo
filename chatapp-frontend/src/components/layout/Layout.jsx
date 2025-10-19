import { Badge, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import {
    HiBell,
    HiChat,
    HiCog,
    HiLogout,
    HiMenu,
    HiMoon,
    HiPlus,
    HiSun,
    HiUserGroup,
    HiUsers,
    HiX
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';

const ModernLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.userId) {
        try {
          const response = await notificationApi.getUnreadNotifications(user.userId);
          setUnreadCount(response.data?.length || 0);
        } catch (error) {
          console.error('Lỗi load thông báo:', error);
        }
      }
    };
    loadUnreadCount();
    // Reload every 60 seconds (tăng từ 30s lên 60s để giảm tải)
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user?.userId]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarItems = [
    { id: 'chats', label: 'Tin nhắn', icon: HiChat, badge: null },
    { id: 'friends', label: 'Bạn bè', icon: HiUsers, badge: null },
    { id: 'notifications', label: 'Thông báo', icon: HiBell, badge: unreadCount > 0 ? unreadCount : null },
  ];

  const navigate = useNavigate();

  const handleNavClick = (id) => {
    setActiveTab(id);
    // navigate to routes when available
    const routeMap = {
      chats: '/chat',
      friends: '/friends',
      notifications: '/notifications',
    };
    const to = routeMap[id] || '/chat';
    navigate(to);
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <HiChat className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ChatApp</h1>
            </div>
            <Button
              size="sm"
              color="gray"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <HiX className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200
                    ${activeTab === item.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <Badge color="failure" size="sm">{unreadCount}</Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700 space-y-2">
            <Button
              size="sm"
              color="gray"
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleDarkMode}
            >
              {darkMode ? <HiSun className="w-4 h-4 mr-2" /> : <HiMoon className="w-4 h-4 mr-2" />}
              {darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            </Button>
            <Button
              size="sm"
              color="failure"
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <HiLogout className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="gray"
                variant="ghost"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <HiMenu className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {activeTab}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {/* Nút New Chat đã chuyển vào ConversationList */}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
