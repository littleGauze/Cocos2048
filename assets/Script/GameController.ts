import GameCore from './Core/GameCore';
import NumberSprite from './NumberSprite';
import Location from './Core/Location';
import ResourceManager from './ResourceManager';
import MoveDirection from './Core/MoveDirection';
import GameResult from './GameResult';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    bestScore = null;

    @property(cc.Label)
    currentScore = null;

    @property(cc.Node)
    resultPage = null;

    @property(GameResult)
    gameResult = null;

    private resManager: ResourceManager = null;

    private core: GameCore = null;
    private numberSprites: Array<Array<NumberSprite>> = [];

    private touchStart: cc.Vec2 = null;
    private slideThreshold: number = 50;
    private _isRunning: boolean = false;

    onLoad(): void {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.handleKeyDown, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.handleTouchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.handleTouchEvent, this);
        this.node.once('gameOver', this.onGameOver, this);
    }

    start(): void {
        this.resManager = this.getComponent(ResourceManager);
        this.core = new GameCore();

        // init it after resources loaded
        this.resManager.ready(() => {
            this.int();

            // generate numbers
            this.generateNumber();
            this.generateNumber();
        })
    }

    onDestroy(): void {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.handleKeyDown);
        this.node.off(cc.Node.EventType.TOUCH_START, this.handleTouchEvent, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.handleTouchEvent, this);
    }

    private restart(): void {
        this.currentScore.string = 0;
        this.clearNumbers();
        this.core.reset();
        this.generateNumber();
        this.generateNumber();

        this.resultPage.getComponent(GameResult).hide();
        this.node.once('gameOver', this.onGameOver, this);
        this._isRunning = true;
    }

    private onGameOver(isSuccess: boolean = false): void {
        this._isRunning = false;
        this.resultPage.getComponent(GameResult).show(isSuccess);
    }

    private int(): void {
        this._isRunning = true;
        for (let r = 0; r < 4; r++) {
            const sprites: Array<NumberSprite> = [];
            for (let c = 0; c < 4; c++) {
                sprites.push(this.createSprite(new Location(r, c)));
            }
            this.numberSprites.push(sprites);
        }
    }

    private clearNumbers(): void {
        this.numberSprites.forEach(
            (sprites: NumberSprite[]) => sprites.forEach(
                (sprite: NumberSprite) => sprite.setImage(0)
            )
        )
    }

    private handleKeyDown(evt: cc.Event.EventKeyboard): void {
        switch(evt.keyCode) {
            case MoveDirection.Up:
            case MoveDirection.Down:
            case MoveDirection.Left:
            case MoveDirection.Right:
                this.core.move(evt.keyCode as MoveDirection);
                break;
        }
    }

    private handleTouchEvent(evt: cc.Event.EventTouch): void {
        if (evt.type === 'touchstart') {
            this.touchStart = evt.touch.getLocation();
        } else {
            const touchEnd: cc.Vec2 = evt.touch.getLocation();
            const dir: cc.Vec2 = touchEnd.sub(this.touchStart);

            const x: number = Math.abs(dir.x);
            const y: number = Math.abs(dir.y);

            // horizontal
            if (x > y && dir.mag() > this.slideThreshold) {
                dir.x > 0 ? this.core.move(MoveDirection.Right) : this.core.move(MoveDirection.Left);
            } else if (dir.mag() > this.slideThreshold) {
                // vertical
                dir.y > 0 ? this.core.move(MoveDirection.Up) : this.core.move(MoveDirection.Down);
            }
        }
    }

    private createSprite(loc: Location): NumberSprite {
        const node: cc.Node = new cc.Node();
        node.name = `${loc.rIndex}${loc.cIndex}`;
        node.addComponent(cc.Sprite);
        node.setParent(this.node);

        const numSp: NumberSprite = node.addComponent(NumberSprite);
        numSp.resManager = this.resManager;
        numSp.setImage(0);

        return numSp;
    }

    private generateNumber(): void {
        const { num, location } = this.core.generateNumber();
        if (num < 0) return;

        const numSprite: NumberSprite = this.numberSprites[location.rIndex][location.cIndex];
        numSprite.node.scale = 0.6;
        numSprite.setImage(num);
        numSprite.enterEffect();
    }

    private updateMap(): void {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                this.numberSprites[r][c].setImage(this.core.map.getNumber(new Location(r, c)))
            }
        }
    }

    update(dt: number): void {
        if (!this._isRunning) return;
        if (this.core.isChange) {
            this.playEffect();
            this.updateMap();
            this.generateNumber();
            this.core.isChange = false;

            // update the score
            if (this.core.bestScore > parseInt(this.bestScore.string)) {
                this.bestScore.string = this.core.bestScore;
            }
            if (this.core.currentScore > parseInt(this.currentScore.string)) {
                this.currentScore.string = this.core.currentScore;
            }
        }

        if (this.core.isOver) {
            this.node.emit('gameOver', this.core.isSuccess);
        }
    }

    playEffect(): void {
        this.core.changedLocations.forEach((loc: Location) => {
            this.numberSprites[loc.rIndex][loc.cIndex].mergeEffect();
        });
        this.core.changedLocations = [];
    }
}
