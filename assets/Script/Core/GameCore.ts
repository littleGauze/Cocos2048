import Matrix from './Matrix';
import MoveDirection from './MoveDirection';
import Location from './Location';

export default class GameCore {
    private _map: Matrix;
    private mergeArray: Array<number> = [];
    private zeroFilterArray: Array<number> = [];
    private originalMap: Matrix;
    private emptyLocations: Array<Location> = [];

    private rowLen: number = 4;
    private colLen: number = 4;
    private _isChange: boolean = false;
    private _isOver: boolean = false;

    public bestScore: number = 0;
    public currentScore: number = 0;
    public changedLocations: Array<Location> = [];

    constructor() {
        this._map = new Matrix(4, 4);
        this.originalMap = new Matrix(4, 4);
    }

    get map(): Matrix {
        return this._map;
    }

    get isChange(): boolean {
        return this._isChange;
    }

    set isChange(val: boolean) {
        this._isChange = val;
    }

    get isOver(): boolean {
        return this._isOver;
    }

    private removeZero(): void {
        this.zeroFilterArray = new Array(this.rowLen);
        Matrix.fill(this.zeroFilterArray)
        let idx: number = 0;

        for (let i = 0, len = this.mergeArray.length; i < len; i++) {
            if (this.mergeArray[i] !== 0) {
                this.zeroFilterArray[idx++] = this.mergeArray[i];
            }
        }
        this.mergeArray = this.zeroFilterArray;
    }

    private merge(): Array<number> {
        const changedIdx: Array<number> = [];
        this.removeZero();

        for (let i = 0, len = this.mergeArray.length; i < len; i++) {
            if (this.mergeArray[i] && this.mergeArray[i] === this.mergeArray[i + 1]) {
                this.mergeArray[i] += this.mergeArray[i];
                this.mergeArray[i + 1] = 0;
                changedIdx.push(i);

                // current score
                if (this.mergeArray[i] > this.currentScore) {
                    this.currentScore = this.mergeArray[i];
                }

                // best score
                if (this.currentScore > this.bestScore) {
                    this.bestScore = this.currentScore;
                }
            }
        }

        this.removeZero();

        return changedIdx;
    }

    public moveUp(): void {
        for (let i = 0; i < this.colLen; i++) {
            this.mergeArray = this._map.getColNumbers(i);
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location(idx, i)));
            this._map.setColNumbers(i, this.mergeArray);
        }
    }

    public moveDown(): void {
        for (let i = 0; i < this.colLen; i++) {
            this.mergeArray = this._map.getColNumbers(i).reverse();
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location((this.rowLen - idx - 1), i)));
            this._map.setColNumbers(i, this.mergeArray.reverse());
        }
    }

    public moveLeft(): void {
        for (let i = 0; i < this.rowLen; i++) {
            this.mergeArray = this._map.getRowNumbers(i);
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location(i, idx)));
            this._map.setRowNumbers(i, this.mergeArray);
        }
    }

    public moveRight(): void {
        for (let i = 0; i < this.rowLen; i++) {
            this.mergeArray = this._map.getRowNumbers(i).reverse();
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location(i, (this.colLen - idx - 1))));
            this._map.setRowNumbers(i, this.mergeArray.reverse());
        }
    }

    public move(direction: MoveDirection): void {
        // save the original matrix
        this.originalMap = this._map.clone();
        this._isChange = false;

        switch (direction) {
            case MoveDirection.Up:
                this.moveUp();
                break;
            case MoveDirection.Down:
                this.moveDown();
                break;
            case MoveDirection.Left:
                this.moveLeft();
                break;
            case MoveDirection.Right:
                this.moveRight();
                break;
        }

        // check change
        this._isChange = this._map.isChange(this.originalMap);

        // check isOver
        if (this.checkOver()) {
            this._isOver = true;
        }
    }

    public generateNumber(): { num: number; location: Location; } {
        this.emptyLocations = this._map.getEmptyLocations();
        if (this.emptyLocations.length) {
            // get an empty location
            const idx: number = Math.floor(Math.random() * this.emptyLocations.length);
            const loc: Location = this.emptyLocations[idx];

            // 10 percent probability to get 4 and 90 percent to get 2;
            const num: number = Math.ceil(Math.random() * 10) === 1 ? 4 : 2;
            this._map.setNumber(loc, num);

            // remove the empty location in the list
            this.emptyLocations.splice(idx, 1);

            return { num, location: loc };
        } else {
            return {
                num: -1,
                location: new Location(-1, -1)
            };
        }
    }

    private checkOver(): boolean {
        if (this.emptyLocations.length) return false;

        for (let r = 0; r < this.rowLen; r++) {
            for (let c = 0; c < this.colLen - 1; c++) {
                if (
                    this._map.getNumber(new Location(r, c)) === this._map.getNumber(new Location(r, c + 1)) ||
                    this._map.getNumber(new Location(c, r)) === this._map.getNumber(new Location(c + 1, r))
                ) return false;
            }
        }

        return true;
    }

    public reset(): void {
        this._isOver = false;
        this.currentScore = 0;
        this._map = new Matrix(4, 4);
    }
}
