import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { styled } from '@mui/system';

import { rotateMatrix90 } from "src/util/util";

const StyledCanvas = styled('canvas')({
  borderWidth: 1,
  borderColor: 'black',
  borderStyle: 'solid',
  marginTop: 50
});

class Rectangle {
  constructor(x, y, indRow, indCol) {
    this.indRow = indRow;
    this.indCol = indCol;
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.isDragging = false;
  }

  render = function (ctx, piece) {
    const data = piece.data;
    let width = data[0].length;
    let height = data.length;
    this.width = width;
    this.height = height;

    const img = ctx.getImageData(this.x, this.y, width, height);
    const pixels = img.data;

    const flattenData = data.flat();
    let imageIndex = 0;
    for (let i = 0; i < flattenData.length; i++) {
      pixels[imageIndex++] = flattenData[i].r; // r
      pixels[imageIndex++] = flattenData[i].g; // g
      pixels[imageIndex++] = flattenData[i].b; // b
      pixels[imageIndex++] = 255; // a
    }
    ctx.putImageData(img, this.x, this.y);
  }
}

let MouseTouchTracker = function (canvas, callback) {
  function processEvent(evt) {
    let rect = canvas.getBoundingClientRect();
    let offsetTop = rect.top;
    let offsetLeft = rect.left;

    if (evt.touches) {
      return {
        x: evt.touches[0].clientX - offsetLeft,
        y: evt.touches[0].clientY - offsetTop
      }
    } else {
      return {
        x: evt.clientX - offsetLeft,
        y: evt.clientY - offsetTop
      }
    }
  }

  function onDown(evt) {
    evt.preventDefault();
    let coords = processEvent(evt);
    callback('down', coords.x, coords.y);
  }

  function onUp(evt) {
    evt.preventDefault();
    callback('up');
  }

  function onMove(evt) {
    evt.preventDefault();
    let coords = processEvent(evt);
    callback('move', coords.x, coords.y);
  }

  canvas.ontouchmove = onMove;
  canvas.onmousemove = onMove;

  canvas.ontouchstart = onDown;
  canvas.onmousedown = onDown;
  canvas.ontouchend = onUp;
  canvas.onmouseup = onUp;
}

const isHit = (shape, x, y) => {
  if (x > shape.x && y > shape.y && x < shape.x + shape.width && y < shape.y + shape.height) {
    return true;
  }

  return false;
}

const FreeStyleDrag = ({ pieces }) => {
  const [localPieces, setLocalPieces] = useState([]);
  const canvasRef = useRef();

  const rotatePiece = (rectangle) => {
    const curPieceMatrix = [...localPieces];
    const curPiece = { ...localPieces[rectangle.indRow][rectangle.indCol] };
    curPiece.data = rotateMatrix90(curPiece.data);
    curPieceMatrix[rectangle.indRow][rectangle.indCol] = curPiece;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    rectangle.render(ctx, curPiece)
  }

  const drawPieces = (pieces) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startX = 0;
    let startY = 0;

    const rectangleLst = [];

    const pieceWidth = pieces[0][0].data[0].length;
    const pieceHeight = pieces[0][0].data.length;
    const rows = pieces.length;
    const cols = pieces[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const rectangle = new Rectangle(j * pieceWidth, i * pieceHeight, i, j);
        rectangle.render(ctx, pieces[i][j]);
        rectangleLst.push(rectangle);
      }
    }

    let touchBeganX = 0;
    let touchBeganY = 0;
    const mtt = new MouseTouchTracker(canvas,
      function (evtType, x, y) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (evtType) {
          case 'down':
            startX = x;
            startY = y;
            touchBeganX = x;
            touchBeganY = y;

            for (let rectangle of rectangleLst) {
              if (isHit(rectangle, x, y)) {
                rectangle.isDragging = true;
                break;
              }
            }
            break;
          case 'up':
            if (Math.abs(touchBeganX - startX) <= 5 && Math.abs(touchBeganY - startY) <= 5) {
              for (let rectangle of rectangleLst) {
                if (rectangle.isDragging) {
                  rotatePiece(rectangle);
                  break;
                }
              }
            }

            for (let rectangle of rectangleLst) {
              rectangle.isDragging = false;
            }
            break;
          case 'move':
            let dx = x - startX;
            let dy = y - startY;
            startX = x;
            startY = y;

            for (let rectangle of rectangleLst) {
              if (rectangle.isDragging) {
                rectangle.x += dx;
                rectangle.y += dy;
                break;
              }
            }
            break;
        }

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            let index = i * cols + j;
            rectangleLst[index].render(ctx, pieces[i][j]);
          }
        }
      }
    );
  }

  useEffect(() => {
    if (pieces.length <= 0) return;
    if (localPieces.length > 0) return;
    setLocalPieces(pieces.slice().map(ele => ele.slice()));

  }, [pieces])

  useEffect(() => {
    if (localPieces.length <= 0) return;
    drawPieces(localPieces);
  }, [localPieces])

  return (
    <StyledCanvas ref={canvasRef} width="1000" height="1000" />
  )
}

FreeStyleDrag.propTypes = {
  pieces: PropTypes.array.isRequired,
}

export default FreeStyleDrag;
