
/**
 * KAMARAJ COLLEGE - COE BACKEND (GAS)
 * Updated for separated option columns and granular settings.
 */

function doGet(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getQuestions') {
    const qSheet = sheet.getSheetByName("Questions");
    if (!qSheet) return createJsonResponse([]);
    const data = qSheet.getDataRange().getValues();
    const headers = data.shift();
    
    return createJsonResponse(data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = row[i]);
      // Reconstruct options array from separate columns for the frontend
      obj.options = [obj.option1, obj.option2, obj.option3, obj.option4];
      return obj;
    }));
  }
  
  if (action === 'getExams') {
    const eSheet = sheet.getSheetByName("Exams");
    if (!eSheet) return createJsonResponse([]);
    const data = eSheet.getDataRange().getValues();
    const headers = data.shift();
    return createJsonResponse(data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = row[i]);
      return obj;
    }));
  }

  if (action === 'getResults') {
    const rSheet = sheet.getSheetByName("Results");
    if (!rSheet) return createJsonResponse([]);
    const data = rSheet.getDataRange().getValues();
    const headers = data.shift();
    return createJsonResponse(data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = row[i]);
      return obj;
    }));
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'submitExam') {
    const resSheet = sheet.getSheetByName("Results");
    resSheet.appendRow([
      data.rollNo,
      data.examId,
      data.score,
      data.violations,
      new Date().toISOString(),
      JSON.stringify(data.answers),
      data.status || 'SUBMITTED'
    ]);
    return createJsonResponse({status: 'success'});
  }

  if (action === 'saveExamSettings') {
    const examSheet = sheet.getSheetByName("Exams");
    const examData = examSheet.getDataRange().getValues();
    const s = data.settings;
    let rowIdx = -1;
    for (let i = 1; i < examData.length; i++) {
      if (examData[i][0] === s.examId) { rowIdx = i + 1; break; }
    }
    
    const rowValues = [
      s.examId, 
      s.totalTimeMinutes, 
      s.maxViolations, 
      s.partACount, 
      s.partBCount, 
      s.isReviewEnabled ? 1 : 0, 
      s.isReleased ? 1 : 0, 
      s.isCalculatorEnabled ? 1 : 0
    ];
    
    if (rowIdx !== -1) {
      examSheet.getRange(rowIdx, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      examSheet.appendRow(rowValues);
    }
    return createJsonResponse({status: 'success'});
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
