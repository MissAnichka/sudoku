import React, { Component } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import RangeSlider from 'rn-range-slider';

const CircularPathD = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';
const backGroundOrange = '#F4511E';
const backGroundGrey = '#546E7A';
const backGroundBlue = '#1B6B9B';
const backgroundBlueLighter = '#378CBF';
const backgroundBlueDarker = '#0a4c73';
const backGroundGreen = '#7CDC1B';
const LightBlue100 = '#B3E5FC';
const LightBlue200 = '#81D4FA';
const LightBlue300 = '#4FC3F7';
const Indigo700 = '#303F9F';
const DeepOrange200 = '#FFAB91';
const DeepOrange600 = '#F4511E';
const ControlNumberColor = Indigo700;

function getBackGroundColor({ conflict, isPeer, sameValue, isSelected }) {
  if (conflict && isPeer && sameValue) {
    return DeepOrange200;
  } else if (sameValue) {
    return LightBlue300;
  } else if (isSelected) {
    return LightBlue200;
  } else if (isPeer) {
    return LightBlue100;
  }
  return false;
}

function getFontColor({ value, conflict, prefilled }) {
  if (conflict && !prefilled) {
    return DeepOrange600;
  } else if (!prefilled && value) {
    return ControlNumberColor;
  }
  return false;
}

export default class LinksScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: [],
      value: 30
    }
    this.generateGame();
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View className="generation">
          <Text>Hello</Text>
          <View className="copy">Start with {this.state.value} cells prefilled</View>
          <RangeSlider
            style={{ width: 80, height: 15 }}
            gravity={'center'}
            min={17}
            max={81}
            step={1}
            selectionColor="#3df"
            blankColor="#f618"
            onValueChanged={(low, high, fromUser) => {
              this.setState({ value: fromUser })
            }} />
          />
          <button className="button" onClick={this.generateGame}>Play Sudoku</button>
        </View>
      </ScrollView>
    )
  }

  randomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  range(n) {
    return Array.from(Array(n).keys());
  }

  makePuzzle() {
    console.log("making puzzle...");
    while (true) {
      try {
        const puzzle = Array.from(Array(9).keys()).map(() => Array.from(Array(9).keys()));
        const rows = Array.from(Array(9).keys()).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        const columns = Array.from(Array(9).keys()).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        const squares = Array.from(Array(9).keys()).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        Array.from(Array(9).keys()).forEach((i) => {
          Array.from(Array(9).keys()).forEach((j) => {
            const row = rows[i];
            const column = columns[j];
            const square = squares[((Math.floor(i / 3)) * 3) + Math.floor(j / 3)];
            const choices = [...row].filter(x => column.has(x)).filter(x => square.has(x));
            const choice = randomChoice(choices);
            if (!choice) {
              // eslint-disable-next-line no-throw-literal
              throw 'dead end';
            }
            puzzle[i][j] = choice;
            column.delete(choice);
            row.delete(choice);
            square.delete(choice);
          });
        });
        console.log("created puzzle");
        return puzzle;
      } catch (e) {
        // eslint-disable-next-line no-continue
        continue;
      }
    }
  }

  /**
   * Answers the question: can the cell (i,j) in the puzzle contain the number
   in cell "c"
   * @param puzzle
   * @param i
   * @param j
   * @param c
   */
  canBeA(puzzle, i, j, c) {
    console.log("can be?");
    const x = Math.floor(c / 9);
    const y = c % 9;
    const value = puzzle[x][y];
    if (puzzle[i][j] === value) return true;
    if (puzzle[i][j] > 0) return false;
    // if not the cell itself, and the mth cell of the group contains the value v, then "no"
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const m in Array.from(Array(9).keys())) {
      const rowPeer = { x: m, y: j };
      const columnPeer = { x: i, y: m };
      const SquarePeer = {
        x: (Math.floor(i / 3) * 3) + Math.floor(m / 3),
        y: (Math.floor(j / 3) * 3) + (m % 3),
      };
      if (!(rowPeer.x === x && rowPeer.y === y) && puzzle[rowPeer.x, rowPeer.y] === value) return false;
      if (!(columnPeer.x === x && columnPeer.y === y) && puzzle[columnPeer.x, columnPeer.y] === value) return false;
      if (!(SquarePeer.x === x && SquarePeer.y === y) && puzzle[SquarePeer.x, SquarePeer.y] === value) return false;
    }
    return true;
  }

  /**
   *
   * @param a
   * @param b
   * @returns {boolean}
   */
  isPeer(a, b) {
    console.log("checking peers...");
    if (!a || !b) return false;
    const squareA = ((Math.floor(a.x / 3)) * 3) + Math.floor(a.y / 3);
    const squareB = ((Math.floor(b.x / 3)) * 3) + Math.floor(b.y / 3);
    return a.x === b.x || a.y === b.y || squareA === squareB;
  }

  pluck(allCells, n = 0) {
    console.log("plucking...");
    const puzzle = JSON.parse(JSON.stringify(allCells));
    /**
       * starts with a set of all 81 cells, and tries to remove one (randomly) at a time,
       * but not before checking that the cell can still be deduced from the remaining cells.
       * @type {Set}
       */
    const cells = new Set(Array.from(Array(81).keys()));
    const cellsLeft = new Set(cells);
    while (cellsLeft.size && cells.size > n) {
      const cell = this.randomChoice([...cells]);
      const x = Math.floor(cell / 9);
      const y = cell % 9;
      cellsLeft.delete(cell);
      /**
           * row, column and square record whether another cell in those groups could also take
           * on the value we are trying to pluck. (If another cell can, then we can't use the
           * group to deduce this value.) If all three groups are True, then we cannot pluck
           * this cell and must try another one.
           */
      let row = false;
      let column = false;
      let square = false;
      range(9).forEach((i) => {
        const rowPeer = { x: i, y };
        const columnPeer = { x, y: i };
        const squarePeer = {
          x: (Math.floor(Math.floor(cell / 9) / 3) * 3) + Math.floor(i / 3),
          y: ((Math.floor(cell / 9) % 3) * 3) + (i % 3),
        };
        if (rowPeer.x !== x) {
          row = this.canBeA(puzzle, rowPeer.x, rowPeer.y, cell);
        }
        if (columnPeer.y !== y) {
          column = this.canBeA(puzzle, columnPeer.x, columnPeer.y, cell);
        }
        if (squarePeer.x !== x && squarePeer.y !== y) {
          square = this.canBeA(puzzle, squarePeer.x, squarePeer.y, cell);
        }
      });
      if (row && column && square) {
        // eslint-disable-next-line no-continue
        continue;
      } else {
        // this is a pluckable cell!
        // eslint-disable-next-line no-param-reassign
        puzzle[x][y] = 0; // 0 denotes a blank cell
        /**
         * remove from the set of visible cells (pluck it)
         * we don't need to reset "cellsleft" because if a cell was not pluckable
         * earlier, then it will still not be pluckable now (with less information
         * on the board).
         */
        cells.delete(cell);
      }
    }
    console.log("finished plucking");
    return { puzzle, size: cells.size };
  }

  /**
 * make size 9 array of 0s
 * @returns {Array}
 */
  makeCountObject() {
    console.log("couting objects..");
    const countObj = [];
    for (let i = 0; i < 10; i += 1) countObj.push(0);
    return countObj;
  }

  /**
 * given a 2D array of numbers as the initial puzzle, generate the initial game state
 * @param puzzle
 * @returns {any}
 */
  makeBoard({ puzzle }) {
    console.log("making board...");
    // create initial count object to keep track of conflicts per number value
    const rows = Array.from(Array(9).keys()).map(() => this.makeCountObject());
    const columns = Array.from(Array(9).keys()).map(() => this.makeCountObject());
    const squares = Array.from(Array(9).keys()).map(() => this.makeCountObject());
    const result = puzzle.map((row, i) => (
      row.map((cell, j) => {
        if (cell) {
          rows[i][cell] += 1;
          columns[j][cell] += 1;
          squares[((Math.floor(i / 3)) * 3) + Math.floor(j / 3)][cell] += 1;
        }
        return {
          value: puzzle[i][j] > 0 ? puzzle[i][j] : null,
          prefilled: !!puzzle[i][j],
        };
      })
    ));
    console.log("made board");
    return fromJS({ puzzle: result, selected: false, choices: { rows, columns, squares } });
  }

  generateGame(finalCount = 20) {
    console.log("generating game...");
    // get a filled puzzle generated
    const solution = this.makePuzzle();
    // pluck values from cells to create the game
    const { puzzle } = this.pluck(solution, finalCount);
    // initialize the board with choice counts
    const board = this.makeBoard({ puzzle });
    console.log("setting state...");
    this.setState({ board });
  }

  updateBoard(newBoard) {
    console.log("updating board...");
    this.setState({ board: newBoard });
  }
};

