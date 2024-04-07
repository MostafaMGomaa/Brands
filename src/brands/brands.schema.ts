import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandDocumnet = HydratedDocument<Brand>;

@Schema({
  timestamps: true,
})
export class Brand {
  @Prop({
    required: [true, 'Brand name is required'],
    trim: true,
  })
  brandName: String;

  @Prop({
    required: [true, 'Year founded is required'],
    min: [1600, 'Year founded seems too old'],
    max: [new Date().getFullYear(), 'Year founded cannot be in the future'],
  })
  yearFounded: Number;

  @Prop({
    required: [true, 'Headquarters location is required'],
    trim: true,
  })
  headquarters: String;

  @Prop({
    required: [true, 'Number of locations is required'],
    min: [1, 'There should be at least one location'],
  })
  numberOfLocations: Number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
