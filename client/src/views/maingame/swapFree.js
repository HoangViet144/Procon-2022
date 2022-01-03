import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Button, Grid } from '@mui/material';
import ImagePieces from './imagePieces';


const SwapFree = ({ initialConfig, rotate, pieces, styleObj, updateDrag, setUpdateDrag, handleRotateBasedOnDrag }) => {
  const [curChoice, setCurChoice] = useState({ id: '' });
  const [localPieces, setLocalPieces] = useState([]);

  useEffect(() => {
    if (pieces.length <= 0) return;
    if (!updateDrag) return;
    setUpdateDrag(false);

    const newLocalPieces = pieces.slice().map(e => e.slice());
    for (let i = 0; i < newLocalPieces.length; i++) {
      for (let j = 0; j < newLocalPieces[0].length; j++) {
        newLocalPieces[i][j] = {
          ...newLocalPieces[i][j],
          rotate: 0
        }
      }
    }

    setLocalPieces(newLocalPieces);
  }, [pieces, updateDrag])

  const handleChoose = (ele) => {
    setCurChoice(cur => {
      if (cur.id === '') {
        console.log(ele)
        return ele;
      }
      if (ele.id === '') return { id: '' };

      const newLocalPieces = localPieces.slice().map(e => e.slice());
      const tmpAr = newLocalPieces.flat();
      const piece1 = tmpAr.filter(e => e.id === cur.id)[0];
      const piece2 = tmpAr.filter(e => e.id === ele.id)[0];
      const index1 = tmpAr.indexOf(piece1);
      const index2 = tmpAr.indexOf(piece2);

      const colSeg = initialConfig.colSegment;
      piece1.indRow = Math.floor(index2 / colSeg);
      piece1.indCol = index2 % colSeg;
      piece2.indRow = Math.floor(index1 / colSeg);
      piece2.indCol = index1 % colSeg;

      newLocalPieces[Math.floor(index1 / colSeg)][index1 % colSeg] = piece2;
      newLocalPieces[Math.floor(index2 / colSeg)][index2 % colSeg] = piece1;
      setLocalPieces(newLocalPieces);

      return { id: '' }
    })
  }

  const handleRotate = () => {
    if (curChoice.id === '') return;
    console.log(curChoice)
    const newLocalPieces = localPieces.slice().map(e => e.slice())
    const curPiece = newLocalPieces[curChoice.indRow][curChoice.indCol];
    curPiece.rotate = (curPiece.rotate + 1) % 4;
    setLocalPieces(newLocalPieces);

    handleRotateBasedOnDrag(curPiece.id, curPiece.rotate);
  }

  return (
    <Grid container alignItems='center'>
      <Grid item>
        <ImagePieces
          colSegment={initialConfig.colSegment}
          rotate={rotate}
          zoom={initialConfig.width > 1000 ? 0.4 : 1}
          curChoice={curChoice}
          setCurChoice={handleChoose}
          pieces={localPieces}
          styleObj={{ ...styleObj, marginTop: 50 }}
        />
      </Grid>
      <Grid item>
        <Button variant='outlined' onClick={() => handleRotate()}>90 swap</Button>
      </Grid>
    </Grid>
  )
}

SwapFree.propTypes = {
  initialConfig: PropTypes.object.isRequired,
  rotate: PropTypes.array.isRequired,
  pieces: PropTypes.array.isRequired,
  styleObj: PropTypes.object.isRequired,
  updateDrag: PropTypes.bool.isRequired,
  setUpdateDrag: PropTypes.func.isRequired,
  handleRotateBasedOnDrag: PropTypes.func.isRequired
}
export default SwapFree;