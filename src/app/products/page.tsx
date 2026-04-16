"use client";

import { useEffect, useState, useCallback } from "react";
import { Product, SortOption } from "@/types/product";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import SortControls from "./SortControls";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });
  const [sort, setSort] = useState<SortOption>("price-asc");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (page: number, sortOption: SortOption) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=8&sort=${sortOption}`);
      const data = await res.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(pagination.currentPage, sort);
  }, [sort, pagination.currentPage, fetchProducts]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Products
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Browse our collection of {pagination.totalItems} products
          </p>
        </div>

        {/* Sort Controls */}
        <SortControls currentSort={sort} onSortChange={handleSortChange} />

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900"
              >
                <div className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-2 h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
