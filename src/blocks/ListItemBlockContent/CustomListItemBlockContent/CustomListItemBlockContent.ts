

import {
  PropSchema,
  createBlockSpecFromStronglyTypedTiptapNode,
  createStronglyTypedTiptapNode,
  propsToAttributes,
} from "../../../schema/index.js";
import { createDefaultBlockDOMOutputSpec } from "../../defaultBlockHelpers.js";
import { defaultProps } from "../../defaultProps.js";
import { getListItemContent } from "../getListItemContent.js";
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
        parseHTML: el => Number(el.getAttribute("data-prefix")) || 0,
        renderHTML: attrs => ({ "data-prefix": attrs.prefix ?? 0 }),
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

  renderHTML({node, HTMLAttributes }) {
    console.log(node.attrs);

    return createDefaultBlockDOMOutputSpec(
      this.name,
      "p",
      {
        ...(this.options.domAttributes?.blockContent || {}),
        ...HTMLAttributes,
      },
      this.options.domAttributes?.inlineContent || {}
    );
  },
});

export const CustomListItem = createBlockSpecFromStronglyTypedTiptapNode(
  CustomListItemBlockContent,
  customListItemPropSchema
);
