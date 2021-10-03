const zoom = 5;
const TOP = 0, //cell data indexes
      RIGHT = 1,
      BOTTOM = 2,
      LEFT = 3,
      VISITED = 4,
      NEIGHBORS = 5;
class Maze
{
  constructor(pref)
  {
    if (!pref)
      pref = {};

    const rect = document.body.firstElementChild.getBoundingClientRect();
    this.size = pref.size || 2;
    this.columns = pref.columns || Math.round((window.innerWidth-rect.x*3)/this.size);
    this.rows = pref.rows || Math.round((window.innerHeight-rect.y*3)/this.size);
    this.start = pref.start || [0,0];
//    this.start = pref.start || [~~(Math.random() * this.columns), 0];
//    this.start = pref.start || [~~(Math.random() * this.columns), ~~(Math.random() * this.rows)];

    this.end = pref.end || [this.columns-1, this.rows-1];
//    this.end = pref.end || [~~(Math.random() * this.columns), this.rows-1];
//    this.end = pref.end || [~~(Math.random() * this.columns), ~~(Math.random() * this.rows)];

    this.cells = [...new Array(this.rows * this.columns)].map((a,i) => [1,1,1,1,false,this.getDir(i)]);//top,right,bottom,left,visited,neighbor cells
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.columns * this.size + 1;
    this.canvas.height = this.rows * this.size+ 1;
    this.ctx = this.canvas.getContext("2d");
    this.path = null;
/*
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = 'middle';
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(100,100,100,100)";
//    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "green";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "grey";
*/
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.genWalls();
  }

  genWalls()
  {
    let x = this.start[0],
        y = this.start[1],
        cur = y * this.columns + x,
        stack = [cur],
        num = 0;

/*
    for(let i = 0; i < this.columns; i++)
    {
      this.cells[i][TOP] = Math.round(Math.random() * 10) ? 1 : 0; //remove top wall
      this.cells[(this.rows-1) * this.columns + i][BOTTOM] = Math.round(Math.random() * 10) ? 1 : 0; //remove bottom wall
    }

    for(let i = 0; i < this.rows; i++)
    {
      this.cells[i*this.columns][LEFT] = Math.round(Math.random() * 10) ? 1 : 0; // remove left wall
      this.cells[i*this.columns+this.columns-1][RIGHT] = Math.round(Math.random() * 10) ? 1 : 0; //remove right wall
    }
*/  
    if (!y)
      this.cells[cur][TOP] = 0; //remove top wall

    if (this.end[1] == this.rows-1)
      this.cells[this.getCell(this.end[0], this.end[1])][BOTTOM] = 0; //remove bottom wall

    while(stack.length)
    {
      
      x = cur % this.columns;
      y = ~~(cur / this.columns);
      const cell = this.cells[cur];
      let dir = [];
      cell[VISITED] = true;

      if (this.cells[cell[NEIGHBORS][TOP]] && !this.cells[cell[NEIGHBORS][TOP]][VISITED])
        dir[dir.length] = 0; //top

      if (this.cells[cell[NEIGHBORS][RIGHT]] && !this.cells[cell[NEIGHBORS][RIGHT]][VISITED])
        dir[dir.length] = 1; //right

      if (this.cells[cell[NEIGHBORS][BOTTOM]] && !this.cells[cell[NEIGHBORS][BOTTOM]][VISITED])
        dir[dir.length] = 2; //bottom

      if (this.cells[cell[NEIGHBORS][LEFT]] && !this.cells[cell[NEIGHBORS][LEFT]][VISITED])
        dir[dir.length] = 3; //left

      num++;

      if (x == this.end[0] && y == this.end[1])
        this.path = [...stack, cur];


      if (!dir.length)
      {
        --num;
        --num;
        cur = stack.pop();
        continue;
      }

      stack[stack.length] = cur;
      dir = dir[~~(Math.random()*dir.length)];
      this.removeWall(cur, cell[NEIGHBORS][dir]);
      cur = cell[NEIGHBORS][dir];
    }
  }
  removeWall(a, b)
  {
    const cellA = this.cells[a],
          cellB = this.cells[b],
          [aX, aY] = this.getCoords(a),
          [bX, bY] = this.getCoords(b);

    if (bX > aX)
    {
      cellA[RIGHT] = 0;
      cellB[LEFT] = 0;
    }
    else if (bX < aX)
    {
      cellA[LEFT] = 0;
      cellB[RIGHT] = 0;
    }
    if (bY > aY)
    {
      cellA[BOTTOM] = 0;
      cellB[TOP] = 0;
    }
    else if (bY < aY)
    {
      cellA[TOP] = 0;
      cellB[BOTTOM] = 0;
    }
  }

