import { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid
} from '@mui/material';
import { styled } from '@mui/system';

import { convertP6toP3 } from "src/util/convert"
import Header from "src/views/maingame/header";
import ImagePieces from "./imagePieces";
import ControlBlock from "./controlBlock";
import FreeStyleDrag from "./freestyleDrag";
import { BTN_VALUE } from "./controlBlock";
import { createImageURI } from "src/util/util";

const StyledDiv = styled('div')({
  padding: 8,
});

const MainGame = () => {
  const [serverInfo, setServerInfo] = useState({
    domain: 'http://localhost:8081/a.ppm',
    token: 'team token'
  });

  const [initialConfig, setInitialConfig] = useState({
    width: 0,
    height: 0,
    imageData: [],
    rowSegment: 0,
    colSegment: 0,
    maxChoice: 0,
    chooseCost: 0,
    swapCost: 0,
  });

  const [styleObj, setStyleObj] = useState({ spacing: 0, padding: 0, hideId: true });
  const [updateDrag, setUpdateDrag] = useState(false);
  const [pieces, setPieces] = useState([]);
  const [curChoice, setCurChoice] = useState({ id: '' });
  const [redoAct, setRedoAct] = useState([]);

  const [answer, setAnswer] = useState({
    rotate: [],
    action: []
  })

  const setInitAnswer = () => {
    let rotateAr = [];
    for (let i = 0; i < initialConfig.rowSegment * initialConfig.colSegment; i++) rotateAr.push(0);
    setAnswer(cur => ({
      ...cur,
      rotate: rotateAr
    }));
  }

  const splitImageToPieces = () => {
    if (initialConfig.rowSegment === 0 || initialConfig.colSegment === 0) {
      console.log("row segment or col segment is invalid: ", initialConfig);
      return;
    }
    const pieceHeight = Math.round(initialConfig.height / initialConfig.rowSegment);
    const pieceWidth = Math.round(initialConfig.width / initialConfig.colSegment);
    const initData = [];
    for (const row of initialConfig.imageData) {
      initData.push([...row]);
    }

    const pieceMatrix = [];
    let indCol = 0, indRow = 0;
    for (let i = 0; i < initialConfig.height; i += pieceHeight) {
      let pieceAr = [];
      for (let j = 0; j < initialConfig.width; j += pieceWidth) {
        let piece = initData.slice(i, i + pieceHeight).map(ele => ele.slice(j, j + pieceWidth))
        pieceAr.push({
          data: piece,
          imageUri: createImageURI(piece),
          width: pieceWidth,
          height: pieceHeight,
          indCol: indCol,
          indRow: indRow,
          id: indCol.toString() + "-" + indRow.toString(),
          displayId: indRow.toString() + "-" + indCol.toString()
        });
        indCol += 1;
      }
      indCol = 0;
      indRow += 1;
      pieceMatrix.push(pieceAr);
    }

    setPieces(pieceMatrix);

    setInitAnswer();

    setUpdateDrag(true);
  }

  const handleRotate = () => {
    if (curChoice.id === '') return;

    let indCol = +curChoice.id.substring(0, curChoice.id.indexOf("-"));
    let indRow = +curChoice.id.substring(curChoice.id.indexOf("-") + 1);

    const rotateInd = indRow * initialConfig.colSegment + indCol;
    let rotateValue = + answer.rotate[rotateInd];
    rotateValue = (rotateValue + 1) % 4;

    const newAnswer = { ...answer };
    newAnswer.rotate[rotateInd] = rotateValue;
    setAnswer(newAnswer);
  }

  const handleRotateBasedOnDrag = (id, rotateValue) => {
    if (id === '') return;

    let indCol = +id.substring(0, id.indexOf("-"));
    let indRow = +id.substring(id.indexOf("-") + 1);

    const rotateInd = indRow * initialConfig.colSegment + indCol;
    const newAnswer = { ...answer };
    newAnswer.rotate[rotateInd] = rotateValue;
    setAnswer(newAnswer);
  }

  const handleAction = (action, choice = null, actionType = BTN_VALUE.NORMAL_ACT, newActionLst = []) => {
    if (choice === null) choice = curChoice;
    if (choice.id === '') return;

    const indRow = choice.indRow;
    const indCol = choice.indCol;
    const curPieceMatrix = [...pieces];
    let targetRow = indRow;
    let targetCol = indCol;

    switch (action) {
      case BTN_VALUE.UP:
        if (indRow === 0) return;
        targetRow = indRow - 1;
        targetCol = indCol;

        break;
      case BTN_VALUE.DOWN:
        if (indRow === initialConfig.rowSegment - 1) return;
        targetRow = indRow + 1;
        targetCol = indCol;
        break;
      case BTN_VALUE.LEFT:
        if (indCol === 0) return;
        targetRow = indRow;
        targetCol = indCol - 1;
        break;
      case BTN_VALUE.RIGHT:
        if (indCol === initialConfig.colSegment - 1) return;
        targetRow = indRow;
        targetCol = indCol + 1;
        break;
      default:
        return;
    }

    const curPiece = { ...curPieceMatrix[indRow][indCol], indCol: targetCol, indRow: targetRow };
    const targetPiece = { ...curPieceMatrix[targetRow][targetCol], indCol: indCol, indRow: indRow };
    curPieceMatrix[indRow][indCol] = targetPiece;
    curPieceMatrix[targetRow][targetCol] = curPiece;
    setPieces(curPieceMatrix);

    switch (actionType) {
      case BTN_VALUE.UNDO:
        setAnswer(cur => ({
          ...cur,
          action: newActionLst
        }));

        setCurChoice(cur => ({
          id: choice.id,
          indCol: curPiece.indCol,
          indRow: curPiece.indRow
        }));
        break;
      case BTN_VALUE.NORMAL_ACT:
        setRedoAct([]);
      default:
        setCurChoice(cur => ({
          ...cur,
          indCol: curPiece.indCol,
          indRow: curPiece.indRow
        }));

        const newAction = [...answer.action]
        newAction.push({ id: choice.id, action });
        setAnswer(cur => ({
          ...cur,
          action: newAction
        }));
    }
  }

  const handleUndoAction = () => {
    const curActionLst = [...answer.action];
    if (curActionLst.length === 0) return;
    const lastAction = curActionLst.at(-1);
    const newActionLst = curActionLst.slice(0, -1);

    const allPieces = pieces.flat();
    const lastPiece = allPieces.filter(ele => ele.id === lastAction.id)[0];

    const inverseAction = {
      [BTN_VALUE.LEFT]: BTN_VALUE.RIGHT,
      [BTN_VALUE.RIGHT]: BTN_VALUE.LEFT,
      [BTN_VALUE.UP]: BTN_VALUE.DOWN,
      [BTN_VALUE.DOWN]: BTN_VALUE.UP,
    }

    handleAction(
      inverseAction[lastAction.action],
      {
        id: lastAction.id,
        indRow: lastPiece.indRow,
        indCol: lastPiece.indCol
      },
      BTN_VALUE.UNDO,
      newActionLst
    );

    setRedoAct(cur => [...cur, lastAction]);
  }

  const handleRedoAction = () => {
    setRedoAct(cur => {
      if (cur.length === 0) return [];
      const curRedoLst = [...cur];
      const lastAction = curRedoLst.at(-1);

      const allPieces = pieces.flat();
      const lastPiece = allPieces.filter(ele => ele.id === lastAction.id)[0];

      handleAction(
        lastAction.action,
        {
          id: lastAction.id,
          indRow: lastPiece.indRow,
          indCol: lastPiece.indCol
        },
        BTN_VALUE.REDO
      );

      cur.pop();
      return cur;
    })
  }

  useEffect(() => {
    splitImageToPieces();
  }, [initialConfig])

  const getImage = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: serverInfo.domain,
        responseType: 'blob'
      })
      let rawData = new Blob([res.data])
      const preprocessData = await convertP6toP3(rawData);
      setInitialConfig(preprocessData);
    } catch (err) {
      console.log(err)
    }
  }

  const toggleStyle = () => {
    setStyleObj(cur => ({
      ...cur,
      padding: cur.padding === 0 ? 18 : 0,
      spacing: cur.spacing === 2 ? 0 : 2
    }));
  }

  const toggleShowId = () => {
    setStyleObj(cur => ({
      ...cur,
      hideId: !cur.hideId
    }));
  }

  return (
    <StyledDiv>
      <Header
        serverInfo={serverInfo}
        setServerInfo={setServerInfo}
      />
      <Grid container alignItems='start' >
        <Grid container item xs={9}>
          <ImagePieces
            colSegment={initialConfig.colSegment}
            rotate={answer.rotate}
            zoom={initialConfig.width > 1000 ? 0.4 : 1}
            curChoice={curChoice}
            setCurChoice={setCurChoice}
            pieces={pieces}
            styleObj={styleObj}
          />
          <FreeStyleDrag
            handleRotateBasedOnDrag={handleRotateBasedOnDrag}
            updateDrag={updateDrag}
            setUpdateDrag={setUpdateDrag}
            width={initialConfig.width}
            height={initialConfig.height}
            zoom={initialConfig.width > 1000 ? 0.4 : 1}
            pieces={pieces}
          />
        </Grid>
        <Grid container item xs={3}>
          <ControlBlock
            answer={answer}
            handleAction={handleAction}
            getImage={getImage}
            handleRotate={handleRotate}
            handleUndoAction={handleUndoAction}
            handleRedoAction={handleRedoAction}
            maxChoice={initialConfig.maxChoice}
            costChoose={initialConfig.chooseCost}
            costSwap={initialConfig.swapCost}
            toggleStyle={toggleStyle}
            toggleShowId={toggleShowId}
            pieceHeight={initialConfig.rowSegment === 0 ? 0 : Math.round(initialConfig.height / initialConfig.rowSegment)}
            pieceWidth={initialConfig.colSegment === 0 ? 0 : Math.round(initialConfig.width / initialConfig.colSegment)}
            serverInfo={serverInfo}
          />
        </Grid>
        <Grid item xs={12}>

        </Grid>
      </Grid>
    </StyledDiv >
  )
}


export default MainGame;