"use client";

import React, { useEffect, useState } from "react";
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
import { getAssetsList } from "@/api/auth";

type ProductAsset = {
  asset_id: number;
  type: string;
  asset_code: string;
  texture_urls: Record<string, string[]>;
};

const PAGE_SIZE = 8;

const ProductAssetsPage = () => {
  const [assets, setAssets] = useState<ProductAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const res: any = await getAssetsList({ page, page_size: PAGE_SIZE });
        const data = res?.data;
        // 后端返回格式:
        // {
        //   "total": 3,
        //   "page": 1,
        //   "page_size": 10,
        //   "list": [ ... ]
        // }
        setAssets(data?.list || []);
        setTotal(data?.total || 0);
      } catch (e: any) {
        setError(e.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [page]);

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-4 text-2xl font-semibold">Product Assets</h1>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {!loading && (
        <div className="flex-1 overflow-auto ">
          <Table className="w-full h-full">
            <TableCaption>产品资源列表（共 {total} 条）</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Type ID</TableHead>
                <TableHead>Textures Keys</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.asset_id}>
                  <TableCell className="font-medium">
                    {asset.asset_id}
                  </TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.asset_code}</TableCell>
                  <TableCell>
                    {Object.keys(asset.texture_urls || {}).join(", ") || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}, {PAGE_SIZE} items per page
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="border px-3 py-1 rounded disabled:opacity-50"
                        onClick={handlePrev}
                        disabled={page === 1}
                      >
                        Prev
                      </button>
                      <button
                        className="border px-3 py-1 rounded disabled:opacity-50"
                        onClick={handleNext}
                        disabled={page === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ProductAssetsPage;