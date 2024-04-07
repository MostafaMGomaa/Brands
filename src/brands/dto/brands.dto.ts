import { ObjectId } from 'mongoose';

export interface BrandDto {
  _id: ObjectId;

  brandName: string;

  yearFounded: number;

  headquarters: string;

  numberOfLocations: number;

  createdAt?: Date;

  updatedAt?: Date;
}
