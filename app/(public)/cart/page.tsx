'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Bounded } from "@/components/Bounded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { getUserCartApi, updateCartQuantityApi, deleteCartApi, addOrderApi } from "@/api/auth";
import { debounce } from "lodash";
import { CartConvas } from "./CartCanvas";

interface Customisation {
  id: number;
  p_size: string;
  p_finish: string;
  p_flex: string;
  p_textures: string;
}

interface CartItem {
  cart_item_id: number;
  design: Customisation;
  product: {
    id: number;
    asset_code: string;
    is_double_sided: boolean;
  };
  quantity: number;
  unit_price: string;
  created_at: string;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const userIdRef = useRef<number | null>(null);
  const [selectedTotal, setSelectedTotal] = useState('0.00');
  useEffect(() => {
    const total = cart
      .filter(item => selectedItems.includes(item.cart_item_id))
      .reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0)
      .toFixed(2);
    setSelectedTotal(total);
    console.log(total)
  }, [cart, selectedItems]);

  const fetchCart = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userInfo") || '{}').id;
      userIdRef.current = userId;
      const res: any = await getUserCartApi(userId);
      if (res.code === 200) {
        setCart(res.data);
        setSelectedItems([]);
      }
    } catch (error) {
      toast.error("Failed to load cart");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const debouncedUpdate = useCallback(
    debounce(async (id: number, quantity: number) => {
      try {
        await updateCartQuantityApi(id, quantity);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update quantity");
        fetchCart();
      }
    }, 500),
    []
  );

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev =>
      prev.map(item => (item.cart_item_id === id ? { ...item, quantity } : item))
    );
    debouncedUpdate(id, quantity);
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.cart_item_id));
    }
  };

  const removeItems = async (ids: number[]) => {
    if (ids.length === 0) return;
    try {
      await deleteCartApi(ids);
      // toast.success("Item(s) removed");
      fetchCart();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const checkoutSelected = async () => {
    if (selectedItems.length === 0) return;

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo?.id;
    const userAddress = userInfo?.address?.trim() || "";
    const userEmail = userInfo?.email || "";

    if (!userAddress) {
      toast.error("Please add your shipping address in your profile before placing an order.");
      return;
    }

    try {
      // 1️⃣ 找到选中的购物车商品
      const itemsToOrder = cart.filter(item =>
        selectedItems.includes(item.cart_item_id)
      );

      // 2️⃣ 计算总价
      const totalPrice = itemsToOrder.reduce(
        (sum, item) =>
          sum + parseFloat(item.unit_price) * item.quantity,
        0
      );

      // 3️⃣ 构建订单列表
      const orderList = itemsToOrder.map(item => ({
        design_id: item.design.id,
        product_id: item.product?.id, // 关键
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
      }));
      // console.log({
      //   user_id: userId,
      //   total_price: totalPrice,
      //   order_status: "Pending",
      //   address: userAddress,
      //   email: userEmail,
      //   list: orderList,
      // })
      // debugger
      // 4️⃣ 调用订单接口
      const orderRes: any = await addOrderApi({
        user_id: userId,
        total_price: totalPrice,
        order_status: "Pending",
        address: userAddress,
        email: userEmail,
        list: orderList,
      });

      if (orderRes.code === 200) {
        toast.success("Order created successfully!");
        await removeItems(selectedItems);

      } else {
        toast.error("Order creation failed");
      }

    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error("Something went wrong");
    }
  };

  const getTotal = () =>
    cart.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0).toFixed(2);

  
  return (
    <Bounded className="bg-brand-gray p-8">

      {cart.length === 0 ? (
        <div className="text-center text-3xl h-[40vh] flex items-center justify-center ">
          <p className="text-gary-500">Your cart is empty..</p>
        </div>
      ) : (
        <div className=" mt-15 md:mt-30">
          {/* 全选 + 批量删除 */}
          <FieldGroup className="mb-4 flex gap-4">
            <Field orientation="horizontal">
              <Checkbox
                id="select-all"
                className="border-gray-900 border-2"
                checked={selectedItems.length === cart.length}
                onCheckedChange={toggleSelectAll}
              />
              <FieldLabel htmlFor="select-all" >Select All</FieldLabel>

              <Button
                variant="destructive"
                disabled={selectedItems.length === 0}
                onClick={() => removeItems(selectedItems)}
              >
                Delete Selected
              </Button>
            </Field>
          </FieldGroup>

          <div className="space-y-4">
            {cart.map(item => (
              <div
                key={item.cart_item_id}
                className="flex items-stretch gap-6 p-2 rounded shadow"
              >
                {/* 1️⃣ 选择框 */}
                <div className="flex items-start pt-2">
                  <Checkbox
                    className="border-gray-900 border-2"
                    id={`cart-${item.cart_item_id}`}
                    checked={selectedItems.includes(item.cart_item_id)}
                    onCheckedChange={() => {
                      // console.log('Item ID:', item.cart_item_id)
                      toggleSelectItem(item.cart_item_id)
                    }
                    }
                  />
                </div>

                {/* 2️⃣ 3D 预览 */}
                <div className="w-2/7 h-30 flex-shrink-0 rounded-2xl overflow-hidden">
                  <CartConvas
                    typeId={item.product?.asset_code || ""}
                    finish={item.design.p_finish || ""}
                    textureUrl={item.design.p_textures}
                    isDoubleSided={item.product?.is_double_sided || false}
                    orbitControls={true}
                    className="h-full w-full"
                  />
                </div>

                {/* 3️⃣ 参数区域（竖着排） */}
                <div className="flex flex-col justify-between flex-1">
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-semibold">Size:</span>{" "}
                      {item.design.p_size}
                    </div>
                    <div>
                      <span className="font-semibold">Finish:</span>{" "}
                      {item.design.p_finish}
                    </div>
                    <div>
                      <span className="font-semibold">Flex:</span>{" "}
                      {item.design.p_flex}
                    </div>
                  </div>
                </div>

                {/* 4️⃣ 数量 + 价格区域 */}
                <div className="flex flex-col items-center justify-between">
                  {/* 竖排数量控制 */}
                  <div className="flex flex-col items-center border rounded overflow-hidden">
                    <button
                      className="px-3 py-1 hover:bg-gray-100"
                      onClick={() =>
                        updateQuantity(
                          item.cart_item_id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                    <div className="px-4 py-1 border-y">
                      {item.quantity}
                    </div>

                    <button
                      className="px-3 py-1 hover:bg-gray-100"
                      onClick={() =>
                        updateQuantity(
                          item.cart_item_id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                  </div>

                  {/* 价格 */}
                  <p className="mt-4 font-semibold text-md">
                    £{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {/* <div className="text-right mt-6 text-xl font-bold">
              Total: £{getTotal()}
            </div> */}
            <div className="text-right mt-2 text-lg font-semibold">
              Selected Total: £{selectedTotal}
            </div>

            <div className="text-right mt-4 flex justify-end gap-4">
              {/* <Button onClick={() => removeItems(cart.map(i => i.cart_item_id))}>
                Clear Cart
              </Button> */}
              <Button
                disabled={selectedItems.length === 0}
                onClick={checkoutSelected}
              >
                Checkout Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </Bounded>
  );
};

export default Cart;