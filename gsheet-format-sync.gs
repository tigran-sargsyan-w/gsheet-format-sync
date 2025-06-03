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

      console.log(`🔄 Синхронизация листа: ${name}...`);

      // 💥 Очистка форматирования
      sheet.clearFormats();

      // ❄️ Установка фиксации
      sheet.setFrozenRows(frozenRows);
      sheet.setFrozenColumns(frozenCols);

      // 📐 Обеспечение нужного размера
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

      // 🔁 Копируем зафиксированные строки (все колонки)
      if (frozenRows > 0) {
        const source = template.getRange(1, 1, frozenRows, NUM_COLS);
        const target = sheet.getRange(1, 1, frozenRows, NUM_COLS);
        source.copyTo(target, { formatOnly: false });
      }

      // 🔁 Копируем зафиксированные столбцы (все строки)
      if (frozenCols > 0) {
        const source = template.getRange(1, 1, NUM_ROWS, frozenCols);
        const target = sheet.getRange(1, 1, NUM_ROWS, frozenCols);
        source.copyTo(target, { formatOnly: false });
      }

      // 🎨 Копируем формат всего диапазона
      const targetRange = sheet.getRange(1, 1, NUM_ROWS, NUM_COLS);
      templateRange.copyTo(targetRange, { formatOnly: true });

      // ↔️ Ширина столбцов
      for (let col = 1; col <= NUM_COLS; col++) {
        const width = template.getColumnWidth(col);
        sheet.setColumnWidth(col, width);
      }

      // ↕️ Высота строк
      for (let row = 1; row <= NUM_ROWS; row++) {
        const height = template.getRowHeight(row);
        sheet.setRowHeight(row, height);
      }

      // 🔗 Объединения
      for (const range of mergedRanges) {
        const row = range.getRow();
        const col = range.getColumn();
        const rSpan = range.getNumRows();
        const cSpan = range.getNumColumns();
        sheet.getRange(row, col, rSpan, cSpan).merge();
      }

      console.log(`✅ Готово: ${name}`);
    } catch (e) {
      console.error(`❌ Ошибка при обработке ${name}: ${e}`);
    }
  }
}

// 🔠 Перевод буквы столбца в индекс (например, "K" → 11)
function columnLetterToIndex(letter) {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col *= 26;
    col += letter.charCodeAt(i) - 64;
  }
  return col;
}
