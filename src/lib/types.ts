export type UserRole = "customer" | "vendor" | "admin";
export type Pizza = {
  _id: string; itemName: string; category: string; description: string; price: number;
  location: string; images: string[]; vendorId: string; vendorName?: string; vendorInfo?: {name:string;description?:string;location?:string;phone?:string};
  status: "pending" | "approved" | "rejected" | "inactive"; isAvailable?: boolean;
  rating?: number; reviewCount?: number; reviews?: Array<{customerName?:string;rating:number;comment:string;createdAt?:string}>; isPremiumVendor?: boolean; createdAt?: string;
};
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type Order = {
  _id: string; itemId: string; itemName: string; itemImage?: string; vendorId: string;
  vendorName?: string; customerId: string; customerName?: string; deliveryDate: string;
  deliveryAddress: string; message?: string; itemPrice?: number; status: OrderStatus; createdAt: string;
};
