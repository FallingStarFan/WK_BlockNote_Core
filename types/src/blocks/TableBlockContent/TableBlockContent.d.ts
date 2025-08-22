import { Node } from "@tiptap/core";
export declare const tablePropSchema: {
    textColor: {
        default: "default";
    };
};
export declare const TableBlockContent: Node<any, any> & {
    name: "table";
    config: {
        content: "tableRow+";
    };
};
/**
 * This extension allows you to create table rows.
 * @see https://www.tiptap.dev/api/nodes/table-row
 */
export declare const TableRow: Node<{
    HTMLAttributes: Record<string, any>;
}, any>;
export declare const Table: {
    config: {
        type: "table";
        content: "table";
        propSchema: {
            textColor: {
                default: "default";
            };
        };
    };
    implementation: import("../../index.js").TiptapBlockImplementation<{
        type: "table";
        content: "table";
        propSchema: {
            textColor: {
                default: "default";
            };
        };
    }, any, import("../../index.js").InlineContentSchema, import("../../index.js").StyleSchema>;
};
