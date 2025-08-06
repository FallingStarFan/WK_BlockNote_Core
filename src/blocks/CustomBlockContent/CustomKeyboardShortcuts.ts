/*
匯入需要的指令與工具

splitBlockCommand：用來分裂 block。

updateBlockCommand：用來更新 block 類型/屬性。

getBlockInfoFromTransaction：取得當前選區所在的 block 資訊。

BlockNoteEditor 型別。

定義 handleEnter 函式（接收一個 editor 實例）。

在 transaction 中取得目前狀態

blockInfo：包含目前光標所在的 block 容器與內容。

selectionEmpty：判斷選取是否為空（插入點）。

檢查是否需要處理

必須是 block container。

必須是 indentCustomItem 類型。

必須是單一插入點（非範圍選取）。

定義 Enter 的兩種行為（透過 Tiptap 的 command pipeline 執行）：

空 block → 把 indentCustomItem 轉成 paragraph。

非空 block → 在光標處切割 block，生成新的同類型 block。

回傳是否成功處理 Enter（boolean）。
*/






import { splitBlockCommand } from "../../api/blockManipulation/commands/splitBlock/splitBlock.js";
import { updateBlockCommand } from "../../api/blockManipulation/commands/updateBlock/updateBlock.js";
import { getBlockInfoFromTransaction } from "../../api/getBlockInfoFromPos.js";
import { BlockNoteEditor } from "../../editor/BlockNoteEditor.js";

export const handleEnter = (editor: BlockNoteEditor<any, any, any>) => {
  const { blockInfo, selectionEmpty } = editor.transact((tr) => {
    return {
      blockInfo: getBlockInfoFromTransaction(tr),
      selectionEmpty: tr.selection.anchor === tr.selection.head,
    };
  });

  if (!blockInfo.isBlockContainer) {
    return false;
  }
  const { bnBlock: blockContainer, blockContent } = blockInfo;

  if (
    !(
      blockContent.node.type.name === "indentCustomItem" 
    ) ||
    !selectionEmpty
  ) {
    return false;
  }

  return editor._tiptapEditor.commands.first(({ state, chain, commands }) => [
    () =>
      // Changes list item block to a paragraph block if the content is empty.
      commands.command(() => {
        if (blockContent.node.childCount === 0) {
          return commands.command(
            updateBlockCommand(blockContainer.beforePos, {
              type: "paragraph",
              props: {},
            }),
          );
        }

        return false;
      }),

    () =>
      // Splits the current block, moving content inside that's after the cursor
      // to a new block of the same type below.
      commands.command(() => {
        if (blockContent.node.childCount > 0) {
          chain()
            .deleteSelection()
            .command(splitBlockCommand(state.selection.from, true))
            .run();

          return true;
        }

        return false;
      }),
  ]);
};
