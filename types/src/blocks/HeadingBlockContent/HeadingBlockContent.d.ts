export declare const headingPropSchema: {
    level: {
        default: number;
        values: readonly [1, 2, 3, 4, 5, 6];
    };
    isToggleable: {
        default: false;
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
export declare const Heading: {
    config: {
        type: "heading";
        content: "inline";
        propSchema: {
            level: {
                default: number;
                values: readonly [1, 2, 3, 4, 5, 6];
            };
            isToggleable: {
                default: false;
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
    implementation: import("../../index.js").TiptapBlockImplementation<{
        type: "heading";
        content: "inline";
        propSchema: {
            level: {
                default: number;
                values: readonly [1, 2, 3, 4, 5, 6];
            };
            isToggleable: {
                default: false;
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
    }, any, import("../../index.js").InlineContentSchema, import("../../index.js").StyleSchema>;
};
