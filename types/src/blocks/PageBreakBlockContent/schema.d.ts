import { BlockNoteSchema } from "../../editor/BlockNoteSchema.js";
import { BlockSchema, InlineContentSchema, StyleSchema } from "../../schema/index.js";
import { PageBreak } from "./PageBreakBlockContent.js";
export declare const pageBreakSchema: BlockNoteSchema<import("../../index.js").BlockSchemaFromSpecs<{
    pageBreak: {
        config: {
            type: "pageBreak";
            propSchema: {};
            content: "none";
            isFileBlock: false;
            isSelectable: false;
        };
        implementation: import("../../index.js").TiptapBlockImplementation<{
            type: "pageBreak";
            propSchema: {};
            content: "none";
            isFileBlock: false;
            isSelectable: false;
        }, any, InlineContentSchema, StyleSchema>;
    };
}>, import("../../index.js").InlineContentSchemaFromSpecs<{
    text: {
        config: "text";
        implementation: any;
    };
    link: {
        config: "link";
        implementation: any;
    };
}>, import("../../index.js").StyleSchemaFromSpecs<{
    bold: {
        config: {
            type: string;
            propSchema: "boolean";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
    italic: {
        config: {
            type: string;
            propSchema: "boolean";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
    underline: {
        config: {
            type: string;
            propSchema: "boolean";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
    strike: {
        config: {
            type: string;
            propSchema: "boolean";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
    code: {
        config: {
            type: string;
            propSchema: "boolean";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
    textColor: {
        config: {
            type: string;
            propSchema: "string";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
    backgroundColor: {
        config: {
            type: string;
            propSchema: "string";
        };
        implementation: import("../../index.js").StyleImplementation;
    };
}>>;
/**
 * Adds page break support to the given schema.
 */
export declare const withPageBreak: <B extends BlockSchema, I extends InlineContentSchema, S extends StyleSchema>(schema: BlockNoteSchema<B, I, S>) => BlockNoteSchema<B & {
    pageBreak: typeof PageBreak.config;
}, I, S>;
