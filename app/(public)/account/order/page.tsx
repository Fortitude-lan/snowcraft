"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { FaUser, FaBox, FaPencil, FaArrowLeft } from "react-icons/fa6";
import { useAuth } from '@/contexts/auth-context';
import { getUserOrdersApi } from "@/api/auth";
import { ChevronDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { OrderConvas } from "./OrderCanvas";
import { X } from "lucide-react";
type OrderItemData = {
    order_item_id: number;
    product: {
        id: number;
        name: string;
        asset_code?: string;
        is_double_sided?: boolean;
    } | null;
    quantity: number;
    unit_price: string;
    design_id: {
        id: number;
    };
    design?: {
        p_size?: string;
        p_finish?: string;
        p_flex?: string;
        p_textures?: string;
    };
    p_finish?: string;
};

type OrderData = {
    order_id: number;
    order_number: string;
    total_price: string;
    order_status: string;
    created_at: string;
    items: OrderItemData[];
};


export default function AccountPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedItem, setSelectedItem] = useState<OrderItemData | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                try {
                    const userid = JSON.parse(localStorage.getItem('userInfo') || '{}').id;

                    const res:any = await getUserOrdersApi(userid);
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
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "Confirmed":
                return "bg-blue-100 text-blue-700 border-blue-300";
            case "Shipped":
                return "bg-purple-100 text-purple-700 border-purple-300";
            case "Completed":
                return "bg-green-100 text-green-700 border-green-300";
            default:
                return "bg-gray-100 text-gray-600 border-gray-300";
        }
    };
    return (
        <div className="min-h-screen bg-texture py-12">
            <Bounded>
                <div className="max-w-5xl mx-auto">
                    {/* Order History */}
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <FaBox className="text-brand-blue text-xl md:text-2xl" />
                            <Heading className="text-xl md:text-2xl" as="h2">
                                Order History
                            </Heading>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">No orders yet</p>
                                <Link
                                    href="/products"
                                    className="button-cutout inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom px-4 text-lg fl-py-2.5/3 from-brand-blue to-brand-lime text-black"
                                >
                                    Build Your First  Snowboard
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Collapsible key={order.order_id} className="border-b pb-4">

                                        {/* Trigger */}
                                        <CollapsibleTrigger asChild>
                                            <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 px-4 py-4 rounded transition-colors">

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-base md:text-lg font-mono break-all">
                                                        #{order.order_number} <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusStyle(
                                                            order.order_status
                                                        )}`}
                                                        >{order.order_status}</span>
                                                    </p>

                                                    <p className="text-xs md:text-sm text-gray-600">
                                                        {new Date(order.created_at).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-bold text-base md:text-lg text-green-600">
                                                            £{order.total_price}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Paid via PayPal</p>
                                                    </div>

                                                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform group-data-[state=open]:rotate-180" />
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>

                                        {/* Content */}
                                        <CollapsibleContent className="px-4 pt-2">
                                            <div className="grid gap-3 mt-2">
                                                {order.items.map((item, idx) => (
                                                    <div
                                                        key={item.order_item_id}
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setDrawerOpen(true);
                                                        }}
                                                        className="flex gap-4 items-center border rounded p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                                                    >
                                                        <div className="flex-grow min-w-0">
                                                            <p className="font-semibold text-sm">
                                                                {item.product?.name || "Custom snowboard"}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {item.design
                                                                    ? `Size ${item.design.p_size || "-"} • ${item.design.p_finish || "-"} • ${item.design.p_flex || "-"}`
                                                                    : "Custom design details not available"}
                                                            </p>
                                                        </div>

                                                        <div className="text-right min-w-[80px]">
                                                            <p className="text-sm">× {item.quantity}</p>
                                                            <p className="text-sm font-semibold">
                                                                £{(Number(item.unit_price) * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        )}
                    </div>

                    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right" dismissible={false}>

                        <DrawerContent className="sm:w-[60vw] w-full p-6">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded hover:bg-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {selectedItem && (
                                <>
                                    <DrawerHeader>
                                        <DrawerTitle>
                                            {/* {selectedItem.product?.name || "Custom Snowboard"} */}
                                        </DrawerTitle>
                                        {/* <DrawerDescription>
                                        </DrawerDescription> */}

                                    </DrawerHeader>

                                    <div className="mt-4 space-y-6">
                                        {/* 第一行：订单概要 */}
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="font-semibold text-sm">
                                                {selectedItem.product?.name || "Custom Snowboard"}
                                            </span>
                                            <span className="text-sm">
                                                {selectedItem.quantity} × £{selectedItem.unit_price} ={" "}
                                                <span className="font-bold text-green-600">

                                                    £{(Number(selectedItem.unit_price) * selectedItem.quantity).toFixed(2)}
                                                </span>
                                            </span>
                                        </div>

                                        {/* 第二行：3D Canvas 渲染定制效果 */}
                                        <div className="w-full h-64">
                                            {/* 这里替换成你的 Canvas 组件，比如 R3F */}
                                            <OrderConvas
                                                assetCode={selectedItem?.product?.asset_code || ""}
                                                finish={selectedItem?.p_finish || ""}
                                                textureUrl={selectedItem?.design?.p_textures || ""}
                                                isDoubleSided={selectedItem.product?.is_double_sided}
                                                orbitControls={true}
                                                className="h-full w-full"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                        </DrawerContent>
                    </Drawer>

                </div>
            </Bounded >
        </div >
    );
}
