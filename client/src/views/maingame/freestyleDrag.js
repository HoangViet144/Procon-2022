import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { styled } from '@mui/system';

const StyledCanvas = styled('canvas')((props) => ({
  borderWidth: 1,
  borderColor: 'black',
  borderStyle: 'solid',
  marginTop: 50,
}));

class Rectangle {
  constructor(x, y, indRow, indCol) {
    this.indRow = indRow;
    this.indCol = indCol;
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.initialWidth = 0;
    this.initialHeight = 0;
    this.isDragging = false;
  }

  render = function (ctx, piece, zoom = 1) {
    let img = new Image;
    img.onload = () => {
      this.width = img.width * zoom;
      this.height = img.height * zoom;
      this.initialHeight = img.height;
      this.initialWidth = img.width;
      ctx.drawImage(img, this.x, this.y, img.width * zoom, img.height * zoom);
    };
    img.src = piece.imageUri;
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

const FreeStyleDrag = ({ pieces, zoom, width, height, updateDrag, setUpdateDrag, handleRotateBasedOnDrag }) => {
  const [localPieces, setLocalPieces] = useState([]);
  const canvasRef = useRef();

  const rotatePiece = (rectangle) => {
    const curPiece = { ...localPieces[rectangle.indRow][rectangle.indCol] };

    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);

    tmpCanvas.width = rectangle.initialWidth;
    tmpCanvas.height = rectangle.initialHeight;

    let img = new Image;
    img.onload = () => {
      tmpCtx.drawImage(img, 0, 0);
    };
    img.src = curPiece.initialImgUri;

    tmpCtx.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);

    curPiece.rotate = (curPiece.rotate + 1) % 4;
    tmpCtx.rotate(curPiece.rotate * 90 * Math.PI / 180);
    tmpCtx.drawImage(img, -img.width / 2, -img.height / 2);

    curPiece.imageUri = tmpCanvas.toDataURL();

    localPieces[rectangle.indRow][rectangle.indCol] = curPiece;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    rectangle.render(ctx, curPiece, zoom);

    handleRotateBasedOnDrag(curPiece.id, curPiece.rotate);
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
        const rectangle = new Rectangle(j * pieceWidth * zoom, i * pieceHeight * zoom, i, j);
        rectangle.render(ctx, pieces[i][j], zoom);
        rectangleLst.push(rectangle);
      }
    }

    let touchBeganX = 0;
    let touchBeganY = 0;
    const mtt = new MouseTouchTracker(canvas,
      function (evtType, x, y) {
        let reRender = false;
        switch (evtType) {
          case 'down':
            startX = x;
            startY = y;
            touchBeganX = x;
            touchBeganY = y;

            for (let rectangle of rectangleLst) {
              if (isHit(rectangle, x, y)) {
                reRender = true;
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
                reRender = true;
                rectangle.x += dx;
                rectangle.y += dy;
                break;
              }
            }

            break;
        }

        if (!reRender) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            let index = i * cols + j;
            rectangleLst[index].render(ctx, pieces[i][j], zoom);
          }
        }
      }
    );
  }

  useEffect(() => {
    if (pieces.length <= 0) return;
    if (!updateDrag) return;
    setUpdateDrag(false);
    const newMatrixPieces = pieces.slice().map(ele => ele.slice());
    for (let i = 0; i < newMatrixPieces.length; i++) {
      for (let j = 0; j < newMatrixPieces[0].length; j++) {
        newMatrixPieces[i][j] = {
          ...newMatrixPieces[i][j],
          initialImgUri: newMatrixPieces[i][j].imageUri,
          rotate: 0
        }
      }
    }

    setLocalPieces(newMatrixPieces);

  }, [pieces, updateDrag])

  useEffect(() => {
    if (localPieces.length <= 0) return;
    drawPieces(localPieces);
  }, [localPieces])

  return (
    <StyledCanvas ref={canvasRef} width={width * 1.5} height={height * 1.5} />
  )
}

FreeStyleDrag.propTypes = {
  pieces: PropTypes.array.isRequired,
  zoom: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  updateDrag: PropTypes.bool.isRequired,
  setUpdateDrag: PropTypes.func.isRequired,
  handleRotateBasedOnDrag: PropTypes.func.isRequired
}

export default FreeStyleDrag;
