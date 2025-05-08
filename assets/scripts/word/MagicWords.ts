import { _decorator, Component, Node, assetManager, ImageAsset, Texture2D, SpriteFrame, director, Prefab, instantiate } from 'cc';
import { MsgData } from './MsgData';
const { ccclass, property } = _decorator;

export type Chunk =
    | {
        type: 'string';
        value: string;
    }
    | {
        type: 'img';
        value: SpriteFrame;
    };

export interface AvatarData {
    position: string;
    spriteFrame: SpriteFrame;
}

@ccclass('MagicWords')
export class MagicWords extends Component {
    @property({ type: Prefab })
    private msgDataPrefab: Prefab = null;

    @property({ type: Node })
    private dialogueLayout: Node = null;

    @property({ type: Node })
    private chatNode: Node = null;

    private emojiMap: Map<string, SpriteFrame> = new Map();
    private avatarMap = new Map<string, AvatarData>();
    private dialogue: { name: string; chunks: Chunk[] }[] = [];

    onLoad() {
        this.chatNode.active = true;
        this.run();
    }

    async run() {
        try {
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();

            const { emojiMap, avatarMap, processedDialogue } = await this.processApiData(data);

            this.chatNode.active = false;

            this.emojiMap = emojiMap;
            this.avatarMap = avatarMap;
            this.dialogue = processedDialogue;

            // Show messages one by one
            for (let i = 0; i < this.dialogue.length; i++) {
                const message = this.dialogue[i];
                const avatar = this.avatarMap.get(message.name);

                if (avatar) {
                    const dialogueBox = instantiate(this.msgDataPrefab);
                    dialogueBox.setPosition(0, 0, 0);
                    this.node.addChild(dialogueBox);
                    // If you have a dialogue layout node, assign it here
                    if (this.dialogueLayout) {
                        dialogueBox.parent = this.dialogueLayout;
                    }

                    const msgData = dialogueBox.getComponent(MsgData);
                    if (msgData) {
                        msgData.initialiseData(
                            message.name,
                            message.chunks,
                            avatar,
                        );
                    }
                } else {
                    console.warn(`Avatar not found for: ${message.name}`);
                }

                // Wait 2 seconds before showing the next message
                await this.delay(2000);
            }
        } catch (err) {
            console.error('Failed to load or process data:', err);
        }
    }
    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async processApiData(data: any) {
        const emojiMap = new Map<string, SpriteFrame>();
        const avatarMap = new Map<string, AvatarData>();

        // Load emojis
        const emojiPromises = data.emojies.map(async (emoji: any) => {
            const spriteFrame = await this.loadImageAsSpriteFrame(emoji.url);
            emojiMap.set(emoji.name, spriteFrame);
        });

        // Load avatars
        const avatarPromises = data.avatars.map(async (avatar: any) => {
            const spriteFrame = await this.loadImageAsSpriteFrame(avatar.url);
            avatarMap.set(avatar.name, {
                position: avatar.position,
                spriteFrame,
            });
        });

        // Wait for all loads
        await Promise.all([...emojiPromises, ...avatarPromises]);

        // Process dialogue
        const processedDialogue = data.dialogue.map((message: any) => ({
            name: message.name,
            chunks: this.splitTextToChunks(message.text, emojiMap),
        }));

        return {
            emojiMap,
            avatarMap,
            processedDialogue,
        };
    }

    async loadImageAsSpriteFrame(url: string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            assetManager.loadRemote<ImageAsset>(url, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.error(`Failed to load image: ${url}`, err);
                    reject(err);
                    return;
                }

                const texture = new Texture2D();
                texture.image = imageAsset;
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;

                resolve(spriteFrame);
            });
        });
    }

    private splitTextToChunks(text: string, emojiMap: Map<string, SpriteFrame>): Chunk[] {
        const regex = /\{([^}]+)\}/g;
        const chunks: Chunk[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Text before emoji
            if (match.index > lastIndex) {
                const str = text.slice(lastIndex, match.index);
                if (str.trim()) {
                    chunks.push({ type: 'string', value: str });
                }
            }

            // Emoji itself
            const emojiName = match[1].trim();
            const spriteFrame = emojiMap.get(emojiName);
            if (spriteFrame) {
                chunks.push({ type: 'img', value: spriteFrame });
            } else {
                console.warn(`Emoji not found in map: ${emojiName}`);
            }

            lastIndex = regex.lastIndex;
        }

        // Remaining text after last emoji
        if (lastIndex < text.length) {
            const str = text.slice(lastIndex);
            if (str.trim()) {
                chunks.push({ type: 'string', value: str });
            }
        }

        return chunks;
    }

    backToMenu() {
        director.loadScene('Home');
    }
}
