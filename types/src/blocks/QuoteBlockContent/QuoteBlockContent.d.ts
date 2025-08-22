export declare const quotePropSchema: {
    backgroundColor: {
        default: "default";
    };
    textColor: {
        default: "default";
    };
    textAlignment: {
        default: "left";
        values: readonly ["left", "center", "right", "justify"];
    };
};
export declare const QuoteBlockContent: import("@tiptap/core").Node<any, any> & {
    name: "quote";
    config: {
        content: "inline*";
    };
};
export declare const Quote: {
    config: {
        type: "quote";
        content: "inline";
        propSchema: {
            backgroundColor: {
                default: "default";
            };
            textColor: {
                default: "default";
            };
            textAlignment: {
                default: "left";
                values: readonly ["left", "center", "right", "justify"];
            };
        };
    };
    implementation: import("../../index.js").TiptapBlockImplementation<{
        type: "quote";
        content: "inline";
        propSchema: {
            backgroundColor: {
                default: "default";
            };
            textColor: {
                default: "default";
            };
            textAlignment: {
                default: "left";
                values: readonly ["left", "center", "right", "justify"];
            };
        };
    }, any, import("../../index.js").InlineContentSchema, import("../../index.js").StyleSchema>;
};
