import { InputRule } from "@tiptap/core";
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
import { handleEnter } from "../CustomKeyboardShortcuts.js";
import { getCustomContent } from "../getCustomContent.js";

export const indentCustomPropSchema = {
  ...defaultProps,
  // 用來儲存縮排層級，最低為 1
  indentationLevel: {
    default: 1, // 沒有預設值
   
  },
} satisfies PropSchema;

const IndentCustomBlockContent = createStronglyTypedTiptapNode({
  name: "indentCustom",
  content: "inline*",
  group: "blockContent",
  priority: 90,

  addAttributes() {
    return {
      ...propsToAttributes(indentCustomPropSchema),
    };
  },

  addInputRules() {
    return [
      new InputRule({
        // 輸入 "1. " 轉換成 indentCustom
        find: /^(\d+)\.\s$/,
        handler: ({ state, chain, range }) => {
          const blockInfo = getBlockInfoFromSelection(state);
          if (
            !blockInfo.isBlockContainer ||
            blockInfo.blockContent.node.type.spec.content !== "inline*" ||
            blockInfo.blockNoteType === "indentCustom" ||
            blockInfo.blockNoteType === "heading"
          ) {
            return;
          }
          const currentLevel = blockInfo.bnBlock.node.attrs.indentationLevel ?? 1;
          chain()
            .command(
              updateBlockCommand(blockInfo.bnBlock.beforePos, {
                type: "indentCustom",
                props: {
                  // 初始層級從 1 開始
                   indentationLevel: currentLevel + 1  // 或 newLevel
                },
              }),
            )
            .deleteRange({ from: range.from, to: range.to });
        },
      }),
    ];
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
            type: "indentCustom",
            props: {},
          }),
        );
      },

      // Tab: 增加縮排
      Tab: () => {
        const blockInfo = getBlockInfoFromSelection(this.editor.state);
        if (!blockInfo.isBlockContainer) return false;

        const currentLevel =
          blockInfo.bnBlock.node.attrs.indentationLevel ?? 1;

        return this.editor.commands.command(
          updateBlockCommand(blockInfo.bnBlock.beforePos, {
            props: { indentationLevel: currentLevel + 1 },
          }),
        );
      },

      // Shift-Tab: 減少縮排
      "Shift-Tab": () => {
        const blockInfo = getBlockInfoFromSelection(this.editor.state);
        if (!blockInfo.isBlockContainer) return false;

        const currentLevel =
          blockInfo.bnBlock.node.attrs.indentationLevel ?? 1;
        const newLevel = Math.max(1, currentLevel - 1); // 最低層級為 1

        return this.editor.commands.command(
          updateBlockCommand(blockInfo.bnBlock.beforePos, {
            props: { indentationLevel:  newLevel as any},
          }),
        );
      },
    };
  },

  addProseMirrorPlugins() {
    // 縮排純粹由 props + CSS 控制，不需要額外 plugin
    return [];
  },

  parseHTML() {
    return [
      {
        tag: "div[data-content-type=" + this.name + "]",
        contentElement: ".bn-inline-content",
      },
      {
        tag: "li",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const parent = element.parentElement;
          if (!parent) return false;

          // 判斷縮排層級，簡單示範：li 包裹於 ol/ul 則層級 2，否則 1
          const level = element.matches(":scope > ol > li, :scope > ul > li")
            ? 2
            : 1;
          return { indentationLevel: level };
        },
        getContent: (node, schema) =>
          getCustomContent(node, schema, this.name),
        priority: 300,
        node: "indentCustom",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const level = HTMLAttributes.indentationLevel ?? 1;
    HTMLAttributes["data-indent-level"] = level;

    return createDefaultBlockDOMOutputSpec(
      this.name,
      "p",
      {
        ...(this.options.domAttributes?.blockContent || {}),
        ...HTMLAttributes,
      },
      this.options.domAttributes?.inlineContent || {},
    );
  },
});

export const IndentCustom = createBlockSpecFromStronglyTypedTiptapNode(
  IndentCustomBlockContent,
  indentCustomPropSchema,
);
