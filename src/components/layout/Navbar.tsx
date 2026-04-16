import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Bell, MessageCircle, User, LogOut, Building2, CircleDollarSign, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/users';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { login } = useAuth();
  const handleFastSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    if (!targetId) return;
    const targetUser = users.find(u => u.id === targetId);
    if (targetUser) {
      try {
        await login(targetUser.email, 'password', targetUser.role);
        navigate(targetUser.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  // User dashboard route based on role
  const dashboardRoute = user?.role === 'entrepreneur' 
    ? '/dashboard/entrepreneur' 
    : '/dashboard/investor';
  
  // User profile route based on role and ID
  const profileRoute = user 
    ? `/profile/${user.role}/${user.id}` 
    : '/login';
  
  const navLinks = [
    {
      icon: user?.role === 'entrepreneur' ? <Building2 size={18} /> : <CircleDollarSign size={18} />,
      text: 'Dashboard',
      path: dashboardRoute,
    },
    {
      icon: <Calendar size={18} />,
      text: 'Meetings',
      path: user ? '/meetings' : '/login',
    },
    {
      icon: <MessageCircle size={18} />,
      text: 'Messages',
      path: user ? '/messages' : '/login',
    },
    {
      icon: <Bell size={18} />,
      text: 'Notifications',
      path: user ? '/notifications' : '/login',
    },
    {
      icon: <Wallet size={18} />,
      text: 'Payments',
      path: user ? '/payments' : '/login',
    },
    {
      icon: <User size={18} />,
      text: 'Profile',
      path: profileRoute,
    }
  ];
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-600/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Business Nexus</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {user ? (
              <div className="flex items-center space-x-1 lg:space-x-2">
                <div className="flex items-center space-x-0.5 lg:space-x-1 border-r border-gray-100 pr-2 mr-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      title={link.text}
                      className="inline-flex items-center px-2 lg:px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    >
                      <span className="flex-shrink-0">{link.icon}</span>
                      <span className="ml-2 hidden xl:block whitespace-nowrap">{link.text}</span>
                    </Link>
                  ))}
                </div>
                
                {/* QUICK SWITCHER */}
                <div className="hidden lg:block relative group">
                  <select
                    value=""
                    onChange={handleFastSwitch}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 pr-6 text-[10px] xl:text-[11px] font-semibold text-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all cursor-pointer w-[110px] xl:w-[150px] truncate shadow-sm"
                  >
                    <option value="" disabled>Switch...</option>
                    {user?.role === 'entrepreneur' && (
                      <optgroup label="Entrepreneurs">
                        {users.filter(u => u.role === 'entrepreneur').map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </optgroup>
                    )}
                    {user?.role === 'investor' && (
                      <optgroup label="Investors">
                        {users.filter(u => u.role === 'investor').map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>

                <div className="flex items-center space-x-0.5 xl:space-x-1 ml-1 xl:ml-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-error-600 hover:bg-error-50 px-1.5 xl:px-2"
                  >
                    <LogOut size={16} className="2xl:mr-2" />
                    <span className="hidden 2xl:block text-xs">Logout</span>
                  </Button>
                  
                  <Link to={profileRoute} className="avatar-menu flex items-center space-x-2 pl-1.5 xl:pl-2 border-l border-gray-100 ml-0.5 xl:ml-1 flex-shrink-0">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        size="sm"
                        status={user.isOnline ? 'online' : 'offline'}
                      />
                    </div>
                    <div className="hidden 2xl:block text-left flex-shrink-0">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] font-medium text-gray-500 capitalize leading-tight">{user.role}</p>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none transition-colors"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status={user.isOnline ? 'online' : 'offline'}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {/* MOBILE QUICK SWITCHER */}
                <div className="px-3 py-2">
                  <div className="relative group">
                    <select
                      value=""
                      onChange={(e) => {
                        handleFastSwitch(e);
                        setIsMenuOpen(false);
                      }}
                      className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="" disabled>Switch Account...</option>
                      {user?.role === 'entrepreneur' && (
                        <optgroup label="Entrepreneurs">
                          {users.filter(u => u.role === 'entrepreneur').map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </optgroup>
                      )}
                      {user?.role === 'investor' && (
                        <optgroup label="Investors">
                          {users.filter(u => u.role === 'investor').map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.text}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link 
                  to="/login" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>Log in</Button>
                </Link>
                <Link 
                  to="/register" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};