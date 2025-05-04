
'use client'; // Add this directive because we use useRouter/usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Use usePathname for App Router
import { Home, BookOpen, Users, Brain, User } from 'lucide-react'; // Example icons

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/guia', label: 'Guia', icon: BookOpen },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/conhecimento', label: 'Conhecimento', icon: Brain },
  { href: '/perfil', label: 'Perfil', icon: User },
];

const BottomNav = () => {
  const pathname = usePathname(); // Get current pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-50">
      {navItems.map((item) => {
        // Check if the current path starts with the item's href
        // Special case for home ('/') to avoid matching everything
        const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link href={item.href} key={item.label} className="flex flex-col items-center justify-center text-center px-2">
            <Icon
              className={`h-6 w-6 mb-1 ${isActive ? 'text-primary dark:text-secondary' : 'text-neutral dark:text-gray-400'}`}
              strokeWidth={isActive ? 2 : 1.5} // Make active icon slightly bolder
            />
            <span
              className={`text-xs ${isActive ? 'text-primary dark:text-secondary font-medium' : 'text-neutral dark:text-gray-400'}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;

