import {
  getDueDate,
  getInvoiceReceiptDate,
  getInvoiceReceiptId,
  getItemDescription,
  getPrice,
  getQuantity,
  getSubtotal,
  getTax,
  getTaxPayerId,
  getTotal,
  getUnitPrice,
  getVendorName,
} from "./field-utils";
import { getStandardisedInvoice } from "./get-standardised-invoice";

jest.mock("./field-utils");
const mockedGetDueDate = getDueDate as jest.Mock;
const mockedGetInvoiceReceiptDate = getInvoiceReceiptDate as jest.Mock;
const mockedGetInvoiceReceiptId = getInvoiceReceiptId as jest.Mock;
const mockedGetItemDescription = getItemDescription as jest.Mock;
const mockedGetPrice = getPrice as jest.Mock;
const mockedGetQuantity = getQuantity as jest.Mock;
const mockedGetSubtotal = getSubtotal as jest.Mock;
const mockedGetTax = getTax as jest.Mock;
const mockedGetTaxPayerId = getTaxPayerId as jest.Mock;
const mockedGetTotal = getTotal as jest.Mock;
const mockedGetUnitPrice = getUnitPrice as jest.Mock;
const mockedGetVendorName = getVendorName as jest.Mock;

describe("Standardised invoice getter", () => {
  let givenTextractPages: any;
  let givenTextractPagesLineItemFields: any;
  let givenTextractPagesSummaryFields: any;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedGetDueDate.mockReturnValue("mocked due date");
    mockedGetInvoiceReceiptDate.mockReturnValue("mocked invoice receipt date");
    mockedGetInvoiceReceiptId.mockReturnValue("mocked invoice receipt ID");
    mockedGetItemDescription.mockReturnValue("mocked item description");
    mockedGetPrice.mockReturnValue("mocked price");
    mockedGetQuantity.mockReturnValue("mocked quantity");
    mockedGetSubtotal.mockReturnValue("mocked subtotal");
    mockedGetTax.mockReturnValue("mocked tax");
    mockedGetTaxPayerId.mockReturnValue("mocked taxPayerId");
    mockedGetTotal.mockReturnValue("mocked total");
    mockedGetUnitPrice.mockReturnValue("mocked unit price");
    mockedGetVendorName.mockReturnValue("mocked vendor name");

    givenTextractPagesLineItemFields = [
      {
        Type: {
          Text: "mocked line item field type",
          Confidence: 12,
        },
        ValueDetection: {
          Text: "mocked field value",
          Confidence: 34,
        },
      },
    ];

    givenTextractPagesSummaryFields = [
      {
        Type: {
          Text: "mocked summary field type",
          Confidence: 56,
        },
        ValueDetection: {
          Text: "mocked summary field value",
          Confidence: 78,
        },
      },
    ];

    givenTextractPages = [
      {
        LineItemGroups: [
          {
            LineItems: {
              LineItemExpenseFields: givenTextractPagesLineItemFields,
            },
          },
        ],
        SummaryFields: givenTextractPagesSummaryFields,
      },
    ];
  });

  test("Standardised invoice getter with no pages", () => {
    givenTextractPages = [];

    const result = getStandardisedInvoice(givenTextractPages);

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith([]);
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith([]);
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith([]);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith([]);
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith([]);
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith([]);
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith([]);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith([]);
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter with undefined summary fields", () => {
    givenTextractPages[0].SummaryFields = undefined;

    getStandardisedInvoice(givenTextractPages);

    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith([]);
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith([]);
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith([]);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith([]);
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith([]);
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith([]);
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith([]);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith([]);
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(1);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
  });

  test("Standardised invoice getter with undefined line items", () => {
    givenTextractPages[0].LineItemGroups[0].LineItems = undefined;

    const result = getStandardisedInvoice(givenTextractPages);

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter with undefined line item groups", () => {
    givenTextractPages[0].LineItemGroups = undefined;

    const result = getStandardisedInvoice(givenTextractPages);

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter with no line items", () => {
    givenTextractPages[0].LineItemGroups[0].LineItems = [];

    const result = getStandardisedInvoice(givenTextractPages);

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter with undefined line item fields", () => {
    givenTextractPages[0].LineItemGroups[0].LineItems.LineItemExpenseFields =
      undefined;

    getStandardisedInvoice(givenTextractPages);

    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(1);
    expect(mockedGetItemDescription).toHaveBeenCalledWith([]);
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith([]);
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith([]);
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith([]);
  });

  test("Standardised invoice getter with a line item", () => {
    const result = getStandardisedInvoice(givenTextractPages);

    expect(result).toEqual([
      {
        due_date: "mocked due date",
        invoice_receipt_date: "mocked invoice receipt date",
        invoice_receipt_id: "mocked invoice receipt ID",
        item_description: "mocked item description",
        item_id: undefined,
        price: "mocked price",
        quantity: "mocked quantity",
        service_name: undefined,
        subtotal: "mocked subtotal",
        tax: "mocked tax",
        tax_payer_id: "mocked taxPayerId",
        total: "mocked total",
        unit_price: "mocked unit price",
        vendor_name: "mocked vendor name",
      },
    ]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetVendorName).toHaveBeenCalledTimes(1);
    expect(mockedGetVendorName).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(1);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
  });
});
