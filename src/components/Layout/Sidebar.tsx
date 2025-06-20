import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  Users, 
  FileText, 
  Bell, 
  MessageSquare, 
  CreditCard, 
  FileBarChart,
  ChevronDown,
  ChevronRight,
  Building
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState({
    members: false,
    maintenance: false,
    notices: false,
    complaints: false,
  });

  const isAdmin = user?.role === 'admin';

  const toggleMenu = (menu: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center text-sm py-3 px-4 rounded-md transition-colors ${
      isActive 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const navGroupClass = (isExpanded: boolean) =>
    `flex items-center justify-between text-sm py-3 px-4 rounded-md transition-colors ${
      isExpanded
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Building className="h-8 w-8 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">SocietyMS</h2>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        <NavLink to="/dashboard" className={navLinkClass}>
          <HomeIcon className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>

        {/* Members Section */}
        <div>
          <button 
            className={navGroupClass(expanded.members)}
            onClick={() => toggleMenu('members')}
          >
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-3" />
              Members
            </span>
            {expanded.members ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {expanded.members && (
            <div className="ml-7 mt-1 space-y-1">
              <NavLink to="/members" className={navLinkClass}>
                All Members
              </NavLink>
              {isAdmin && (
                <NavLink to="/members/add" className={navLinkClass}>
                  Add Member
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Maintenance Section */}
        <div>
          <button 
            className={navGroupClass(expanded.maintenance)}
            onClick={() => toggleMenu('maintenance')}
          >
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-3" />
              Maintenance
            </span>
            {expanded.maintenance ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {expanded.maintenance && (
            <div className="ml-7 mt-1 space-y-1">
              <NavLink to="/maintenance/bills" className={navLinkClass}>
                View Bills
              </NavLink>
              {isAdmin && (
                <NavLink to="/maintenance/generate" className={navLinkClass}>
                  Generate Bills
                </NavLink>
              )}
              <NavLink to="/maintenance/payments" className={navLinkClass}>
                Payments
              </NavLink>
            </div>
          )}
        </div>

        {/* Notices Section */}
        <div>
          <button 
            className={navGroupClass(expanded.notices)}
            onClick={() => toggleMenu('notices')}
          >
            <span className="flex items-center">
              <Bell className="h-5 w-5 mr-3" />
              Notices
            </span>
            {expanded.notices ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {expanded.notices && (
            <div className="ml-7 mt-1 space-y-1">
              <NavLink to="/notices" className={navLinkClass}>
                View Notices
              </NavLink>
              {isAdmin && (
                <NavLink to="/notices/create" className={navLinkClass}>
                  Create Notice
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Complaints Section */}
        <div>
          <button 
            className={navGroupClass(expanded.complaints)}
            onClick={() => toggleMenu('complaints')}
          >
            <span className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-3" />
              Complaints
            </span>
            {expanded.complaints ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {expanded.complaints && (
            <div className="ml-7 mt-1 space-y-1">
              <NavLink to="/complaints" className={navLinkClass}>
                {isAdmin ? 'All Complaints' : 'My Complaints'}
              </NavLink>
              {!isAdmin && (
                <NavLink to="/complaints/create" className={navLinkClass}>
                  Submit Complaint
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Payment */}
        <NavLink to="/payment" className={navLinkClass}>
          <CreditCard className="h-5 w-5 mr-3" />
          Make Payment
        </NavLink>

        {/* Reports */}
        {isAdmin && (
          <NavLink to="/reports" className={navLinkClass}>
            <FileBarChart className="h-5 w-5 mr-3" />
            Reports
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;