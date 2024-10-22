"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { useEffect } from 'react';

const Header = () => {
    const currentPath = usePathname();
  useEffect(() => {
    console.log("Current Path:", currentPath);
  }, [currentPath]);

  return (
    <div className="navbar justify-center">
      <div className="flex w-[50%] justify-center">
        <ul className="menu text-4xl menu-horizontal space-x-12 p-8">
          <li>
            <Link href="/" className={`focus:bg-indigo-950 focus:text-white rounded-2xl p-4 ${currentPath === '/' ? 'bg-indigo-950' : ''}`}>
                Accueil
            </Link>
          </li>
          <li>
            <Link href="/player" className={`focus:bg-indigo-950 focus:text-white rounded-2xl p-4 ${currentPath === '/player' ? 'bg-indigo-950' : ''}`}>
                Player
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;