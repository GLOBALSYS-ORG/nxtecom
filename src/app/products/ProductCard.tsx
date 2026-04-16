"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900">
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-zinc-900/80 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100/80 dark:text-zinc-900">
          {product.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            ${product.price.toFixed(2)}
          </span>
          <StarRating rating={product.rating} />
        </div>
      </div>
    </div>
  );
}
