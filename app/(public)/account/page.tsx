"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { FaUser, FaBox, FaPencil, FaCheck } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { TbAddressBook } from "react-icons/tb";
import { useAuth } from '@/contexts/auth-context';
import { getUserOrdersApi, saveAddressApi } from "@/api/auth";
import { ChevronDown } from "lucide-react"
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type OrderItemData = {
  order_item_id: number;
  product: {
    id: number;
    name: string;
  } | null;
  quantity: number;
  unit_price: string;
};

type OrderData = {
  order_id: number;
  total_price: string;
  order_status: string;
  created_at: string;
  items: OrderItemData[];
};


export default function AccountPage() {
  const { user, loginUserFromData } = useAuth();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false)
  const [address, setAddress] = useState(user?.address || "")
  const handleSave = async () => {
    if (!user) return;

    try {
      const res: any = await saveAddressApi(user.clerk_id, address);

      if (res.code === 200) {
        // 更新 context user
        const updatedUser = { ...user, address };
        loginUserFromData(updatedUser);

        // 更新 localStorage
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));

        setIsEditing(false);

        // 成功提示
        toast.success("Address updated successfully!");
      } else {
        // 后端返回非 200
        console.error("Failed to save address:", res.message);
        toast.error(res.message || "Failed to save address.");
      }
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error("Failed to save address. Please try again.");
    }
  };

  const handleCancel = () => {
    setAddress(user?.address || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const userid = JSON.parse(localStorage.getItem('userInfo') || '{}').id;

          const res: any = await getUserOrdersApi(userid);
          if (res.code === 200) {
            setOrders(res.data || []);
          } else {
            console.error("Failed:", res.data.message);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-texture bg-brand-gray flex items-center justify-center">
        <Bounded className="text-center">
          <Heading className="mb-6" as="h1">
            Loading...
          </Heading>
        </Bounded>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-texture py-12">
      <Bounded>
        {/* Profile Header */}
        <div className="max-w-5xl mx-auto">
          <Collapsible className="m-6">
            <div className="bg-white rounded-lg  p-4 md:p-8">

              {/* Trigger 区域 = 原来的 Header */}
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-4 md:gap-6 mb-6 cursor-pointer">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-navy rounded-full flex items-center justify-center text-white text-xl md:text-2xl flex-shrink-0">
                    <FaUser />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Heading
                      className="mb-2 text-xl md:text-2xl lg:text-3xl flex items-center"
                      as="h1"
                    >
                      {user.username || "Welcome"}
                      <ChevronDown
                        className="pl-4 h-10 w-10 text-gray-500 transition-transform duration-300 data-[state=open]:rotate-180"
                      />
                    </Heading>

                    <p className="text-gray-600 text-sm md:text-base break-all">
                      {user.address || "No address set"}
                    </p>
                  </div>

                </div>
              </CollapsibleTrigger>

              {/* Content 区域 = 原来的下面部分 */}
              <CollapsibleContent className="space-y-6">

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-gray rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Username</p>
                    <p className="font-semibold">{user.username || "Not set"}</p>
                    {!user.username && (
                      <p className="text-xs text-gray-500 mt-1">
                        Click "Edit Profile" to set a username
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-brand-gray rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="font-semibold">
                      {new Date(user.created_at!).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <Link
                    href="/account/profile"
                    className="button-cutout group inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom gap-2 md:gap-3 px-1 text-sm md:text-lg py-2 md:~py-2.5/3 from-brand-navy to-brand-lime text-white"
                  >
                    <div className="flex size-5 md:size-6 items-center justify-center transition-transform group-hover:-rotate-[25deg] [&>svg]:h-full [&>svg]:w-full">
                      <FaPencil />
                    </div>
                    <div className="w-px self-stretch bg-white/25" />
                    <span className="truncate">Edit Profile & Username</span>
                  </Link>
                </div>

              </CollapsibleContent>

            </div>
          </Collapsible>


          {/* Edit Address */}
          <div className="bg-white rounded-lg p-4 md:p-8 m-6">

            <h2 className="text-lg md:text-xl font-semibold mb-6">
              Shipping Address
            </h2>

            <div className="p-4 bg-brand-gray rounded-lg mb-6">

              {!isEditing ? (
                user?.address ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {address}
                  </p>
                ) : (
                  <p className="text-gray-500">
                    No address added yet.
                  </p>
                )
              ) : (
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  placeholder="Enter your shipping address..."
                />
              )}

            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="button-cutout group inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom gap-2 px-2 py-2 text-sm md:text-base from-brand-navy to-brand-lime text-white"
              >
                <FaPencil />
                <span>Edit Address</span>
              </button>
            ) : (
              <div className="flex gap-20">
                <button
                  onClick={handleSave}
                  className="button-cutout group inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom gap-2 px-2 py-2 text-sm md:text-base from-brand-navy to-brand-blue text-white"
                >
                  <FaCheck />
                  Save
                </button>

                <button
                  onClick={handleCancel}
                  className="button-cutout group inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom gap-2 px-2 py-2 text-sm md:text-base from-brand-navy to-brand-orange text-white"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            )}

          </div>
        </div>
      </Bounded>
    </div>
  );
}
