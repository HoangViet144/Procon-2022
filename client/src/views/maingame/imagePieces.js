import {
  Grid,
  ToggleButton
} from '@mui/material';
import { styled } from '@mui/system';
import PropTypes from 'prop-types';

import ImagePreview from "./imagePreview";

const StyledToggleButton = styled(ToggleButton)((props) => ({
  padding: props.padding,
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "white",
    backgroundColor: '#00ff00',
    opacity: 0.2
  }
}));

const StyledGrid = styled(Grid)((props) => ({
  zoom: props.zoom
}));


const ImagePieces = ({ pieces, curChoice, setCurChoice, styleObj, zoom, rotate, colSegment }) => {
  const getRotateAngle = (ele) => {
    let indCol = +ele.id.substring(0, ele.id.indexOf("-"));
    let indRow = +ele.id.substring(ele.id.indexOf("-") + 1);

    const rotateInd = indRow * colSegment + indCol;
    return rotate[rotateInd];
  }
  return (
    <StyledGrid container item spacing={styleObj.spacing} zoom={zoom}>
      {pieces.map((row, indR) => (
        <Grid container item spacing={styleObj.spacing} key={indR}>
          {row.map((ele, ind) => (
            <Grid item key={ind}>
              <StyledToggleButton
                selected={curChoice.id === ele.id}
                value={ele.id}
                padding={styleObj.padding}
                onChange={() => curChoice.id === ele.id ? setCurChoice({ id: '' }) : setCurChoice({ id: ele.id, indCol: ele.indCol, indRow: ele.indRow })}
              >
                <ImagePreview
                  imageUri={ele.imageUri}
                  rotateAngle={getRotateAngle(ele)}
                />
                {!styleObj.hideId && <span>{ele.displayId}</span>}
              </StyledToggleButton>
            </Grid>
          ))}
        </Grid>
      ))}
    </StyledGrid>
  )
}

ImagePieces.propTypes = {
  pieces: PropTypes.array.isRequired,
  curChoice: PropTypes.object.isRequired,
  setCurChoice: PropTypes.func.isRequired,
  styleObj: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
  rotate: PropTypes.array.isRequired,
  colSegment: PropTypes.number.isRequired
}
export default ImagePieces;