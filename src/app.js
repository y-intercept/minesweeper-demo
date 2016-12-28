const React = require('react')
const minesweeper = require('minesweeper')
const { map, addIndex } = require('ramda')
const mapIndex = addIndex(map)
const BoardStateEnum = minesweeper.BoardStateEnum
const reload = function () {
  location.reload()
}

const closedCss = {
  border: '3px',
  borderStyle: 'solid',
  backgroundColor: 'LightGray',
  borderLeftColor: 'white',
  borderTopColor: 'white',
  borderRightColor: 'DarkGray',
  borderBottomColor: 'DarkGray',
  height: '25px',
  minWidth: '25px'
}

const openCss = {
  border: '3px',
  borderStyle: 'clear',
  backgroundColor: 'LightGray',
  borderLeftColor: 'LightGray',
  borderTopColor: 'LightGray',
  borderRightColor: 'LightGray',
  borderBottomColor: 'LightGray',
  height: '25px',
  minWidth: '25px'
}

const App = React.createClass({
  getInitialState() {
    return {
      grid: [],
      board: null,
      state: 0,
      intervalId: this.startTimer(),
      timer: 0,
      game: true,
      victory: false,
      settings: {
        rows: 9,
        cols: 9,
        mines: 10
      }
    }
  },
  componentDidMount () {
    let board = this.getNewBoard()
    this.setState({
      board: board,
      grid: board.grid(),
      state: board.state()
    })
  },
  getNewBoard() {
    let mineArray = minesweeper.generateMineArray({
      rows: this.state.settings.rows,
      cols: this.state.settings.cols,
      mines: this.state.settings.mines
    })
    return new minesweeper.Board(mineArray)
  },
  openCell(x, y) {
    return (e) => {
      let board = this.state.board
      board.openCell(x, y)
      this.setState({
        grid: board.grid(),
        state: board.state()
      })
    }
  },
  setFlag(x, y) {
    return (e) => {
      e.preventDefault()
      let board = this.state.board
      board.cycleCellFlag(x, y)
      this.setState({
        grid: board.grid(),
        state: board.state()
      })
    }
  },
  changeSettings(e) {
    let settings = e.target.value
    if (settings === 'easy') {
      settings = {
          rows: 9,
          cols: 9,
          mines: 10
      }
    } else if (settings === 'normal') {
      settings = {
          rows: 16,
          cols: 16,
          mines: 40
      }
    } else if (settings === 'hard') {
      settings = {
          rows: 16,
          cols: 30,
          mines: 99
      }
    }
    let change = minesweeper.generateMineArray(settings)
    let board = new minesweeper.Board(change)
    this.setState({
      board: board,
      grid: board.grid(),
      state: board.state()
    })
  },
  startTimer() {
    return setInterval(_ => {
      let timer = this.state.timer
      if (this.state.state === BoardStateEnum.LOST) {
        this.setState({timer: 0, game: false})
      }
      if (this.state.state === BoardStateEnum.IN_PROGRESS) {
        this.setState({timer: timer + 1})
      }
      if (this.state.state === BoardStateEnum.WON) {
        this.setState({timer: timer, game: false, victory: true})
      }
    }, 1000)
  },
  render() {
    const determineCellState = (cell) => {
      if (this.state.state < 2) {
        if (cell.flag === 1) {
          return {
            css: closedCss,
            text: '🚩'
          }
        }
        if (cell.flag === 2) {
          return {
            css: closedCss,
            text: '❓'
          }
        }
        if (cell.state === 0) {
          return {
            css: closedCss,
            text: null
          }
        } else if (cell.state === 1 && !cell.isMine) {
          return {
            css: openCss,
            text: (cell.numAdjacentMines > 0) ? cell.numAdjacentMines.toString() : null
          }
        } else {
          return {
            css: openCss,
            text: (cell.state === 1 && cell.isMine) ? '💣' : null
          }
        }
      } else {
        return {
          css: openCss,
          text: cell.isMine ? '💣' : null
        }
      }
    }

    const td = (cell, i) => {
      const cellState = determineCellState(cell)
      return (
        <td
          style={cellState.css}
          key={i}
          onContextMenu={this.setFlag(cell.x, cell.y)}
          onClick={this.openCell(cell.x, cell.y)}>
          <center>{cellState.text}</center>
        </td>
      )
    }

    const tr = (row, i) => <tr key={i}>{mapIndex(td, row)}</tr>
    const gameState = !this.state.game && this.state.victory ? <span className="green f3 ml3">YOU WON! VICTORY!</span> : null
    return (
      <div>
      <div className="main" id="bg">
        <h2>Minesweeper</h2>
        <select onChange={this.changeSettings}>
          <option value='easy'>Easy</option>
          <option value='normal'>Normal</option>
          <option value='hard'>Hard</option>
        </select>
        <span className="ph2"><button className="br2" onClick={reload}>Reset</button></span>
        <span >{gameState}</span>
        <div className='timer'>
          <p>Time: {this.state.timer}</p>
        </div>
        <table className="ba b--silver bw1">
          <tbody>
            {mapIndex(tr, this.state.grid)}
          </tbody>
        </table>
      </div>
    </div>
    )
  }
})

module.exports = App
