function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  const ss = SpreadsheetApp.openById("1bD4OMn2it1Gp36x8-Bsj0PdWQwl8vs2-B5cc2s9Sn2Y");
  const sheet = ss.getSheetByName("カテゴリ出力用");

  const last = sheet.getLastRow();
  const values = sheet.getRange(1, 1, last, 1).getValues(); // 品番がA列にある場合

  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === data.sku) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return ContentService.createTextOutput("NOT_FOUND");
  }

  // D〜J列に書き込み
  sheet.getRange(targetRow, 4).setValue(data.cat1);
  sheet.getRange(targetRow, 5).setValue(data.cat2);
  sheet.getRange(targetRow, 6).setValue(data.cat3);
  sheet.getRange(targetRow, 7).setValue(data.cat4);
  sheet.getRange(targetRow, 8).setValue(data.cat5);
  sheet.getRange(targetRow, 9).setValue(data.cat6);

  return ContentService.createTextOutput("OK");
}
