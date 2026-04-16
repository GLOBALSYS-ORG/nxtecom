import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";
import { SortOption } from "@/types/product";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "8", 10);
  const sort = (searchParams.get("sort") || "price-asc") as SortOption;

  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating-asc":
      sorted.sort((a, b) => a.rating - b.rating);
      break;
    case "rating-desc":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
  }

  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = sorted.slice(startIndex, endIndex);

  return NextResponse.json({
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    },
  });
}
