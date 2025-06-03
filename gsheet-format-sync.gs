function syncTemplateToCountrySheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const template = ss.getSheetByName("Template");

  // ✏️ Settings
  const countrySheetNames = ["FR", "IT"];

  // 🪢 Up to which row and column to synchronize
  const NUM_ROWS = 13;
  const LAST_COLUMN = "U";
  const NUM_COLS = columnLetterToIndex(LAST_COLUMN);

  const templateRange = template.getRange(1, 1, NUM_ROWS, NUM_COLS);
  const mergedRanges = templateRange.getMergedRanges();

  // ❄️ Freeze settings
  const frozenRows = template.getFrozenRows();
  const frozenCols = template.getFrozenColumns();

  for (const name of countrySheetNames) {
    try {
      const sheet = ss.getSheetByName(name);
      if (!sheet) {
        console.warn(`⚠️ Sheet "${name}" not found — skipped`);
        continue;
      }

      console.log(`🔄 Synchronizing sheet: ${name}...`);

      // 💥 Clear formatting
      sheet.clearFormats();

      // ❄️ Set freeze panes
      sheet.setFrozenRows(frozenRows);
      sheet.setFrozenColumns(frozenCols);

      // 📐 Ensure correct sheet size
      if (sheet.getMaxRows() < NUM_ROWS)
        sheet.insertRowsAfter(
          sheet.getMaxRows(),
          NUM_ROWS - sheet.getMaxRows()
        );
      if (sheet.getMaxColumns() < NUM_COLS)
        sheet.insertColumnsAfter(
          sheet.getMaxColumns(),
          NUM_COLS - sheet.getMaxColumns()
        );

      // 🔁 Copy frozen rows (all columns) with all datas
      if (frozenRows > 0) {
        const source = template.getRange(1, 1, frozenRows, NUM_COLS);
        const target = sheet.getRange(1, 1, frozenRows, NUM_COLS);
        source.copyTo(target, { formatOnly: false });
      }

      // 🔁 Copy frozen columns (all rows) with all datas
      if (frozenCols > 0) {
        const source = template.getRange(1, 1, NUM_ROWS, frozenCols);
        const target = sheet.getRange(1, 1, NUM_ROWS, frozenCols);
        source.copyTo(target, { formatOnly: false });
      }

      // 🎨 Copy format of the entire range
      const targetRange = sheet.getRange(1, 1, NUM_ROWS, NUM_COLS);
      templateRange.copyTo(targetRange, { formatOnly: true });

      // ↔️ Setting Column widths
      for (let col = 1; col <= NUM_COLS; col++) {
        const width = template.getColumnWidth(col);
        sheet.setColumnWidth(col, width);
      }

      // ↕️ Setting Row heights
      for (let row = 1; row <= NUM_ROWS; row++) {
        const height = template.getRowHeight(row);
        sheet.setRowHeight(row, height);
      }

      // 🔗 Merged ranges
      for (const range of mergedRanges) {
        const row = range.getRow();
        const col = range.getColumn();
        const rSpan = range.getNumRows();
        const cSpan = range.getNumColumns();
        sheet.getRange(row, col, rSpan, cSpan).merge();
      }

      console.log(`✅ Done: ${name}`);
    } catch (e) {
      console.error(`❌ Error processing ${name}: ${e}`);
    }
  }
}

// 🔠 Convert column letter to index (e.g., "K" → 11)
function columnLetterToIndex(letter) {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col *= 26;
    col += letter.charCodeAt(i) - 64;
  }
  return col;
}
