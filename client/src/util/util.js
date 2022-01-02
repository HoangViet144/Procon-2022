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