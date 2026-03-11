'use client';
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { ProductItem } from "../../../components/ProductItem";
import { useEffect, useState } from "react";
import { getProducts } from "@/api/auth";
import ProductFilters from "@/components/ProductFilters";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Products = () => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    min_price: null as number | null,
    max_price: null as number | null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);


  // ---------- 拉取产品数据 ----------
  const fetchProducts = (page = 1, filtersParam = filters) => {
    const params: Record<string, any> = {};
    if (filtersParam.keyword) params.keyword = filtersParam.keyword;
    if (filtersParam.type) params.type = filtersParam.type.toLowerCase();
    if (filtersParam.min_price !== null) params.min_price = filtersParam.min_price;
    if (filtersParam.max_price !== null) params.max_price = filtersParam.max_price;

    getProducts({ page, page_size: pageSize, params })
      .then((res: any) => {
        if (res.code === 200) {
          setDataList(res.data.list || []);
          setCurrentPage(res.data.page || 1);
          setTotalPages(Math.ceil((res.data.total || 0) / pageSize));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
      });
  };

  // ---------- 初次加载 ----------
  useEffect(() => {
    fetchProducts();
  }, []);

  // ---------- 筛选回调 ----------
  const handleApplyFilters = (appliedFilters: typeof filters) => {
    setFilters((prev) => ({ ...prev, ...appliedFilters }));
    fetchProducts(1, { ...filters, ...appliedFilters }); // 筛选后回到第一页
  };

  // ---------- 页码切换 ----------
  const handlePageChange = (page: number) => {
    fetchProducts(page, filters);
  };

  // ---------- 渲染分页组件 ----------
  const renderPagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <Pagination className="mt-6 flex justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(p);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <Bounded className="bg-texture bg-brand-yellow">
      <div className="mt-20 ">
        {/* <Heading className="text-center ~mb-4/6" as="h2">
          All Products
        </Heading> */}

        <ProductFilters onApply={handleApplyFilters} />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {dataList.map((product, idx) => (
          <ProductItem key={`product-${product.id}`} idx={idx} data={product} noScribble />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && renderPagination()}
    </Bounded>
  );
};

export default Products;
