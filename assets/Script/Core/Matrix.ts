import Location from './Location';

export default class Matrix {
  private row: number;
  private col: number;
  private matrix: Array<Array<number>> = [];

  public static fill(arr: Array<number>, num: number = 0): void {
    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i] = num;
    }
  }

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;

    this.init();
  }

  private init(): void {
    for (let i = 0; i < this.row; i++) {
      const rowArr: Array<number> = new Array(this.col);
      Matrix.fill(rowArr)
      this.matrix.push(rowArr);
    }
  }

  public setNumber(loc: Location, num: number): void {
    this.matrix[loc.rIndex][loc.cIndex] = num;
  }

  public getNumber(loc: Location): number {
    return this.matrix[loc.rIndex][loc.cIndex];
  }

  public getRowNumbers(rowIdx: number): Array<number> {
    return this.matrix[rowIdx];
  }

  public setRowNumbers(rowIdx: number, rows: Array<number>): void {
    this.matrix[rowIdx] = rows;
  }

  public getColNumbers(colIdx: number): Array<number> {
    return this.matrix.map(row => row[colIdx]);
  }

  public setColNumbers(colIdx: number, cols: Array<number>): void {
    this.matrix.forEach((row, idx) => (row[colIdx] = cols[idx]));
  }

  public clone(): Matrix {
    const map: Matrix = new Matrix(this.row, this.col);
    for (let i = 0; i < this.row; i++) {
      map.setRowNumbers(i, [...this.getRowNumbers(i)]);
    }
    return map;
  }

  public getEmptyLocations(): Array<Location> {
    const locs: Array<Location> = [] ;
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.matrix[i][j] === 0) {
          locs.push(new Location(i, j))
        }
      }
    }
    return locs;
  }

  public isChange(map: Matrix): boolean {
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        if (this.matrix[i][j] !== map.getNumber(new Location(i, j))) return true
      }
    }

    return false;
  }
}