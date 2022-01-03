export const rotateMatrix90 = (matrix) => {
  const m = matrix.length;
  const n = matrix[0].length;
  const resMatrix = []
  for (let i = 0; i < n; i++) {
    let row = [];
    for (let j = 0; j < m; j++) {
      row.push({});
    }
    resMatrix.push(row);
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      resMatrix[n - 1 - j][i] = matrix[i][j];
    }
  }
  return resMatrix;
}

export const rotateMatrix180 = (matrix) => {
  const m = matrix.length;
  const n = matrix[0].length;
  const resMatrix = []
  for (let i = 0; i < m; i++) {
    let row = [];
    for (let j = 0; j < n; j++) {
      row.push({});
    }
    resMatrix.push(row);
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      resMatrix[m - 1 - i][n - 1 - j] = matrix[i][j];
    }
  }
  return resMatrix;
}

export const rotateMatrix270 = (matrix) => {
  let matrixRotate90 = rotateMatrix90(matrix);
  return rotateMatrix180(matrixRotate90);
}

export const createImageURI = (data) => {
  if (data.length === 0) {
    console.log("canvas width is 0");
    return;
  }

  let width = data[0].length;
  let height = data.length;

  const flattenData = data.flat();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = width;
  canvas.height = height;

  const img = ctx.getImageData(0, 0, width, height);
  const pixels = img.data;

  let imageIndex = 0;
  for (let i = 0; i < flattenData.length; i++) {
    pixels[imageIndex++] = flattenData[i].r; // r
    pixels[imageIndex++] = flattenData[i].g; // g
    pixels[imageIndex++] = flattenData[i].b; // b
    pixels[imageIndex++] = 255; // a
  }
  ctx.putImageData(img, 0, 0);

  return canvas.toDataURL();
}