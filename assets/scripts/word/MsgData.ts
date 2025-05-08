import { _decorator, Component, Label, Node, Sprite, tween, UIOpacity, UITransform } from 'cc';
import { AvatarData, Chunk } from './MagicWords';
const { ccclass, property } = _decorator;

@ccclass('MsgData')
export class MsgData extends Component {

    @property({ type: Node })
    private dialogueLayout: Node = null;

    @property({ type: Label })
    private playerName: Label = null;

    @property({ type: Sprite })
    private profileSprite: Sprite = null;

    private opacityComp: UIOpacity = null;

    start() {
    }

    initialiseData(
        name: string,
        chunks: Chunk[],
        profileData: AvatarData
    ) {
        this.opacityComp = this.getComponent(UIOpacity);

        this.profileSprite.spriteFrame = profileData.spriteFrame;
        this.playerName.string = name;

        // Set profile position by sibling index
        if (profileData.position === 'left') {
            this.profileSprite.node.setSiblingIndex(0); // first in layout
        } else {
            this.profileSprite.node.setSiblingIndex(this.dialogueLayout.children.length - 1); // last in layout
        }


        for (const chunk of chunks) {
            if (chunk.type === 'string') {
                const labelNode = new Node();
                const label = labelNode.addComponent(Label);
                label.string = chunk.value;
                label.fontSize = 20;
                label.lineHeight = 30;
                label.node.parent = this.dialogueLayout;
            } else if (chunk.type === 'img') {
                const spriteFrame = chunk.value;
                if (spriteFrame) {
                    const emojiNode = new Node();
                    const sprite = emojiNode.addComponent(Sprite);
                    sprite.spriteFrame = spriteFrame;
                    const uiTransform = emojiNode.addComponent(UITransform);
                    uiTransform.setContentSize(30, 30); // Set size for the emoji
                    emojiNode.parent = this.dialogueLayout;
                }
            }
        }

        this.opacityComp.opacity = 0
        tween(this.opacityComp)
            .to(0.5, { opacity: 255 }, { easing: 'sineIn' })
            .start();

    }
}

