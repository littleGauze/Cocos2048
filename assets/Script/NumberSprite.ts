import ResourceManager from './ResourceManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NumberSprite extends cc.Component {
    private sp: cc.Sprite = null;
    public resManager: ResourceManager = null;

    @property
    duration: number = .08;

    onLoad(): void {
        this.sp = this.node.getComponent(cc.Sprite);
    }

    public setImage(num: number): void {
        this.sp.spriteFrame = this.resManager.getImage(num);
        this.sp.node.width = 112.5;
        this.sp.node.height = 112.5;
    }

    public enterEffect(): void {
        const action1: cc.ActionInterval = cc.scaleTo(0, 0.6);
        const action2: cc.ActionInterval = cc.scaleTo(this.duration * 2, 1).easing(cc.easeIn(3));
        this.node.runAction(cc.sequence(action1, action2));
    }

    public mergeEffect(): void {
        const action1: cc.ActionInterval = cc.scaleTo(this.duration, 1.15).easing(cc.easeCubicActionOut());
        const action2: cc.ActionInterval = cc.scaleTo(this.duration, 1).easing(cc.easeCubicActionIn());
        this.node.runAction(cc.sequence(action1, action2));
    }

    public moveEffect(to: cc.Vec2): void {
        // TODO: move logic
    }
}
