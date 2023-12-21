import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';

// building : distance,height,width
const InitBuildings = [
  // [3, 1, 1],
  [2, 4, 3],
  [1, 2, 6],
  [3, 4, 6],
  // [4, 2, 2],
  // [8, 2, 2],
  // [9, 3, 2],
  // [8, 2, 4],
]

function App() {
  const [points, setPoints] = useState([]);
  const [buildings, setBuildings] = useState(InitBuildings);
  const canvasRef = useRef(null);

  // init canvas
  const drawAxis = (_canvasRef) => {
    const canvas = _canvasRef.current;
    const context = canvas.getContext('2d');

    context.beginPath();
    // y axis
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(100, 500);
    context.lineTo(100, 100);
    context.stroke();
    // x axis
    context.strokeStyle = 'blue';
    context.beginPath();
    context.moveTo(100, 500);
    context.lineTo(700, 500);
    context.stroke();
  }

  const drawRect = (_canvasRef, rectPoints) => {
    const canvas = _canvasRef.current;
    const context = canvas.getContext('2d');

    context.strokeStyle = 'red';
    context.strokeRect(
      rectPoints[0].x,
      rectPoints[0].y,
      rectPoints[1].x - rectPoints[0].x,
      rectPoints[1].y - rectPoints[0].y
    );
    // context.strokeRect(200, 500, 300, 300);

  }

  const drawLines = (_canvasRef, points) => {
    const canvas = _canvasRef.current;
    const context = canvas.getContext('2d');

    context.strokeStyle = 'blue';
    context.beginPath();
    points.map((point, index) => {
      if (index == 0)
        context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    })

    context.stroke();
  }

  const drawPoints = (_canvasRef, points) => {
    const canvas = _canvasRef.current;
    const context = canvas.getContext('2d');

    context.strokeStyle = 'red';
    points.map((point, index) => {
      context.beginPath();
      context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      context.stroke();
    })

    context.stroke();
  }

  const clearCanvas = (_canvasRef) => {
    const canvas = _canvasRef.current;
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  const convertPosition = (point) => {
    const basePoint = { x: 100, y: 500 }
    return {
      x: basePoint.x + point[0] * 50,
      y: basePoint.y + point[1] * -50
    }
  }

  // service
  // get two points of react from distance,height and width
  const getRectPoints = (buildingInfo) => {
    let distance = buildingInfo[0]
    let height = buildingInfo[1]
    let width = buildingInfo[2]
    return [
      convertPosition([distance, 0]),
      convertPosition([distance + width, height])
    ]
  }

  const drawBuildings = (_canvasRef) => {
    buildings.map(buildingInfo => {
      const rectPoints = getRectPoints(buildingInfo)
      drawRect(_canvasRef, rectPoints)
    })
  }

  // point caculation

  const getPointsOfRect = (rectPoints) => {
    let point1 = rectPoints[0]
    let point2 = { x: rectPoints[0].x, y: rectPoints[1].y }
    let point3 = rectPoints[1]
    let point4 = { x: rectPoints[1].x, y: rectPoints[0].y }
    return [point1, point2, point3, point4]
  }

  const findHiddenPoints = (existPoints, newPoints) => {
    const hiddenPoints = newPoints.map(newPoint => {
      let hidden = false;
      for (let index = 0; index < existPoints.length; index++) {
        let endPoint = existPoints[index];
        if (endPoint.x > newPoint.x) {
          if (index == 0) break; // new point exist before start point
          if (endPoint.y < newPoint.y) {
            hidden = true;
            // console.log("endpoint has bigger x and y than new point", endPoint, newPoint);
          }
          break
        } else if (endPoint.x == newPoint.x) {
          if (index == existPoints.length - 1) { // new point has same x with last point
            if (endPoint.y < newPoint.y) {
              hidden = true;
              // console.log("endpoint has same x and bigger y than new point", endPoint, newPoint);
            }
            break
          }
          let nextPoint = existPoints[index + 1];
          if ((endPoint.y < newPoint.y && newPoint.y < nextPoint.y) || (endPoint.y > newPoint.y && newPoint.y > nextPoint.y)) {
            hidden = true
            // console.log("next endpoint has same x and bigger y than new point", endPoint, newPoint);
          }
          break
        }
      }
      return hidden
    })
    return hiddenPoints
  }

  // cross lines
  const getLinesFromPoints = (points) => {
    let lines = points.map((point, index) => {
      if (index >= points.length - 1) return null;
      return [point, points[index + 1]];
    })
    return lines.filter(line => !!line)
  }

  const findDirectionOfLine = (line) => {
    if (line[0].x == line[1].x) return 0 // vertical
    return 1 //  horizantal
  }

  const checkIfinRange = (a, b, value) => {
    return a >= value && value >= b || a <= value && value <= b
  }
  const checkIfPointInLine = (line, point) => {
    let checkX = checkIfinRange(line[0].x, line[1].x, point.x)
    let checkY = checkIfinRange(line[0].y, line[1].y, point.y)
    // console.log("checkIfPointInLine", line, point, checkX, checkY);
    return checkX && checkY
  }

  const findCrossPoint = (existLine, newLine) => {
    let existLineDirection = findDirectionOfLine(existLine);
    let newLineDirection = findDirectionOfLine(newLine);
    if (existLineDirection == newLineDirection) return null; // same direction 

    let crossPoint = null
    if (existLineDirection == 0) { // exsitLine is vertical and newLine is horizantal
      crossPoint = { x: existLine[0].x, y: newLine[0].y }
    }
    else {
      crossPoint = { x: newLine[0].x, y: existLine[0].y }
    }

    if (!checkIfPointInLine(existLine, crossPoint)) {
      return null
    }
    if (!checkIfPointInLine(newLine, crossPoint)) {
      return null
    }

    return crossPoint;
  }

  const findCrossPoints = (existPoints, newPoints) => {
    let crossPoints = [];
    let existLines = getLinesFromPoints(existPoints);
    let newLines = getLinesFromPoints(newPoints);
    console.log("existLines", existLines);
    console.log("newLines", newLines);
    crossPoints = existLines.flatMap(existLine => {
      return newLines.map(newLine => {
        return findCrossPoint(existLine, newLine);
      })
    })
    console.log("crossPoints", crossPoints);
    return crossPoints.filter(point => !!point)
  }

  // find points
  const uniqueArray = (array) => {
    let jsonObject = array.map(JSON.stringify);
    let uniqueSet = new Set(jsonObject);
    return Array.from(uniqueSet).map(JSON.parse);
  }

  const checkOrderOfPoints = (point1, nextPoint1, point2) => {
    if (point1.x - point2.x != 0) return point2.x - point1.x; // sort with x axis
    if (!nextPoint1) return point2.y - point1.y // if point1 is last point sort with - y axis
    return (nextPoint1.y - point1.y) * (point2.y - point1.y) // sort with line direction
  }

  const mergePointsWithOrder = (points1, points2) => {
    let x = 0, y = 0;
    let newPoints = []
    while (x < points1.length && y < points2.length) {
      console.log("checkOrderOfPoints ", points1[x], points2[y], checkOrderOfPoints(points1[x], points1[x + 1], points2[y]));
      if (checkOrderOfPoints(points1[x], points1[x + 1], points2[y]) > 0) {
        newPoints.push(points1[x]);
        x++;
      }
      else {
        newPoints.push(points2[y]);
        y++;
      }
    }
    return uniqueArray([...newPoints, ...points1.slice(x), ...points2.slice(y)])
  }

  const calculatePoints = (buildRects) => {
    // const points = buildRects.flatMap(rectPoints=>getPointsOfRect(rectPoints))
    let points = []
    buildRects.map(rectPoints => {
      let pointsOfReact = getPointsOfRect(rectPoints);

      let hiddenNewPoints = findHiddenPoints(points, pointsOfReact)
      let hiddenExistPoints = findHiddenPoints(pointsOfReact, points)

      let crossPoints = findCrossPoints(points, pointsOfReact)
      
      points = points.filter((point, index) => !hiddenExistPoints[index])
      pointsOfReact = pointsOfReact.filter((point, index) => !hiddenNewPoints[index])
      
      console.log("pointsOfReact", pointsOfReact, "crossPoints", crossPoints);
      pointsOfReact = mergePointsWithOrder(pointsOfReact, crossPoints);
      console.log("mergePointsWithOrder pointsOfReact", pointsOfReact, "crossPoints", crossPoints);

      points = mergePointsWithOrder(points, pointsOfReact);
      // points = [...points, ...pointsOfReact, ...crossPoints];

      // points = uniqueArray(points)
      // points.sort((a, b) => {
      //   // if (a.x == b.x) return b.y - a.y
      //   return a.x - b.x
      // })
      console.log("hidden points", hiddenNewPoints, hiddenExistPoints,);
      console.log("new points", points);
    })
    return points
  }

  const drawCoverLines = (_canvasRef) => {
    const buildRects = buildings.map(buildingInfo => getRectPoints(buildingInfo));
    const points = calculatePoints(buildRects);
    drawLines(_canvasRef, points)
    drawPoints(_canvasRef, points)
  }

  useEffect(() => {
    clearCanvas(canvasRef);
    drawAxis(canvasRef)
    drawBuildings(canvasRef)
    drawCoverLines(canvasRef)
  }, [buildings])

  return (
    <div className="App">
      <div className="input params">
        <input></input>
      </div>
      <div className="canvas-container">
        <canvas ref={canvasRef} width={800} height={600} />
      </div>
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </div>
  );
}

export default App;
