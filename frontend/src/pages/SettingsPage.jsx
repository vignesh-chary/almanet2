import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, Bell, Shield, User, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
    const { data: user } = useQuery({ queryKey: ['authUser'] });
    const { isDarkMode, toggleTheme } = useTheme();

    const settingsSections = [
        {
            title: 'Theme',
            description: 'Customize your viewing experience',
            icon: isDarkMode ? Moon : Sun,
            action: (
                <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isDarkMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            )
        },
        {
            title: 'Notifications',
            description: 'Manage your notification preferences',
            icon: Bell,
            action: (
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                    Configure
                </button>
            )
        },
        {
            title: 'Privacy',
            description: 'Control your profile visibility and data',
            icon: Shield,
            action: (
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                    Manage
                </button>
            )
        },
        {
            title: 'Account',
            description: 'Update your account information',
            icon: User,
            action: (
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                    Edit
                </button>
            )
        },
        {
            title: 'Accessibility',
            description: 'Customize your accessibility preferences',
            icon: Eye,
            action: (
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                    Customize
                </button>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-1">
                <Sidebar user={user} />
            </div>
            <div className="col-span-1 lg:col-span-3">
                <div className="bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark p-6">
                    <h1 className="text-2xl font-bold text-text dark:text-text-dark mb-8">Settings</h1>

                    <div className="space-y-4">
                        {settingsSections.map((section, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-5 rounded-lg bg-secondary dark:bg-secondary-dark hover:bg-accent/5 dark:hover:bg-accent-dark/5 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 rounded-lg bg-accent/10 dark:bg-accent-dark/10">
                                        <section.icon className="text-text dark:text-text-dark" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-text dark:text-text-dark">{section.title}</h3>
                                        <p className="text-sm text-text-muted dark:text-text-dark-muted">{section.description}</p>
                                    </div>
                                </div>
                                {section.action}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;