  getDir(cell)
  {
    const [x, y] = this.getCoords(cell),
          dir = new Array(4);

    if (y)
      dir[TOP] = (y - 1) * this.columns + x;

    if (x + 1 < this.columns)
      dir[RIGHT] = y * this.columns + x + 1;

    if (y + 1 < this.rows)
      dir[BOTTOM] = (y + 1) * this.columns + x;

    if (x)
      dir[LEFT] = y * this.columns + x - 1;

    return dir;
  }

  getCell(x,y)
  {
    return y * this.columns + x;
  }

  getCoords(cell)
  {
    return [cell % this.columns, ~~(cell / this.columns)];
  }

  show()
  {
    const ctx = this.ctx,
          cells = this.cells;

    ctx.beginPath();
    ctx.strokeStyle = "black";
//    ctx.lineCap = "square";
    for(let c = 0, col, row, x, y, pI, next; c < this.cells.length; c++)
    {
      col = c % this.columns;
      row = ~~(c / this.columns);
      x = col * this.size + 0.5;
      y = row * this.size + 0.5;
/*
      if (this.cells[c][VISITED])
      {
        ctx.fillStyle = "rgba(100, 255, 100, 100)";
        ctx.fillRect(x, y, this.size, this.size);
      }
*/
      if (cells[c][TOP]) //top
      {
        ctx.moveTo(x, y)
        ctx.lineTo(x + this.size, y);
      }
      if (cells[c][RIGHT]) //right
      {
        ctx.moveTo(x + this.size, y)
        ctx.lineTo(x + this.size, y + this.size);
      }

      if (cells[c][BOTTOM]) //bottom
      {
        ctx.moveTo(x + this.size, y + this.size)
        ctx.lineTo(x, y + this.size);
      }

      if (cells[c][LEFT]) //left
      {
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + this.size);
      }
    }
    ctx.stroke();
    let path,pX,pY;
    let paths = [];
    this.path.forEach((c,i) =>
    {
//			ctx.beginPath();
      const col = c % this.columns,
            row = ~~(c / this.columns),
            x = col * this.size + 0.5,
            y = row * this.size + 0.5;

/*
      ctx.fillStyle = "rgba(200, 255, 200, 100)";
      ctx.fillRect(
        x + (cells[c][LEFT] * 2),
        y + (cells[c][TOP] * 2),
        this.size - (cells[c][RIGHT] * 2 + cells[c][LEFT] * 2),
        this.size - (cells[c][BOTTOM] * 2 + cells[c][TOP] * 2)
      );
*/
      if (!i)
      {
        path = this.start;
        path[0] = path[0] * this.size + ~~(this.size / 2) + 0.5;
        path[1] = path[1] * this.size + 0.5;
        paths.push([...path]);
      }
      const next = this.getCoords(c);
      pX = next[0] * this.size + this.size/2 + 0.5; 
      pY = next[1] * this.size + this.size/2 + 0.5;
      paths.push([pX, pY]);
      if (i == this.path.length -1)
      {
        paths.push([pX, pY + this.size/2]);
      }
    });
    ctx.beginPath();
    ctx.strokeStyle = "rgb(0, 155, 255)";
    ctx.lineWidth = 1;//this.size/1.2;
//    ctx.lineJoin = "round";
//    ctx.lineCap = "square";
//    ctx.lineCap = "round";
//    ctx.setLineDash([1,this.size/3]);
//    ctx.lineDashOffset = 1;
    paths.forEach((p,i) =>
    {
      if (!i)
        ctx.moveTo(p[0],p[1]);
      else
        ctx.lineTo(p[0],p[1]);
    });
    ctx.stroke();
    ctx.beginPath();
    const s = this.size * 0.5 + 2;
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.fillRect(paths[0][0]-1, paths[0][1]-1,s,s);
    ctx.beginPath();
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(paths[paths.length-1][0]-1, paths[paths.length-1][1]-1,s,s);
/*
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    paths.forEach((p,i) =>
    {
      if (i < 2 || i == paths.length - 1)
        return;
      ctx.font = "" + this.fontSize(i-1) + "px monospace";
      ctx.fillText(i-1, p[0], p[1]+0.5);
    });
    ctx.fill();
*/
  }

  fontSize(t)
  {
    return Math.max((this.size * ( 1.1 - ((""+t).length * 0.2))), 5);
  }
}

