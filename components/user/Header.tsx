'use client';
// React and Clerk imports
import React, { useState } from 'react';
import { SignedIn, SignedOut, SignIn, SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from '../Logo';
import { LogOutIcon, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CustomModal from "@/components/HeroModal";
import { Button } from '../ui/button';


export function Header() {
    const { user, logout } = useAuth();
    const { signOut } = useClerk();
    const [open, setOpen] = useState(false); // For SignIn modal
    const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile menu toggle

    const firstName = user?.username || "there";

    const menuItems = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'About', href: '/about' },
        { label: 'Review', href: '/feedback' },
        

    ];

    /***** end clerk */

    return (
        <header id="header" className="w-full z-9 absolute top-0 left-0 flex items-center justify-between px-8 py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
                <Logo className="fl-h-8/14 " />
            </Link>

            {/* Desktop Menu */}
            <nav
                className="hidden sm:flex gap-8"
                aria-label="Menu"
            >
                {menuItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="text-gray-700 hover:text-amber-700 transition text-lg"
                    >
                        {item.label}
                    </a>
                ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
                {/* normal */}
                {/* {user ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className='cursor-pointer'>Hi,&nbsp;{user.username}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Link
                                            href="/account"
                                            title="View Account"
                                        >
                                            View Account
                                        </Link>

                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem variant="destructive" onClick={logout}>
                                        <LogOutIcon />
                                        Sign Out

                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link
                            href="/cart"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 hover:brightness-110"
                        >
                            <ShoppingCart size={20} strokeWidth={2} />
                        </Link>

                    </>
                ) : (
                    <Link
                        href="/signin"
                        className="hidden sm:inline-flex button-cutout group items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom gap-3 px-1 text-lg fl-py-2.5/3 from-brand-blue to-brand-lime text-black mr-4"
                    >
                        Login
                    </Link>

                )} */}

                {/*  clerkjs */}
                <div className="hidden sm:flex items-center gap-2">
                    <SignedIn>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className='cursor-pointer text-lg'>Hi,&nbsp;{firstName}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Link href="/account">View Account</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/account/order">My Orders</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem variant="destructive" onClick={async () => { await signOut(); logout(); }}>
                                        <LogOutIcon /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/cart" className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:scale-110">
                            <ShoppingCart size={20} strokeWidth={2} />
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <Link
                            href="/sign-in"
                            className="hidden sm:inline-flex button-cutout group items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom gap-3 px-1 text-lg fl-py-2.5/3 from-brand-blue to-brand-lime text-black mr-4"
                        >
                            Login
                        </Link>
                    </SignedOut>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="sm:hidden flex items-center gap-2">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative w-8 h-8 flex flex-col justify-center gap-1.5"
                        aria-label="Toggle menu"
                    >
                        <span className={`block h-1 w-7 bg-brand-purple transition ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                        <span className={`block h-1 w-7 bg-brand-purple transition ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block h-1 w-7 bg-brand-purple transition ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-0 p-4 z-20">
                    {/* 用户信息 */}
                    <SignedIn>
                        <div className="flex flex-col gap-1 pb-2 border-b border-gray-200">
                            <span className="text-gray-700 mb-2 font-semibold text-lg">Hi, {firstName}</span>
                            <Link
                                href="/account/order"
                                className="text-gray-700 hover:text-amber-700 text-base"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                My Orders
                            </Link>
                            <Link
                                href="/cart"
                                className="flex items-center gap-2 text-gray-700 hover:text-amber-700 text-base py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <ShoppingCart size={18} /> Cart
                            </Link>
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <button
                            onClick={() => {
                                setOpen(true);       // 打开登录 modal
                                setIsMenuOpen(false); // 关闭 mobile menu
                            }}
                            className="text-lg text-brand-blue py-2 border-b border-gray-200 text-left"
                        >
                            Login
                        </button>
                    </SignedOut>

                    {/* 导航菜单 */}
                    <div className="flex flex-col gap-1 py-2 border-b border-gray-200">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-gray-700 hover:text-amber-700 text-base py-2"
                                onClick={() => setIsMenuOpen(false)} // 点击关闭菜单
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* 购物车 & 登出 */}
                    <SignedIn>
                        <div className="flex flex-col gap-1 pt-2">

                            <button
                                className="flex items-center gap-2 text-red-600 text-base py-2"
                                onClick={async () => {
                                    await signOut();
                                    logout();
                                    setIsMenuOpen(false); // 退出后也关闭菜单
                                }}
                            >
                                <LogOutIcon /> Sign Out
                            </button>
                        </div>
                    </SignedIn>
                </div>
            )}

            {/* SignIn Modal */}
            <CustomModal open={open} onClose={() => setOpen(false)} showCloseButton>
                <SignIn appearance={{ elements: { rootBox: "mx-auto", card: "shadow-2xl" } }} />
            </CustomModal>
        </header>
    );
};

