import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';

import { Brand } from './brands.schema';
import { BrandDto } from './dto/brands.dto';
@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}

  async validateAndTransformData(): Promise<BrandDto[]> {
    // Perform the data transformation with aggregation pipeline
    const result = await this.brandModel.aggregate([
      {
        $set: {
          yearFounded: {
            $let: {
              vars: {
                yearFoundedConverted: {
                  $ifNull: [
                    {
                      $convert: {
                        input: '$yearFounded',
                        to: 'int',
                        onError: null,
                      },
                    },
                    {
                      $ifNull: [
                        {
                          $convert: {
                            input: '$yearCreated',
                            to: 'int',
                            onError: null,
                          },
                        },
                        {
                          $convert: {
                            input: '$yearsFounded',
                            to: 'int',
                            onError: null,
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $gte: ['$$yearFoundedConverted', 1600] },
                      { $lte: ['$$yearFoundedConverted', { $year: '$$NOW' }] },
                    ],
                  },
                  then: '$$yearFoundedConverted',
                  else: 1600,
                },
              },
            },
          },
        },
      },
      {
        $set: {
          /**
           * 'bandName'
           * Use brandName if not null, otherwise use brand.name
           */
          brandName: {
            $ifNull: ['$brandName', '$brand.name'],
          },
        },
      },
      {
        $set: {
          /**
           * numberOfLocations
           * Convert it to number
           * Use the default value if it not a number.
           */
          numberOfLocations: {
            $convert: {
              input: '$numberOfLocations',
              to: 'int',
              onError: 1,
              onNull: 1,
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
      // Select only  fields in the schema.
      {
        $project: {
          brandName: 1,
          yearFounded: 1,
          headquarters: 1,
          numberOfLocations: 1,
        },
      },
    ]);

    await this.brandModel.deleteMany({});

    const data = (await this.brandModel.insertMany(result)) as BrandDto[];
    return data;
  }

  async genFakeData(): Promise<Brand[]> {
    const currentYear = new Date().getFullYear();
    const fakeBrands = Array.from(
      { length: 10 },
      (): Brand => ({
        brandName: faker.company.name(),
        yearFounded: faker.number.int({ min: 1600, max: currentYear }),
        headquarters: `${faker.location.city()}, ${faker.location.country()}`,
        numberOfLocations: faker.number.int({ min: 1, max: 1000 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      }),
    );

    const result = await this.brandModel.insertMany(fakeBrands);

    return result;
  }
}
