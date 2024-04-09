import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Brand } from './brands.schema';
@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}
  /**
   * This aggregation may take a longer time compared to the one in `brands.service.ts` because
   * it includes unnecessary conversions of 'yearsFounded' and 'yearCreated' to integers.
   * These conversions are performed even when 'yearFounded' might already be a valid number,
   * resulting in an inefficient transformation process.
   */

  async validateAndTransformData(): Promise<any[]> {
    // Perform the data transformation with aggregation pipeline
    await this.brandModel.aggregate([
      {
        // Convert 'yearsFounded' and 'yearCreated' to an int if they are strings
        $set: {
          yearsFoundedInt: {
            $cond: {
              if: { $eq: [{ $type: '$yearsFounded' }, 'string'] },
              then: { $toInt: '$yearsFounded' },
              else: '$yearsFounded',
            },
          },
          yearCreatedInt: {
            $cond: {
              if: { $eq: [{ $type: '$yearCreated' }, 'string'] },
              then: { $toInt: '$yearCreated' },
              else: '$yearCreated',
            },
          },
        },
      },
      /**
       * 'yearFounded'
       *  */
      {
        $set: {
          // Determine the correct 'yearFounded' value
          yearFounded: {
            $switch: {
              branches: [
                // If 'yearFounded' is a valid number, use it
                {
                  case: {
                    $and: [
                      { $ne: ['$yearFounded', null] },
                      { $gte: ['$yearFounded', 1600] },
                      { $lte: ['$yearFounded', new Date().getFullYear()] },
                    ],
                  },
                  then: '$yearFounded',
                },
                // If 'yearCreatedInt' is a valid number, use it
                {
                  case: {
                    $and: [
                      { $ne: ['$yearCreatedInt', null] },
                      { $gte: ['$yearCreatedInt', 1600] },
                      { $lte: ['$yearCreatedInt', new Date().getFullYear()] },
                    ],
                  },
                  then: '$yearCreatedInt',
                },
                // If yearsFoundedInt is a valid number, use it
                {
                  case: {
                    $and: [
                      { $ne: ['$yearsFoundedInt', null] },
                      { $gte: ['$yearsFoundedInt', 1600] },
                      { $lte: ['$yearsFoundedInt', new Date().getFullYear()] },
                    ],
                  },
                  then: '$yearsFoundedInt',
                },
              ],
              // Default value.
              default: 1600,
            },
          },
        },
      },
      /**
       * 'brandName'
       * Use brandName if not null, otherwise use brand.name
       */
      {
        $set: {
          brandName: {
            $ifNull: ['$brandName', '$brand.name'],
          },
        },
      },
      /**
       * numberOfLocations
       * Convert it to number
       * Use the default value if it not a number.
       */
      {
        $set: {
          numberOfLocations: {
            $cond: {
              if: { $eq: [{ $type: '$numberOfLocations' }, 'int'] },
              then: '$numberOfLocations',
              else: 1,
            },
          },
        },
      },
      /**
       * headquarters
       * Use headquarters if not null, otherwise use hqAddress
       */
      {
        $set: {
          headquarters: {
            $ifNull: ['$headquarters', '$hqAddress'],
          },
        },
      },
      {
        // Remove temporary fields and any additional fields not defined in the schema
        $unset: [
          'yearCreated',
          'yearsFounded',
          'yearsFoundedInt',
          'yearCreatedInt',
          'brand',
          'hqAddress',
        ],
      },
      {
        $out: 'test',
      },
    ]);

    // Return the entire transformed collection
    return this.brandModel.find().exec();
  }
}
