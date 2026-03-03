"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner"

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { getProducts, addProductApi, updateProductStatus, getAssetsList } from "@/api/auth";

type Product = {
  id: number;
  name: string;
  type: number;
  price: string;
  status: boolean;
  p_size: string;
  p_flex: string;
  p_desc: string;
  p_finish: string;
  asset?: Array<any>; // 新增字段
};

type Asset = {
  asset_id: number;
  type: string;
  asset_code: string;
  // 其他字段...
};

const PAGE_SIZE = 8;

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]); // 模型资源列表

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [formData, setFormData] = useState({
    name: "",
    type: 1,
    price: "",
    status: true,
    p_size: "",
    p_finish: "",
    asset_code: "",
    p_flex: "",
    p_desc: "",
  });


  // 获取产品列表
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res: any = await getProducts({
          page,
          page_size: PAGE_SIZE,
          params: {},
        });

        if (res?.code === 200) {
          setProducts(res.data.list || []);
          setTotal(res.data.total || 0);
        } else {
          setError("加载失败");
        }
      } catch (e: any) {
        setError(e.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [page]);

  // 获取模型资源列表
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res: any = await getAssetsList({ page: 1, page_size: 100 });
        if (res?.code === 200) {
          setAssets(res.data.list || []);
        }
      } catch (e) {
        console.error("Failed to fetch assets", e);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async () => {
    console.log(formData.asset_code)
    if (!formData.asset_code) {
      toast.warning(`Please select a model asset!`)
      return;
    }

    try {
      const res = await addProductApi(formData);

      if (res?.data?.id) {
        toast.success("Product created successfully!");
        setOpen(false);
        setPage(1); // 刷新第一页
      } else {
        toast.error("Failed to create product. Please try again.");
      }
    } catch (e: any) {
      console.error("Create product failed", e);
      const msg =
        e?.response?.data?.error || e?.message || "Unknown error occurred";
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (id: number, checked: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: checked } : p))
    );

    try {
      await updateProductStatus({ id: String(id), status: checked });
    } catch (e) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: !checked } : p))
      );
      console.error("Failed to update status", e);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Products</h1>

      <button
        className="bg-black text-white px-4 py-2 rounded"
        onClick={() => setOpen(true)}
      >
        + Add Product
      </button>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {!loading && (
        <div className="flex-1 overflow-auto">
          <Table className="w-full h-full">
            <TableCaption>产品列表（共 {total} 条）</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Finish</TableHead>
                <TableHead>Asset</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.status}
                      onCheckedChange={(checked) =>
                        handleToggleStatus(p.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>{p.p_size}</TableCell>
                  <TableCell>{p.p_finish}</TableCell>
                  <TableCell>{p.asset?.type || ""} [{p.asset?.asset_code || ""}]</TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 新增产品 Drawer */}
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="px-6 w-[50vw]">
          <DrawerHeader>
            <DrawerTitle>Add Product</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* <div>
              <Label>Type</Label>
              <Input
                type="number"
                disabled
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: Number(e.target.value) })
                }
              />
            </div> */}

            <div>
              <Label>Model Asset</Label>
              <NativeSelect
                value={formData.asset_code}
                onChange={(e) => {
                  console.log(e.target.value)
                  return setFormData({ ...formData, asset_code: e.target.value })
                }
                }
              >
                <NativeSelectOption value="">
                  Select a model asset
                </NativeSelectOption>
                {assets.map((a) => (
                  <NativeSelectOption key={a.asset_id} value={a.asset_id}>
                    {a.type}[{a.asset_code}]
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label>Price(£)</Label>
              <Input
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Size</Label>
              <Input
                value={formData.p_size}
                onChange={(e) =>
                  setFormData({ ...formData, p_size: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Finish</Label>
              <Input
                value={formData.p_finish}
                onChange={(e) =>
                  setFormData({ ...formData, p_finish: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Flex</Label>
              <Input
                value={formData.p_flex || ""}
                onChange={(e) =>
                  setFormData({ ...formData, p_flex: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                className="w-full border rounded px-2 py-1"
                rows={4}
                value={formData.p_desc || ""}
                onChange={(e) =>
                  setFormData({ ...formData, p_desc: e.target.value })
                }
              />
            </div>
          </div>

          <DrawerFooter className="mt-6 flex gap-2">
            <Button onClick={handleSubmit}>Submit</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProductListPage;
