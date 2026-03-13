const fs = require('fs');

const txtContent = fs.readFileSync('../Tong hop.txt', 'utf8');
const lines = txtContent.split(/\r?\n/);

const cungNames = [
  "MỆNH", "PHỤ MẪU", "PHÚC ĐỨC", "ĐIỀN TRẠCH", "QUAN LỘC", "NÔ BỌC", "NÔ BỘC", 
  "THIÊN DI", "TẬT ÁCH", "TÀI BẠCH", "TỬ TỨC", "PHU THÊ", "HUYNH ĐỆ", "SÁU VỊ TRÍ CỦA CUNG THÂN"
];

let currentCung = null;
const cungTexts = {};

for (let line of lines) {
  let trimmed = line.trim();
  let upper = trimmed.toUpperCase();
  
  let found = false;
  for (let name of cungNames) {
    if (upper === `CUNG ${name}`) {
      currentCung = name === "NÔ BỌC" ? "NÔ BỘC" : name;
      found = true;
      if (!cungTexts[currentCung]) cungTexts[currentCung] = [];
      break;
    }
  }
  
  if (!found && currentCung && !currentCung.includes("SÁU VỊ TRÍ")) {
    cungTexts[currentCung].push(line);
  }
}

const dataJsContent = fs.readFileSync('./src/data.js', 'utf8');

// Extract current array
let match = dataJsContent.match(/export const tuViData = (\[[\s\S]*?\]);/);
if (match) {
  let arr = eval('(' + match[1] + ')');
  
  const MAPPING = {
    "Mệnh": "MỆNH",
    "Phụ Mẫu": "PHỤ MẪU",
    "Phúc Đức": "PHÚC ĐỨC",
    "Điền Trạch": "ĐIỀN TRẠCH",
    "Quan Lộc": "QUAN LỘC",
    "Nô Bộc": "NÔ BỘC",
    "Thiên Di": "THIÊN DI",
    "Tật Ách": "TẬT ÁCH",
    "Tài Bạch": "TÀI BẠCH",
    "Tử Tức": "TỬ TỨC",
    "Phu Thê": "PHU THÊ",
    "Huynh Đệ": "HUYNH ĐỆ"
  };

  arr.forEach(item => {
    let key = MAPPING[item.name];
    if (cungTexts[key]) {
      item.detailedDescription = cungTexts[key].join('\n').trim();
    }
  });

  let newContent = `export const tuViData = ${JSON.stringify(arr, null, 2)};\n`;
  fs.writeFileSync('./src/data.js', newContent, 'utf8');
  console.log("Successfully updated data.js");
} else {
  console.log("Could not parse data.js");
}
