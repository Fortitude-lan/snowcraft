"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getOrderListApi, updateOrderStatusApi } from "@/api/auth";

type OrderItem = {
  order_item_id: number;
  product: {
    id: number;
    name: string;
    asset_code?: string;
    is_double_sided?: boolean;
  };
  quantity: number;
  unit_price: string;
  design?: {
    id: number;
    p_size?: string;
    p_finish?: string;
    p_flex?: string;
    p_textures?: string[];
  };
};

type Order = {
  order_id: number;
  order_number: string;
  total_price: string;
  order_status: string;
  created_at: string;
  items: OrderItem[];
  address: string;
  email: string;
};

const PAGE_SIZE = 10;

const OrderListPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await getOrderListApi({
        page,
        page_size: PAGE_SIZE,
        params: {}, // 可传 {user_id: xxx, status: "Pending"} 筛选
      });
      if (res?.code === 200) {
        setOrders(res.data.list || res.data || []);
        setTotal(res.data.total || res.data?.length || 0);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleStatusChange = async (orderId: number, orderNumber: string, newStatus: string) => {
    try {
      const res: any = await updateOrderStatusApi(orderId, newStatus);
      if (res?.code === 200) {
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === orderId ? { ...o, order_status: newStatus } : o
          )
        );
        toast.success(`OrderID: ${orderNumber}  ->  ${newStatus}`);
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const statusOptions = ["Pending", "Confirmed", "Shipped", "Completed"];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>

      {loading && <div>Loading...</div>}

      <div className="flex-1 overflow-auto">
        <Table className="w-full h-full">
          <TableCaption>Order list (Total {total})</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total (£)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Items</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.order_id}>
                <TableCell className="font-medium">{o.order_number}</TableCell>
                <TableCell>{o.address || "N/A"}</TableCell>
                <TableCell>{o.email || "N/A"}</TableCell>
                <TableCell>{o.total_price}</TableCell>
                <TableCell>
                  <NativeSelect
                    value={o.order_status}
                    onChange={(e) => handleStatusChange(o.order_id, o.order_number, e.target.value)}
                    className={`font-semibold ${o.order_status === "Pending"
                        ? "text-yellow-500"
                        : o.order_status === "Confirmed"
                          ? "text-blue-500"
                          : o.order_status === "Shipped"
                            ? "text-purple-500"
                            : o.order_status === "Completed"
                              ? "text-green-500"
                              : "text-gray-500"
                      }`}
                  >
                    {statusOptions.map((status) => (
                      <NativeSelectOption key={status} value={status}>
                        {status}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </TableCell>
                <TableCell>
                  {new Date(o.created_at).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {o.items.map((i) => (
                    <div key={i.order_item_id} className="mb-1 text-sm">
                      <strong>{i.product?.name}</strong> × {i.quantity} (£{i.unit_price})<br />
                      {i.design && (
                        <span className="text-xs text-gray-500">
                          Size {i.design.p_size || "-"} • {i.design.p_finish || "-"} • {i.design.p_flex || "-"}
                        </span>
                      )}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}

            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No orders
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {totalPages > 1 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};

export default OrderListPage;