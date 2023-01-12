import { Invoice } from "./invoice";
import placeNames from "./data/place-names.json";
import streetTypes from "./data/street-types.json";
import { Customer, LineItem, Vendor } from "./types";

const randomLetter = (): string => {
  return Math.ceil(10 + Math.random() * 25).toString(36);
};

const randomString = (length: number): string => {
  return new Array(length)
    .fill(null)
    .reduce<string>((acc) => acc + randomLetter(), "");
};

const randomStreetType = (): string => {
  return streetTypes[Math.floor(Math.random() * streetTypes.length)];
};

const randomName = (): string => {
  return placeNames[Math.floor(Math.random() * placeNames.length)];
};

const randomPostcode = (): string => {
  return `${randomLetter()}${randomLetter()}${Math.floor(
    1 + Math.random() * 8
  )} ${Math.floor(
    1 + Math.random() * 8
  )}${randomLetter()}${randomLetter()}`.toUpperCase();
};

const randomAddress = (): string[] => {
  return [
    `${randomName()} ${randomName()}`,
    `${Math.floor(Math.random() * 100)} ${randomName()} ${randomStreetType()}`,
    randomName(),
    randomPostcode(),
  ];
};

const randomVendor = (): Vendor => {
  return {
    name: "Client Three",
    vatNumber: `GB${Math.floor(Math.random() * 1_000_000_000)}`,
    address: randomAddress(),
  };
};

const randomCustomer = (): Customer => {
  return {
    name: randomName(),
    address: randomAddress(),
  };
};

const randomLineItem = (): LineItem => {
  const priceTier = [
    { min: 0, max: 5, unitPrice: 6.5 },
    { min: 6, max: 10, unitPrice: 0.25 },
    { min: 10, unitPrice: 8.88 },
  ][Math.floor(Math.random() * 3)]; // These match fake-prices.csv
  const quantity =
    priceTier.min + Math.floor(Math.random() * (priceTier.max ?? 20));
  const subtotal = quantity * priceTier.unitPrice;
  return {
    description: "Verification of sentience via address checking mechanism", // should match IPV_ADDRESS_CRI_END from fake-vendor-services.csv
    vat: 0.2 * subtotal,
    quantity,
    unitPrice: priceTier.unitPrice,
    subtotal,
  };
};

const randomLineItems = (quantity: number): LineItem[] => {
  return new Array(quantity).fill(null).map(randomLineItem);
};

export const randomInvoice = (): Invoice => {
  return new Invoice({
    vendor: randomVendor(),
    customer: randomCustomer(),
    date: new Date(),
    invoiceNumber: `${randomString(3)}-${Math.floor(
      Math.random() * 1_000_000_000
    )}`,
    dueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
    lineItems: randomLineItems(10),
  });
};
