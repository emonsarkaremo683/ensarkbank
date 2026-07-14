package com.elitetech_inc.ensarkbank.accounting_system.journal.service;

import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.opencsv.CSVWriter;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TransactionHistoryExportService {

    private static final java.awt.Color BANK_GOLD = new java.awt.Color(201, 168, 76);
    private static final java.awt.Color BANK_DARK = new java.awt.Color(10, 22, 40);
    private static final java.awt.Color BANK_LIGHT = new java.awt.Color(240, 245, 250);
    private static final java.awt.Color SUCCESS_GREEN = new java.awt.Color(34, 197, 94);
    private static final java.awt.Color FAILED_RED = new java.awt.Color(239, 68, 68);
    private static final java.awt.Color PENDING_AMBER = new java.awt.Color(245, 158, 11);

    // ======================== PDF ========================

    public byte[] generatePdf(List<JournalResponse> entries, String accountNumber,
                              String customerName, LocalDateTime fromDate, LocalDateTime toDate) {
        return generatePdf(entries, accountNumber, customerName, fromDate, toDate, null);
    }

    public byte[] generatePdf(List<JournalResponse> entries, String accountNumber,
                              String customerName, LocalDateTime fromDate, LocalDateTime toDate,
                              String password) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        if (password != null && !password.isBlank()) {
            writer.setEncryption(
                    password.getBytes(),
                    password.getBytes(),
                    PdfWriter.ALLOW_PRINTING,
                    PdfWriter.STANDARD_ENCRYPTION_128
            );
        }

        document.open();

        try {
            addPdfHeader(document, customerName, accountNumber, fromDate, toDate, entries.size());
            addPdfSummary(entries, document);
            addPdfTable(entries, document);
            addPdfFooter(document);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addPdfHeader(Document document, String customerName, String accountNumber,
                              LocalDateTime fromDate, LocalDateTime toDate, int totalEntries) throws DocumentException {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

        Paragraph bankName = new Paragraph("EnSark Bank", new Font(Font.HELVETICA, 22, Font.BOLD, BANK_DARK));
        bankName.setAlignment(Element.ALIGN_LEFT);
        document.add(bankName);

        Paragraph tagline = new Paragraph("Secure. Smart. Simple.", new Font(Font.ITALIC, 9, Font.NORMAL, new java.awt.Color(120, 120, 120)));
        tagline.setAlignment(Element.ALIGN_LEFT);
        tagline.setSpacingAfter(6);
        document.add(tagline);

        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BANK_GOLD);
        sep.setLineWidth(2);
        document.add(new Chunk(sep));
        document.add(Chunk.NEWLINE);

        Paragraph title = new Paragraph("Transaction Statement", new Font(Font.HELVETICA, 16, Font.BOLD, BANK_DARK));
        title.setAlignment(Element.ALIGN_LEFT);
        title.setSpacingAfter(12);
        document.add(title);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1, 1});

        addInfoCell(infoTable, "Customer Name", customerName != null ? customerName : "N/A");
        addInfoCell(infoTable, "Account Number", accountNumber != null ? accountNumber : "All Accounts");

        String fromStr = fromDate != null ? fromDate.format(fmt) : "Start";
        String toStr = toDate != null ? toDate.format(fmt) : "Present";
        addInfoCell(infoTable, "Period From", fromStr);
        addInfoCell(infoTable, "Period To", toStr);
        addInfoCell(infoTable, "Generated On", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a")));
        addInfoCell(infoTable, "Total Entries", String.valueOf(totalEntries));

        document.add(infoTable);
        document.add(Chunk.NEWLINE);
    }

    private void addInfoCell(PdfPTable table, String label, String value) {
        Font labelFont = new Font(Font.HELVETICA, 8, Font.BOLD, new java.awt.Color(100, 100, 100));
        Font valueFont = new Font(Font.HELVETICA, 9, Font.NORMAL, BANK_DARK);

        PdfPCell labelCell = new PdfPCell(new Phrase(label + ":", labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(4);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(4);
        valueCell.setHorizontalAlignment(Element.ALIGN_LEFT);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addPdfSummary(List<JournalResponse> entries, Document document) throws DocumentException {
        BigDecimal totalCredit = entries.stream()
                .filter(e -> e.getEntryType() != null && e.getEntryType().name().equals("CREDIT"))
                .map(JournalResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDebit = entries.stream()
                .filter(e -> e.getEntryType() != null && e.getEntryType().name().equals("DEBIT"))
                .map(JournalResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PdfPTable summaryTable = new PdfPTable(3);
        summaryTable.setWidthPercentage(100);
        summaryTable.setWidths(new float[]{1, 1, 1});
        summaryTable.setSpacingAfter(12);

        addSummaryCell(summaryTable, "Total Entries", String.valueOf(entries.size()), BANK_DARK);
        addSummaryCell(summaryTable, "Total Credits", formatPdfCurrency(totalCredit), SUCCESS_GREEN);
        addSummaryCell(summaryTable, "Total Debits", formatPdfCurrency(totalDebit), FAILED_RED);

        document.add(summaryTable);
    }

    private void addSummaryCell(PdfPTable table, String label, String value, java.awt.Color valueColor) {
        Font labelFont = new Font(Font.HELVETICA, 8, Font.NORMAL, new java.awt.Color(120, 120, 120));
        Font valueFont = new Font(Font.HELVETICA, 12, Font.BOLD, valueColor);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(8);
        cell.setBackgroundColor(BANK_LIGHT);

        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", labelFont));
        p.add(new Chunk(value, valueFont));
        cell.addElement(p);

        table.addCell(cell);
    }

    private void addPdfTable(List<JournalResponse> entries, Document document) throws DocumentException {
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 3.5f, 2f, 1.5f, 1.2f, 1.5f});
        table.setHeaderRows(1);

        String[] headers = {"Date", "Particulars", "Counterparty", "Type", "Entry", "Amount"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, new Font(Font.HELVETICA, 8, Font.BOLD, java.awt.Color.WHITE)));
            cell.setBackgroundColor(BANK_DARK);
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBorder(Rectangle.BOTTOM);
            cell.setBorderWidth(2);
            cell.setBorderColor(BANK_GOLD);
            table.addCell(cell);
        }

        DateTimeFormatter rowFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        Font rowFont = new Font(Font.HELVETICA, 8, Font.NORMAL, BANK_DARK);
        boolean alternate = false;

        for (JournalResponse e : entries) {
            java.awt.Color bgColor = alternate ? BANK_LIGHT : java.awt.Color.WHITE;
            alternate = !alternate;

            addRowCell(table, e.getDate() != null ? e.getDate().format(rowFmt) : "-", rowFont, bgColor);

            String particularsText = truncate(e.getParticulars(), 40) + "\n" + truncate(e.getTransactionId(), 50);
            addRowCell(table, particularsText, rowFont, bgColor);

            addRowCell(table, truncate(e.getCounterpartyName() != null ? e.getCounterpartyName() : "-", 20), rowFont, bgColor);
            addRowCell(table, e.getTransactionType() != null ? e.getTransactionType().toString() : "-", rowFont, bgColor);

            Font entryFont = new Font(Font.HELVETICA, 8, Font.BOLD,
                    e.getEntryType() != null && e.getEntryType().name().equals("CREDIT") ? SUCCESS_GREEN : FAILED_RED);
            addRowCell(table, e.getEntryType() != null ? e.getEntryType().toString() : "-", entryFont, bgColor);

            Font amountFont = new Font(Font.HELVETICA, 8, Font.BOLD,
                    e.getEntryType() != null && e.getEntryType().name().equals("CREDIT") ? SUCCESS_GREEN : FAILED_RED);
            addRowCell(table, e.getAmount() != null ? formatPdfCurrency(e.getAmount()) : "-", amountFont, bgColor);
        }

        document.add(table);
    }
    private void addRowCell(PdfPTable table, String text, Font font, java.awt.Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setPadding(5);
        cell.setBackgroundColor(bgColor);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(new java.awt.Color(220, 220, 220));
        table.addCell(cell);
    }

    private void addPdfFooter(Document document) throws DocumentException {
        document.add(Chunk.NEWLINE);
        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BANK_GOLD);
        sep.setLineWidth(1);
        document.add(new Chunk(sep));

        Font footerFont = new Font(Font.HELVETICA, 7, Font.ITALIC, new java.awt.Color(150, 150, 150));
        Paragraph footer = new Paragraph(
                "This is a computer-generated statement from Ensar Bank. For queries, contact support@ensarbank.com",
                footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(6);
        document.add(footer);
    }

    // ======================== EXCEL ========================

    public byte[] generateExcel(List<JournalResponse> entries, String accountNumber,
                                String customerName, LocalDateTime fromDate, LocalDateTime toDate) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transaction History");

            int rowNum = 0;
            rowNum = addExcelHeader(sheet, rowNum, customerName, accountNumber, fromDate, toDate);
            rowNum = addExcelSummaryRow(sheet, rowNum, entries);
            rowNum += 1;
            rowNum = addExcelTableHeader(sheet, rowNum);
            addExcelRows(sheet, rowNum, entries);

            for (int i = 0; i < 7; i++) sheet.autoSizeColumn(i);

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }

    private int addExcelHeader(Sheet sheet, int rowNum, String customerName, String accountNumber,
                               LocalDateTime fromDate, LocalDateTime toDate) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        Row row = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(0);
        cell.setCellValue("Ensar Bank - Transaction Statement");

        CellStyle titleStyle = sheet.getWorkbook().createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = sheet.getWorkbook().createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        cell.setCellStyle(titleStyle);

        sheet.createRow(rowNum++).createCell(0).setCellValue("Customer: " + (customerName != null ? customerName : "N/A"));
        sheet.createRow(rowNum++).createCell(0).setCellValue("Account: " + (accountNumber != null ? accountNumber : "All Accounts"));
        sheet.createRow(rowNum++).createCell(0).setCellValue("Period: " +
                (fromDate != null ? fromDate.format(fmt) : "Start") + " to " +
                (toDate != null ? toDate.format(fmt) : "Present"));
        sheet.createRow(rowNum++).createCell(0).setCellValue("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a")));
        return rowNum;
    }

    private int addExcelSummaryRow(Sheet sheet, int rowNum, List<JournalResponse> entries) {
        BigDecimal totalCredit = entries.stream()
                .filter(e -> e.getEntryType() != null && e.getEntryType().name().equals("CREDIT"))
                .map(JournalResponse::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDebit = entries.stream()
                .filter(e -> e.getEntryType() != null && e.getEntryType().name().equals("DEBIT"))
                .map(JournalResponse::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Entries:");
        row.createCell(1).setCellValue(entries.size());
        row.createCell(2).setCellValue("Total Credits:");
        row.createCell(3).setCellValue(totalCredit.doubleValue());
        row.createCell(4).setCellValue("Total Debits:");
        row.createCell(5).setCellValue(totalDebit.doubleValue());
        return rowNum;
    }

    private int addExcelTableHeader(Sheet sheet, int rowNum) {
        String[] headers = {"Date", "Transaction ID", "Particulars", "Counterparty", "Type", "Entry", "Amount"};
        Row row = sheet.createRow(rowNum++);

        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        return rowNum;
    }

    private void addExcelRows(Sheet sheet, int startRow, List<JournalResponse> entries) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        CellStyle creditStyle = sheet.getWorkbook().createCellStyle();
        org.apache.poi.ss.usermodel.Font creditFont = sheet.getWorkbook().createFont();
        creditFont.setColor(IndexedColors.DARK_GREEN.getIndex());
        creditStyle.setFont(creditFont);

        CellStyle debitStyle = sheet.getWorkbook().createCellStyle();
        org.apache.poi.ss.usermodel.Font debitFont = sheet.getWorkbook().createFont();
        debitFont.setColor(IndexedColors.DARK_RED.getIndex());
        debitStyle.setFont(debitFont);

        int rowNum = startRow;
        for (JournalResponse e : entries) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(e.getDate() != null ? e.getDate().format(fmt) : "-");
            row.createCell(1).setCellValue(e.getTransactionId() != null ? e.getTransactionId() : "-");
            row.createCell(2).setCellValue(e.getParticulars() != null ? e.getParticulars() : "-");
            row.createCell(3).setCellValue(e.getCounterpartyName() != null ? e.getCounterpartyName() : "-");
            row.createCell(4).setCellValue(e.getTransactionType() != null ? e.getTransactionType().toString() : "-");

            String entryType = e.getEntryType() != null ? e.getEntryType().toString() : "-";
            org.apache.poi.ss.usermodel.Cell entryCell = row.createCell(5);
            entryCell.setCellValue(entryType);
            entryCell.setCellStyle("CREDIT".equals(entryType) ? creditStyle : debitStyle);

            org.apache.poi.ss.usermodel.Cell amountCell = row.createCell(6);
            amountCell.setCellValue(e.getAmount() != null ? e.getAmount().doubleValue() : 0);
            amountCell.setCellStyle("CREDIT".equals(entryType) ? creditStyle : debitStyle);
        }
    }

    // ======================== CSV ========================

    public void generateCsv(List<JournalResponse> entries, Writer writer) {
        try (CSVWriter csvWriter = new CSVWriter(writer)) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a");

            String[] header = {"Date", "Transaction ID", "Particulars", "Account Number",
                    "Counterparty Account", "Counterparty Name", "Entry Type", "Amount",
                    "Transaction Type", "Channel", "Status", "Remarks"};
            csvWriter.writeNext(header);

            for (JournalResponse e : entries) {
                String[] row = {
                        e.getDate() != null ? e.getDate().format(fmt) : "-",
                        e.getTransactionId() != null ? e.getTransactionId() : "-",
                        e.getParticulars() != null ? e.getParticulars() : "-",
                        e.getAccountNumber() != null ? e.getAccountNumber() : "-",
                        e.getCounterpartyAccountNumber() != null ? e.getCounterpartyAccountNumber() : "-",
                        e.getCounterpartyName() != null ? e.getCounterpartyName() : "-",
                        e.getEntryType() != null ? e.getEntryType().toString() : "-",
                        e.getAmount() != null ? e.getAmount().toString() : "0",
                        e.getTransactionType() != null ? e.getTransactionType().toString() : "-",
                        e.getChannel() != null ? e.getChannel().toString() : "-",
                        e.getStatus() != null ? e.getStatus().toString() : "-",
                        e.getRemarks() != null ? e.getRemarks() : "-"
                };
                csvWriter.writeNext(row);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }

    // ======================== UTIL ========================

    private String formatPdfCurrency(BigDecimal amount) {
        if (amount == null) return "$0.00";
        return String.format("$%,.2f", amount);
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "-";
        return text.length() > maxLen ? text.substring(0, maxLen - 3) + "..." : text;
    }
}