LinksScreen.navigationOptions = {
  title: 'Links',
};

const styles = StyleSheet.create({
  cell: {
    height: cellWidth,
    width: cellWidth,
    display: flex,
    flexWrap: wrap,
    alignItems: center,
    justifyContent: center,
    fontSize: 1.1,
    fontWeight: bold,
    // transition: backgroundColor .3 easeInOut
},
// cellNthChild(3n+3):not(:last-child) {
//     border-right: 2px solid black;
// }
// .cell:not(:last-child) {
//     border-right: 1px solid black;
// }
// .note-number {
//     font-size: .6em;
//     width: 33%;
//     height: 33%;
//     box-sizing: border-box;
//     display: flex;
//     align-items: center;
//     justify-content: center;
// }
//   container: {
//     flex: 1,
//     paddingTop: 15,
//     backgroundColor: '#fff',
//   },
//   copy: {
//     textAlign: center,
//     fontSize: 1.3,
//     marginBottom: .5
//   },
//   generation: {
//     display: flex,
//     justifyContent: center,
//     flexDirection: column,
//     width: 100,
//     alignItems: center
//   },
//   button: {
//     marginTop: .5,
//     borderRadius: .25,
//     cursor: pointer,
//     fontWeight: bold,
//     textDecoration: none,
//     color: fff,
//     position: relative,
//     display: inline - block,
//     transitionAll: .25,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     fontSize: 1.4
//   },
//   buttonActive: {
//     transform: translate(0, 5),
//     boxShadowTop: 0,
//     boxShadowRight: 1,
//     boxShadowBottom: 0,
//     boxShadowLeft: 0
//   },
//   button: {
//     backgroundColor: backGroundBlue,
//     boxShadowTop: 0,
//     boxShadowRight: 2,
//     boxShadowBottom: 4,
//     boxShadowLeft: 0,
//     boxShadowColor: backgroundBlueDarker,
//     display: flex,
//     alignItems: center
//   },
//   buttonHover: {
//     backgroundColor: backgroundBlueLighter
//   }
});
