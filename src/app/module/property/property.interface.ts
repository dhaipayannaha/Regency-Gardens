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
}