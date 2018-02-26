const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsText(file);
  });
}

const parseCSVtoTable = (rawString) => {
  // get rid of weird escaped whitespace
  const csvString = rawString.replace(/\"/g, '')
  const rows = csvString.split(/\r\n/);
  return table = rows.map((row, i) => {
    // description row contains commas in items and needs to be handled with positive lookahead
    return i !== 1 ? row.split(',') : row.split(/,(?=\S)/);
  });
}

const makeShowOptions = (display) => (data) => {
  data[0].forEach((name, i) => {
    const nameOption = document.createElement('div');
    nameOption.innerHTML = `
    <input type="checkbox" id="${name}">
    <label title="${data[1][i]}" for="${name}">${name}</label>
    `
    display.appendChild(nameOption);
  });
};

const showOptions = makeShowOptions(document.querySelector('.options'));

const dataUpload = document.querySelector('#upload');
const analyzeBtn = document.querySelector('#analyze');
let data;

dataUpload.addEventListener('change', (e) => {
  parseFile(e.target.files[0])
    .then(result => parseCSVtoTable(result))
    .then(table => {
      data = table;
      showOptions(data);
    })
})

analyzeBtn.addEventListener('click', () => {
  const checkedList = Array.from(document.querySelectorAll('.options input:checked'));
  const checkedVarNames = checkedList.map(input => input.id);
  const relevantIndices = data[0].reduce((indices, varName, i) => {
    if (checkedVarNames.find(name => name === varName)) {
      indices.push(i);
    }
    return indices;
  }, []);
})
