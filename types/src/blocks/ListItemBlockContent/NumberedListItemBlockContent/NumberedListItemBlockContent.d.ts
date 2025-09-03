export declare const numberedListItemPropSchema: {
    start: {
        default: undefined;
        type: "number";
    };
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
export declare const NumberedListItem: {
    config: {
        type: "numberedListItem";
        content: "inline";
        propSchema: {
            start: {
                default: undefined;
                type: "number";
            };
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
    implementation: import("../../../index.js").TiptapBlockImplementation<{
        type: "numberedListItem";
        content: "inline";
        propSchema: {
            start: {
                default: undefined;
                type: "number";
            };
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
    }, any, import("../../../index.js").InlineContentSchema, import("../../../index.js").StyleSchema>;
};
