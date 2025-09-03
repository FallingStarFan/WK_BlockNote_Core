
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

// 屬性定義
export const customListItemPropSchema = {
  ...defaultProps,
  start: { default: undefined, type: "number" },
  prefix: { default: 0 }, // 左側前綴
} satisfies PropSchema;

const CustomListItemBlockContent = createStronglyTypedTiptapNode({
  name: "customListItem",
  content: "inline*",
  group: "blockContent",
  priority: 89,

  addAttributes() {
    return {
      ...propsToAttributes(customListItemPropSchema),
      index: {
        default: 1,
        parseHTML: (el) => el.getAttribute("data-index"),
        renderHTML: (attrs) => ({ "data-index": attrs.index }),
      },
      prefix: {
        default: 0,
        parseHTML: (el) => el.getAttribute("data-prefix"),
        renderHTML: (attrs) => ({ "data-prefix": attrs.prefix }),
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
          })
        );
      },
    };
  },

  addProseMirrorPlugins() {
    return [CustomListIndexingPlugin()];
  },

  parseHTML() {
    return [
      {
        tag: `div[data-content-type=${this.name}]`,
        contentElement: ".bn-inline-content",
      },
      {
        tag: "li",
        getAttrs: (el) => ({
          index: el.getAttribute("data-index") || 1,
          prefix: el.getAttribute("data-prefix") || 0,
        }),
        getContent: (node, schema) =>
          getListItemContent(node, schema, this.name),
        priority: 300,
        node: "customListItem",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { index, prefix, ...rest } = HTMLAttributes;

    return createDefaultBlockDOMOutputSpec(
      this.name,
      "p",
      {
        ...(this.options.domAttributes?.blockContent || {}),
        ...rest,
        "data-index": index,
        "data-prefix": prefix,
      },
      this.options.domAttributes?.inlineContent || {}
    );
  },
});

export const CustomListItem = createBlockSpecFromStronglyTypedTiptapNode(
  CustomListItemBlockContent,
  customListItemPropSchema
);
