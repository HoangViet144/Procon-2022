import {
  Button,
  Grid,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const BTN_VALUE = {
  UNDO: 1,
  REDO: 2,
  LEFT: 3,
  RIGHT: 4,
  UP: 5,
  DOWN: 6,
  NORMAL_ACT: 7
};

export const ROTATE_ANGLE = {
  DEG90: 1,
  DEG180: 2,
  DEG270: 3
};

const ControlBlock = ({ getImage, answer, handleAction, handleRotate, handleUndoAction, handleRedoAction, maxChoice,
  costSwap, costChoose, toggleStyle, toggleShowId, pieceWidth, pieceHeight, serverInfo }) => {
  const [finalAnswer, setFinalAnswer] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [serverResponse, setServerResponse] = useState({ wrongLoc: 0, wrongSwap: 0 })

  const sendAnswer = async () => {
    try {
      const res = await axios({
        method: 'POST',
        url: serverInfo.domain,
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(finalAnswer)
      })

      console.log(res)
    } catch (err) {
      console.log(err)
    }
  }

  const btnList = [
    [
      { icon: "Get image", value: null, func: getImage },
      { icon: "Send response", func: sendAnswer }
    ],
    [
      { icon: <UndoIcon />, value: BTN_VALUE.UNDO, func: handleUndoAction },
      { icon: <KeyboardArrowUpIcon />, value: BTN_VALUE.UP, func: handleAction },
      { icon: <RedoIcon />, value: BTN_VALUE.REDO, func: handleRedoAction },
      { icon: "90deg", value: ROTATE_ANGLE.DEG90, func: handleRotate },
      { icon: <VisibilityIcon />, value: '', func: toggleShowId }
    ],
    [
      { icon: <KeyboardArrowLeftIcon />, value: BTN_VALUE.LEFT, func: handleAction },
      { icon: <KeyboardArrowDownIcon />, value: BTN_VALUE.DOWN, func: handleAction },
      { icon: <KeyboardArrowRightIcon />, value: BTN_VALUE.RIGHT, func: handleAction },
      // { icon: "Remove gap", value: '', func: toggleStyle }
    ]
  ]

  const getActionString = (choiceId, actionLine) => {
    if (choiceId === '') return '';
    let indCol = +choiceId.substring(0, choiceId.indexOf("-"));
    let indRow = +choiceId.substring(choiceId.indexOf("-") + 1);

    const indCode = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    let res = '';
    res += indCode[indCol] + indCode[indRow] + '\n';
    res += actionLine.length.toString() + '\n';

    for (let action of actionLine) {
      switch (action) {
        case BTN_VALUE.UP:
          res += 'U';
          break;
        case BTN_VALUE.DOWN:
          res += 'D';
          break;
        case BTN_VALUE.LEFT:
          res += 'L';
          break;
        case BTN_VALUE.RIGHT:
          res += 'R';
          break;
        default:
          break;
      }
    }
    res += '\n';
    return res;
  }

  useEffect(() => {
    let ansStr = answer.rotate.map(ele => ele.toString()).join("") + "\n";
    let curChoiceId = '';
    let actionLine = [];

    let cntAction = 0;
    let actionStr = '';

    for (let actionObj of answer.action) {
      if (actionObj.id !== curChoiceId) {
        actionStr += getActionString(curChoiceId, actionLine);
        actionLine = [];
        cntAction += 1;
      }
      curChoiceId = actionObj.id;
      actionLine.push(actionObj.action);
    }
    actionStr += getActionString(curChoiceId, actionLine);
    ansStr += cntAction.toString() + '\n' + actionStr;

    setFinalAnswer(ansStr);
  }, [answer])

  useEffect(() => {
    const ar = finalAnswer.split('\n');
    const cntChoice = ar.length <= 1 ? 0 : +ar[1];
    let cntSwap = 0;
    for (let i = 3; i < ar.length; i += 3) {
      cntSwap += +ar[i];
    }

    setTotalCost(cntChoice * costChoose + cntSwap * costSwap);
  }, [finalAnswer, costChoose, costSwap])

  return (
    <Grid container spacing={1}>
      <Grid item container spacing={1}>
        {btnList.map((row, indR) => (
          <Grid container item key={indR} spacing={1}>
            {row.map((ele, ind) => (
              <Grid item key={ind}>
                <Button variant="outlined" onClick={() => ele.func(ele.value)}>
                  {ele.icon}
                </Button>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12}>
        <TextField
          label='Control sequence'
          multiline
          fullWidth
          value={finalAnswer}
          onChange={(e) => setFinalAnswer(e.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label='Max choice'
          disabled
          value={maxChoice}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label='Cost swap'
          disabled
          value={costSwap}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label='Cost choice'
          disabled
          value={costChoose}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label='Total cost'
          disabled
          value={totalCost}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label='Wrong location'
          disabled
        // value={totalCost}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label='Wrong swap'
          disabled
        // value={totalCost}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label='Piece width'
          disabled
          value={pieceWidth}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label='Piece height'
          disabled
          value={pieceHeight}
        />
      </Grid>
    </Grid>
  )
}

ControlBlock.propTypes = {
  getImage: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired,
  handleUndoAction: PropTypes.func.isRequired,
  handleRedoAction: PropTypes.func.isRequired,
  handleRotate: PropTypes.func.isRequired,
  maxChoice: PropTypes.number.isRequired,
  costSwap: PropTypes.number.isRequired,
  costChoose: PropTypes.number.isRequired,
  toggleStyle: PropTypes.func.isRequired,
  toggleShowId: PropTypes.func.isRequired,
  pieceWidth: PropTypes.number.isRequired,
  pieceHeight: PropTypes.number.isRequired,
  serverInfo: PropTypes.object.isRequired
};

export default ControlBlock;