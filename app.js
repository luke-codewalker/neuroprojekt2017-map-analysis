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

  const selectColumns = (table, indices, header) => {
    const rows = table.slice(header ? 0 : 2);
    return rows.map((row, i) => {
      return row.filter((val, i) => {
        if (indices.find(index => index === i)) {
          return val;
        }
      })
    })
  }

  const reducedTable = selectColumns(data, relevantIndices, false);

  const makeMapMaker = (bgImage, resultContainer) => (row) => {
    console.log(row);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 900;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(bgImage, 0, 0, 1200, 900);

    let maxX = row[0];
    let maxY = row[1];

    let scaledX = [];
    let scaledY = [];

    for (let j = 2; j < row.length; j += 2) {
      if (!isNaN(row[j])) {
        scaledX.push(row[j] / maxX);
        scaledY.push(row[j + 1] / maxY);
      }
    }

    for (let k = 0; k < scaledX.length; k++) {
      ctx.beginPath();
      let r = k + 1;
      ctx.ellipse(scaledX[k] * canvas.width, scaledY[k] * canvas.height, 8 / (r / (r + 3)), 8 / (r / (r + 3)), 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,200,0,0.75)";
      ctx.fill();
      ctx.strokeStyle = "rgb(255,0,0)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "16px sans-serif bold";
      ctx.fillText(r, scaledX[k] * canvas.width - 4, scaledY[k] * canvas.height + 8);
    }

    resultContainer.appendChild(canvas);
  }

  const makeMap = makeMapMaker(document.querySelector('#source-img'), document.querySelector('#results'));


  reducedTable.forEach((row) => {
    makeMap(row);
  });
});

