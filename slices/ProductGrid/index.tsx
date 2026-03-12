'use client';
import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { SlideIn } from "@/components/SlideIn";
import { ProductGridSlice } from "@/data/homeData";
import { JSX, useEffect, useState } from "react";
import { getProducts } from "@/api/auth";
import { ProductItem } from "@/components/ProductItem";

/**
 * Props for `ProductGrid`.
 */


const ProductGrid = ({ slice }: { slice: ProductGridSlice }) => {
  const [hotList, setHotList] = useState<any[]>([]);

  useEffect(() => {
    getProducts({ page_size: 4 })
      .then((res:any) => {
        if (res.code === 200) setHotList(res.data.list || []);
      })
      .catch(console.error);
  }, []);

  return (
    <Bounded id="products" data-slice-type={slice.slice_type} className="bg-texture bg-brand-yellow">
      <SlideIn>
        <Heading className="text-center ~mb-4/6" as="h2">{slice.heading}</Heading>
      </SlideIn>
      <SlideIn>
        <div className="text-center ~mb-6/10">
          {slice.body.map((p, i) => <p key={i}>{p.text}</p>)}
        </div>
      </SlideIn>
      <div className="grid w-full grid-cols-1  gap-2 md:gap-4 sm:grid-cols-2 lg:grid-cols-4" >
        {hotList.map((product, idx) => (
          <ProductItem key={product.id} idx={idx} data={product} />
        ))}
      </div>
    </Bounded>
  );
};

export default ProductGrid;