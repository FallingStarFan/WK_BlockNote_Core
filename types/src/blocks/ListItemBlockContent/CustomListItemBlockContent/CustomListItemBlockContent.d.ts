export declare const customListItemPropSchema: {
    start: {
        default: undefined;
        type: "number";
    };
    prefix: {
        default: number;
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
export declare const CustomListItem: {
    config: {
        type: "customListItem";
        content: "inline";
        propSchema: {
            start: {
                default: undefined;
                type: "number";
            };
            prefix: {
                default: number;
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
        type: "customListItem";
        content: "inline";
        propSchema: {
            start: {
                default: undefined;
                type: "number";
            };
            prefix: {
                default: number;
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
