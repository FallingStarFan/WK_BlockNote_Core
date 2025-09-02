import { updateBlockCommand } from "../../../api/blockManipulation/commands/updateBlock/updateBlock.js";
import { getBlockInfoFromSelection } from "../../../api/getBlockInfoFromPos.js";
import {
  PropSchema,
  createBlockSpecFromStronglyTypedTiptapNode,
  createStronglyTypedTiptapNode,
  propsToAttributes,
} from "../../../schema/index.js";
import { createDefaultBlockDOMOutputSpec } from "../../defaultBlockHelpers.js";
import { defaultProps } from "../../defaultProps.js";
import { getListItemContent } from "../getListItemContent.js";
import { handleEnter } from "../ListItemKeyboardShortcuts.js";
import { CustomListIndexingPlugin } from "./CustomListIndexingPlugin.js";

export const customListItemPropSchema = {
  ...defaultProps,
  start: { default: undefined, type: "number" },
} satisfies PropSchema;

const CustomListItemBlockContent = createStronglyTypedTiptapNode({
  name: "customListItem",
  content: "inline*",
  group: "blockContent",
  priority: 100,
  addAttributes() {
    return {
      ...propsToAttributes(customListItemPropSchema),
      // the index attribute is only used internally (it's not part of the blocknote schema)
      // that's why it's defined explicitly here, and not part of the prop schema
      index: {
        default: 1,
        parseHTML: (element) => element.getAttribute("data-index"),
        renderHTML: (attributes) => {
          return {
            "data-index": attributes.index,
          };
        },
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => handleEnter(this.options.editor),
      "Mod-Shift-7": () => {
        const blockInfo = getBlockInfoFromSelection(this.editor.state);
        if (
          !blockInfo.isBlockContainer ||
          blockInfo.blockContent.node.type.spec.content !== "inline*"
        ) {
          return true;
        }

        return this.editor.commands.command(
          updateBlockCommand(blockInfo.bnBlock.beforePos, {
            type: "customListItem",
            props: {},
          }),
        );
      },
    };
  },

  addProseMirrorPlugins() {
    return [CustomListIndexingPlugin()];
  },

  parseHTML() {
    return [
      // Parse from internal HTML.
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content",
      },
      // Parse from external HTML.
      {
        tag: "li",
        getAttrs: (element) => {
          if (typeof element === "string") {
            return false;
          }

          const parent = element.parentElement;

          if (parent === null) {
            return false;
          }

           {
            const startIndex =
              parseInt(parent.getAttribute("start") || "1") || 1;

            if (element.previousSibling || startIndex === 1) {
              return {};
            }

            return {
              start: startIndex,
            };
          }

          return false;
        },
        // As `li` elements can contain multiple paragraphs, we need to merge their contents
        // into a single one so that ProseMirror can parse everything correctly.
        getContent: (node, schema) =>
          getListItemContent(node, schema, this.name),
        priority: 300,
        node: "customListItem",
      },
    ];
  },

  // @blocknote/core/src/blocks/ListItemBlockContent/CustomListItemBlockContent.ts

// ...（其餘程式碼保持不變）

renderHTML({ HTMLAttributes }) {
    // ✅ 從 HTMLAttributes 中取出 index 屬性
    const { index, ...restHTMLAttributes } = HTMLAttributes;

    const blockContentHTMLAttributes: Record<string, string> = {
      ...(this.options.domAttributes?.blockContent || {}),
      // ✅ 確保所有其他屬性都被傳遞
      ...restHTMLAttributes,
    };
    console.log(index)
    // ✅ 如果 index 存在，則手動將它加入為 data-index
    if (index) {
        
      blockContentHTMLAttributes["data-index"] = index;
    }

    return createDefaultBlockDOMOutputSpec(
      this.name,
      // We use a <p> tag, because for <li> tags we'd need an <ol> element to
      // put them in to be semantically correct, which we can't have due to the
      // schema.
      "p",
      blockContentHTMLAttributes,
      this.options.domAttributes?.inlineContent || {},
    );
  },
});

export const CustomListItem = createBlockSpecFromStronglyTypedTiptapNode(
  CustomListItemBlockContent,
  customListItemPropSchema,
);
