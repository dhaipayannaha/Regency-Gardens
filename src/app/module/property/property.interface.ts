import { ListingType, PropertyStatus } from "../../../generated/prisma/enums";


export interface IProperty {
    title: string;
    slug: string;
    description: string;
    price: number;
    listingType: ListingType;
    status?: PropertyStatus;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    address: string;
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
    featured?: boolean;
    agentId: string;
    categoryId: string;
    images?: string[];
}
export type PropertyFilters = {
  city?: string;
  listingType?: ListingType;
  status?: PropertyStatus;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  searchTerm?: string; // searches title/description
};