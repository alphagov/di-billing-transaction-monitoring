import JSPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceData } from "./types";

export class Invoice {
  constructor(invoice: InvoiceData) {
    this.vendor = invoice.vendor;
    this.customer = invoice.customer;
    this.date = invoice.date;
    this.invoiceNumber = invoice.invoiceNumber;
    this.dueDate = invoice.dueDate;
    this.lineItems = invoice.lineItems;
  }

  public vendor;
  public customer;
  public date;
  public invoiceNumber;
  public dueDate;
  public lineItems;

  getSubtotal(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.subtotal, 0);
  }

  getTotal(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.subtotal + cur.vat, 0);
  }
}

export const makeMockInvoicePDF =
  <TWriteOutput>(writeOutput: (file: ArrayBuffer) => Promise<TWriteOutput>) =>
  async (invoice: Invoice): Promise<TWriteOutput> => {
    const doc = new JSPDF({
      unit: "cm",
    });

    doc.setFontSize(24);
    doc.text(`Tax Invoice`, 2, 2);

    doc.setFontSize(8);
    invoice.customer.address.forEach((line, i) => {
      doc.text(line, 2, 3 + i / 2);
    });
    invoice.vendor.address.forEach((line, i) => {
      doc.text(line, 16, 2 + i / 2);
    });
    doc.text(`Invoice Number:\n${invoice.invoiceNumber}`, 12, 2);
    doc.text(`Invoice Date:\n${invoice.date.toLocaleDateString("en-GB")}`, 12, 3);
    doc.text(`Due Date:\n${invoice.dueDate.toLocaleDateString("en-GB")}`, 12, 4);
    doc.text(`VAT Number:\n${invoice.vendor.vatNumber}`, 12, 5);

    autoTable(doc, {
      startY: 8,
      head: [["Description", "Quantity", "Unit Price", "VAT", "Amount"]],
      body: invoice.lineItems.map((lineItem) => [
        lineItem.description,
        lineItem.quantity,
        lineItem.unitPrice.toLocaleString("en-GB", {
          style: "currency",
          currency: "gbp",
        }),
        lineItem.vat.toLocaleString("en-GB", {
          style: "currency",
          currency: "gbp",
        }),
        lineItem.subtotal.toLocaleString("en-GB", {
          style: "currency",
          currency: "gbp",
        }),
      ]),
      foot: [
        [
          `Subtotal: ${invoice.getSubtotal().toLocaleString("en-GB", {
            style: "currency",
            currency: "gbp",
          })}`,
        ],
        [
          `Total: ${invoice.getTotal().toLocaleString("en-GB", {
            style: "currency",
            currency: "gbp",
          })}`,
        ],
      ],
    });
    doc.text(`Invoice number: ${invoice.invoiceNumber}`, 2, 20);
    const output = await writeOutput(doc.output("arraybuffer"));

    return output;
  };
