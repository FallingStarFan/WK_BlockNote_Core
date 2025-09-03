import type { BlockNoteEditor } from "../../editor/BlockNoteEditor.js";
import { BlockFromConfig } from "../../schema/index.js";
export declare const filePropSchema: {
    backgroundColor: {
        default: "default";
    };
    name: {
        default: "";
    };
    url: {
        default: "";
    };
    caption: {
        default: "";
    };
};
export declare const fileBlockConfig: {
    type: "file";
    propSchema: {
        backgroundColor: {
            default: "default";
        };
        name: {
            default: "";
        };
        url: {
            default: "";
        };
        caption: {
            default: "";
        };
    };
    content: "none";
    isFileBlock: true;
};
export declare const fileRender: (block: BlockFromConfig<typeof fileBlockConfig, any, any>, editor: BlockNoteEditor<any, any, any>) => {
    dom: HTMLElement;
    destroy?: () => void;
};
export declare const fileParse: (element: HTMLElement) => {
    url: string | undefined;
} | {
    caption: string | undefined;
    url: string | undefined;
} | undefined;
export declare const fileToExternalHTML: (block: BlockFromConfig<typeof fileBlockConfig, any, any>) => {
    dom: HTMLParagraphElement;
} | {
    dom: HTMLAnchorElement;
};
export declare const FileBlock: {
    config: {
        type: "file";
        propSchema: {
            backgroundColor: {
                default: "default";
            };
            name: {
                default: "";
            };
            url: {
                default: "";
            };
            caption: {
                default: "";
            };
        };
        content: "none";
        isFileBlock: true;
    };
    implementation: import("../../index.js").TiptapBlockImplementation<{
        type: "file";
        propSchema: {
            backgroundColor: {
                default: "default";
            };
            name: {
                default: "";
            };
            url: {
                default: "";
            };
            caption: {
                default: "";
            };
        };
        content: "none";
        isFileBlock: true;
    }, any, import("../../index.js").InlineContentSchema, import("../../index.js").StyleSchema>;
};
