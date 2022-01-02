import { useRef, useEffect } from "react";
import PropTypes from 'prop-types';

const ImagePreview = ({ width, height, data, ...rest }) => {
  const canvasRef = useRef();

  useEffect(() => {
    processPPM(width, height, data);
  });


  const processPPM = (width, height, data) => {
    if (width === 0 || height === 0) {
      console.log("canvas width is 0");
      return;
    }

    width = data[0].length;
    height = data.length;

    const flattenData = data.flat();

    const canvas = canvasRef.current;
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
  }

  return (
    <canvas ref={canvasRef} width="100" height="100" />
  )
}

ImagePreview.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
};

export default ImagePreview;