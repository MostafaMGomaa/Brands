import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import * as ExcelJS from 'exceljs';

import { Brand } from './brands.schema';
import { BrandDto } from './dto/brands.dto';
@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}

  async validateAndTransformData(): Promise<BrandDto[]> {
    // Perform the data transformation with aggregation pipeline
    const result = await this.brandModel.aggregate([
      {
        /**
         * 'yearFounded'
         * Convert and select the proper value for 'yearFounded'
         */
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
      // Select only fields in the schema.
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

    const fakeBrands = Array.from({ length: 10 }, () => ({
      brandName: faker.company.name(),
      yearFounded: faker.number.int({ min: 1600, max: currentYear }),
      headquarters: `${faker.location.city()}, ${faker.location.country()}`,
      numberOfLocations: faker.number.int({ min: 1, max: 1000 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }));

    const result = (await this.brandModel.insertMany(fakeBrands)) as Brand[];

    return result;
  }

  async exportToExcel() {
    const seedData = [
      {
        brandName: 'Streich - Fahey',
        yearFounded: 1837,
        headquarters: 'Wittingstead, Tunisia',
        numberOfLocations: 360,
        caseDescription:
          'Mid-19th century brand with a significant presence, boasting 360 locations across multiple regions.',
      },
      {
        brandName: 'Kerluke, Osinski and Larson',
        yearFounded: 2021,
        headquarters: 'New Blairhaven, Guadeloupe',
        numberOfLocations: 5,
        caseDescription:
          'The newest brand in the market, with limited but growing presence, currently operating in 5 locations.',
      },
      {
        brandName: "O'Hara, Towne and Buckridge",
        yearFounded: 1870,
        headquarters: 'Cathedral City, French Southern Territories',
        numberOfLocations: 506,
        caseDescription:
          'An established brand with a long history, spanning multiple centuries. It has a widespread presence, operating in over 500 locations.',
      },
      {
        brandName: 'Tillman, Koepp and Haley',
        yearFounded: 1748,
        headquarters: 'Port Leilani, Zimbabwe',
        numberOfLocations: 834,
        caseDescription:
          'One of the oldest brands, founded in the 18th century. Despite its historical roots, it maintains a strong presence with over 800 locations.',
      },
      {
        brandName: 'Nicolas Inc',
        yearFounded: 1764,
        headquarters: 'West Assunta, Lesotho',
        numberOfLocations: 352,
        caseDescription:
          'Another 18th-century brand, operating in multiple locations and known for its longstanding presence in the market.',
      },
      {
        brandName: 'Koch - Satterfield',
        yearFounded: 1957,
        headquarters: 'Crawfordville, Togo',
        numberOfLocations: 904,
        caseDescription:
          'A modern brand founded in the 20th century. Despite its relatively recent establishment, it has rapidly expanded to over 900 locations.',
      },
      {
        brandName: 'Marks Inc',
        yearFounded: 1864,
        headquarters: 'Mishawaka, Burkina Faso',
        numberOfLocations: 919,
        caseDescription:
          'Established in the 19th century, is a well-established brand with a widespread presence, operating in nearly 1,000 locations.',
      },
      {
        brandName: 'Beier - Simonis',
        yearFounded: 1802,
        headquarters: 'South Kyleigh, South Africa',
        numberOfLocations: 374,
        caseDescription:
          'An early 19th-century brand with a moderate presence, operating in several locations across South Africa.',
      },
      {
        brandName: 'Olson, Hickle and White',
        yearFounded: 1835,
        headquarters: "Lee's Summit, Moldova",
        numberOfLocations: 876,
        caseDescription:
          'Founded in the mid-19th century, has expanded its operations to numerous locations, serving customers across Moldova.',
      },
      {
        brandName: 'Wintheiser - Wolff',
        yearFounded: 1785,
        headquarters: 'Vonshire, Cuba',
        numberOfLocations: 249,
        caseDescription:
          'a late 18th-century brand, maintains a modest presence with 249 locations, serving customers in Cuba.',
      },
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Brands');

    worksheet.columns = [
      { header: 'Brand Name', key: 'brandName' },
      { header: 'Year Founded', key: 'yearFounded' },
      { header: 'Headquarters', key: 'headquarters' },
      { header: 'Number of Locations', key: 'numberOfLocations' },
      { header: 'Case Description', key: 'caseDescription' },
    ];

    seedData.forEach((brand) => {
      worksheet.addRow(brand);
    });

    const filePath = 'brands.xlsx';
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }
}