function time(d)
{
  const t = new Date() - d,
        s = Math.round(t / 1000);

  return ('0'+~~(s/3600) % 24).slice(-2)+':'+('0'+~~(s/60)%60).slice(-2)+':'+('0' + s % 60).slice(-2) + ("" + (t / 1000) + ".000").match(/\.(\d+)/)[0];
}
let d = new Date();
const maze = new Maze();
let t = new Date() - d;
document.getElementById("info").appendChild(document.createTextNode("path length: " + maze.path.length + "\n"));
document.getElementById("info").appendChild(document.createTextNode("maze size: " + maze.columns + "x" + maze.rows + "\n"));
document.getElementById("info").appendChild(document.createTextNode("generated in: " + time(d) + "\nrendered in: "));
d = new Date();
document.body.appendChild(maze.canvas);
maze.show();
t = new Date() - d;
document.getElementById("info").appendChild(document.createTextNode(time(d) + ""));

const elZoom = document.getElementById("zoom")
      zoomCtx = elZoom.getContext("2d"),
      zoomSize = Math.max(3, Math.min(6, zoom)) / 2 * 100,
      zoomWidth = zoomSize / zoom,
      zoomHeight = zoomSize / zoom,
      lastZoom = {x:0, y:0};

function showZoom(e)
{
  elZoom.width = zoomSize;
  elZoom.height = zoomSize;
  const node = maze.canvas,
        padding = parseInt(getComputedStyle(node).padding),
        x = ~~((e.x + (e.pageX - e.x - 0) - node.offsetLeft)) - padding,
        y = ~~((e.y + (e.pageY - e.y - 0) - node.offsetTop)) - padding;

  elZoom.style.left = x + node.offsetLeft + padding - zoomSize/2 + "px";
  elZoom.style.top = y + node.offsetTop + padding - zoomSize/2  + "px";
  zoomCtx.imageSmoothingEnabled = false;
  zoomCtx.fillStyle = "white";
  zoomCtx.fillRect(0, 0, zoomSize, zoomSize);
  lastZoom.x = x - zoomSize/(zoom * 2) +1;
  lastZoom.y = y - zoomSize/(zoom * 2) +1;
  zoomCtx.drawImage(maze.canvas, lastZoom.x, lastZoom.y , zoomWidth , zoomHeight , 0, 0, zoomSize, zoomSize);
}

function eventMove(e)
{
  if (!e.buttons)
    return;

  showZoom(e);
};

maze.canvas.addEventListener("mouseleave", e =>
{
//  elZoom.width = 0;
//  elZoom.height = 0;
});

maze.canvas.addEventListener("mousemove", eventMove);
elZoom.addEventListener("mousemove", eventMove);

document.body.addEventListener("mousedown", e =>
{
console.log(e.target);
    if (e.target === maze.canvas || e.target === elZoom)
    {
      showZoom(e);
      e.preventDefault();
    }
    else
    {
      elZoom.width = 0;
      elZoom.height = 0;
    }
});