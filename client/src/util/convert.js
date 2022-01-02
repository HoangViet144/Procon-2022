let newMaxVal = 255;

const error = (msg) => {
  console.log(msg)
};

const assert = (condition, msg) => {
  if (!condition) {
    error(msg);
  }
};

const toString = (charCodeArray) => {
  return charCodeArray.map(function (code) {
    return String.fromCharCode(code);
  }).join("");
};

const whitespace = Array(256).fill(false);
whitespace[9] = true;
whitespace[10] = true;
whitespace[11] = true;
whitespace[12] = true;
whitespace[32] = true;

const isWhitespace = (charCode) => {
  return whitespace[charCode];
};

export const convertP6toP3 = async (p6File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      try {
        const buffer = fileReader.result;
        const view = new Uint8Array(buffer);

        // Extract magic number - "P6"
        const magicNumber = toString([view[0], view[1]]);
        assert(magicNumber === "P6", "This program can only convert images from the P6 format (your format: " + magicNumber + ")");

        let i = 2;

        // drop out # character
        while (isWhitespace(view[i])) i++;
        i++;
        while (isWhitespace(view[i])) i++;

        // Extract num of segment
        const colSegChars = [];
        while (!isWhitespace(view[i])) {
          colSegChars.push(view[i]);
          i++;
        }
        const colSegment = parseInt(toString(colSegChars), 10);

        while (isWhitespace(view[i])) i++;

        const rowSegChars = [];
        while (!isWhitespace(view[i])) {
          rowSegChars.push(view[i]);
          i++;
        }
        const rowSegment = parseInt(toString(rowSegChars), 10);

        // Drop out # character.
        while (isWhitespace(view[i])) i++;
        i++;
        while (isWhitespace(view[i])) i++;

        // Extract max choice
        const choiceChars = [];
        while (!isWhitespace(view[i])) {
          choiceChars.push(view[i]);
          i++;
        }
        const maxChoice = parseInt(toString(choiceChars), 10);

        // Drop out # character.
        while (isWhitespace(view[i])) i++;
        i++;
        while (isWhitespace(view[i])) i++;

        // Extract cost
        const chooseCostChars = [];
        while (!isWhitespace(view[i])) {
          chooseCostChars.push(view[i]);
          i++;
        }
        const chooseCost = parseInt(toString(chooseCostChars), 10);

        while (isWhitespace(view[i])) i++;

        const swapCostChars = [];
        while (!isWhitespace(view[i])) {
          swapCostChars.push(view[i]);
          i++;
        }
        const swapCost = parseInt(toString(swapCostChars), 10);

        // Drop out # character.
        while (isWhitespace(view[i])) i++;
        i++;
        while (isWhitespace(view[i])) i++;

        // Extract the width.
        const widthChars = [];
        while (!isWhitespace(view[i])) {
          widthChars.push(view[i]);
          i++;
        }
        assert(i < view.length, "File is too short: expected more data");
        const width = parseInt(toString(widthChars), 10);
        assert(isFinite(width) && width > 0, "Invalid width specified in PPM file");

        while (isWhitespace(view[i])) i++;

        // Extract the height.
        const heightChars = [];
        while (!isWhitespace(view[i])) {
          heightChars.push(view[i]);
          i++;
        }
        assert(i < view.length, "File is too short: expected more data");
        const height = parseInt(toString(heightChars), 10);
        assert(isFinite(height) && height > 0, "Invalid height specified in PPM file");

        while (isWhitespace(view[i])) i++;

        // Extract the maximum color value.
        const maxValChars = [];
        while (!isWhitespace(view[i])) {
          maxValChars.push(view[i]);
          i++;
        }
        ++i; // Skip the only whitespace character
        assert(i < view.length, "File is too short: expected more data");
        const maxVal = parseInt(toString(maxValChars), 10);
        assert(0 < maxVal && maxVal < 65536, "Maximum color value is not within the range (0, 65536)");
        const wideValues = maxVal >= 256;

        const imageData = [];
        let tmp = [];

        // Convert the binary P6 data into ASCII P3 data and append it to the file.
        let pixelNumber = 0;
        while (i < view.length) {
          tmp.push(Math.round(view[i] / maxVal * newMaxVal));
          ++pixelNumber;
          if ((pixelNumber / 3) % width === 0) {
            imageData.push(tmp);
            tmp = [];
          }
          i += wideValues ? 2 : 1;
        }
        assert(i == view.length, "Actual number of pixels did not match specified width and height");

        resolve({
          width: width,
          height: height,
          rowSegment: rowSegment,
          colSegment: colSegment,
          maxChoice: maxChoice,
          chooseCost: chooseCost,
          swapCost: swapCost,
          imageData: convertToRGBArray(imageData)
        });
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
    fileReader.readAsArrayBuffer(p6File);
  });
};

const convertToRGBArray = (imageData) => {
  const rgbAr = [];
  for (let row of imageData) {
    let rgbRow = [];
    for (let i = 0; i < row.length; i += 3) {
      rgbRow.push({
        r: row[i],
        g: row[i + 1],
        b: row[i + 2]
      });
    }
    rgbAr.push(rgbRow);
  }
  return rgbAr;
}