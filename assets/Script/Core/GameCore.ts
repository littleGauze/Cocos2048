import Matrix from './Matrix';
import MoveDirection from './MoveDirection';
import Location from './Location';

interface MoveInfo {
    idx?: number;
    tempIdx: number;
    count: number;
}

export interface MoveStep {
    from: Location,
    to: Location
}

export default class GameCore {
    private _map: Matrix;
    private mergeArray: Array<number> = [];
    private zeroFilterArray: Array<number> = [];
    private originalMap: Matrix;
    private emptyLocations: Array<Location> = [];

    private successThreshold: number = 2048;
    private rowLen: number = 4;
    private colLen: number = 4;
    private _isChange: boolean = false;
    private _isOver: boolean = false;
    private _isSuccess: boolean = false;

    public bestScore: number = 0;
    public currentScore: number = 0;
    public changedLocations: Array<Location> = [];
    private moveInfo: Array<MoveInfo> = [];
    public moveSteps: Array<MoveStep> = [];

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

    get isSuccess(): boolean {
        return this._isSuccess;
    }

    private removeZero(before: boolean = false): void {
        this.zeroFilterArray = new Array(this.rowLen);
        Matrix.fill(this.zeroFilterArray)
        let idx: number = 0;
        let zeroCount: number = 0;

        for (let i = 0, len = this.mergeArray.length; i < len; i++) {
            if (this.mergeArray[i] !== 0) {
                // initiate
                if (before) {
                    this.moveInfo.push({ idx: i, tempIdx: idx, count: zeroCount });
                } else {
                    zeroCount && this.updateMoveInfo({ tempIdx: i, count: zeroCount });
                }
                this.zeroFilterArray[idx++] = this.mergeArray[i];
                continue;
            }
            zeroCount++;
        }
        this.mergeArray = this.zeroFilterArray;
    }

    private merge(): Array<number> {
        const changedIdx: Array<number> = [];
        this.removeZero(true);

        for (let i = 0, len = this.mergeArray.length; i < len; i++) {
            if (this.mergeArray[i] && this.mergeArray[i] === this.mergeArray[i + 1]) {
                this.mergeArray[i] += this.mergeArray[i];
                this.mergeArray[i + 1] = 0;
                changedIdx.push(i);

                // count move step
                this.updateMoveInfo({ tempIdx: i + 1, count: 1 }, true);

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

        // remove zero steps
        this.moveInfo = this.moveInfo.filter((it: MoveInfo) => !!it.count);

        return changedIdx;
    }

    private updateMoveInfo(info: MoveInfo, isMerge: boolean = false): void {
        this.moveInfo.forEach((it: MoveInfo) => {
            if (it.tempIdx === info.tempIdx) {
                it.count += info.count;
                if (isMerge) {
                    // set the tempIdx same with merge one
                    it.tempIdx -= 1;
                }
            }
        });
    }

    public moveUp(): void {
        for (let i = 0; i < this.colLen; i++) {
            this.moveInfo = [];
            this.mergeArray = this._map.getColNumbers(i);
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location(idx, i)));

            // set move info
            this.moveInfo.forEach((info: MoveInfo) => {
                this.moveSteps.push({
                    from: new Location(info.idx, i),
                    to: new Location(info.idx - info.count, i)
                });
            })

            this._map.setColNumbers(i, this.mergeArray);
        }
    }

    public moveDown(): void {
        for (let i = 0; i < this.colLen; i++) {
            this.moveInfo = [];
            this.mergeArray = this._map.getColNumbers(i).reverse();
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location((this.rowLen - idx - 1), i)));

            // set move info
            this.moveInfo.forEach((info: MoveInfo) => {
                this.moveSteps.push({
                    from: new Location(this.colLen - info.idx - 1, i),
                    to: new Location(this.colLen - info.idx - 1 + info.count, i)
                });
            })

            this._map.setColNumbers(i, this.mergeArray.reverse());
        }
    }

    public moveLeft(): void {
        for (let i = 0; i < this.rowLen; i++) {
            this.moveInfo = [];
            this.mergeArray = this._map.getRowNumbers(i);
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location(i, idx)));

            // set move info
            this.moveInfo.forEach((info: MoveInfo) => {
                this.moveSteps.push({
                    from: new Location(i, info.idx),
                    to: new Location(i, info.idx - info.count)
                });
            })

            this._map.setRowNumbers(i, this.mergeArray);
        }
    }

    public moveRight(): void {
        for (let i = 0; i < this.rowLen; i++) {
            this.moveInfo = [];
            this.mergeArray = this._map.getRowNumbers(i).reverse();
            const changed: Array<number> = this.merge();
            this.changedLocations.push(...changed.map(idx => new Location(i, (this.colLen - idx - 1))));

            // set move info
            this.moveInfo.forEach((info: MoveInfo) => {
                this.moveSteps.push({
                    from: new Location(i, this.rowLen - info.idx - 1),
                    to: new Location(i, this.rowLen - info.idx - 1 + info.count)
                });
            })

            this._map.setRowNumbers(i, this.mergeArray.reverse());
        }
    }

    public move(direction: MoveDirection): void {
        if (this._isOver) return;

        // save the original matrix
        this.originalMap = this._map.clone();
        this._isChange = false;
        this.moveInfo = [];
        this.moveSteps = [];

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
        if (this.emptyLocations.length && !this._isOver) {
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
        if (this.currentScore >= this.successThreshold) {
            this._isSuccess = true;
            return true;
        }
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
