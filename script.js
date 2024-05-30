/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';


const CVS_WIDTH = 300;
const CVS_HEIGHT = 300;
const ROWS = 10;
const COLS = 10;

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;

let loc_p1_cvs;
let loc_p2_cvs;
let tgt_p1_cvs;
let tgt_p2_cvs;

let loc_p1_grid = [];
// let tgt_p1_grid = [];



let prevClick = [0,0];



// The (overly simple) model
class Square {
  colour = [0, 0, 0];
  value = 0;

  constructor(colour, value) {
    this.colour = colour;
    this.value = value;
  }

}

// Setup the scene (runs first)
function setup() {
  loc_p1_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  loc_p2_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  tgt_p1_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  tgt_p2_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);


  loc_p1_grid.position(400,400);
  // Initialize the grid to all white squares
  grid_gen(loc_p1_grid)
  grid_gen(tgt_p1_grid)

}


function grid_gen(grid) {
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      if ((x+y) % 2 == 0) {
        grid[y].push(new Square([0, 120, 230], 0));
      } else {
        grid[y].push(new Square([0,130,230], 0));
      }
    }
  }
  return grid;
}

// Draw a new frame of the scene
function draw() {
  // Clear the screen with a grey rectangle
  background(220);

  // Draw the grid
  draw_grid(COLS, ROWS);
}

/* Draw a grid that is x by y
 * Utilize the `grid` 2D array of Squares
 * Fill each square with the proper .colour and if the value
 * of the square is over 0, write the value on the square.
 */
function draw_grid(x, y) {
  // Get the size of each square
  let width = Math.floor(CVS_WIDTH/x);
  let height = Math.floor(CVS_HEIGHT/y);

  // Center the grid on the canvas if there's a rounding error
  let x_buffer = (CVS_WIDTH - width*x)/2
  let y_buffer = (CVS_HEIGHT - height*y)/2

  stroke([0,125,230]);
  for (let row = 0; row < y; row++) {
    for (let col = 0; col < x; col++) {
      // Fill the square with the r,g,b values from the model
      fill(...loc_p1_grid[row][col].colour);
      rect(col*width + x_buffer, row*height + y_buffer, width, height);
    }
  }
}
