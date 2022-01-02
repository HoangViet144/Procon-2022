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
const ImagePieces = ({ pieces, curChoice, setCurChoice, styleObj }) => {
  return (
    <Grid container item spacing={styleObj.spacing}>
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
                  width={ele.width}
                  height={ele.height}
                  data={ele.data}
                />
                {!styleObj.hideId && <span>{ele.displayId}</span>}
              </StyledToggleButton>
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  )
}

ImagePieces.propTypes = {
  pieces: PropTypes.array.isRequired,
  curChoice: PropTypes.object.isRequired,
  setCurChoice: PropTypes.func.isRequired,
  styleObj: PropTypes.object.isRequired
}
export default ImagePieces;