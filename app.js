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
    // description row contains sentences with commas so we need a negative lookahead
    return row.split(/,(?!\s)/);
  });
}

const makeShowOptions = (selectMenu) => (data) => {
  while(selectMenu.firstChild) {
    selectMenu.removeChild(selectMenu.firstChild);
  }

  data[0].forEach((name, i) => {
    selectMenu.innerHTML += `
    <option value="${name}">${name}</label>
    `
    });
};

const showOptions = makeShowOptions(document.querySelector('select#subject'));

const imgUpload = document.querySelector('#uploadImg');
const dataUpload = document.querySelector('#uploadData');
const analyzeForm = document.querySelector('form');
let data;

if(dataUpload.files[0]) {
  document.querySelector('#dataFileName').innerText = dataUpload.files[0].name;
  parseFile(dataUpload.files[0])
  .then(result => parseCSVtoTable(result))
  .then(table => {
    data = table;
    showOptions(data);
  })
}

dataUpload.addEventListener('change', (e) => {
  document.querySelector('#dataFileName').innerText = e.target.files[0].name;
  parseFile(e.target.files[0])
    .then(result => parseCSVtoTable(result))
    .then(table => {
      data = table;
      showOptions(data);
    })
})

if(imgUpload.files[0]) {
  document.querySelector('#imgFileName').innerText = imgUpload.files[0].name;  
  document.querySelector('#source-img').src = URL.createObjectURL(imgUpload.files[0]);
}

imgUpload.addEventListener('change', (e) => {
  document.querySelector('#imgFileName').innerText = e.target.files[0].name;    
  document.querySelector('#source-img').src = URL.createObjectURL(e.target.files[0]);
})

analyzeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const secondHeader = document.querySelector('#secondHeaderCheck:checked') !== null;
  const dataVarName = document.querySelector('input[name="data"]').value;
  const select = document.querySelector('#subject');
  const idVarName = select.options[select.selectedIndex].value;
  const resultsDisplay = document.querySelector('#results');

  while(resultsDisplay.firstChild) {
    resultsDisplay.removeChild(resultsDisplay.firstChild);
  }

  const dataIndices = data[0].reduce((indices, name, i) => {
    const match = name.match(dataVarName);
    if(match !== null){
      indices.push(i);
    }
    return indices;
  }, []);

  const idIndex = data[0].findIndex(name => name === idVarName);

  const selectColumns = (table, indices, startRow) => {
    const rows = table.slice(startRow);

    return rows.map((row, i) => {
      return row.filter((val, i) => {
        if (undefined !== indices.find(index => index === i)) {
          return val;
        }
      })
    })
  }

  const reducedTable = selectColumns(data, dataIndices, secondHeader ? 2 : 1);
  const labelArray = selectColumns(data, [idIndex], secondHeader ? 2 : 1);
  
  const makeMapMaker = (bgImage, resultContainer) => (label, row) => {
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

    const createUrlfromCanvas = (canvas) => {
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          resolve(URL.createObjectURL(blob));
        }, 'image/png');
      }); 
    }

    createUrlfromCanvas(canvas)
    .then(url => {
      const result = document.createElement('div');
      result.classList.add('result');

      const labelInfo = document.createElement('span');
      labelInfo.innerText = label;
      result.appendChild(labelInfo);
      
      const img = document.createElement('img');
      img.setAttribute('width','120');
      img.setAttribute('height','90');
      img.setAttribute('src',url);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${label}.png`);
      link.setAttribute('type','image/png'); 
      link.innerText = 'Download';

      result.appendChild(img);
      result.appendChild(link);

      resultContainer.appendChild(result);
    })
  }

  const makeMap = makeMapMaker(document.querySelector('#source-img'), resultsDisplay);

  reducedTable.forEach((row, i) => {
    makeMap(labelArray[i][0], row);
  });
});

