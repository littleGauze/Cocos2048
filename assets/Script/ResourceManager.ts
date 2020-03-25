const { ccclass } = cc._decorator;

const KEYS: Array<string> = ['0', '2', '4', '8', '16', '32', '64', '128', '256', '512', '1024', '2048', '4096', '8192'];
interface Map {
    [index: string]: cc.SpriteFrame;
}

@ccclass
export default class ResourceManager extends cc.Component {

    private map: Map = {};
    private handlers: Array<Function> = [];

    onLoad(): void {
        cc.loader.loadRes('Texture/2048', cc.SpriteAtlas, (err, atlas: cc.SpriteAtlas) => {
            if (err) return console.error(err);
            KEYS.forEach(key => {
                this.map[key] = atlas.getSpriteFrame(key);
            })

            // call the handlers
            if (this.handlers.length) {
                this.handlers.forEach(handle => handle(atlas));
                this.handlers = [];
            }
        })
    }

    public ready(handle: Function): void {
        this.handlers.push(handle);
    }

    public getImage(key: number): cc.SpriteFrame {
        const sp: cc.SpriteFrame = this.map[key + ''];
        return sp;
    }
}
