# Brands Service Documentation

## Table of Contents

- [Overview](#overview)
- [Schema](#schema)
- [Methods](#methods)
  - [validateAndTransformData()](#validateandtransformdata)
  - [genFakeData()](#genfakedata)
  - [exportToExcel()](#exporttoexcel)
- [Problems with the Old Brand Service)](#problems-with-the-old-brand-service)

## Overview

The BrandsService class within brands.service.ts is responsible for transforming, seeding, and exporting data related to restaurant brands. This service is part of a larger task to standardize a MongoDB collection using Mongoose and TypeScript.

## Schema

| Value             | Datatype |
| ----------------- | -------- |
| brandName         | String   |
| yearFounded       | Number   |
| headquarters      | String   |
| numberOfLocations | Number   |

## Methods

```ts
validateAndTransformData();
```

### Purpose

Transforms the data in the brands collection to match a given Mongoose schema. It corrects inconsistencies, validates the data, and updates the collection in place.

### Implementation Details

- Utilizes an aggregation pipeline to transform fields such as yearFounded, brandName, and numberOfLocations.
- Corrects field names and ensures data types are consistent with the schema.
- Deletes all documents in the collection and re-inserts the transformed data.

```ts
genFakeData();
```

### Purpose

Generates and seeds 10 new brand documents with randomized data that adheres to the schema.

### Implementation Details

- Uses `@faker-js/faker` to generate fake data for brand names, years founded, headquarters, and number of locations.
- Inserts the generated documents into the brands collection.

```ts
exportToExcel();
```

### Purpose

Documents the seed data cases in an Excel file, explaining the unique characteristics of each case.

### Implementation Details

- Creates a new Excel workbook and worksheet using `exceljs`.
- Defines columns for brand attributes and descriptions.
- Adds rows to the worksheet for each brand in the seed data.
- Writes the workbook to an .xlsx file and returns the file path.

## Problems with the Old Brand Service

This aggregation may take a longer time compared to the one in `brands.service.ts` because
it includes unnecessary conversions of 'yearsFounded' and 'yearCreated' to integers.
These conversions are performed even when 'yearFounded' might already be a valid number,
resulting in an inefficient transformation process.
