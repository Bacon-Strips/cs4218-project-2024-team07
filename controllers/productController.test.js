import { jest } from "@jest/globals";
// import slugify from "slugify";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController,
} from "../controllers/productController.js";

import productModel from "../models/productModel.js";
// Still don't know how to mock a local model
// TODO: Mock productModel.
jest.mock("../models/productModel");
// const mockedProductModel = jest.createMockFromModule('../models/productModel.js');

const slugify = jest.createMockFromModule('slugify');
const fs = jest.createMockFromModule('fs');

// console.log(jest.isMockFunction(mockedProductModel)) // false
console.log("productModel.save: ", productModel); // false
console.log("slugify: ", jest.isMockFunction(slugify)); // true
console.log("fs.func: ", jest.isMockFunction(fs.readFileSync)); // true

// You also need to mock individual methods if you want specific behavior in your tests
productModel.save = jest.fn().mockResolvedValue({}); // Mock specific methods

// Base case for a product request
const baseReq = {
  fields: {
    name: "test product name",
    description: "test description",
    price: 10,
    category: "test category",
    quantity: 10,
    shipping: true,
  },
  files: { photo: { size: 100000, path: "client/public/images/a1.png" } },
};
// Resetting mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Base response object
const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
});

test("Create Product - success", async () => {
  const mockSave = jest.fn().mockResolvedValue({ _id: 1 });
  productModel.prototype.save = mockSave;
  const req = baseReq;
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  await createProductController(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Created Successfully",
    })
  );
  expect(mockSave).toHaveBeenCalled();
});

test("Create Product - missing name", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, name: "" } }; // Name is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Name is Required",
    })
  );
});

test("Create Product - missing description", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, description: "" } }; // Description is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Description is Required",
    })
  );
});

test("Create Product - missing price", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, price: "" } }; // Price is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Price is Required",
    })
  );
});

test("Create Product - missing category", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, category: "" } }; // Category is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Category is Required",
    })
  );
});

test("Create Product - missing quantity", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, quantity: "" } }; // Quantity is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Quantity is Required",
    })
  );
});

test("Create Product - photo too large", async () => {
  const req = {
    ...baseReq,
    files: { photo: { size: 2000000, path: "client/public/images/a1.png" } },
  }; // Photo size exceeds 1MB
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "photo is Required and should be less then 1mb",
    })
  );
});

test("Create Product - successful without photo", async () => {
  const req = { ...baseReq, files: {} }; // No photo provided
  const res = createMockResponse();

  // productModel.prototype.save.mockResolvedValue({ _id: 1 });

  await createProductController(req, res);

  expect(productModel.prototype.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Created Successfully",
    })
  );
});

test("Create Product - successful with photo", async () => {
  const req = { ...baseReq };
  const res = createMockResponse();

  // Mock file reading
  fs.readFileSync.mockReturnValue(Buffer.from("image data"));

  productModel.prototype.save.mockResolvedValue({ _id: 1 });

  await createProductController(req, res);
//   expect(fs.readFileSync).toHaveBeenCalledWith("client/public/images/a1.png");
  expect(productModel.prototype.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Created Successfully",
    })
  );
});


test("Create Product - save operation fails", async () => {
  const req = { ...baseReq };
  const res = createMockResponse();

  // Simulate save failure
  const saveError = new Error("Database error");
  const mockRejectedValue = jest.fn().mockRejectedValue(saveError)
  productModel.prototype.save = mockRejectedValue;

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Error in crearing product",
    })
  );
});


// TODO: Add test cases for the rest of the controller methods.
// Test getProductController methods
const mockProductData = [
  { _id: "1", name: "Product 1", category: "Category 1" },
  { _id: "2", name: "Product 2", category: "Category 2" },
];

test("Get Products - success", async () => {
  // Mocking the chainable methods of productModel
  const mockFind = jest.fn().mockReturnThis();
  const mockPopulate = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockSort = jest.fn().mockResolvedValue(mockProductData);

  // Link these mock methods to productModel.find
  productModel.find = mockFind;
  productModel.find.mockImplementation(() => ({
    populate: mockPopulate,
    select: mockSelect,
    limit: mockLimit,
    sort: mockSort,
  }));

  const req = {}; // Empty request since we don't need anything from req for this test
  const res = createMockResponse();

  // Call the controller
  await getProductController(req, res);

  // Assertions
  expect(mockFind).toHaveBeenCalled(); // Check if find was called
  expect(mockPopulate).toHaveBeenCalledWith("category"); // Check if populate was called correctly
  expect(mockSelect).toHaveBeenCalledWith("-photo"); // Check if select was called correctly
  expect(mockLimit).toHaveBeenCalledWith(12); // Check if limit was called with 12
  expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 }); // Check if sort was called correctly
  expect(res.status).toHaveBeenCalledWith(200); // Ensure correct response status
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      counTotal: 2, // There are two products in the mock response
      message: "ALlProducts ",
      products: mockProductData,
    })
  );
});


test("Get Products - failure", async () => {
  // Mock the `find` method to reject with an error
  const mockError = new Error("Database query failed");
  productModel.find.mockImplementation(() => ({
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockRejectedValue(mockError),
  }));

  const req = {}; // Empty request
  const res = createMockResponse();

  // Call the controller
  await getProductController(req, res);

  // Assertions for the failure case
  expect(res.status).toHaveBeenCalledWith(500); // Expect a 500 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Erorr in getting products",
      error: mockError.message, // Error message from the rejection
    })
  );
});

// Test getSingleProductController method

const mockSingleProductData = {
  _id: "1",
  name: "Test Product",
  slug: "test-product",
  category: "Test Category",
};

test("Get Single Product - success", async () => {
  // Mock the `findOne` method to return mock product data
  const mockFindOne = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockPopulate = jest.fn().mockResolvedValue(mockSingleProductData);

  productModel.findOne = mockFindOne;
  productModel.findOne.mockImplementation(() => ({
    select: mockSelect,
    populate: mockPopulate,
  }));

  const req = { params: { slug: "test-product" } }; // Mock request with slug parameter
  const res = createMockResponse();

  // Call the controller
  await getSingleProductController(req, res);

  // Assertions
  expect(mockFindOne).toHaveBeenCalledWith({ slug: "test-product" }); // Check if `findOne` was called with the correct slug
  expect(mockSelect).toHaveBeenCalledWith("-photo"); // Ensure the `select` method was called with "-photo"
  expect(mockPopulate).toHaveBeenCalledWith("category"); // Ensure `populate` was called with "category"
  expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Single Product Fetched",
      product: mockSingleProductData,
    })
  );
});

test("Get Single Product - failure", async () => {
  // Mock the `findOne` method to throw an error
  const mockError = new Error("Database query failed");
  productModel.findOne.mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockRejectedValue(mockError),
  }));

  const req = { params: { slug: "test-product" } }; // Mock request with slug parameter
  const res = createMockResponse();

  // Call the controller
  await getSingleProductController(req, res);

  // Assertions
  expect(res.status).toHaveBeenCalledWith(500); // Expect a 500 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Eror while getitng single product",
      error: mockError,
    })
  );
});
