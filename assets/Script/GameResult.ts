const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    resultTitle = null;

    @property(cc.Label)
    descTitle = null;

    public show(isSuccess: boolean = false): void {
        if (isSuccess) {
            this.resultTitle.string = 'Congratulation!';
            this.descTitle.string = 'You Win';
        } else {
            this.resultTitle.string = 'Game Over!';
            this.descTitle.string = 'Try Again';
        }
        this.node.opacity = 0;
        const move: cc.ActionInterval = cc.moveBy(.5, 0, 874.75).easing(cc.easeInOut(5));
        const fadeIn: cc.ActionInterval = cc.fadeTo(.5, 255);
        this.node.runAction(cc.spawn(move, fadeIn));
    }

    public hide(): void {
        const move: cc.ActionInterval = cc.moveBy(.5, 0, -874.75).easing(cc.easeInOut(5));
        const fadeIn: cc.ActionInterval = cc.fadeTo(0, 255);
        this.node.runAction(cc.spawn(move, fadeIn));
    }
}
