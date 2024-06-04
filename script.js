/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Addie de Boer
 */

'use strict';


const CVS_WIDTH = 600;
const CVS_HEIGHT = 600;
const ROWS = 10;
const COLS = 10;

const X = CVS_WIDTH / COLS;
const Y = CVS_HEIGHT / ROWS;

let loc_p1_cvs;
let loc_p2_cvs;
// let tgt_p1_cvs;
// let tgt_p2_cvs;

let loc_p1_grid = [];
let loc_p2_grid = [];




class Tile {
  colour = [0, 0, 0];
  value = 0;

  constructor(colour, value) {
    this.colour = colour;
    this.value = value;
  }

}



class Compartment {
  #coords;
  bingus;

  constructor(coords) {
    this.#coords = coords
    this.bingus = "bingus";
  }
}



class Ship {
  #type = ""
  #seaworthy = true; // if ship is still alive
  #length;
  #name;
  #coordinates;
  #rotation;

  constructor(length, type, name, coordinates, rotation) {
    this.#type = type;
    this.#length = new Array(length).fill(Compartment);
    this.#name = name;
    this.#coordinates = coordinates;
    this.#rotation = rotation;
  }


  get name() {return this.#name}
  get length() {return this.#length}
  get coordinates() {return this.#coordinates}

  set coordinates(item) {this.#coordinates = item}
  set rotation(item) {this.#rotation = item}

  get seaworthy() {return this.#seaworthy}
  set seaworthy(item) {this.#seaworthy = item}
}


class Player {
  #username = "";
  #position;
  hits = 0;
  ships_left = 5;
  shots_fired = 0;
  #password = "";

  #ships = [];


  constructor(position) {
    this.#position = position;

    // ship initialisation
    if (position == 1) {
      // player 1 plays as USA
      this.#ships[0] = new Ship(5, "ac", "USS Yorktown")
      this.#ships[1] = new Ship(4, "bt", "USS Missouri")
      this.#ships[2] = new Ship(3, "ds", "USS Cassin Young")
      this.#ships[3] = new Ship(3, "sb", "USS Barracuda")
      this.#ships[4] = new Ship(2, "pt", "USS Barfly")
    } else {
      // player 2 plays as Imperial Japan
      this.#ships[0] = new Ship(5, "ac", "IJN Akagi")
      this.#ships[1] = new Ship(4, "bt", "IJN Yamato")
      this.#ships[2] = new Ship(3, "ds", "IJN Yukikaze")
      this.#ships[3] = new Ship(3, "sb", "IJN Kaidai")
      this.#ships[4] = new Ship(2, "pt", "IJN Ryuuho")
    }


  }

  get username() {return this.#username}
  set username(item) {this.#username = item}

  set setPassword(item) {this.#password = item}
  get ships() {return this.#ships}
}



function setup() {
  loc_p1_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // loc_p2_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // tgt_p1_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  // // tgt_p2_cvs = createCanvas(CVS_WIDTH, CVS_HEIGHT);


  // tgt_p1_grid.position(400,400);
  // Initialize the grid to all white squares
  grid_gen(loc_p1_grid)
  // grid_gen(tgt_p1_grid)


  initGame();
}


function grid_gen(grid) {
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      if ((x+y) % 2 == 0) {
        grid[y].push(new Tile([0, 120, 230], 0));
      } else {
        grid[y].push(new Tile([0,130,230], 0));
      }
    }
  }
  return grid;
}



function shipPlacement(player) {

  // place ships in descending length
  // ac, bt, ds, sb, pt

  drawShip(player.ships[1])

}



// Draw a new frame of the scene
function draw() {
  // Clear the screen with a grey rectangle
  background(220);

  // Draw the grid
  draw_grid(COLS, ROWS);
}

function draw_grid(x, y) {
  // Get the size of each square
  let width = Math.floor(CVS_WIDTH/x);
  let height = Math.floor(CVS_HEIGHT/y);

  // Center the grid on the canvas if there's a rounding error
  let x_buffer = (CVS_WIDTH - width*x)/2
  let y_buffer = (CVS_HEIGHT - height*y)/2

  noStroke()
  for (let row = 0; row < y; row++) {
    for (let col = 0; col < x; col++) {
      // Fill the square with the r,g,b values from the model
      fill(loc_p1_grid[row][col].colour);
      rect(col*width + x_buffer, row*height + y_buffer, width, height);
    }
  }
}



function initGame() {
  let player_1 = new Player(1);
  let player_2 = new Player(-1);



  shipPlacement(player_1);
  shipPlacement(player_2);
}


function drawShip(ship,x=2,y=3) {
  console.log(ship);
  console.log(ship.length[0])
  for (let i = 0; i < ship.length.length; i++) {
    // loc_p1_grid[ship.length[i].coords[0]][ship.length[i].coords[1]].colour = "gray"
  }
}
