import * as XLSX from 'xlsx';


export function exportToCSV(propList) {
  let text = `Name;Type;Description;Fill rule;Required\n`;
  propList.forEach(line => {
    text += `${line.propertyName};${line.type};${line.description};${line.fillRule};${line.required}\n`
  });
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'payload-checker.csv');
  link.click();
}

export function exportToXLSX(propList) {
  const propFiltered = propList.map(p => {
    return {
      'Name': p.propertyName,
      'Type': p.type,
      'Description': p.description,
      'Fill rule': p.fillRule,
      'Required': p.required
    }
  });
  const sheet = XLSX.utils.json_to_sheet(propFiltered);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Sheet1');
  const xlsDocument = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
  const blob = new Blob([xlsDocument], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'payload-checker.xlsx');
  link.click();
}

export function exportToTXT(propList) {
  let text = `Name\tType\tDescription\tFill rule\tRequired\n`;
  propList.forEach(line => {
    text += `${line.propertyName}\t${line.type}\t${line.description}\t${line.fillRule}\t${line.required}\n`
  });
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'payload-checker.txt');
  link.click();
}
